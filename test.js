/*
http
https
dns
fs
zlib
*/

var pnc = require('./index.js');

var fs = pnc.require('fs');
fs.readFile('./index.js').then(function(res){
	console.log(res);
});


var http = pnc.require('http');
var res = http.get("http://google.co.in");
res.then(function(data){
	console.log(data.body);
})
res.on('error', function(e) {
  console.log("Got error: " + e.message);
});
