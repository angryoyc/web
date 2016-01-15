/** @module web
 * @name web
 * @author Serg A. Osipov
 * @email serg.osipov@gmail.com
 * @overview Some web request methods
 */

"use strict"

var conf;
var fs=require('fs');
var urlparser = require('url');
//var tmpfile=0;
var crypto = require('crypto')
var http = require('http')
//var RSVP = require('rsvp');

/**
 * Возвращаем объект conf
 * @return {conf} conf - объект, описывающий конфигурацию приложения и задающий необходимые парметры.
 */
function getconf(){
	try{
		if(!conf) conf = require('../config.json');
	}catch(e){
		conf ={};
	}
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
	return new Promise(function(resolve, reject){
		exports.xget(url, headers)
		.then(function(result){
			if(result.response.statusCode == 200){
				resolve(result.body);
			}else{
				reject(new Error('Request error: status ' + result.response.statusCode + ' | complete:' + result.response.complete));
			};
		}, reject).catch(reject);
	});
}

/**
 * Метод реализующий  http GET запрос. Базовый метод, возвращающий сырые данные.
 * @param  {string} url     Полный URL запроса (включая querystring-часть - часть после '?')
 * @param  {object} headers Объект, описывающий дополнительные параметры http-заголовка.
 * @return {promise}        Возвращается promise объект, resolve-вызов которого получит результат выполнения http-запроса в виде объекта с двумя свойствам: response (объект, возвращаемый http.request), и body, содержащие данные тела ответа
 */
exports.xget=function (url, headers){
	var m;
	var string;
	var http;
	var get_options;
	var get_req;
	return new Promise(function(resolve, reject){
		if(url){
			//-if(m=url.match(/^(http\:\/\/)(.+?)(\:\d*){0,1}(\/.*)$/)){
			var m = urlparser.parse(url);
			if(m && m.hostname){
				string = '';
				http = getHttp(url);
				get_options = {
					host: m.hostname,
					port: m.port || 80,
					path: m.path,
					method: 'GET',
				};
				if(headers) get_options.headers = headers;
				get_req = http.request(get_options, function(res) {
					res.setEncoding('utf8');
					res.on('error',function(err){reject(err);});
					res.on('data', function (chunk) {string+=chunk.toString();});
					res.on('end', function(){
						resolve({body:string, response: res});
					});
				}).on('error', function(err){reject(err);});
				get_req.end();
			}else{
				reject('Invalid URL');
			};
		}else{
			reject(new Error('Empty url'));
		};
	});
};

/**
 * Метод реализующий  http POST запрос. Базовый метод, возвращающий сырые данные. Данные запроса возвращаются только если статус ответа = 200 иначе генерируется ошибка
 * @param  {string} url     Полный URL запроса (включая querystring-часть - часть после '?')
 * @param  {string} data    Данные, передаваемые в теле POST-запроса
 * @param  {object} headers Объект, описывающий дополнительные параметры http-заголовка.
 * @return {promise}        Возвращается promise объект, resolve-вызов которого получит результат выполнения http-запроса в сыром виде (то есть в виде строки)
 */
exports.post=function (url, data, headers){
	return new Promise(function(resolve, reject){
		exports.xpost(url, data, headers)
		.then(function(result){
			if(result.response.statusCode == 200){
				resolve(result.body);
			}else{
				reject(new Error('Request error: status ' + result.response.statusCode));
			};
		}, reject).catch(reject);
	});
};

/**
 * Метод реализующий  http POST запрос. Базовый метод, возвращающий сырые данные. Данные запроса возвращаются только если статус ответа = 200 иначе генерируется ошибка
 * @param  {string} url     Полный URL запроса (включая querystring-часть - часть после '?')
 * @param  {string} data    Данные, передаваемые в теле POST-запроса
 * @param  {object} headers Объект, описывающий дополнительные параметры http-заголовка.
 * @return {promise}        Возвращается promise объект, resolve-вызов которого получит результат выполнения http-запроса в виде объекта с двум свойствами: response (объект возвращаемый методом http.request) и body - собранные данные тела ответа
 */
