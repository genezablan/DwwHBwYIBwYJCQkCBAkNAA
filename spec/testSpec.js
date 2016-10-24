'use strict';

const fivebeans = require('fivebeans');
let client = new fivebeans.client('localhost', 11300);

let job1 = {
  type: 'scraper',
  payload: {  
    from: 'USD',
    to: 'HKD',
    id: 'sample'
  }
};

describe('Testing The Flow',function(){
	let Consumer = require('./consumer.js');

	describe('Beanstalk Connect',function(){
		it("must connect to beanstalkd server",function(done){
			client
				 .on('connect', function(){
				 	console.log('Connected');
					done()
				  })
				 .on('error', function(error){
				 	console.log('Error:',error);
				 })
				.connect();
		},2000);		
	})
	
	describe('Producing Job',function(){
		it("must connect to beanstalkd server",function(done){
			client
				 .on('connect', function(){
				 	console.log('Connected');
					done()
				  })
				 .on('error', function(error){
				 	console.log('Error:',error);
				 })
				.connect();
		},2000);		
	})
		
})