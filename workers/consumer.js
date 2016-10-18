'use strict';

const co = require('co');
const Promise = require('bluebird');
const request = require('request');
const cheerio = require('cheerio');
const Beansworker = require('fivebeans').worker;
/**

[
    "default",
    {
        "type":"scraper",
        "payload":{
            "name":"gg gg",
            "sign":"gg"
        }
    }
]
**/
class Consumer {
	constructor(){
		this.type = 'scraper';
	}
	getExchangeRate(data) {
		return new Promise((resolve,reject) => {
			if(!data.from) return reject({message:'From is required'});
			if(!data.to) return reject({message:'To is required'});

			let link = `http://www.xe.com/currencyconverter/convert/?Amount=1&From=${data.from}&To=${data.to}`;
			request.get(link,(err,res,body) => {
				if(err || res.statusCode !== 200) {
					console.error('ERR:',err);
					return reject({message:'Something wrong with getting the links'})
				}
				let $ = cheerio.load(body);
				try{
					let resultAmount = $('#ucc-container .uccResultAmount').text();
					if(!resultAmount) return reject({message:'Can\'t find the result'});
					resultAmount = parseFloat(resultAmount);
					return resolve({amount:resultAmount});
				}catch(e){
					return reject({message:'Can\t parse the result amount'});
				}
			})	
		});
	}

	work(payload,callback){
		console.log('payload:',payload);
		callback('success');
	}
}

let consumer = new Consumer();
let options = {
	id: 'worker_1',
	host: '127.0.0.1',
	port: 11300,
	handlers : {
		'scraper': consumer
	},
	ignoreDefault: true
}
let worker = new Beansworker(options);
worker.start(['default']);
