
var fivebeans = require('fivebeans');

var client = new fivebeans.client('localhost', 11300);

var job1 = {
  type: 'scraper',
  payload: {
    name: 'Nolan Ryan',
    sign: 'Leo'
  }
};

client
  .on('connect', function(){
    client.use('default', function(err, name){
      client.put(0,0,60, JSON.stringify(['default', job1]), function(err, jobid){
        console.log(jobid);
      })
    })
  }).on('error', function(err){
    console.log(err);
  })
  .on('close', function(){
    console.log('...Closing the tube...');
  })
  .connect();