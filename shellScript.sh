#!/bin/bash
# elif statements
clustername=$1
desiredno=$2
#environment=$3
environment=dev

source /opt/isosys/secret/env.properties 


#if loop env = dev/uat non prod and evn=prod is prod

echo "Setting ECR variables"

if [ $environment == "dev" ] || [ $environment == "uat" ];
   then 
      envmnt=nonprod
      ECR_env=$ECRnonprodenv
      ECR_pid=$ECRnonprodpid
      ECR_pwd=$ECRnonprodpwd
      ARN=$ECRnonprodARN;
      oktaProf=$ECRnonprodoktaprof

   else
      envmnt=prod
      ECR_env=$ECRprodenv
      ECR_pid=$ECRprodpid
      ECR_pwd=$ECRprodpwd
      ARN=$ECRprodARN;
      oktaProf=ECRprodoktaprof
fi

echo clustername $clustername  desiredno $desiredno


# get OKTA profile name
echo
echo "Initiate OKTA Login.."
saml2aws login -a $oktaProf --username=$ECR_pid --password=${ECR_pwd} --force --skip-prompt
if [ $? -gt 0 ]; then
    echo "ERROR: OKTA login command failed for userID: $ECR_pid Exiting shell ..."
    echo
    exit 1
fi



ECRuri=$URI'/'$appName'-'$environment

echo ">>>  " $ECRuri
echo
echo "Login to ECR"
$(aws ecr get-login --no-include-email --region us-east-1 --profile $oktaProf)
if [ $? -gt 0 ]; then
    echo "ERROR: ECR login command failed. Exiting shell ..."
    echo
    exit 1
fi

#curl -X POST -F token=18fea9daf0470f63a214b6760de26e -F ref=master --form "variables[clustername]=$clustername" --form "variables[desiredno]=$desiredno" --insecure https://dev.jde.cloud.verisk.com/api/v4/projects/239/trigger/pipeline



# AWS saml to aws login 
FN='arn:aws:lambda:us-east-1:'$ARN':function:StartStopEC2'

aws --debug lambda invoke \
    --invocation-type RequestResponse \
    --function-name $FN \
    --region us-east-1 \
    --payload '{ "clustername":"'"${clustername}"'", "desiredno":"'"${desiredno}"'" }' \
    out

#aws cli command pay load is ARN , cluster(stack name) and desiredno

