Web module
------------

Some methods for outgoing http-requests with pomises

 * web.get          - plain GET request
 * web.get_json     - GET request, returning JSON-data
 * web.get_file     - GET request, returning file
 * web.post         - plain POST request
 * web.post_json    - POST request, returning JSON-data
 * web.api          - POST request, returning JSON-data and error number analize
 * web.post_file    - POST request, returning file (not implemented)

Install
--------

npm install https://github.com/angryoyc/web.git

Tests
------
make test


Example
--------

require("web").get('http://settv.ru/')
.then(
	function(result){
		console.log(result);
	}, 
	function(err){
		console.log('ERR:', err);
	}
);
