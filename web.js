"use strict"
/** @module web
 * @name web
 * @author Serg A. Osipov
 * @email serg.osipov@gmail.com
 * @overview Some web request methods
 */

var conf;
var fs=require('fs');
var urlparser = require('url');
//var tmpfile=0;
var crypto = require('crypto')
var http = require('http')
var RSVP = require('rsvp');

/**
 * Возвращаем объект conf
 * @return {conf} conf - объект, описывающий конфигурацию приложения и задающий необходимые парметры.
 */
function getconf(){
	if(!conf) conf = require('../config.json')
	return conf;
};

/**
 * Возвращает http или https - объект в зависимости от URL
 * @param  {string} url  	URL - анализируется только начала запроса, указывающая тип протокола
 * @return {http|https}     http или https объект
 */
function getHttp(url){
	//exports.getHttp=function(url){
	if(url && url.match(/^https/i)){
		return require('https');
	}else if(url && url.match(/^http/i)){
		return http=require('http');
	};
};


/**
 * Установка соственного объекта конфигурации
 * @param  {conf} config - Объект конфигурации
 * @return {undefined}       
 */
exports.setconf=function setconf(config){
	/** Set conf manual */
	conf = config;
	return this;
};

/**
 * Метод реализующий  http GET запрос. Базовый метод, возвращающий сырые данные.
 * @param  {string} url     Полный URL запроса (включая querystring-часть - часть после '?')
 * @param  {object} headers Объект, описывающий дополнительные параметры http-заголовка.
 * @return {promise}        Возвращается promise объект, resolve-вызов которого получит результат выполнения http-запроса в сыром виде (то есть в виде строки)
 */
exports.get=function (url, headers){
	var m;
	var string;
	var http;
	var post_options;
	var post_req;
	return new RSVP.Promise(function(resolve, reject){
		if(url){
			//-if(m=url.match(/^(http\:\/\/)(.+?)(\:\d*){0,1}(\/.*)$/)){
			var m = urlparser.parse(url);
			if(m && m.hostname){
				string = '';
				http = getHttp(url);
				post_options = {
//					host: m[2],
//					port: m[3]?(parseInt(m[3].substr(1)) || 80):80,
//					path: m[4],
					host: m.hostname,
					port: m.port || 80,
					path: m.path,
					method: 'GET',
				};
				if(headers) post_options.headers = headers;
				post_req = http.request(post_options, function(res) {
					res.setEncoding('utf8');
					res.on('error',function(err){reject(err);});
					res.on('data', function (chunk) {string+=chunk.toString();});
					res.on('end', function(){
						if(res.statusCode == 200){
							resolve(string);
						}else{
							reject(new Error('Request error: status ' + res.statusCode + ' | complete:' + res.complete));
						};
					});
				}).on('error', function(err){reject(err);});
				post_req.end();
			}else{
				reject('Invalid URL');
			};
		}else{
			reject(new Error('Empty url'));
		};
	});
};

/**
 * Метод реализующий  http POST запрос. Базовый метод, возвращающий сырые данные.
 * @param  {string} url     Полный URL запроса (включая querystring-часть - часть после '?')
 * @param  {string} data    Данные, передаваемые в теле POST-запроса
 * @param  {object} headers Объект, описывающий дополнительные параметры http-заголовка.
 * @return {promise}        Возвращается promise объект, resolve-вызов которого получит результат выполнения http-запроса в сыром виде (то есть в виде строки)
 */
exports.post=function (url, data, headers){
	return new RSVP.Promise(function(resolve, reject){
		if(url){
			var string = '';
			var m;
//			if(m=url.match(/^(http\:\/\/)(.+?)(\:\d*){0,1}(\/.*)$/)){
			var m = urlparser.parse(url);
			if(m && m.hostname){
				var http = getHttp(url);
				var post_options = {
//					host: m[2],
//					port: m[3]?(parseInt(m[3].substr(1)) || 80):80,
//					path: m[4],
					host: m.hostname,
					port: m.port || 80,
					path: m.path,
					method: 'POST',
				};
				if(headers) post_options.headers = headers;
				var post_req = http.request(post_options, function(res) {
					res.setEncoding('utf8');
					res.on('error',function(err){reject(err);});
					res.on('data', function (chunk) {string+=chunk.toString();});
					res.on('end', function(){
						if(res.statusCode == 200){
							resolve(string);
						}else{
							reject(new Error('Request error: status' + res.statusCode));
						};
					});
				}).on('error', function(err){reject(err);});
				post_req.write(data);
				post_req.end();
			}else{
				reject('Invalid URL');
			};
		}else{
			reject(new Error('Empty url'));
		};
	});
};

