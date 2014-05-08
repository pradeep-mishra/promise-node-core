var Promise = require('promise');
var cacheModules = {};
var nodeModules = {};
var slice = Array.prototype.slice ;

var clone = function(obj){
    var cloneObj = {};
    for(var item in obj){
        if(typeof obj[item] === "function"){
            cloneObj[item] = obj[item].bind(obj);
        }else{
            cloneObj[item] = obj[item];
        }
    }
    return cloneObj;
}
var mix = function(fObj, sObj){
    var nObj = clone(fObj);
    for(var item in sObj){
        if(typeof sObj[item] === "function"){
            nObj[item] = sObj[item].bind(sObj);
        }else{
            nObj[item] = sObj[item];
        }
    }
    return nObj;
}

var nodeAsync2Promise = function(_function, context){
    return function(){
        var args = slice.call(arguments),
            returnValue;
        var promise = new Promise(function (resolve, reject) {
            var callback = function(error, data){
                if(error){
                    return reject(error);
                }
                var _args = slice.call(arguments, 1);
                resolve.apply(this, _args);
            }
            args.push(callback);
            try{
                returnValue = _function.apply(context, args);
            }catch(e){
                returnValue = e;
            }
        });

        if(returnValue instanceof Error){
            throw returnValue;
        }
        if(returnValue){
            return mix(promise, returnValue);
        }
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
            if(typeof mod[func] === "function"){
                cacheModules[moduleName][func] = mod[func].bind(mod);
            }else{
                cacheModules[moduleName][func] = mod[func];
            }
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
        if (typeof mod[func] === "function" && functionList.indexOf(func) >= 0) {
            cacheModules[moduleName][func] = nodeAsync2Promise(mod[func], mod);
        }else{
            if(typeof mod[func] === "function"){
                cacheModules[moduleName][func] = mod[func].bind(mod);
            }else{
                cacheModules[moduleName][func] = mod[func];
            }
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
        if(typeof http[func] === "function"){
            cacheModules[moduleName][func] = http[func].bind(http);
        }else{
            cacheModules[moduleName][func] = http[func];
        }
    }
    cacheModules[moduleName].request = function(opt){
        var returnValue;
        var promise = new Promise(function (resolve, reject) {
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
            try{
                returnValue = nodeModules[moduleName].request(opt, callback);
                returnValue.on('error', function (error) {
                    return reject(error);
                });
            }catch(e){
                returnValue = e;
            }
        });
        if(returnValue instanceof Error){
            throw returnValue;
        }
        if(returnValue){
            return mix(promise, returnValue);
        }
        return promise;
    }

    cacheModules[moduleName].get = function(opt){
        var returnValue;
        var promise = new Promise(function (resolve, reject) {
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
            try{
                returnValue = nodeModules[moduleName].get(opt, callback);
                returnValue.on('error', function (error) {
                    return reject(error);
                });
            }catch(e){
                returnValue = e;
            }

        });
        if(returnValue instanceof Error){
            throw returnValue;
        }
        if(returnValue){
            return mix(promise, returnValue);
        }
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