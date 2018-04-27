
## Introduction
This web application was created for the Allevi Coding Challenge. The objective was to create a web application in about a week that would take into a json of print information and accordingly display valuable statistics about it in a meaningful way to both the client and internal team.

The code is still in its development stage and a lot of planned features have not been added due to time constraints. However this documentation will list all of the potential features added and what is currently working in the demonstration.

## How to Run
To run the script, first clone the repo. Additionally you will need to install node and npm. The version tested are Node - v8.1.4 and NPM - 5.8.0
Next run the following in the directory

```javascript
npm install
```

This will install all the required dependecies and the correct versions.
To start the server locally

```javascript
node server.js
```
And navigate a webrowser to http://localhost:8000

## List of development features
..* Implement secure login with https (page setup, need to write backend)
..* Data parse the json into a dictionary with user key (completed)
..* Generate frequency distribution charts based of array values (completed)
..* Load custom user page to display print information of only specific user (not started)
..* Load admin page to allow search for a user and overall statistics (completed)
..* Allow user uploads and internal team feedback with infile/outfile (not started)
..* Organization and planning of frontend layout and design (not started)
Additionally the backend server parses additional information and sends it, but page does not render. Need to discuss with team to figure out optimal way to display info.

## Challenges
I have worked with Node.js in web application before, so it was my natural server logic of choice when starting this web application. I focused on setting up the socket connection and correct middleware logic to allow me to rapidly add features based off of the data. Unfornately I have little experience writing clean, easy to read frontend so a lot of time was spent setting up basic webpages to render charts (used Google Charts). While the current html pages are near barebone, with enough time and experience they can be transformed into a cleaner interface. Additionally need to work with an https module and possibly bcrypt or passport.js to set up a secure login mechanism for both user and team. Lastly the data parsing will currently be taking a lot of memory and is blocking the initialization of the server, need to look into ways to stream the data rather than load it at once

## Feedback
Please feel free to download, edit, and share. Give feedback in terms of additional features that could be added, other ways to intepret the print data, as well as overall comments about the code and design.

Feel free to contact me at roshanair1620@gmail.com
Thanks!



