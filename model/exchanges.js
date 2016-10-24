'use strict';

const mongoose = require('mongoose');

let Exchanges = new mongoose.Schema({
	from: {type: String},
	to: {type: String},
	rate: {type: String, max: 144},
},{strict: false,timestamps: true});

module.exports = mongoose.model('Exchanges',Exchanges);