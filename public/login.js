/*
Frontend javascript that should handle login page, this is still in early stages
and does feature any type of secure matching, all it does for now is allow users 
to go to admin page
*/

var submitButton = document.getElementById("submitButton");
var emailEntry = document.getElementById("emailEntry");
var passwordEntry = document.getElementById("passwordEntry");
var xhr = new XMLHttpRequest();

var socket = io();

socket.on('redirect', function(data)
{
	window.location.href = 	data;
});

//@TODO: will need to implement full login mechanism with passport
var handleLogin = function()
{
	socket.emit('userAuth', emailEntry.value);
};
