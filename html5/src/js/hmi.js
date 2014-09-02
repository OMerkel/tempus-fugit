//
// Copyright (c) 2014 Oliver Merkel
// All rights reserved.
//
// @author Oliver Merkel, <Merkel(dot)Oliver(at)web(dot)de>
//

var intervalId = null;
var startDate, startTime;
var svgDocument;
var timeSelected = false;

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
    exactTime = exactTime < 0 ? 0 : exactTime;
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
      timeSelected = false;
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
  timeSpan = ONEMINUTE * 15;
  timeSelected = true;
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

function presetTime(pageX, pageY) {
  if (null==intervalId) {
    var centerX = svgDocument.defaultView.innerWidth >> 1;
    var centerY = svgDocument.defaultView.innerHeight >> 1;
    var x = (pageX - centerX);
    var y = (pageY - centerY);
    var distance = Math.sqrt(x*x+y*y);
    if (distance < centerX && distance > 0.80 * centerX ) {
      var deg = Math.atan(y / x) / Math.PI * 180.0 +
        ( x>=0 ? 90.0 : 270.0 );
      var min = deg / 6.0;
      var ONESECOND = 1000;
      var ONEMINUTE = 60 * ONESECOND;
      timeSpan = ONEMINUTE * min;
      timeSelected = min > 1.0 / 60.0;
      if (timeSelected) {
        startDate = new Date();
        startTime = startDate.getTime();
        display();
      }
    }
  }
}

function mousePresetTime(evt) {
  presetTime(evt.pageX, evt.pageY);
}

function touchPresetTime(evt) {
  presetTime(evt.changedTouches[0].pageX, evt.changedTouches[0].pageY);
}

function stopTimer(pageX, pageY) {
  if (null!=intervalId) {
    clearInterval( intervalId );
    intervalId = null;
    presetTime(pageX, pageY);
  }
}

function mouseStopTimer(evt) {
  stopTimer(evt.pageX, evt.pageY);
}

function touchStopTimer(evt) {
  stopTimer(evt.changedTouches[0].pageX, evt.changedTouches[0].pageY);
}

function startTimer(pageX, pageY) {
  presetTime(pageX, pageY);
  if (timeSelected) {
    intervalId = setInterval("display();", cycle);
  }
}

function mouseStartTimer(evt) {
  startTimer(evt.pageX, evt.pageY);
}

function touchStartTimer(evt) {
  startTimer(evt.changedTouches[0].pageX, evt.changedTouches[0].pageY);
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
        svgDocument.onmousedown = mouseStopTimer;
        svgDocument.onmousemove = mousePresetTime;
        svgDocument.onmouseup = mouseStartTimer;
        svgDocument.ontouchstart = touchStopTimer;
        svgDocument.ontouchmove = touchPresetTime;
        svgDocument.ontouchend = touchStartTimer;
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
  resetTimer();
  $( document ).on( 'pagecontainershow', sync);
}

$( init );
