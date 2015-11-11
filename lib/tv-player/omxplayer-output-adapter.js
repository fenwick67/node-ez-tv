/*

media adapter

omxplayer output adapter

implements

createPlyer(cb)
playMedia(path)

calls

this.onEndReached(function)

*/

//using node-omxplayer library from https://github.com/oeuillot/node-omxplayer
// 

var omx = require('omx-manager');

(function(){
  var self = this;
  
  var globalOmxConfig = {
    '-o':'both',
    '-b':true
  };

  this.createPlayer = function(cb){
    cb(null);//do nothing lol
  }

  this.playMedia = function(path){
    var wasPlaying = omx.isPlaying();
    if(!wasPlaying){
      omx.play(path,globalOmxConfig);
      return;
    }

    omx.removeListener('stop',_onEnd);
    omx.stop();
    omx.once('stop',reAddListener);
    
    function reAddListener(){
      omx.play(path,globalOmxConfig);
      //it stopped once (like we asked), now call _onEnd 
      omx.on('stop',_onEnd);
    }

  }

  // call this when media has reached the end
  this.onEndReached = function(){
    console.log('this should never be called.  You are supposed to replace this.');   
  };//placeholder
  
  omx.on('stop',_onEnd);
  function _onEnd(){
    console.log('omx emitted end');
    self.onEndReached();
  }

  module.exports = this;
}())
