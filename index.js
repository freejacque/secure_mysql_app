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

  // POST request to "/add"
  if(pathname === '/add') {
    var requestBody = '';
    var postParameters;
    request.on('data', function(data) {
      requestBody += data;
    });
    request.on('end', function() {
      postParameters = querystring.parse(requestBody);
      //  the POST parameter "content" holds the content to be added
      addContentToDatabase(postParameters.content, function() {
        // redirect to "/" when new content is added to the db
        response.writeHead(302, {'Location': '/'});
        response.end();
      });
    });
    // GET request to "/"
  } else {
    //  text used for filtering in GET parameter "q"
    var filter = querystring.parse(url.parse(request.url).query).q;
    getContentsFromDatabase(filter, function(contents) {
      response.writeHead(200, {'Content-Type': 'text/html'});
      // DBCONTENT is replaced with data from db (do not do this in real app, use a template)
      response.write(pageContent.replace('DBCONTENT', contents));
      response.end();
    });
  }
}

// called by the code that handles the "/" route.
// retrieves info from the db & applies the LIKE filter if one is used in the query
function getContentsFromDatabase(filter, callback) {
  var connection = mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: 'root',
    database: 'node'
  });
  var query;
  var resultsAsString = '';

  if(filter) {
    filter = filter + '%';
    query = connection.query( 'SELECT id, content FROM test ' +
                              'WHERE content LIKE ?', filter);
  } else {
    query = connection.query('SELECT id, content FROM test');
  }

  query.on('error', function(err) {
    console.log('A database error occurred:');
    console.log(err);
  });

  // every result is added to the content string
  query.on('result', function(result) {
    resultsAsString += 'id: ' + result.id;
    resultsAsString += ', content: ' + result.content;
    resultsAsString += '\n';
  });

  //  once all results are processed, call the callback
  //  the completed string is the parameter
  query.on('end', function(result) {
    connection.end();
    callback(resultsAsString);
  });
}

// called by the code that handles the "/add" route
// inserts the string as a new content entry
function addContentToDatabase(content, callback) {
  var connection = mysql.createConnection({
    host: 'localhost',
    port: 3307,
    user: 'root',
    password: 'root',
    database: 'node'
  });

  connection.query('INSERT INTO test (content) ' + 'VALUES ("' + content + '")',
    function(err) {
      if(err) {
        console.log('Could not insert content "' + content + '" into database.');
      }
      callback();
    });
}
