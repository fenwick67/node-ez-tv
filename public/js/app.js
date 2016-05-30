
$.get('/guide.json',updateTimeline);
//window.setInterval(function(){$.get('/guide.json',updateTimeline);},10000);
getServerState();


function updateTimeline(guideData){

  //window.guideData = guideData;

  var shows = {};
  var chartData = [];
  for(var i = 0; i < guideData.length; i ++){
    if(!shows[guideData[i].name]){
      shows[guideData[i].name] = {label:guideData[i].name,times:[]};
    }
    var start = new Date(guideData[i].date).getTime()
    var end = new Date(guideData[i].endDate).getTime()
    var hr = (((new Date(start).getHours() +11) % 12)+1);
    var mn = ('0'+(new Date(start).getMinutes()) ).slice(-2);
    var label = hr+':'+mn;
    shows[guideData[i].name].times.push({
      starting_time:start,
      ending_time:end,
      label:label,
      class:'show-label'
    });
    
  }

  var showNames = Object.keys(shows);
  for(var i = 0; i < showNames.length; i++){
    chartData.push(shows[showNames[i]]);
  }
  //console.log(chartData);
  var chart = d3.timeline()
  .margin({left:110, right:30, top:10, bottom:0})
  .width(10000)
  .stack()
  .showTimeAxisTick()
  .beginning(new Date())

  var tl = d3.select("#timeline");
  var svg = tl.append("svg").attr("width", 1000);

  svg.datum(chartData).call(chart);

  var textWidth =0;
  var svgHeight = 100;
  svg.selectAll("text.timeline-label")
  .each(function () {
    this.setAttribute('data-name',this.innerHTML);
    this.innerHTML = trimTo(this.innerHTML,25);
    textWidth = Math.min(Math.max( this.getComputedTextLength(),textWidth ),200);
    this.setAttribute('textLength',Math.min(this.getComputedTextLength(),200))
  });

  svg.each(function(){
    svgHeight = Number(this.getAttribute('height'));
  });

  var coverRect = svg
    .insert("rect",'.timeline-label')
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", textWidth+5)
    .attr("height", svgHeight)
    .style("fill", "rgba(255,255,255,.9)")

  var eatRect =  svg
    .insert('rect','.timeline-label')
    .attr('x',textWidth+4)
    .attr('y','0')
    .attr('height','100%')
    .attr('width','1')
    .attr('fill','black')
   
  window.showNameMap = {};
  guideData.forEach(function(el){
    if(showNameMap[el.name]) return;
    showNameMap[el.name]=el;
  });
   
  d3.selectAll('.timeline-label')
    .on('click',function(){
      console.log('got click',this);
      updateShowPanel($(this).attr('data-name') || this.innerHTML);
    });
    
  updateShowPanel($('.timeline-label').first().attr('data-name'));
  
  updatePartyPanel(shows);

}

window.serverState = {override:false};

function skipEpisode(callback){

  var callback = callback || function(){};
  $.ajax({
    url:'/skipEpisode',
    method:'POST',
    success:function(){
      return callback(null);
    },
    fail:function(){
      return callback(new Error('Problem getting state'));
    }
  });
}


function playFile(filename){
  var callback = callback || function(){};
  $.ajax({
    url:'/playFile?file='+filename,
    method:'POST',
    success:function(){
      return callback(null);
    },
    fail:function(){
      return callback(new Error('Problem getting file'));
    }
  });
}
//get server state info
function getServerState(callback){

  var callback = callback || function(){};
  $.ajax({
    url:'/serverState.json',
    method:'GET',
    success:function(state){
      window.serverState=state;
      serverStateUiRefresh();
      return callback(null,state);
    },
    fail:function(){
      return callback(new Error('Problem getting state'));
    }
  });
}

//get episode list for show name
function getEpisodeList(name,callback){
  var callback = callback || function(){};
  $.ajax({
    url:'/episodes.json?show='+name,
    method:'GET',
    success:function(resJson){
      return callback(null,resJson.files);
    },
    fail:function(){
      return callback(new Error('Problem getting episode list'));
    }
  });  
}

//request or cancel show playback override
function requestOverride(doOverride,callback){
  $.ajax({
    url:'/override?doOverride='+doOverride.toString(),
    method:'POST',
    success:function(state){
      window.serverState=state;
      return callback(null,state);
    },
    fail:function(){
      return callback(new Error('Problem setting override'));
    }
  });
  
}

