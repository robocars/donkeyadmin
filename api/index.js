const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const tubes = require('./src/tubes');
const models = require('./src/models');
const drive = require('./src/drive');
drive.setup({
    io
});

io.on('connection', function(socket){
    console.log('a user connected');
});

app.use(cors());
//
app.use(express.static(path.join(__dirname, '../app/build')));
app.use('/', tubes);
app.use('/', models);
app.use('/', drive);

http.listen(8080);