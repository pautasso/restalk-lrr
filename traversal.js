var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');
const logger = require('morgan');

var app = express();

app.use(logger('dev'));
app.use(bodyParser.json());

app.listen(3001);


function fillrup(n) {
	let result = [];
	for (let i = 0; i<n; i++) {
		result.push({i, val: Math.random(n)});
	}
	return result;
}

var collection = fillrup(1000);



app.get('/first',function(req,res) {

	var links = [];
	links.push('/1; rel="next"');
	links.push('/first; rel="first"');
	links.push('/last; rel="last"');
	
	res.set('Link', links)

	res.send({data: collection[0], links});

});

app.get('/last',function(req,res) {

	var links = [];
	links.push('/'+(collection.length-2)+'; rel="prev"');
	links.push('/first; rel="first"');
	links.push('/last; rel="last"');

	res.set('Link', links);

	res.send({data: collection[collection.length-1], links});

});


app.get('/:idx',function(req,res) {

	var current = Number(req.params.idx);

	var links = [];

	if (current+1 < collection.length) {
		links.push('/'+(1+current)+'; rel="next"');
	} else if (1+current == collection.length) {
		links.push('/last; rel="next"');
	}
	if (current-1 > 0) {
		links.push('/'+(current-1)+'; rel="prev"');
	} else if (current-1 == 0) {
		links.push('/first; rel="prev"');
	}
	links.push('/first; rel="first"');
	links.push('/last; rel="last"');

	res.set('Links',links);

	res.send({data: collection[current], links});

});


