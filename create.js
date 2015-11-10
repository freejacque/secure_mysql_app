'use strict';

var connection = mysql.createConnection({
  host: 'localhost',
  port: 3307,
  user: 'root',
  password: 'root'
});

connection.query('USE node', funcyion(err) {
  if(err) {
    console.log('Could not switch to database "node".');
  }
});
