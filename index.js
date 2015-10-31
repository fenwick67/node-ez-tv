var vlc = require('vlc')
  , schedule = require('node-schedule')
  , tvPlayer = require('./lib/tv-player')(vlc)
  , fs = require('fs')
  , pathspec = require('pathspec')
  , glob = require('glob');

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

fs.readFile(__dirname + '/schedule.json','utf8',function(er,data){
  if(er){
    throw new Error('could not read schedule.json');
  } else {
    var schedule;
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
  }
});