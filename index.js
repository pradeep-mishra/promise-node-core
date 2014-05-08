var Promise = require('promise');
var cacheModules = {};
var nodeModules = {};
var slice = Array.prototype.slice ;

var nodeAsync2Promise = function(_function, context){
	return function(){
		var args = slice.call(arguments);
		var promise = new Promise(function (resolve, reject) {
			var callback =function(error, data){
				if(error){
					return reject(error);	
				}
				var _args = slice.call(arguments, 1);
				resolve.apply(this, _args);
			}
			args.push(callback);
			_function.apply(context, args);
		});
		
		return promise;
	}
}

var generic = function(moduleName){
	if(cacheModules[moduleName]){
		return cacheModules[moduleName];
	}
	var mod = require(moduleName);
	nodeModules[moduleName] = mod;
	cacheModules[moduleName] = {};

	for (var func in mod) {
	  if (!(func.match(/Sync$/)) && typeof mod[func] === "function") {
	    cacheModules[moduleName][func] = nodeAsync2Promise(mod[func], mod);
	  }else{
	  	cacheModules[moduleName][func] = mod[func];
	  }
	}
	return cacheModules[moduleName] ;
}

var selectedFunctions = function(moduleName, functionList){
	if(cacheModules[moduleName]){
		return cacheModules[moduleName];
	}
	var mod = require(moduleName);
	nodeModules[moduleName] = mod;
	cacheModules[moduleName] = {};
	for (var func in mod) {
	  if (typeof mode[func] === "function" && functionList.indexOf(func) !== -1) {
	    cacheModules[moduleName][func] = nodeAsync2Promise(mod[func], mod);
	  }else{
	  	cacheModules[moduleName][func] = mod[func];
	  }
	}
	return cacheModules[moduleName] ;
}

var http = function(moduleName){
	if(cacheModules[moduleName]){
		return cacheModules[moduleName];
	}
	var http = require(moduleName);
	nodeModules[moduleName]= http;
	cacheModules[moduleName] = {};
	for (var func in http) {
	  cacheModules[moduleName][func] = http[func];
	}
	cacheModules[moduleName].request = function(opt){
		var req, rejec;
		var promise = new Promise(function (resolve, reject) {
			rejec = reject;
			var callback =function(res){
				if(res && res.statusCode > 0 && res.statusCode < 400){
					res.setEncoding((promise.encoding || 'utf8'));
					var resData =[];
					res.on('data', function (chunk) {
						resData.push(chunk);
					});
					res.on('end', function () {
						res.body = resData.join('');
						return resolve(res);
					});		
				}else{
					reject(res);	
				}	
			}
			req = nodeModules[moduleName].request(opt, callback);
			req.on('error', function (error) {
				return rejec(error);
			});	
		});
		promise.req = req;	
		return promise;
	}

	cacheModules[moduleName].get = function(opt){
		var req, rejec;
		var promise = new Promise(function (resolve, reject) {
			rejec = reject;
			var callback =function(res){
				if(res && res.statusCode > 0 && res.statusCode < 400){
					res.setEncoding((promise.encoding || 'utf8'));
					var resData =[];
					res.on('data', function (chunk) {
						resData.push(chunk);
					});
					res.on('end', function () {
						res.body = resData.join('');
						resolve(res);
					});		
				}else{
					reject(res);	
				}	
			}
			req = nodeModules[moduleName].get(opt, callback);
			req.on('error', function (error) {
				return rejec(error);
			});	
		});
		promise.req = req;	
		return promise;
	}
	return cacheModules[moduleName];
}

var zlib = (function(){
	var functionList = [
		'deflate',
		'deflateRaw',
		'gzip',
		'gunzip',
		'inflate',
		'inflateRaw',
		'unzip'
	];
	return function(moduleName){
		return selectedFunctions(moduleName, functionList);
	}
})();

var Require = { 
	fs : generic,
	dns : generic,
	http : http,
	https : http,
	zlib : zlib
}

var requireFunc = function(moduleName){
	if(Require[moduleName]){
		return Require[moduleName](moduleName);
	}
	return require(moduleName);
}


module.exports = {
	require : requireFunc
}