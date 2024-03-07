const express = require('express');
const server = express();
const port = 8080;

server.use(express.static(__dirname + '/public'));
server.listen(port);
console.log(`Express is listening at http://localhost:${port}`);