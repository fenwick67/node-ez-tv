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
    
    if(wasPlaying){
      omx.removeListener('end',_onEnd);
    }

    omx.play(path,globalOmxConfig);

    if(wasPlaying){
     setTimeout(function(){omx.on('end',_onEnd)},1000);
    }

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
