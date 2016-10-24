	'use strict';

const co = require('co');
const Promise = require('bluebird');
const request = require('request');
const cheerio = require('cheerio');

const mongoose = require('mongoose');
const ExchangesSchema = require('../model/exchanges');

/**
 * @typedef {object} ConsumerInput
 * @property {string} [from] - exchange rate source
 * @property {string} [to] - exchange rate to convert to
 */
/**
 * @typedef {object} ConsumerConfig
 * mongo
 * @property {object} [mongo_host] - address of mongo host
 * @property {string} [mongo_db] - database name of mongo
 */
/**
 * Create a consumer
 * @constructor
 * @param {ConsumerConfig} config
 * @constructor
 */
class Consumer {
	constructor(config) {
		if(!config) config = {};
		this.type = 'scraper';
		this.logs = {}; 
		this.mongo_host = config.mongo_host;
		this.mongo_db = config.mongo_db;
		mongoose.connect(`mongodb://${this.mongo_host}/${this.mongo_db}`);
	}

	/**
	 * This function is used to scrape and save the exchange rate
	 * @param {object} ConsumerInput
	 */
	getExchangeRate(data) {
		let component = this;

		return new Promise((resolve, reject) => {
			let from = data.from;
			let to = data.to;
			if(!from) return reject({ message:'From is required'});
			if(!to) return reject({ message:'To is required'});
			let link = `http://www.xe.com/currencyconverter/convert/?Amount=1&From=${from}&To=${to}`;
			request.get(link, (err, res, body) => {
				if(err || res.statusCode !== 200) {
					console.error('ERR:',err);
					return reject({message:'Something wrong with getting the links'})
				}
				let $ = cheerio.load(body);
				try{
					let rate = $('#ucc-container .uccResultAmount').text();
					if(!rate || rate <= 0) return reject({message:'Can\'t find the result'});
					rate = parseFloat(rate);
					let output = {rate, from, to};
					return ExchangesSchema.findOne({from, to}, (err, exchange) => {
						if(err) return reject({message:'Error in validating exchange',err:err});
						if(!exchange) exchange = new ExchangesSchema();
						exchange.from = output.from;
						exchange.to = output.to;
						exchange.rate = output.rate;
						exchange.save((err, result) => {
				            if(err) return reject({message:'Error in saving exchange',err:err});
				            return resolve(result);
				        });
					});
				}catch(e){
					return reject({message:'Can\t parse the result amount'});
				}
			})	
		});
	}

	/**
	 * This is the handler of beansworker
	 */
	work(payload,callback) {
		if(!payload.id){
			callback('bury');
		}
		let component = this;
		co(function* (){
			let rate = yield component.getExchangeRate(payload);
			console.log('Rate:',rate);
			callback('success');
		}).catch(function onError(err){
			let log_data = component.logs[payload.id] || {errorCounter:0}; // STORAGE OF ERROR COUNTER
			if(log_data.errorCounter >= 3){
				//	BURY THE JOBS AFTER MORE THAN 3 ERRORS
				callback('bury'); 
			}else{
				//	BURY THE JOBS AFTER MORE THAN 3 ERRORS
				log_data.errorCounter ++ ;
				component.logs[payload.id] = log_data; // STORE THE ERROR COUNTER IN THE OBJECT
				callback('release',3);	// RELEASE THE JOB WITH THE DELAY OF 3 SECS
			}
		});
	}
}

module.exports  = Consumer;

