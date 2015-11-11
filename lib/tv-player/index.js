var schedule = require('node-schedule');
var glob = require('glob');
var _ = require('lodash');
var async = require('async');


//use OMXPlayer output adapter if on a raspberry pi
//otherwise use VLC
if(process.env.USER && process.env.USER.toString().toLowerCase() === 'pi'){
  var outputAdapter = require('./omxplayer-output-adapter');
}else{
  var outputAdapter = require('./vlc-output-adapter');
}


(function(){

  var self = this;
  var jobTimers = [];
  var commercials = [];
  var currentJob;
  var currentJobRepeats;
  var showOrders = {};

  this.registerCommercials = function(c){
    commercials = c;
  }

  this.clearShows = function(){
    showsOrders = {};
  }

  this.registerShows = function(jobs){

    _.forEach(showOrders,function(val,key){
      delete showOrders[key].files;
    });

    jobs.forEach(function(job){
      scheduleCronMulti(job.cron, function(){
        playJob(job);
        currentJobRepeats = 0;
      });
    });

    
  }

  function playJob(j){

    if(!showOrders[j.name] || !showOrders[j.name].files){ //if show order not defined, define it!
      glob(j.pathspec,function(er,files){//get all files with pathspec
        if(er){
          throw new Error(er);
          return;
        }
        if(files.length < 1){
          console.log('no files match pathspec: '+j.pathspec);
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

          //console.log(o.files);
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

      console.log('playing show',fileToPlay);
      playShow(fileToPlay);
      currentJob = j;
      //console.log('playing show: "'+j.name+'"');
    }
      
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
    outputAdapter.playMedia(file);
  }

  function playMedia(path){
    outputAdapter.playMedia(path);
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

  module.exports = this;
}());
