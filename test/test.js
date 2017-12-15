#!/usr/local/bin/node
var nock = require("nock");
var web = require("../web");
var should = require('should');
var fs = require('fs');

nock('http://stroka.settv.ru').get('/api/fr/test').times(3).reply(200, { error: 0, message: 'Ok', data: { ok: true } });
nock('http://admin:123@stroka.settv.ru').get('/api/fr/test').times(3).reply(200, { error: 0, message: 'Ok', data: { ok: true } });
nock('http://stroka.settv.ru').get('/file').replyWithFile(200, __dirname + '/files/file');
nock('http://stroka.settv.ru').get('/file').reply(302, {}, {location: 'http://stroka.settv.ru/file2'});
nock('http://stroka.settv.ru').get('/file2').replyWithFile(200, __dirname + '/files/file');
nock('http://stroka.settv.ru').post('/api/fr/test').times(4).reply(200, { error: 0, message: 'Ok', data: { ok: true } });
describe('Web', function(){

	describe('xget', function(){
		it('should return object with body and response', async function(done){
			try{
				let result = await web.xget('http://stroka.settv.ru/api/fr/test');
				result.should.type('object');
				result.response.should.type('object');
				result.response.statusCode.should.eql(200);
				eval('(' + result.body +')') .should.eql({ error: 0, message: 'Ok', data: { ok: true } });
				done();
			}catch(err){
				done(err);
			};
		})
	});

	describe('xget', function(){
		it('should return object with body and response', async function(done){
			let result = await web.xget('http://admin:123@stroka.settv.ru/api/fr/test');
			try{
				result.should.type('object');
				result.response.should.type('object');
				result.response.statusCode.should.eql(200);
				eval('(' + result.body +')') .should.eql({ error: 0, message: 'Ok', data: { ok: true } });
				done();
			}catch(err){
				done(err);
			};
		});
	});

	describe('get', function(){
		it('should return right response body', async function(done){
			try{
				let result = await web.get('http://stroka.settv.ru/api/fr/test');
				eval('(' + result +')') .should.eql({ error: 0, message: 'Ok', data: { ok: true } });
				done();
			}catch(err){
				done(err);
			};
		});
	});

	describe('get_json', function(){
		it('should return right answer', async function(done){
			try{
				let result = await web.get_json('http://stroka.settv.ru/api/fr/test');
				result.should.eql({ error: 0, message: 'Ok', data: { ok: true } });
				done();
			}catch(err){
				done(err);
			};
		});
	});

	describe('get_file', function(){
		it('should return right answer', async function(done){
			web.setconf({tempdir:'/tmp'});
			try{
				let result = await web.get_file('http://stroka.settv.ru/file');
				should.exist(result);
				result.should.type('object');
				result.file.should.type('string');
				if (!fs.existsSync(result.file)) {
					throw ("Downloaded file is not exists");
				};
				fs.unlink(result.file, (err)=>{});
				done();
			}catch(err){
				return done(err);
			};
		});
	});


	describe('get_file_with_redirect', function(){
		it('should return right answer', async function(done){
			web.setconf({tempdir:'/tmp'});
			try{
				let result = await web.get_file_with_redirect('http://stroka.settv.ru/file');
				should.exist(result);
				result.should.type('object');
				result.file.should.type('string');
				if (!fs.existsSync(result.file)) {
					throw ("Downloaded file is not exists");
				};
				fs.unlink(result.file, (err)=>{});
				done();
			}catch(err){
				return done(err);
			};
		});
	});



	describe('xpost', function(){
		it('should return object', async function(done){
			try{
				let result = await web.xpost('http://stroka.settv.ru/api/fr/test', "");
				result.should.type('object');
				result.response.should.type('object');
				result.response.statusCode.should.eql(200);
				eval('(' + result.body +')').should.eql({ error: 0, message: 'Ok', data: { ok: true } });
				done();
			}catch(err){
				return done(err);
			};
		});
	});


	describe('post', function(){
		it('should return right answer', async function(done){
			try{
				let result = await web.post('http://stroka.settv.ru/api/fr/test', "");
				eval('(' + result +')') .should.eql({ error: 0, message: 'Ok', data: { ok: true } });
				done();
			}catch(err){
				return done(err);
			};
		});
	});

	describe('post_json', function(){
		it('should return right answer', async function(done){
			try{
				let result = await web.post_json('http://stroka.settv.ru/api/fr/test', {});
				result.should.eql({ error: 0, message: 'Ok', data: { ok: true } });
				done();
			}catch(err){
				return done(err);
			};
		})
	});

	describe('api', function(){
		it('should return right answer', async  function(done){
			try{
				let result = await web.api('http://stroka.settv.ru/api/fr/test', {});
				result.should.eql({ ok: true });
				//-result.should.eql({ error: 0, message: 'Ok', data: { ok: true } });
				done();
			}catch(err){
				return done(err);
			};
		})
	});

});
