
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
  , serveStatic = require('serve-static')
  , scheduleValidator = require('./lib/schedule-validator')
  , colors = require('colors');


module.exports=function(options){


  /*
    schedule.json format:
    
    {
      "jobs":[
        {
          "name":"short films",
          "cron":"0 20 * * *",
          "pathspec":"~/videos/shortfilms/*.mp4"
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

  
  //globals
  var schedule;
  var scheduleFile;
  var guide = [];
  var guideNext = {};

  if(options.file){
    scheduleFile = options.file;
  }else{
    scheduleFile = __dirname + '/schedule.json';
  }


  fs.readFile(scheduleFile,'utf8',function(er,data){
    if(er){
      throw new Error('could not read schedule file'+scheduleFile);
    } else {

      // validate schedule data
      // it's actually synchronous shhh
      scheduleValidator.validate(data,function(error,nbds){
        if(error){
          throw new Error(error);
        }
        else if(nbds && nbds.length > 0){
          console.log( ('SCHEDULE WARNINGS:::::\n'+(nbds.join('\n'))).yellow );
        }else{
          console.log('schedule checks all OK'.green);
        }
      });

      schedule =  JSON.parse(data);
      
      // set timeout to generate new guide every minute
      setInterval(newGuide,60000);

      // register commercials
      tvPlayer.registerCommercials(schedule.commercials);

      // schedule shows to play per schedule.json
      tvPlayer.clearShows();
      tvPlayer.registerShows(schedule.jobs);
      tvPlayer.run(schedule.options);

      // generate a new guide right now
      newGuide();
      
      // launch express app
      expressApp();
      
    }
  });

  function newGuide(){
    var generator = guideGen(schedule);
    guide = generator.getGuide();  
    guideNext = generator.getNext();
  }
  
  function expressApp(){
    var app = express();
    
    function lightCaching(req,res,next){
      res.setHeader('Cache-Control', 'max-age=300');
      next();
    }

    app.get('/guide.json',lightCaching,function(req,res){
      res.send(guide);
    });

    app.get('/next.json',function(req,res){
      
      res.send(next);
    });

    app.use( serveStatic(__dirname + '/public') );

    var port = options.port || process.env.PORT || 8000;
    app.listen(port,function(){
      console.log('listening on port ',port);
    });
  }
  
  
}