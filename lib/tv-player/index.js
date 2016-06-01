var schedule = require('node-schedule');
var glob = require('glob');
var _ = require('lodash');
var path = require('path');

//use OMXPlayer output adapter if on a raspberry pi
//otherwise use VLC
if(process.env.USER && process.env.USER.toString().toLowerCase() === 'pi'){
  var outputAdapter = require('./omxplayer-output-adapter');
}else{
  var outputAdapter = require('./js-vlc-output-adapter');
}


(function(){

  var self = this;
  var jobTimers = [];
  var commercials = [];
  var currentJob;
  var currentJobRepeats;
  var showOrders = {};
  /*showOrders will be full of objects keyed by show name
  
  {
    files:['filename','filename2']
    index:integer (current show being played)  
  }
  
  */

  this.registerCommercials = function(c){
    commercials = c;
  }

  this.clearShows = function(){
    showOrders = {};
  }
  
  this.overrideMode = false;
  
  this.setOverrideMode = function(o){
    self.overrideMode = o;
    return o;
  }
  
  this.jobs = {};

  //register shows in the schedule
  this.registerShows = function(jobs){

    self.jobs = jobs;
    
    _.forEach(showOrders,function(val,key){
      delete showOrders[key].files;
    });

    jobs.forEach(function(job){
      scheduleCronMulti(job.cron, function(){
        if (!self.overrideMode){
          playJob(job);
          currentJobRepeats = 0;
        }     
      });
    });   
  }
  
  // get show order for job name, for getting a list of filenames
  self.getFilesForJobName = function(name,callback){
    if (showOrders[name]){
      return callback(showOrders[name].files);
    }
    generateShowOrderForJob(jobByName(name),function(er){
      var order = showOrders[name]||{};
      var files = order.files||[];
      callback(files);
    });
  }

  function generateShowOrderForJob(j,callback){
    glob(j.pathspec,function(er,files){//get all files with pathspec
      if(er){
        throw new Error(er);
        callback(new Error('error globbing pathspec: '+j.pathspec));
        return;
      }
      if(files.length < 1){
        console.log('no files match pathspec for job: '+j.pathspec);
        callback(new Error('no files match pathspec for job: '+j.pathspec));
      }else{
        // create a showOrder key with job.name
        // and put a 'files' array and a 'index' of the current show

        var o = showOrders[j.name] = {};

        if(j.order==="random" || j.order==="shuffle"){
          o.files = _.shuffle(files);// shuffle order
        }else{
          o.files = _.sortBy(files);// a-z order
        }

        if(j.episodeStartIndex && typeof j.episodeStartIndex === 'number'){
          o.index = j.episodeStartIndex % files.length;
        }else if(j.episodeStartIndex === 'random' || j.episodeStartIndex === 'shuffle'){
          o.index = ~~(Math.random() * files.length)
        }else{
          o.index = 0;
        }

        callback(null);
      }
    });
  }
  
  function playJob(j){

    if(!showOrders[j.name] || !showOrders[j.name].files){ //if show order not defined, define it!
      generateShowOrderForJob(j,function(er){
        if(er){
          return;
        }else{
          finish();
        }
      });    
    } else { // show order already defined.
      finish();
    }

    function finish(){
      var order = showOrders[j.name];
      var fileToPlay = order.files[order.index];//pick file
      order.index = (order.index + 1) % order.files.length; // increment then loop if needed

      console.log('playing file',fileToPlay);
      playShow(fileToPlay);
      currentJob = j;
    }
      
  }
  
  //play next episode
  this.skipEpisode = function(){
    // playJob increments the index for this job so just call it?
    playJob(currentJob);
  }

  this.run = function(options){
    //start libVLC window
    createPlayer(function(er){
      if (er) {
        throw new Error(er);
        return;
      }
      playCommercials();
    })
  }
  
   function createPlayer(cb){
    outputAdapter.createPlayer(cb);
  }
  
  // these functions are delegated straight to outputAdapter with a callback and no options
  var delegates = [
    'pause',
    'toggleSubtitles',
    'cycleSubtitles',
    'cycleAudio'
  ];
  
  delegates.forEach(function(name){
    self[name] = outputAdapter[name]||function(cb){return cb(null)};
  });
  
  console.log(self.pause.toString());

  outputAdapter.onEndReached = function() {

      if(currentJob && currentJob.repeat){// spec said to repeat?
        if (typeof currentJob.repeats === 'number'){// repeat is a number?
          if(currentJob.repeat < currentJobRepeats){// not over the limit?
            currentJobRepeats+=1;
            playJob(currentJob);
          }
          else{//over the limit
            playCommercials();
          }
        }
        else if (repeat === true){                  //repeat is true  
          currentJobRepeats+=1;
          playJob(currentJob);
        }
      }else{ //spec didn't say to repeat
        playCommercials();
      }
  }

  function playCommercials(){
    console.log('playing commercials');
    //play a random commercial
    var randomPs = commercials[~~(commercials.length * Math.random())].pathspec;
    
    glob(randomPs,function(er,files){
      if(er){throw new Error('failed to glob commercial pathspec')}
      if(files.length >=1){
        var randomCommercial = files[~~(files.length * Math.random())]
        setTimeout(function(){
          playMedia(randomCommercial);
        },1000);
      }else{
        console.log('no commercial matches pathspec'); 
      }
    });    
    
  }

  function playShow(file){
    playMedia(file);
  }

  self.playFile = playMedia;
  
  function playMedia(file){
    outputAdapter.playMedia(path.resolve(file));
  }

  function scheduleCronMulti(crons,callback){
    if (typeof crons === 'string'){
      schedule.scheduleJob(crons,callback);
    }
    else if( typeof crons === 'object' && typeof crons.length !== 'undefined' ){//given array

      _.forEach(crons,function(cron){
        schedule.scheduleJob(cron,callback);
      });

    }else{
      throw new Error('bad input to scheduleCronMulti');
    }
  }
  
  // get a job by show name
  function jobByName(name){
    return _.find(this.jobs,{name:name})||false;
  }
  
  // play job by show name
  this.playJobByName = function(name){
    var job = jobByName(name);
    if (!job){
      console.log("couldn't find job with name '"+name+"'");
      return;
    }
    currentJob = job;
    playJob(job);
  }

  module.exports = this;
}());
