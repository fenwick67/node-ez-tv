/*

media adapter

js-VLC

This differs from the VLC output adapter in that it just uses child_process.spawn
This makes it less robust (probasbly?) but it doesn't require node-gyp

Make sure to add VLC to your PATH!


implements

createPlyer(cb)
playMedia(path)
onEndReached(function)


*/

//var VLC = require('vlc');
var spawn = require('child_process').spawn;
(function(){

  var self = this;
  var player = null;

  self.createPlayer = function(cb){
    //do nothing lol
    cb(null);
  }

  self.playMedia = function(path){
    
    //console.log('playing media ' + path);
    
    if(player){
    if(typeof player.removeAllListeners === 'function'){
      player.removeAllListeners('exit');
      player.removeAllListeners('error');
    }
    if(typeof player.kill === 'function'){
      player.kill();
    }
    player = null;
  }
  
  reallyPlay();
  
  
  // spent is used to guard against calling reallyPlay twice per file
  // because child_process may spawn exit,error, or both

  function reallyPlay(){
    player = spawn('vlc',[path,'--fullscreen','--play-and-exit','--no-video-title-show']);
    player.on('exit',__onEndReached);
    player.on('error',__onEndReached);
    spent = false;
  
    function __onEndReached(){
      if(spent) return;
      _onEndReached();
      spent = true;
    }
  }
  
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