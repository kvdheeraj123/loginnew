var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
const shell = require('shelljs');
var path = require('path');
var fs = require('fs');
 const { execFile } = require('child_process');
let username;
let users;
var app = express();

function _isContains(json, value) {
    let contains = false;
    Object.keys(json).some(key => {
        contains = typeof json[key] === 'object' ? _isContains(json[key], value) : json[key] === value;
         return contains;
    });
    return contains;
 }
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
app.use(express.static("images/"));
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/index.html'));
});
app.get('/home', function(request, response){
  response.sendFile(path.join(__dirname+ '/home.html'));
});
app.get('/responses', function(request, response){
    response.sendFile(path.join(__dirname+ '/responses.html'));
  });

app.post('/auth', function(request, response) {
	 username = request.body.ID;
    var password = request.body.password;

fs.readFile('userDetails.json', (err, data) => {
    if (err) throw err;
   users = JSON.parse(data);
	if (username && password) {
		if( _isContains(users, username) && _isContains(users,password)){
                    request.session.loggedin = true;
                   
                response.redirect('/home');
                
			} else {
                 response.send('Incorrect Username and/or Password!' );   
			}			
            response.end();
	} else {
		response.send('Please enter Username and Password!');
		response.end();
    }
});
});

app.get('/home', function(request, response) {

	if (request.session.loggedin) {
		response.send('Welcome back, ' + username + '!');
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});
app.post('/home', function(request, response){
    if(request.session.loggedin){
// exec: executes a file with the specified arguments
 if(request.body.Instances === undefined){
    request.body.Instances = '0';
 }
shell.exec('./shellScript.sh '+ username + ' '+ request.body.server+' '+request.body.Instances +' '+request.body.env, function(error, stdout, stderr){
});
        response.send('<body style="background-image:'+'url("Trees.png")'+'"><h2>Responses are as follows:</h2><br /><br />User: ' + username+',  Choice of Server: '+request.body.server+', Desired Instances: '+request.body.Instances+' ,Environment Selected: '+request.body.env+'</body>');
    }
    response.end();
})

app.listen(3000);
