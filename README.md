[![NPM](https://nodei.co/npm/promise-node-core.svg?downloads=true&downloadRank=true)](https://nodei.co/npm/promise-node-core/)&nbsp;&nbsp;
[![Build Status](https://travis-ci.org/pradeep-mishra/promise-node-core.svg?branch=master)](https://travis-ci.org/pradeep-mishra/promise-node-core)


promise-node-core
=================


Promise for all node core modules async functions 
-------------------------------------

&copy; Pradeep Mishra, Licensed under the MIT-LICENSE

 


Example usage
-------------

```javascript
var pnc = require('promise-node-core');
var fs = pnc.require('fs');
fs.readFile('./index.js').then(function(res){
	console.log(res);
});

var http = pnc.require('http');
http.get("http://www.google.com/index.html").then(function(res) {
  console.log("Got response: " + res.statusCode);
});

```


```bash
npm install promise-node-core --save
```