exports.xpost=function (url, data, headers){
	return new Promise(function(resolve, reject){
		if(url){
			var string = '';
			var m;
			var m = urlparser.parse(url);
			if(m && m.hostname){
				var http = getHttp(url);
				var post_options = {
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
						resolve({body:string, response: res});
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
exports.post_json=function (url, data, headers){
	var strData = JSON.stringify(data);
	var hdrs=headers || {};
	hdrs['Content-Type'] = 'application/json';
	return exports.post(url, strData, hdrs)
	.then(function(string){
		try{
			var response=JSON.parse(string);
			return response;
		}catch(e){
			throw e;
			//- return Promise.reject(e);
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
			throw e;
			//- return RSVP.Promise.reject(e);
		};
	})
};

/**
 * Обращение к методу API. Обёртка вокруг web.post_json
 * @param  {string} URL     URL как в запросе web.post
 * @return {promise} 	       Возвращается promise объект, resolve-вызов которого получит object, который являеется результат выполнения http-запроса распарсеный как JSON. В отличии от web.post_json возвращаемый результат анализируется. Если error==0 возвращается содержимое параметра data, иначе генерируется ошибка.
 */
exports.api=function (url, data, headers){
	return exports.post_json(url, data || {}, headers || {})
	.then(function(json){
		if(json.error==0){
			return json.data;
		}else{
			throw new Error(json.message);
			//- return RSVP.Promise.reject(new Error(json.message));
		};
	});
};


/**
 * Получение файла (GET-запрос, автоматически отрабатываем редирект)
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
exports.get_file_with_redirect=function (fileurl, headers, params){
	return new Promise(function(resolve, reject){
		exports.get_file(fileurl, headers, params)
		.then(
			function(result){
				if(result.statusCode==301 || result.statusCode==302){
					fs.unlink(result.file);
					exports.get_file_with_redirect(result.headers.location, headers, params).then(resolve, reject);
				}else{
					resolve(result);
				};
			},
			reject
		).catch(reject);
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
exports.get_file=function (fileurl, headers, params){
	var conf=getconf(); // получаем конфигурацию
	var startat = new Date();
	return new Promise(function(resolve, reject){
		var tempdir = ((params?params.tempdir:'') || conf.tempdir || '/tmp').replace(/\/$/,''); //
		if(fileurl){
			var filename = urlparser.parse(fileurl).pathname.split('/').pop();
			var tmpfile = rndString();
			var file = tempdir + '/file_'+tmpfile;
			var wstream = fs.createWriteStream(file);
			var data = {file: file, filename: filename, url: fileurl, size:0};
			var m = urlparser.parse(fileurl);
			if(m && m.hostname){
				var string = '';
				var http = getHttp(fileurl);
				var get_options = {
					host: m.hostname,
					port: m.port || 80,
					path: m.path,
					method: 'GET',
				};
				if(headers) get_options.headers = headers;
				var get_req = http.request(get_options, function(res) {
					res.on('error',function(err){
						reject(err);
					});
					res.on('data', function (chunk) {
						data.size+=chunk.length;
						wstream.write(chunk);
						if(params && params.onprogress && typeof(params.onprogress)=='function'){
							params.onprogress(data);
							//- process.stdout.write('\rhttp file loading: ' + ESC + '1m' + data.size + ESC + '0m' + ' bytes loaded\r');
						};
					});
					res.on('end', function(){
						data.statusCode = res.statusCode;
						if(res.statusCode == 200  || res.statusCode==302 || res.statusCode==301){
							wstream.end(); 
							data.headers = res.headers;
						}else{
							wstream.end();
							fs.unlinkSync(file);
							reject(new Error('Request error. Status code:' + res.statusCode));
						};
					});
					wstream.on('close', function(){
						data.elapsed = (new Date() - startat);
						resolve(data);
					});
				}).on('error', function(err){reject(err);});
				get_req.end();
			}else{
				reject('Invalid URL');
			};

/*
			var http = getHttp(fileurl);
			http.get(fileurl, function(res) {
				res.on('error',function(err){
					reject(err);
				});
				res.on('data', function (chunk) {
					data.size+=chunk.length;
					wstream.write(chunk);
					if(params && params.onprogress && typeof(params.onprogress)=='function'){
						params.onprogress(data);
						//- process.stdout.write('\rhttp file loading: ' + ESC + '1m' + data.size + ESC + '0m' + ' bytes loaded\r');
					};
				});
				res.on('end', function(){
					if(res.statusCode == 200){
						wstream.end(); 
						data.headers = res.headers;
					}else{
						wstream.end();
						fs.unlinkSync(file);
						reject(new Error('Request error'));
					};
				});
				wstream.on('close', function(){
					data.elapsed = (new Date() - startat);
					resolve(data);
				});
			}).on('error', function(err){
				reject(err);
			});
*/

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

