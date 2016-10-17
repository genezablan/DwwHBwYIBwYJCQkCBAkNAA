'use strict';

const co = require('co');
const Promise = require('bluebird');
const request = require('request');
const cheerio = require('cheerio');

class Consumer {
	constructor(){

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
}

co(function* (){
	let consumer = new Consumer();
	let exchangeRate = yield consumer.getExchangeRate({from:'USD',to:'EUR'});
	console.log('htmlBody:',exchangeRate);
}).catch(onerror);

function onerror(err) {
  console.error(err.stack);
}