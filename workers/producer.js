'use strict';

const co = require('co');
const Promise = require('bluebird');
const fivebeans = require('fivebeans');


class Producer {
  constructor(config) {
    if(!config) config = {};
    this.beanstalkd_host = config.beanstalkd_host;
    this.beanstalkd_port = config.beanstalkd_port;
    this.client = new fivebeans.client(this.beanstalkd_host, this.beanstalkd_port);
  }

  start(payload){
    console.log('Payload:',payload);
    let component = this;
    let client = component.client;
    client
        .on('connect', function(){
          payload.map(p => {
            client.use(p.payload.tube, function(err, name){
              if(err) throw new Error(err);
              if(err) return reject({message:'Error in putting the job'})
              
                client.put(0,0,60, JSON.stringify([p.payload.tube, p]), function(err, jobid){
                  if(err){
                    throw new Error(err);
                  }
                  console.log('JOB CREATED:',jobid);
                })  
              });
          });
        })
        .on('error',function(err){
           throw new Error(err);
        })
        .connect();      
  }
}

module.exports = Producer;


