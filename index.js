'use strict';

var mysql = require('mysql'),
    http  = require('http'),
    url   = require('url'),
    querystring = require('querystring');


// Start a web server on port 8888. Requests go to function handleRequest

http.createServer(handleRequest).listen(8888);

