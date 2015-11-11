/*

media adapter

VLC

implements

createPlyer(cb)
playMedia(path)
onEndReached(function)


*/

var VLC = require('vlc');

(function(){

  var vlc = VLC([
      //'-I', 'web',
      //'-V', 'dummy',
      //fullscreen option doesn't work --fullscreen',
      //use -vvv for extra verbose
      '--no-video-title-show',
      '--disable-screensaver',
      '--no-snapshot-preview'
  ]);

  var self = this;
  var vlcStarted = false;
  var player;

  self.createPlayer = function(cb){
    if(!vlcStarted){
      player = vlc.mediaplayer;
      player.fullscreen=true;
      player.on('EndReached',_onEndReached);
      vlcStarted = true;
    }
    cb(null);
  }

  self.playMedia = function(path){
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

  function _onEndReached(){
    //console.log('file reached the end.');  
    //player.stop();
    //media.release();
    //vlc.release();
    self.onEndReached();
  }

  self.onEndReached = function(){};//placeholder

  module.exports = this;

}())