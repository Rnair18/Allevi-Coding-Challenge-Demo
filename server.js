var http = require('http');
var routes = require('./routes.js');
var express = require('express');
var alleviData = require('./allevi-data.json'); //need streamer
var socketIO = require('socket.io');

var port = 8000;
var dict = {};
var livePercentArray = [];
var deadPercentArray = [];
var layerHeightArray = [];
var layerNumArray = [];

var parseIntoDictionary = function()
{
	for (index = 0; index < alleviData.length; index++)
	{
		var obj = alleviData[index];
		var email = obj.user_info.email;
		var userName = email.split('@')[0]; //user@gmail.com

		livePercentArray.push(obj.print_data.livePercent);
		deadPercentArray.push(obj.print_data.deadPercent);
		layerHeightArray.push(obj.print_info.resolution.layerHeight);
		layerNumArray.push(obj.print_info.resolution.layerNum);

		if (userName in dict) //update existing
		{
			dict[userName].deadPercentSum += obj.print_data.deadPercent;
			dict[userName].counter++;
			dict[userName].extruder1.push(obj.print_info.pressure.extruder1);
			dict[userName].extruder2.push(obj.print_info.pressure.extruder2);
			dict[userName].infile.push(obj.print_info.files.input);
			dict[userName].output.push(obj.print_info.files.output);
		}

		else //add new key and object
		{
			var newObject = {};
			newObject.deadPercentSum = obj.print_data.deadPercent;
			newObject.counter = 1;
			newObject.extruder1 = [obj.print_info.pressure.extruder1];
			newObject.extruder2 = [obj.print_info.pressure.extruder2];
			newObject.email = email;
			newObject.infile = [obj.print_info.files.input];
			newObject.output= [obj.print_info.files.output];
			dict[userName] = newObject;
		}
	}
}

var convertToFrequencyDist = function(arrayArg, roundFlag)
{
	var elements = [];
	var freq = [];
	var previous;
	arrayArg.sort();
	for (index = 0; index < arrayArg.length; index++)
	{
		if (roundFlag)
		{
			arrayArg[index] = Math.round(arrayArg[index]/5) * 5;
		}
		if (arrayArg[index] !== previous) //previous may be undefined
		{
			elements.push(arrayArg[index]);
			freq.push(1);
		}
		else
		{
			freq[freq.length - 1]++;
		}
		previous = arrayArg[index];
	}
	var result = [];
	for (index = 0; index < elements.length; index++)
	{
		result[index] = [elements[index], freq[index]];
	}
	return result; //elements with freq
}

var getData = function(userName)
{
	return dict[userName]; //could be undefined in invalid username
}

var app = express();
var server = http.Server(app);
var io = socketIO.listen(server);
routes(app);

io.on('connection', function (socket)
{
	socket.on('getUser', function(userName)
	{
		var data = getData(userName);
		socket.emit('updateStats', data);
	});

	socket.on('loadGraph', function()
	{
		var freqArray1 = convertToFrequencyDist(layerHeightArray, false);
		var freqArray2 = convertToFrequencyDist(layerNumArray, false);
		var freqArray3 = convertToFrequencyDist(livePercentArray, true);
		var freqArray4 = convertToFrequencyDist(deadPercentArray, true);
		socket.emit('updateGraph', freqArray1, freqArray2, freqArray3,
		             freqArray4);
	});
});

parseIntoDictionary();
console.log("Starting port at %d", port);
server.listen(port);
