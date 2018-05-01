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
    console.log(data); //For debugging
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

socket.on('updateGraph', function(arr1, arr2, arr3, arr4)
{
    drawBarChart(arr1, "layerHeightChart", "Layer Height");
    drawBarChart(arr2, "layerNumChart", "Layer Number");
    drawScatterChart(arr3, "livePercentChart", "Live Percent");
    drawScatterChart(arr4, "deadPercentChart", "Dead Percent");
});


//Button events
var emitUser = function()
{
    socket.emit('getUser', userName.value);
}

var loadGraph = function()
{
    socket.emit('loadGraph');
}

//The following was modified from the Google Charts Documentation
// Load the Visualization API and the corechart package.
google.charts.load('current', {'packages':['corechart']});

// Callback that creates and populates a data table,
// instantiates the chart, passes in the data and
// draws it.
function drawBarChart(dataArray, id, name) 
{
    console.log(dataArray);

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
