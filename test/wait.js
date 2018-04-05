var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');


var app = express();

app.use(bodyParser.json());

app.listen(3000);

var long = {};

var id = 0;


app.all('/wait/:time',function(req,res) {

	console.log('waiting '+req.params.time);
	setTimeout(() => {
		console.log('done waiting '+req.params.time);
		res.status(200);
		res.write('Hello World!');
		res.end();
	}, req.params.time);

});
