#!/usr/local/bin/node

web=require('./web');

web.post_json('http://127.0.0.1:5001/notice', {})
.then(
	function(result){
		console.log(result);
	},
	function(err){
		console.log(err);
	}
);
