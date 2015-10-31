var schedule = require('node-schedule');
var glob = require('glob');

module.exports = function(VLC){

  var vlc = VLC([
    //'-I', 'dummy',
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
          playShow(job.pathspec);
          console.log('playing show: "'+job.name+'"');
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
      //play commercials
      playCommercials();
    })
  }

  function createPlayer(cb){
    player = vlc.mediaplayer;
    player.fullscreen=false;
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
      console.log('released!')
    }
    console.log('playing media: '+path);
    var media = vlc.mediaFromFile(path);
    console.log('ok');
    media.parseSync(); 
    console.log('ok');  
    //@DREW it won't get past this line when re-playing commercials
    player.stop();
    console.log('ok');
    player.media = media;

    console.log('ok');  
    //player.position=0;

   

    console.log('ok');  
    player.play();

    /*
    var poller = setInterval(function () {
      console.log('Poll:', player.position);

      try {  
        if (player.position >=.9999){
          tearDown();
        }
      } catch (e) {
        console.log('caught error',e);
      }
    }, 500);
    */

    player.on('EndReached',tearDown);
    function tearDown() {
      // below line breaks repeats.
      //player.removeListener('EndReached',this);
      console.log('file reached the end.');  
      //player.stop();
      //media.release();
      //vlc.release();
      playCommercials();
    }
  }


  schedule.scheduleJob('* * * * * *', function(){
    console.log('heartbeat');
  });

  return this;

}