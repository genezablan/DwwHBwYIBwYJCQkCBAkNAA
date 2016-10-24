'use strict';

const co = require('co');

let Producer = require('../workers/producer');
let config = {
	beanstalkd_host : process.env.BEANSTALKD_HOST || '127.0.0.1',
	beanstalkd_port : process.env.BEANSTALKD_PORT || '11300',
}
let producer = new Producer(config);
producer.start(
	[
		{type: 'scraper', payload: {from: 'USD', to: 'HKD', id: 'usdhkd',tube:'genezablan'}},
		{type: 'scraper', payload: {from: 'USD', to: 'EUR', id: 'usdhkd',tube:'genezablan'}},
	]);

