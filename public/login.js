var submitButton = document.getElementById("submitButton");
var emailEntry = document.getElementById("emailEntry");
var passwordEntry = document.getElementById("passwordEntry");
var xhr = new XMLHttpRequest();

var socket = io();

socket.on('redirect', function(data)
{
	window.location.href = 	data;
});

var handleLogin = function() //@TODO: will need to implement full login mechanism with passport
{
	socket.emit('userAuth', emailEntry.value);
};