//request to play show
function playShow(name,callback){
   var callback = callback || function(){};
   $.ajax({
    url:'/playShow?show='+name,
    method:'POST',
    success:function(){
      return callback(null);
    },
    fail:function(){
      return callback(new Error('Problem playing show'));
    }
  });
}

//refresh server state UI
function serverStateUiRefresh(){
  if (!window.serverState.override){
    $('.party-list').addClass('disabled'); 
    if($('#override').prop('checked')){    
      $('#override').prop('checked',false);
    }
  }else{
    $('.party-list').removeClass('disabled');  
    if(!$('#override').prop('checked')){    
      $('#override').prop('checked',true);
    }
  }
  
}


//update party panel with show names
function updatePartyPanel(shows){
  var showNames = Object.keys(shows);
  var list = $('.party-list').clone();
  
  for (var i = 0; i < showNames.length; i ++){
    var title = showNames[i];
    var lihtml = '<li><b>'+title+'</b><a class="button play-button button-sm" data-show="'+title+'"></a><a href="#" class="more-button button button-sm" data-show="'+title+'"></a><a href="#" class="info-button button button-sm" data-show="'+title+'"></a></li>';
    var l = $(lihtml);
    list.append(l);    
  } 
      
  // add event listeners to buttons
  list.on('click','a',function(event){
    var $this = $(this);
    var title = $this.data('show');    
    // if we clicked on info button, show info

    if($this.hasClass('info-button')){
      updateShowPanel(title);
    }
    
    if($this.hasClass('play-button')){ // play if we clicked on the orange button
      if (!window.serverState.override){return};
      playShow(title);
      updateShowPanel(title);
    }
    
    if($this.hasClass('more-button')){
      if (!window.serverState.override){return};
      getEpisodeList(title,function(er,list){
        if(er){return console.error(er);}
        var p = $('<p></p>');
        var ul = $('<ul></ul>');
        
        list.forEach(function(filename){
          var shortname = '&#8230;/' + filename.split(/[\/,\\]/ig).slice(-3).join('/');
          var item = $('<li><b>'+shortname+'</b><a class="play-button button button-sm" data-filename="'+filename+'"></a></li>');          
          window.item = item;
          ul.append(item);
        });
        
        p.append(ul);
        
        var $popup = $('.popup');
        $popup.addClass('up').find('p').html(p);
        $popup.find('h1').text(title);
        
      });
    }
      
  });
  
  $('.party-list').replaceWith(list);
  
}

//party panel listeners
$('#override').on('click',function(){
  var checking = !!$(this).prop('checked');
  requestOverride(checking,serverStateUiRefresh);
});

$('#skip-episode').on('click',function(){
  skipEpisode();
});

// episode selection popup
$('.popup').on('click','.close-button',function(e){
  $(this).parent().removeClass('up');
});

$('.popup').on('click','.play-button',function(){
  var name = $(this).data('filename');
  playFile(name);
});

serverStateUiRefresh();

function updateShowPanel(showName){
  var plussed = showName.replace(/\s/ig,'+');
  
  var omdbUrl = 'https://www.omdbapi.com/?t='+plussed+'&plot=full&r=json';
  if (window.showNameMap && window.showNameMap[showName] && window.showNameMap[showName].mediaType === 'show' || window,showNameMap[showName].mediaType === 'series'){
    omdbUrl+='&type=series';
  }else if (window.showNameMap && window.showNameMap[showName] && window.showNameMap[showName].mediaType === 'movie' || window,showNameMap[showName].mediaType === 'film'){
    omdbUrl+='&type=movie';
  }
  
  
  
  $.get(omdbUrl,function(data){
  
    
    var header = $('<h1></h1>');
    header.text(data.Title);
    
    var plot = $('<p></p>');
    plot.text(data.Plot);
    
    var desc = $('#desc');
    desc.html('');
    desc.append(header);
    desc.append(plot);
    
  });

};



function trimTo(str,maxLength,replaceWith){
  if (str.length <= maxLength){
    return str;
  }
  var ellipsis = replaceWith || '…';
  return str.substr(0,maxLength - (ellipsis.length) ) + ellipsis;
}
setInterval(getServerState,5000);