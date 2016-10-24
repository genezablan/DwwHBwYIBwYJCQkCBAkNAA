'use strict';
const Beansworker = require('fivebeans').worker;
const Consumer = require('../workers/consumer');

let consumer = new Consumer({
	mongo_host : process.env.MONGO_HOST || '127.0.0.1',
	mongo_db : process.env.MONGO_DB || 'challenge'
});;
let tube = process.env.TUBE || 'genezablan';

let options = {
	id: 'worker_1',
		host: process.env.BEANSTALKD_HOST || '127.0.0.1',
		port: process.env.BEANSTALKD_PORT || 11300,
		handlers : {
			'scraper': consumer
		},
		ignoreDefault: true
	}
let worker = new Beansworker(options);
let times = {}
worker.start([tube])
worker.on('job.handled',function(data){
	console.log('Data:',data);
	if(data.action === 'release'){
		consumer.logs[data.from + ' ' + data.to]
	}
})

