var schedule = require('node-schedule');
var glob = require('glob');

module.exports = function(VLC){

  var vlc = VLC([
    '-I', 'web',
    //'-V', 'dummy',
    '--verbose', '1',
    '--no-video-title-show',
    '--disable-screensaver',
    '--no-snapshot-preview'
  ]);

  var shows = [];
  var jobTimers = [];
  var commercials = [];
  var vlcStarted = false;
  var player;

  this.registerCommercials = function(c){
    commercials = c;
  }

  this.clearShows = function(){
    shows = [];
  }

  this.registerShows = function(jobs){
    for (var i = 0, l = jobs.length; i < l; i ++){
      var job = jobs[i];
      schedule.scheduleJob(job.cron, function(){

        glob(job.pathspec,function(er,files){//get all files with pathspec
          if(er){
            throw new Error(er);
            return;
          }
          var fileToPlay = files[~~(files.length * Math.random())];//choose one at random
          playShow(fileToPlay);
          console.log('playing show: "'+job.name+'"');
        });
          
      });

      schedule.scheduleJob(job.cron, function(){
          console.log('should be playing a show...');
      });

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
    player.fullscreen=true;
    
    player.on('EndReached',tearDown);
    function tearDown() {
      console.log('file reached the end.');  
      //player.stop();
      //media.release();
      //vlc.release();
      playCommercials();
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

  function playShow(pathspec){
    // plays a show into the vlc mediaPlayer instance
    playMedia(pathspec);
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

  function scheduleCronMulti(job,callback){
    var argCopy = arguments;
    if (typeof job === 'string'){
      schedule.scheduleJob(job,callback);
    }
    else if( typeof job === 'object' && typeof job.length !== 'undefined' ){//given array
      for(var i = 0, l = job.length; i < l; i ++){
        schedule.scheduleJob(job[i],callback);
      }
    }
  }


  return this;
}
