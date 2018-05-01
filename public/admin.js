/*
Frontend javascript to handle socket connection and text
updates to HTML tags. Additionally also keeps track of google
charts API. Is initiated from admin.html.
*/

//HTML elements search
var searchButton = document.getElementById('searchUserButton');
var userName = document.getElementById('searchUser');
var userNameLabel = document.getElementById('userName');
var critUse = document.getElementById('critUse');
var contact = document.getElementById('contact');

//Critical dead percent threshold (need to clarify with team)
var criticalThreshold = 35;

var socket = io(); //initialize socket

//Socket listening events
socket.on('updateStats', function(data)
{
    if (data == undefined) alert("Invalid User");
    userNameLabel.innerText = data.userName;
    contact.innerText = data.email;
    var critAverage = data.deadPercentSum / data.counter;
    critUse.innerText = critAverage;
    if (critAverage > criticalThreshold)
    {
    	critUse.innerText += " (Critical!)";
    }
});

socket.on('updateGraph', function(arr1, arr2, arr3)
{
    drawScatterChart(arr1, "livePercentChart", "Live Percent");
    drawScatterChart(arr2, "deadPercentChart", "Dead Percent");
    drawBarChart(arr1, "layerHeightChart", "Total Height");
});

socket.on('updateCrossElas', function(percentCrossLink, difference, numJobs, numUsers)
{
    document.getElementById('crossElas').innerText = percentCrossLink;
    document.getElementById('effect').innerText = difference;
    document.getElementById('numJobs').innerText = "# of Jobs: " + numJobs;
    document.getElementById('numActiveUser').innerText = "# of Users: " + numUsers;
});

socket.on('updateCritUsers', function(user)
{
    document.getElementById('firstUser').innerText = "1. " + user[0];
    document.getElementById('secondUser').innerText = "2. " + user[1];
    document.getElementById('thirdUser').innerText = "3. " + user[2];
});

socket.on('showUser', function(data, totalHeight, deadPercentArr, 
                               livePercentArr, extruderArr1, extruderArr2)
{
    if (data == undefined)
    {
        alert('Invalid user');
        return;
    }
    console.log(data);
    addFilesDropDown('infiles', data.infile);
    addFilesDropDown('outfiles', data.output);
    document.getElementById('email').innerText = "Contact: " + data.email;
    drawBarChart(totalHeight, "userHeight", "User Total Height");
    drawScatterChart(deadPercentArr, "userDeadPercent", "User Dead Percent");
    drawScatterChart(livePercentArr, "userLivePercent", "User Live Percent");
    drawBarChart(extruderArr1, "extruderBar1", "Extruder 1 Distribution");
    drawBarChart(extruderArr2, "extruderBar2", "Extruder 2 Distribution");
});

//dropdown files
var addFilesDropDown = function(id, arrayArg)
{
    var object = document.getElementById(id);
    var fragment = document.createDocumentFragment();

    arrayArg.forEach(function(file, index) 
    {
        var opt = document.createElement('option');
        opt.innerHTML = file;
        opt.value = file;
        fragment.appendChild(opt);
    });

    object.appendChild(fragment); 
}


//Button events
var emitUser = function()
{
    socket.emit('getUser', userName.value);
}

var loadGraph = function()
{
    socket.emit('loadGraph');
}

var loadSearchedUser = function()
{
    socket.emit('getUser', document.getElementById("searchUser").value);
}

var updateAll = function()
{
    console.log('Updating all');
    socket.emit('updateAllInfo');
}

//The following was modified from the Google Charts Documentation
// Load the Visualization API and the corechart package.
google.charts.load('current', {'packages':['corechart']});

// Callback that creates and populates a data table,
// instantiates the chart, passes in the data and
// draws it.
function drawBarChart(dataArray, id, name) 
{

    // Create the data table.
    var data = new google.visualization.arrayToDataTable(
        [[name, "Frequency"]].concat(dataArray));

    // Set chart options
    var options = {'title':name + " Distribution",
                   'width':400,
                   'height':400};

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.BarChart(document.getElementById(id));
    chart.draw(data, options);
}

function drawScatterChart(dataArray, id, name)  //need to modularize combine with ^
{

    // Create the data table.
    var data = new google.visualization.arrayToDataTable(
        [[name, "Frequency"]].concat(dataArray));

    // Set chart options
    var options = {'title':name + " Distribution",
                   'width':400,
                   'height':400};

    // Instantiate and draw our chart, passing in some options.
    var chart = new google.visualization.ScatterChart(document.getElementById(id));
    chart.draw(data, options);
}
