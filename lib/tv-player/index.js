var schedule = require('node-schedule');
var glob = require('glob');
var _ = require('lodash');

module.exports = function(VLC){

  var vlc = VLC([
    //'-I', 'web',
    //'-V', 'dummy',
    '--verbose', '1',
    '--no-video-title-show',
    '--disable-screensaver',
    '--no-snapshot-preview'
  ]);

  var jobTimers = [];
  var commercials = [];
  var vlcStarted = false;
  var player;
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
      vlcStarted = true;
      playCommercials();
    })
  }

  function createPlayer(cb){
    player = vlc.mediaplayer;
    player.fullscreen=false;
    
    player.on('EndReached',tearDown);
    function tearDown() {
      //console.log('file reached the end.');  
      //player.stop();
      //media.release();
      //vlc.release();
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

    cb(null);
  }

  function playCommercials(){
    console.log('playing commercials');
    //play a random commercial
    var file = commercials[~~(commercials.length * Math.random())].pathspec;
    setTimeout(function(){
      playMedia(file);
    },1000);
  }

  function playShow(file){
    // plays a show into the vlc mediaPlayer instance
    playMedia(file);
  }

  function playMedia(path,done){
    if(player && player.media){
      player.media.release();
    }

    console.log('playing media: '+path);
    var media = vlc.mediaFromFile(path);
    media.parseSync(); 
    player.stop();
    player.media = media;
    //player.position=0;
    player.play();
  }

  function scheduleCronMulti(crons,callback){
    if (typeof crons === 'string'){
      schedule.scheduleJob(crons,callback);
    }
    else if( typeof crons === 'object' && typeof crons.length !== 'undefined' ){//given array
      var argCopy = arguments;
      for(var i = 0, l = crons.length; i < l; i ++){
        argCopy[0]=crons[i];
        schedule.scheduleJob(crons,callback);
      }
    }
  }

  return this;
}