/**
 * Выполнения POST-запроса, результат которого возвращается в виде JSON
 * @param  {string} URL     URL как в запросе web.post
 * @param  {string} data    Данные, передаваемые в теле POST-запроса (как в web.post)
 * @return {promise}        Возвращается promise объект, resolve-вызов которого получит object, который являеется результат выполнения http-запроса распарсеный как JSON
 */
exports.post_json=function (url, data){
	var strData = JSON.stringify(data);
	return exports.post(url, strData, {'Content-Type': 'application/json'})
	.then(function(string){
		try{
			var response=JSON.parse(string);
			return response;
		}catch(e){
			return RSVP.Promise.reject(e);
		};
	})
};

/**
 * Выполнения GET-запроса, результат которого возвращается в виде JSON
 * @param  {string} URL     URL как в запросе web.post
 * @return {promise}        Возвращается promise объект, resolve-вызов которого получит object, который являеется результат выполнения http-запроса распарсеный как JSON
 */
exports.get_json=function (url){
	return exports.get(url)
	.then(function(string){
		try{
			var response=JSON.parse(string);
			return response;
		}catch(e){
			return RSVP.Promise.reject(e);
		};
	})
};

/**
 * Обращение к методу API. Обёртка вокруг web.post_json
 * @param  {string} URL     URL как в запросе web.post
 * @return {promise} 	       Возвращается promise объект, resolve-вызов которого получит object, который являеется результат выполнения http-запроса распарсеный как JSON. В отличии от web.post_json возвращаемый результат анализируется. Если error==0 возвращается содержимое параметра data, иначе генерируется ошибка.
 */
exports.api=function (url, data){
	return exports.post_json(url, data || {})
	.then(function(json){
		if(json.error==0){
			return json.data;
		}else{
			return RSVP.Promise.reject(new Error(json.message));
		};
	});
};

/**
 * Получение файла (GET-запрос)
 * @param  {string} fileurl		URL ресурса, который должен быть получен как файл.
 * @param  {object} headers		Объект, описывающий дополнительные параметры http-заголовка.
 * @return {promise}            Возвращается promise объект, resolve-вызов которого получит object, содержащий информацию о временном файле, содержащем скаченные данные. 
 * @example
 * {
 *    file: '/full/path/to/temp/filename',
 *    filename: 'filename',
 *    fileurl: 'http://fileurl:80/get/filename',
 *    size: 9999
 * }
 */
exports.get_file=function (fileurl, headers){
	var conf=getconf(); // получаем конфигурацию
	var startat = new Date();
	return new RSVP.Promise(function(resolve, reject){
		var tempdir = (conf.tempdir || '/tmp').replace(/\/$/,''); //
		if(fileurl){
			var filename = urlparser.parse(fileurl).pathname.split('/').pop();
			var tmpfile = rndString();
			var file = tempdir + '/file_'+tmpfile;
			var wstream = fs.createWriteStream(file);
			var data = {file: file, filename: filename, url: fileurl, size:0};
			var http = getHttp(fileurl);
			http.get(fileurl, function(res) {
				res.on('error',function(err){
					reject(err);
				});
				res.on('data', function (chunk) {
					data.size+=chunk.length;
					wstream.write(chunk);}
				);
				res.on('end', function(){
					if(res.statusCode == 200){
						wstream.end(); 
						data.headers = res.headers;
						data.elapsed = (new Date() - startat);
						resolve(data);
					}else{
						wstream.end();
						fs.unlinkSync(file);
						reject(new Error('Request error'));
					};
				});
			}).on('error', function(err){
				reject(err);
			});
		}else{
			reject(new Error('Empty url'));
		};
	});
};


exports.escape=function (string){
	return encodeURIComponent(string);
};


function rndString(){
	return crypto.randomBytes(32).toString('hex');
};

