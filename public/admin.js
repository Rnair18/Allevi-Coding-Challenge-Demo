var searchButton = document.getElementById('searchUserButton');
var userName = document.getElementById('searchUser');
var userNameLabel = document.getElementById('userName');
var critUse = document.getElementById('critUse');
var ext1 = document.getElementById('ext1');
var ext2 = document.getElementById('ext2');
var contact = document.getElementById('contact');
var criticalThreshold = 20;

var socket = io(); //initialize socket

socket.on('updateStats', function(data)
{
    userNameLabel.innerText = data.userName;
    ext1.innerText = data.extruder1;
    ext2.innerText = data.extruder2;
    contact.innerText = data.email;
    var critAverage = data.deadPercentSum / counter;
    critUse.innerText = critAverage;
    if (critAverage > criticalThreshold)
    {
    	critUse.innerText += " (Critical!)";
    }
});

var emitUser = function()
{
    socket.emit('getUser', userName.value); //on button press
}