var submitButton = document.getElementById("submitButton");
var emailEntry = document.getElementById("emailEntry");
var passwordEntry = document.getElementById("passwordEntry");
var xhr = new XMLHttpRequest();

var socket = io();

var handleLogin = function() {
	if (emailEntry.value == "")
	{
		alert("Please enter in an Email Id");
		return;
	}

	else if (passwordEntry.value == "")
	{
		alert("Please enter in a Password");
		return;
	}
		$.ajax({
	  type: "POST",
	  url: window.location.href,
	  user: emailEntry.value,
	  password: passwordEntry.value 
	});
	// xhr.open("POST", window.location.href, true);
	// xhr.setRequestHeader('Content-Type', 'application/json');
	// xhr.send(JSON.stringify(	{
	//     user: emailEntry.value,
	//     password: passwordEntry.value
	// }));

};
