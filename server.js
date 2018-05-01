//modules that are required in the server
var http = require('http');
var routes = require('./routes.js');
var express = require('express');
var alleviData = require('./allevi-data.json'); //need streamer
var socketIO = require('socket.io');
var PriorityQueue = require('priorityqueuejs'); //for critical pq

//global data variables
var port = 8000;
var dict = {};
var livePercentArray = [];
var deadPercentArray = [];
var layerTotalHeightArray = [];
var roundToNum = 5;
var deadPercentThreshold = 20; 
var livePercentThreshold = 70; 
var noCrossLinkingElasticity = [];
var crossLinkingElasticity = [];
var crossLinkingCharacteristics = [];
var numJobs = 0;
var numUsers = 0;

/*
Populates the corresponding global arrays for cross linking vs
elasticity comparison
*/

var pushCrossLinkingVsElasticity = function(obj)
{
	if (obj.print_info.crosslinking.cl_enabled == false)
	{
		noCrossLinkingElasticity.push(obj.print_data.elasticity);
		return;
	}
	var data = [obj.print_info.crosslinking.cl_duration,
	            obj.print_info.crosslinking.cl_intensity]
	crossLinkingCharacteristics.push(data);
	crossLinkingElasticity.push(obj.print_data.elasticity);
	return;
}

/*
Populates our dictionary and parses the json to now feature
user search by grouping all objects with the same usernames
*/
var parseIntoDictionary = function()
{
	for (index = 0; index < alleviData.length; index++)
	{
		numJobs++;
		var obj = alleviData[index];
		var email = obj.user_info.email;
		var userName = email.split('@')[0]; //user@gmail.com

		livePercentArray.push(obj.print_data.livePercent);
		deadPercentArray.push(obj.print_data.deadPercent);
		layerTotalHeightArray.push(obj.print_info.resolution.layerHeight*
			obj.print_info.resolution.layerNum);

		pushCrossLinkingVsElasticity(obj);

		if (userName in dict) //update existing
		{
			dict[userName].deadPercentSum += obj.print_data.deadPercent;
			dict[userName].counter++;
			dict[userName].extruder1.push(obj.print_info.pressure.extruder1);
			dict[userName].extruder2.push(obj.print_info.pressure.extruder2);
			dict[userName].infile.push(obj.print_info.files.input);
			dict[userName].output.push(obj.print_info.files.output);
			dict[userName].totalHeight.push(obj.print_info.resolution.layerHeight *
			                                obj.print_info.resolution.layerNum);
			dict[userName].deadPercentList.push(obj.print_data.deadPercent);
			dict[userName].livePercentList.push(obj.print_data.livePercent);
		}

		else //add new key and object
		{
			numUsers++;
			var newObject = {};
			newObject.deadPercentSum = obj.print_data.deadPercent;
			newObject.deadPercentList = [obj.print_data.deadPercent];
			newObject.livePercentList = [obj.print_data.livePercent];
			newObject.counter = 1;
			newObject.extruder1 = [obj.print_info.pressure.extruder1];
			newObject.extruder2 = [obj.print_info.pressure.extruder2];
			newObject.email = email;
			newObject.infile = [obj.print_info.files.input];
			newObject.output= [obj.print_info.files.output];
			newObject.userName = userName;
			newObject.totalHeight = [obj.print_info.resolution.layerHeight *
			                         obj.print_info.resolution.layerNum];

			dict[userName] = newObject; //load Object into global dictionary
		}
	}
}

