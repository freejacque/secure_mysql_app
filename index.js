'use strict';

var mysql = require('mysql'),
    http  = require('http'),
    url   = require('url'),
    querystring = require('querystring');

// Start a web server on port 8888. Requests go to function handleRequest
http.createServer(handleRequest).listen(8888);

// handles http Requests
function handleRequest(request, response) {

  // HTML as a long string, DBCONTENT is a placeholder for db data
  var pageContent = '<html>' +
                    '<head>' +
                    '<meta http-equiv="Content-Type" ' +
                    'content="text/html; charset=UTF-8" />' +
                    '</head>' +
                    '<body>' +
                    '<form action="/add" method="post">' +
                    '<input type="text" name="content">' +
                    '<input type="submit" value="Add content" />' +
                    '</form>' +
                    '<div>' +
                    '<strong>Content in database:</strong>' +
                    '<pre>' +
                    'DBCONTENT' +
                    '</pre>' +
                    '</div>' +
                    '<form action="/" method="get">' +
                    '<input type="text" name="q">' +
                    '<input type="submit" value=Filter content" />' +
                    '</form>' +
                    '</body>' +
                    '</html>';

  // parse to distinguish between "/" and "/add" url paths
  var pathname = url.parse(request.url).pathname;

  // post request to "/add"
  if(pathname === '/add') {
    var requestBody = '';
    var postParameters;
    request.on('data', function(data) {
      requestBody += data;
    });
    request.on('end', function() {
      postParameters = querystring.parse(requestBody);
      //  the post parameter "content" holds the content to be added
      addContentToDatabase(postParameters.content, function() {
        response.writeHead(302, {'Location': '/'});
        response.end();
      });
    });
  } else {
    var filter = querystring.parse(url.parse(request.url).query).q;
    getContentsFromDatabase(filter, function(contents) {
      response.writeHead(200, {'Content-Type': 'text/html'});
      response.write(pageContent.replace('DBCONTENT, contents'));
      response.end();
    });
  }
}
