var schedule = require('node-schedule')
  , cronParser = require('cron-parser')
  , tvPlayer = require('./lib/tv-player')
  , fs = require('fs')
  , pathspec = require('pathspec')
  , glob = require('glob')
  , guideGen = require('./lib/guide-gen')
  , theSchedule = {}
  , _ = require('lodash')
  , express = require('express')
  , serveStatic = require('serve-static');

var app = express();

/*
  schedule.json format:
  
  {
    "jobs":[
      {
        "name":"Simpsons",
        "cron":"0 20 * * *",
        "pathspec":"~/videos/simpsons/*.mp4"
      }
    ],
    "commercials":[
      {
        "name":"1990s commercials",
        "pathspec":"~/videos/commercials/1990s/*.mp4" 
      }
    ]
    "options":{
  
    }
  }
*/

var schedule;

fs.readFile(__dirname + '/schedule.json','utf8',function(er,data){
  if(er){
    throw new Error('could not read schedule.json');
  } else {
    try{
      schedule =  JSON.parse(data);
    }
    catch(e){
      throw new Error('failed to parse schedule fron JSON');
    }

    // configure libVLC player
    tvPlayer.registerCommercials(schedule.commercials);

    // schedule shows to play per schedule.json
    tvPlayer.clearShows();
    tvPlayer.registerShows(schedule.jobs);
    tvPlayer.run(schedule.options);

    var guide = guideGen(schedule);
    //console.log('next show: ',guide.getNext());
   //console.log('schedule: ',guide.getGuide());
  }
});

app.get('/guide.json',function(req,res){
  var guide = guideGen(schedule).getGuide();
  res.send(guide);
});

app.get('/next.json',function(req,res){
  var next = guideGen(schedule).getNext();
  res.send(next);
});

app.use(serveStatic('public'));
app.listen(8000);
