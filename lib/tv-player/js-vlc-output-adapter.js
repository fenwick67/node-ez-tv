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
var crypto = require('crypto');
var _ = require('lodash');
var http = require('http');
var request = require('request');

(function(options){

  var self = this;
  var player = null;

  self.createPlayer = function(cb){
    //do nothing lol
    cb(null);
  }

  var vlcPort;
  var httpPassword;
  
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
    
    //vlc requires a password be set, generate once on spawn
    httpPassword = httpPassword||crypto.randomBytes(256).toString('hex');
    vlcPort = 2222;
    
    var vlcOptions = [path,'--fullscreen','--play-and-exit','--no-video-title-show','--http-password='+httpPassword,'-I','http'];
    
    //add Port option
    if (process.platform === 'win32'){
      vlcOptions.push('--http-port='+vlcPort);
    }else{
      vlcOptions.push('--http-port');   
      vlcOptions.push(vlcPort.toString());   
    }
    
    reallyPlay();
    
    // spent is used to guard against calling _onEndReached twice per file
    // because child_process pipe might emit exit, error, or both events
    function reallyPlay(){
      player = spawn('vlc',vlcOptions);
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
 
  var commandMap = {
    pause:'?command=pl_pause',
    play:'?command=pl_play',
  }
  
  var currentVlcStatus = {};
  
  //send comand by its sensible name to the http server
  function sendCommand(c,cb){
    
    if (!player){
      return cb(new Error('player not running'));
    }
    
    var toSend = commandMap[c]||c||'';
    
    request.get(
      {
        url:'http://localhost:'+vlcPort+'/requests/status.json'+toSend,
        auth:{
          user:'',
          pass:httpPassword
        }
      },
      function(error,res,body){
        if(error){
          return cb(error);
        }
        try{
          var json = JSON.parse(body);
          currentVlcStatus = _.clone(json);
          return cb(null,json);
        }catch(e){
          return cb(e);
        }
      }
    );
    
  }
  
  function seek(seconds,cb){
    sendCommand('',function(er,status){
      if(er){
        cb(er);
      }else{
        var lengthSeconds = status.length;
        var position = status.position;
        var currentSeconds = position * lengthSeconds;
        var targetSeconds = currentSeconds + seconds;
        var targetPercent =  Math.max(0,Math.min((targetSeconds / lengthSeconds)*100,100));
        sendCommand('?command=seek&val='+targetPercent+'%25',cb);
      }
    });
  }
  
  self.play = function(cb){
    sendCommand('play',cb);
  }
  self.pause = function(cb){
    sendCommand('pause',cb);
  }  
  self.seekForward = function(cb){
    seek(30,cb);
  }
  self.seekFastForward = function(cb){
    seek(10*60,cb);
  }
  self.seekBackward = function(cb){
    seek(-30,cb);
  }
  self.seekFastBackward = function(cb){
    seek(-10*60,cb);
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