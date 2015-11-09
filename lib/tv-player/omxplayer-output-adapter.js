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

  var globalOmxConfig = {
    '-o':'both'
  };

  this.createPlayer = function(cb){
    cb(null);//do nothing lol
  }

  this.playMedia = function(path){
    omx.play(path,globalOmxConfig);
  }

  // call this when media has reached the end
  this.onEndReached = function(){};//placeholder
  omx.on('end',this.onEndReached);

  module.exports = this;
}())