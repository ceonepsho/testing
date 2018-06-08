var express = require("express");
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require("path");
var port = process.env.PORT || 3000;


app.get("/",function(req,res)
	{
		res.status(300).sendFile(path.join(__dirname,"test.html")); 
	});

io.on('connection', function(socket){
//------------------------------------------------------------------------
  socket.on('facebook', function(code){
    console.log(code);
  });
  socket.on('test', function(test){
    console.log(test);
  });
});
http.listen(port);
