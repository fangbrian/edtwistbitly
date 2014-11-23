var express = require("express");
var bodyParser = require("body-parser");
var app = express();

//Globals
var MAX_MEMORY_ENTRIES = 10;
var memoryKey = new Array(MAX_MEMORY_ENTRIES);
var memoryLink = new Array(MAX_MEMORY_ENTRIES);
var currMemory = 0;

app.use(bodyParser.urlencoded( {extended: false}));

function post404Error(response) {
	response.write("Error 404: Page Not Found");
	response.end();
}

function checkValidKey(key) {
	var i;
	for(i = 0; i < currMemory; i++) {	
		if(key === memoryKey[i]){
			return i;
		}
	}
	//If no matching keys return invalid entry
	return MAX_MEMORY_ENTRIES;	
}

app.get('/', function(req, res) {
    res.sendfile('./views/index.html');
});

app.get('/:name', function(req, res) {
	//1. Loop through array to find if key exists
	var i;
	for(i = 0; i < currMemory; i++) {	
		//2. If key exists redirect to site
		if(req.params.name === memoryKey[i]){
			res.redirect(memoryLink[i]);
		}
	}
	//3. If key is not found, error
	if(i === currMemory) {
		post404Error(res);
	}
});

app.post('/myaction', function(req, res) {

	var link = req.body.link;
	var linkKey = req.body.userkey;
	
	//Check for validity of input 
	if(link.substring(0,7) === "http://")
	{
		link = link.substring(7);
	}
	else if(link.substring(0,3) !== "www")
	{
		link = "www." + link;
	}
	
	//Check to see if we have enough memory or if the key is valid
	if((currMemory < MAX_MEMORY_ENTRIES) && (checkValidKey(linkKey) === MAX_MEMORY_ENTRIES)) {
		memoryKey[currMemory] = linkKey;
		memoryLink[currMemory] = 'http://' + link;
		var shortenedUrl = "http://localhost/" + memoryKey[currMemory];
		res.json(shortenedUrl);
		currMemory += 1;
	}
	else {
		//Error local memory full
		if(currMemory >= MAX_MEMORY_ENTRIES){
			res.json("Error: Not enough local memory. Current capacity: " + MAX_MEMORY_ENTRIES);
		}
		//Error key already exists
		else if(checkValidKey(linkKey) < MAX_MEMORY_ENTRIES){
			res.json("Error: Invalid Entry. Key already exists");
		}
	}
	
});

app.listen(80);