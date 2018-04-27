//Handle app routing for different pages

var fs = require('fs');
var express = require('express');

module.exports = function(app)
{
	app.use(express.static(__dirname + '/public'));

    app.get('/', function(req, res)

    {
        if (req.user == undefined) res.redirect('/login');
    });

    app.get('/login', function(req, res)
    {
        res.sendFile('public/login.html', {root: __dirname});
    });

    app.get('/admin', function(req, res)
    {
		res.sendFile('public/admin.html', {root: __dirname});
    });

    app.get('/user', function(req, res)
    {
    	res.status(404).send('Not Found'); //@TODO implement user page
		//res.sendFile('public/user.html', {root: __dirname});
    });

    app.post('/login', function(req, res)
    {
    	console.log("Posted\n!");
    });
}
