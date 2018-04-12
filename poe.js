var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
const logger = require('morgan');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());

app.listen(3001);

const poe_url = '/poe';
const poe_link = '/link';
const poe_token_link = '/token';

const poe_router = express.Router();


//TODO implement garbage collection strategy to clean up the result cache
var token = 0;

var tokens = {};

function getToken() {
	var newtoken = token++;

	tokens[newtoken] = { state: 'new'};

	return newtoken;
}

function seenToken(t) {
	if (tokens[t]) {
		if (tokens[t].state == 'new') {
			tokens[t].state = 'seen';
			return false;
		}
		return true;
	}
	return;
}

function setResponse(t,r) {
	tokens[t].res = r;
}

function getResponse(t) {
	return tokens[t].res;
}


poe_router.get('/debug', function(req, res) {

	res.send(tokens);

});


poe_router.get(poe_token_link, function(req, res) {

	res.status(204);
	res.set('Cache-control', 'no-cache');
	res.set('Link', poe_url + poe_link+'?poe='+getToken()+'; rel=poe');

    res.send();
});

poe_router.get(poe_link, function(req, res) {
	var token = req.query.poe;
	res.send(getResponse(token));
});

poe_router.post(poe_link, function(req, res) {

	var token = req.query.poe;

	const seen = seenToken(token);
		
	console.log(token+' '+seen);

	if (seen) {
		res.status(405).end();
		return;
	}
	if (seen === undefined) {
		res.status(404).end();
		return;
	}

	//process request
	var response = "Hello World \n"+JSON.stringify(req.query);

	//save the response in case it got lost and the client is trying to get it later
	//this will crash if the token has not been initialized before
	setResponse(token, response);

    res.send(response);

    //log that the response has been sent successfully?
});

app.use(poe_url, poe_router);

