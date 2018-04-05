var express = require('express');
var http = require('http');
var bodyParser = require('body-parser');

var app = express();

app.use(bodyParser.json());

app.listen(3001);

var long_running_req = {};

var id = 0;

function getTarget(req) {
  return {
        // host to forward to
        host: 'localhost',
        // port to forward to
        port: 3000,
        // path to forward to
        path: '/wait/10000',
        // request method
        method: req.method,
        // headers to send
        //headers: req.headers
    };
}

function getStatus(id) {
    return {
        status: long_running_req[id].status,
        started: long_running_req[id].started,
        finished: long_running_req[id].finished,
        aborted: long_running_req[id].aborted,
        statusCode: long_running_req[id].statusCode,
        response_body: long_running_req[id].response_body
    };
}

//extra route for debugging purposes
app.get('/jobs/:id/status', function(req, res) {
    if (!long_running_req[req.params.id]) {
        res.status(404).end();;
        return;
    }

    res.send(getStatus(req.params.id));
});

app.get('/jobs/:id', function(req, res) {
    if (!long_running_req[req.params.id]) {
        res.status(404).end();;
        return;
    }

    if (long_running_req[req.params.id].status == 'end') {
        //redirect to the output if the job is complete
        res.redirect('/jobs/' + req.params.id + '/output');
    } else {
        res.send(getStatus(req.params.id));
    }
});

app.get('/jobs/:id/output', function(req, res) {
    if (!long_running_req[req.params.id]) {
        res.status(404).end();
        return;
    }

    res.send(long_running_req[req.params.id].response_body);
});

app.delete('/jobs/:id/output', function(req, res) {
    if (!long_running_req[req.params.id]) {
        res.status(404).end();
        return;
    }

    long_running_req[req.params.id].response_body = "";
    res.status(200).end();
});

app.delete('/jobs/:id', function(req, res) {
    if (!long_running_req[req.params.id]) {
        res.status(404).end();
        return;
    }

    if (long_running_req[req.params.id].status != 'end') {
        long_running_req[req.params.id]._creq.abort();
    };
    delete long_running_req[req.params.id];
    res.status(200).end();
});

app.all('/', function(req, res) {

    var myid = id++;

    console.log(myid + " pending");

    long_running_req[myid] = { status: 'pending' };

    res.status(202);
    res.set('Location', '/jobs/' + myid);
    res.end();

    //alternatively to test from the browser
    //res.redirect('/jobs/'+myid);

    long_running_req[myid].response_body = "";
    long_running_req[myid].started = new Date();


    //configure URL parameters for the call which make take a long time

    var options = getTarget(req);

    console.log(options);

    var creq = http.request(options, function(cres) {

        // set encoding
        cres.setEncoding('utf8');

        cres.on('response', function(chunk) {
            console.log(myid + ' response');

            long_running_req[myid].status = 'response';

            long_running_req[myid].statusCode = cres.statusCode;
        });

        // wait for data
        cres.on('data', function(chunk) {
            console.log(myid + ' data');

            long_running_req[myid].status = 'data';

            long_running_req[myid].response_body += chunk;

        });

        cres.on('aborted', function() {
            console.log(myid + ' aborted');

            long_running_req[myid].status = 'aborted';
            long_running_req[myid].aborted = new Date();
        });

        cres.on('end', function() {
            console.log(myid + ' end');

            long_running_req[myid].statusCode = cres.statusCode;

            long_running_req[myid].status = 'end';
            long_running_req[myid].finished = new Date();
        });

    }).on('error', function(e) {

        if (long_running_req[myid]) {
            long_running_req[myid].status = 'error';
            long_running_req[myid].error = e.message;
        }

        console.log(e.message);
    });

    creq.end();

    console.log(myid + " sent");

    long_running_req[myid].status = 'sent';
    long_running_req[myid]._creq = creq;

});
