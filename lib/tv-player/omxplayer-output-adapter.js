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
    if(omx.isPlaying()){
      omx.removeListener('end',_onEnd);
      omx.stop();
    }
    omx.play(path,globalOmxConfig);
    omx.on('end',_onEnd);
  }

  // call this when media has reached the end
  this.onEndReached = function(){
    console.log('this should never be called');   
  };//placeholder
  
  omx.on('end',_onEnd);
  function _onEnd(){
    console.log('omx emitted end');
    self.onEndReached();
  }

  module.exports = this;
}())
