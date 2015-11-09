/*

guide gen
the idea is that you pass in a schedule and it returns a description
of what is playing when, what's next, etc.

constructor:
guideGen(schedule)

methods:
getSchedule(startTime,endTime) -> returns airing shows and times for the whole range
getNext(time) -> returns next airing show and time

*/
var cronParser = require('cron-parser');
var _ = require('lodash');

module.exports = function(schedule){

  var crons = [];

  _.forEach(schedule.jobs,function(job){
    //console.log('job: ',job);
    if(typeof job.cron === 'string'){
      var cronEntry = {name:job.name,cron:job.cron};
      if(job.runtime){
        cronEntry.runtime = job.runtime;
      }
      crons.push(cronEntry);
    }else if( _.isArray(job.cron) ){
      _.forEach(job.cron,function(cronForReal){
        var cronEntry = {name:job.name,cron:cronForReal};
        if(job.runtime){
          cronEntry.runtime = job.runtime;
        }
        crons.push(cronEntry);
      });
    }

    //console.log(crons);
  });


  function getNext(date){
    var date = date || new Date();
    var earliestName;
    var earliestTime;
    var cronParserOptions = {currentDate:date};

    _.forEach(crons,function(entry){
      var interval = cronParser.parseExpression(entry.cron,cronParserOptions);
      var nextTime = new Date(interval.next());
      if (!earliestTime || earliestTime < nextTime){
        earliestTime = nextTime;
        earliestName = entry.name;
      }
    });

    if(earliestTime){
      return {
        name:earliestName,
        date:earliestTime
      };
    }

    return false;
  }

  function getGuide(startDate,endDate){
    startDate = startDate || new Date(new Date().getTime() - 2*60*60*1000);
    endDate = endDate || ( startDate.getTime() + 24*60*60*1000 );

    var schedule = [];

    var cronParserOptions = {currentDate:startDate,endDate:endDate};

    _.forEach(crons,function(entry,index){
      var interval = cronParser.parseExpression(entry.cron,cronParserOptions);
      
      while(true){
        try{
          var d = interval.next();
          var scheduleItem = {};
          scheduleItem.date = d;
          if(entry.runtime){
            scheduleItem.endDate = new Date(d.getTime() + 1000 * 60 * entry.runtime);
          }
          scheduleItem.name = entry.name;
          schedule.push(scheduleItem);
        }catch(e){
          break;
        }
      }
    });

    return schedule;

  }

  return {
    getGuide:getGuide,
    getNext:getNext
  };

}