/*
Takes a array of values and converts into a frequency distribution of
[value, frequency]. Additionally for calculating the percent distribution
it allows a parameter to round numbers, for easier visibility
*/
var convertToFrequencyDist = function(arrayArg, roundFlag)
{
	var elements = [];
	var freq = [];
	var previous;
	arrayArg.sort();
	for (index = 0; index < arrayArg.length; index++)
	{
		if (roundFlag) //round before calculating distribution
		{
			var value = arrayArg[index];
			arrayArg[index] = Math.round(value/roundToNum) * roundToNum;
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

/*
Returns the user object given a userName key
*/
var getData = function(userName)
{
	return dict[userName]; //could be undefined if invalid username
}

/*
Calculates the average value within an array set of numbers
*/
var getAverage = function(arrayArg)
{
	var sum = 0;
	for (index = 0; index < arrayArg.length; index++)
	{
		sum += arrayArg[index];
	}
	return Math.round(sum / arrayArg.length);
}

/*
Calculates the standard deviation of a data set
*/
var stdDev = function(arrayArg, avg = getAverage(arrayArg))
{
	var sum = 0;
	var arrLength = arrayArg.length;
	for (index = 0; index < arrLength; index++)
	{
		sum += (arrayArg[index] - avg) >> 1;
	}
	sum = sum/arrLength;
	sum = Math.abs(sum);
	return Math.round(Math.sqrt(sum));
}

/*
Calculates correlation (covariance over multiplication of standard devs)
of two arrays
*/
var correlation = function(arrayArg1, arrayArg2)
{
	var sum = 0;
	var avg1 = getAverage(arrayArg1);
	var avg2 = getAverage(arrayArg2);
	var std1 = stdDev(arrayArg1, avg1);
	var std2 = stdDev(arrayArg2, avg2);

	if (arrayArg1.length != arrayArg2.length)
	{
		return 0;
	}

	for (index = 0; index < arrayArg1.length; index++)
	{
		sum += Math.round((arrayArg1[index] - avg1) * (arrayArg2[index] - avg2));
	}
	var covariance = sum / arrayArg1.length;
	if (std1 * std2 == 0) return 0;
	return covariance / (std1 * std2);
}

/*
Enqueue the priority queue with every user from the dictionary
*/
var initQueue = function()
{
	while (!critPQ.isEmpty())
	{
		critPQ.deq();
	}
	for (key in dict)
	{
		critPQ.enq(key);
	}
}

//Initialize our middleweare and set up routes
var app = express();
var server = http.Server(app);
var io = socketIO.listen(server);
routes(app);

//Handle socket connections, @TODO modularize into separate socket.js
io.on('connection', function (socket)
{
	socket.on('getUser', function(userName)
	{
		var data = getData(userName);
		var freq1 = convertToFrequencyDist(data.totalHeight, false);
		var freq2 = convertToFrequencyDist(data.deadPercentList, true);
		var freq3 = convertToFrequencyDist(data.livePercentList, true);
		var freq4 = convertToFrequencyDist(data.extruder1, false);
		var freq5 = convertToFrequencyDist(data.extruder2, false);
		socket.emit('showUser', data, freq1, freq2, freq3, freq4, freq5);
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

	socket.on('userAuth', function(data)
	{
		if (data === "Admin") //will replace with something like passport.js
		{
			socket.emit('redirect', "/admin");
		}
	});

	socket.on('updateAllInfo', function()
	{
		//deadPercentThreshold = newDeadValue;
		//livePercentThreshold = newLiveValue;
		initQueue();
		var freqArray1 = convertToFrequencyDist(livePercentArray, true);
		var freqArray2 = convertToFrequencyDist(deadPercentArray, true);
		var freqArray3 = convertToFrequencyDist(layerTotalHeightArray, true);
		socket.emit('updateGraph', freqArray1, freqArray2, freqArray3);

		var percentCrossLink = crossLinkingElasticity.length/livePercentArray.length;
		percentCrossLink = Math.round(percentCrossLink*100);
		var crossElasAvg = getAverage(crossLinkingElasticity);
		var noCrossElasAvg = getAverage(noCrossLinkingElasticity);
		socket.emit('updateCrossElas', percentCrossLink, crossElasAvg - noCrossElasAvg,
			         numJobs, numUsers);

		var users = [];
		var firstUser = critPQ.peek();
		critPQ.deq();
		var secondUser = critPQ.peek();
		critPQ.deq();
		var thirdUser = critPQ.peek();
		critPQ.deq();

		users = [firstUser, secondUser, thirdUser];
		critPQ.enq(firstUser);
		critPQ.enq(secondUser);
		critPQ.enq(thirdUser);
		socket.emit('updateCritUsers', users);
	});
});

/*
Initializes a priority queue given this function as the compararator.
The comparator categorizes the ranking based on separation from the threshold
live and dead percent values.
*/
var critPQ = new PriorityQueue(function(a, b) {
	userName1 = a;
	userName2 = b;
	if (userName1 == userName2) return 0;
	var userObj1 = dict[userName1];
	var userObj2 = dict[userName2];
	var userDeadDist1 = [];
	var userDeadDist2 = [];
	var userLiveDist1 = [];
	var userLiveDist2 = [];

	for (index = 0; index < userObj1.deadPercentList.length; index++)
	{
		userDeadDist1.push(deadPercentThreshold -
		                   userObj1.deadPercentList[index]);
		userLiveDist1.push(userObj1.livePercentList[index]
			               - livePercentThreshold);
	}
	for (index = 0; index < userObj2.deadPercentList.length; index++)
	{
		userDeadDist2.push(deadPercentThreshold -
			               userObj2.deadPercentList[index]);
		userLiveDist2.push(userObj2.livePercentList[index]
			                - livePercentThreshold);
	}

	var corr1 = correlation(userDeadDist1, userDeadDist2);
	var corr2 = correlation(userLiveDist1, userLiveDist2);
	return getAverage([corr1, corr2]);

});

parseIntoDictionary(); //initiate dictionary (blocking)
initQueue();
console.log("Starting port at %d", port);
server.listen(port); //start server
