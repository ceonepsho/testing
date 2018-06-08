var express = require("express");
var app = express();
var path = require("path");
var port = process.env.PORT || 3000;


app.get("/",function(req,res)
	{
		res.status(300).sendFile(path.join(__dirname,"test.html")); 
	});

app.listen(port);
