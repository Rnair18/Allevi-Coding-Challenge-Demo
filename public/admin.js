var searchButton = document.getElementById('searchUserButton');
var userName = document.getElementById('searchUser');
var userNameLabel = document.getElementById('userName');
var critUse = document.getElementById('critUse');
var contact = document.getElementById('contact');
var criticalThreshold = 35;

var socket = io(); //initialize socket

socket.on('updateStats', function(data)
{
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
    drawPieChart(arr3, "livePercentChart", "Live Percent");
    drawPieChart(arr4, "deadPercentChart", "Dead Percent");

});

var emitUser = function()
{
    socket.emit('getUser', userName.value); //on button press
}

var loadGraph = function()
{
    socket.emit('loadGraph');
}


// Load the Visualization API and the corechart package.
google.charts.load('current', {'packages':['corechart']});

// Set a callback to run when the Google Visualization API is loaded.
//google.charts.setOnLoadCallback(drawChart);

// Callback that creates and populates a data table,
// instantiates the pie chart, passes in the data and
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

function drawPieChart(dataArray, id, name) 
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
