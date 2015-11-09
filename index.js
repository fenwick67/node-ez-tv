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

/*
  call this program with schedule.json filename

  OR just modify the schedule.json default file

*/

var schedule;
var scheduleFile;

if(process.argv[2]){
  scheduleFile = process.argv[2];
}else{
  scheduleFile = __dirname + '/schedule.json';
}


fs.readFile(scheduleFile,'utf8',function(er,data){
  if(er){
    throw new Error('could not read schedule.json');
  } else {
    try{
      schedule =  JSON.parse(data);
    }
    catch(e){
      throw new Error('failed to parse schedule fron JSON');
    }

    // register commercials
    tvPlayer.registerCommercials(schedule.commercials);

    // schedule shows to play per schedule.json
    tvPlayer.clearShows();
    tvPlayer.registerShows(schedule.jobs);
    tvPlayer.run(schedule.options);

    var guide = guideGen(schedule);
    // console.log('next show: ',guide.getNext());
    // console.log('schedule: ',guide.getGuide());

    expressApp();
  }
});

function expressApp(){
  var app = express();

  app.get('/guide.json',function(req,res){
    var guide = guideGen(schedule).getGuide();
    res.send(guide);
  });

  app.get('/next.json',function(req,res){
    var next = guideGen(schedule).getNext();
    res.send(next);
  });

  app.use( serveStatic('public') );

  var port = process.env.PORT || 8000;
  app.listen(port,function(){
    console.log('listening on port ',port);
  });
}