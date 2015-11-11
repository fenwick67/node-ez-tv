/*
schedule validator

validates the pathspecs within a schedule file to warn you if a show doesn't exist
*/

var glob = require('glob')
  , _ = require('lodash')



  function validate(scheduleString,callback){

    var problems = [];

    try{
      var scheduleObject = JSON.parse(scheduleString);
    }
    catch(e){
      callback('schedule not parseable');
    }

    if(scheduleObject.jobs){
      _.forEach(scheduleObject.jobs,function(job){
        var files = glob.sync(job.pathspec);
        if(files.length < 1){
          problems.push('no files match job pathspec '+job.pathspec);
        }
      });
    }else{problems.push('no jobs to play');}


    if(scheduleObject.commercials){
      _.forEach(scheduleObject.comercials,function(commercial){
        var files = glob.sync(commercial.pathspec);
        if(files.length < 1){
          problems.push('no files match commercial pathspec '+commercial.pathspec);
        }
      });
    }else{problems.push('no commercials to play');}

    if(!scheduleObject.commercials && !scheduleObject.jobs){
      callback('there is nothing to play... ever');
    }

    callback(null,problems);
  }

  

  module.exports =  {
    validate:validate
  }