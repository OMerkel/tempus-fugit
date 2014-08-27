//
// Copyright (c) 2014 Oliver Merkel
// All rights reserved.
//
// @author Oliver Merkel, <Merkel(dot)Oliver(at)web(dot)de>
//

var intervalId = null;
var startDate, startTime;
var svgDocument;

function display() {
  if (null != svgDocument) {
    nowDate = new Date();
    nowTime = nowDate.getTime();
    deltaTime = nowTime - startTime;
    var exactTime = (timeSpan - deltaTime)/1000.0;
    var time = Math.floor(exactTime);
    var sec = time % 60;
    var min = Math.floor(time / 60);
    min = min < 0 ? 0 : min;
    sec = sec < 0 ? 0 : sec;
    elementText.textContent = (min<10 ? '0' : '') + min + ':' +
      (sec<10 ? '0' : '') + sec;
    var exactMin = exactTime / 60.0;
    var exactSec = exactTime - 60.0 * min;
    var showTicking = false;
    var showMinutes = true;
    var amount = showMinutes ?
      (showTicking ? min : exactMin) :
      (showTicking ? sec : exactSec);
    var angle = Math.PI*( amount/30.0-0.5 );
    var cx = 286;
    var cy = 596;
    var rx = 300;
    var ry = rx;
    var arcX = rx*Math.cos(angle);
    var arcY = ry*Math.sin(angle);
    var sector = amount > 45 ? ' 0 1' : amount > 30 ? ' 1 1' :
      amount > 15 ? ' 0 0' : ' 1 0';
    var newD =
      'M ' + cx + ',' + (cy-ry) + ' A ' + rx + ',' + ry + ' ' +
      sector + ' 1 ' + (cx+arcX) + ',' + (cy+arcY) +
      ' L ' + cx + ',' + cy + ' z';
    elementDisc.setAttribute('d', newD);
    var newTransform =
      'translate(' + arcX + ',' + arcY + ')';
    elementHandle.setAttribute('transform', newTransform);
    if (exactTime <= cycle / 1000.0) {
      clearInterval( intervalId );
      intervalId = null;
    }
  }
}

function updateWindow() {
  var titleHeight = 24,
    menuHeight = 6,
    decorationHeight = titleHeight + menuHeight,
    availableHeight = window.innerHeight - decorationHeight,
    availableWidth = window.innerWidth,
    size = Math.min(availableWidth*0.95, availableHeight*0.72);
  $('#clock').css({ width: size });
}

function resetTimer() {
  var ONESECOND = 1000;
  var ONEMINUTE = 60 * ONESECOND;
  timeSpan = ONEMINUTE * (
    $('#preset5min').is(':checked') ? 5 :
    $('#preset10min').is(':checked') ? 10 :
    $('#preset15min').is(':checked') ? 15 :
    $('#preset20min').is(':checked') ? 20 :
    $('#preset30min').is(':checked') ? 30 :
    $('#preset45min').is(':checked') ? 45 :
    60 );
  startDate = new Date();
  startTime = startDate.getTime();
  if(null != intervalId) {
    clearInterval( intervalId );
  }
  intervalId = setInterval("display();", cycle);
}

function sync(event, ui) {
  if( 'clock-page' == ui.toPage[0].id ) {
    svgInit();
  }
}

function svgWait() {
  var svgEmbed = document.embeds['clock'];
  if (typeof svgEmbed != 'undefined') {
    if (typeof svgEmbed.getSVGDocument != 'undefined') {
      svgDocument = svgEmbed.getSVGDocument();
      if (null == svgDocument) {
        setTimeout( svgWait,5 );
      }
      else {
        elementText = svgDocument.getElementById('timeText');
        elementDisc = svgDocument.getElementById('timeDisc');
        elementHandle = svgDocument.getElementById('handle');
      }
    }
  }
}

function svgInit() {
  svgWait();
}

function init() {
  cycle = 50;
  svgInit();
  var $window = $(window);
  $window.resize( updateWindow );
  $window.resize();
  $('#new').click( resetTimer );
  resetTimer();
  $( document ).on( 'pagecontainershow', sync);
}

$( init );
