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
		it('should return object with body and response', function(done){
			web.xget('http://stroka.settv.ru/api/fr/test')
			.then(
				function(result){
					result.should.type('object');
					result.response.should.type('object');
					result.response.statusCode.should.eql(200);
					eval('(' + result.body +')') .should.eql({ error: 0, message: 'Ok', data: { ok: true } });
					done();
				},
				function(err){
					console.log('RESULT', err)
					return done(err);
				}
			).catch(done);
		})
	});

	describe('xget', function(){
		it('should return object with body and response', function(done){
			web.xget('http://admin:123@stroka.settv.ru/api/fr/test')
			.then(
				function(result){
					result.should.type('object');
					result.response.should.type('object');
					result.response.statusCode.should.eql(200);
					eval('(' + result.body +')') .should.eql({ error: 0, message: 'Ok', data: { ok: true } });
					done();
				},
				function(err){
					console.log('RESULT', err)
					return done(err);
				}
			).catch(done);
		})
	});

	describe('get', function(){
		it('should return right response body', function(done){
			web.get('http://stroka.settv.ru/api/fr/test')
			.then(
				function(result){
					eval('(' + result +')') .should.eql({ error: 0, message: 'Ok', data: { ok: true } });
					done();
				},
				function(err){
					console.log('RESULT', err)
					return done(err);
				}
			).catch(done);
		})
	});

	describe('get_json', function(){
		it('should return right answer', function(done){
			web.get_json('http://stroka.settv.ru/api/fr/test')
			.then(
				function(result){
					result.should.eql({ error: 0, message: 'Ok', data: { ok: true } });
					done();
				},
				function(err){
					return done(err);
				}
			).catch(done);
		})
	});

	describe('get_file', function(){
		it('should return right answer', function(done){
			web.setconf({tempdir:'/tmp'});
			web.get_file('http://stroka.settv.ru/file')
			.then(
				function(result){

					should.exist(result);
					result.should.type('object');
					result.file.should.type('string');

					if (!fs.existsSync(result.file)) {
						throw ("Downloaded file is not exists");
					};

					fs.unlink(result.file, (err)=>{});
					done();
				},
				function(err){
					return done(err);
				}
			).catch(done);
		})
	});


	describe('get_file_with_redirect', function(){
		it('should return right answer', function(done){
			web.setconf({tempdir:'/tmp'});
			web.get_file_with_redirect('http://stroka.settv.ru/file')
			.then(
				function(result){
					should.exist(result);
					result.should.type('object');
					result.file.should.type('string');
					if (!fs.existsSync(result.file)) {
						throw ("Downloaded file is not exists");
					};
					fs.unlink(result.file, (err)=>{});
					done();
				},
				function(err){
					return done(err);
				}
			).catch(done);
		})
	});



	describe('xpost', function(){
		it('should return object', function(done){
			web.xpost('http://stroka.settv.ru/api/fr/test', "")
			.then(
				function(result){
					result.should.type('object');
					result.response.should.type('object');
					result.response.statusCode.should.eql(200);
					eval('(' + result.body +')').should.eql({ error: 0, message: 'Ok', data: { ok: true } });
					done();
				},
				function(err){
					console.log('RESULT', err)
					return done(err);
				}
			).catch(done);
		})
	});


	describe('post', function(){
		it('should return right answer', function(done){
			web.post('http://stroka.settv.ru/api/fr/test', "")
			.then(
				function(result){
					eval('(' + result +')') .should.eql({ error: 0, message: 'Ok', data: { ok: true } });
					done();
				},
				function(err){
					console.log('RESULT', err)
					return done(err);
				}
			).catch(done);
		})
	});



	describe('post_json', function(){
		it('should return right answer', function(done){
			web.post_json('http://stroka.settv.ru/api/fr/test', {})
			.then(
				function(result){
					result.should.eql({ error: 0, message: 'Ok', data: { ok: true } });
					done();
				},
				function(err){
					return done(err);
				}
			).catch(done);
		})
	});

	describe('api', function(){
		it('should return right answer', function(done){
			web.api('http://stroka.settv.ru/api/fr/test', {})
			.then(
				function(result){
					result.should.eql({ ok: true });
					//-result.should.eql({ error: 0, message: 'Ok', data: { ok: true } });
					done();
				},
				function(err){
					return done(err);
				}
			).catch(done);
		})
	});


/*
*/
});
