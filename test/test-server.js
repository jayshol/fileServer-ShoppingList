var serverObj = require('../server');
var chai = require('chai');
var expect = chai.expect;
var request = require('request');

describe('Suite01', function(){
	this.timeout(500);
	before(function(){
		serverObj.listen(9000);
	});

	after(function(){
		serverObj.close();
	});

	it('Returns an String', function(done){
		request.get('http://localhost:9000', function(err, res, body){
			expect(res.body).to.be.a('string');
		});
	});
})