/**
 * @file hmi.js
 * @author Oliver Merkel <Merkel(dot)Oliver(at)web(dot)de>
 * @date 2014 August 27th
 *
 * @section LICENSE
 *
 * Copyright 2016, Oliver Merkel <Merkel(dot)Oliver(at)web(dot)de>
 * All rights reserved.
 *
 * Released under the MIT license.
 *
 * @section DESCRIPTION
 *
 * @brief Class Hmi.
 * 
 * Class representing the view or Hmi control of tempus fugit application.
 *
 */

Hmi.prototype.onDragStart = function(x, y, e) {
  this.ox = this.circtop.attr('cx');
  this.oy = this.circtop.attr('cy');
  this.stopTimer();
};

Hmi.prototype.onDragMove = function(dx, dy, x, y, e) {
  var drag = { x: this.ox + dx * this.panel.width / this.size.x,
    y: this.oy + dy * this.panel.height / this.size.y };
  var pos = { x: drag.x - this.center.x, y: drag.y - this.center.y };
  var deg = Math.atan(pos.y / pos.x) / Math.PI * 180.0 +
    ( pos.x>=0 ? 90.0 : 270.0 );
  var min = $('#snapnone').is(':checked') ? deg / 6.0 :
    $('#snap30sec').is(':checked') ? Math.floor(deg / 3.0) * 0.5 :
    Math.floor(deg / 6.0);
  var ONESECOND = 1000;
  var ONEMINUTE = 60 * ONESECOND;
  this.timeSpan = ONEMINUTE * min + ONESECOND / 100;
  startDate = new Date();
  this.startTime = startDate.getTime();
  this.tick();
};

Hmi.prototype.onDragComplete = function(e) {
  startDate = new Date();
  this.startTime = startDate.getTime();
  this.tick();
  this.startTimer();
};

Hmi.prototype.stopTimer = function() {
  if ( null != this.timerID ) {
    clearInterval( this.timerID );
    this.timerID = null;
  }
};

Hmi.prototype.startTimer = function() {
  this.stopTimer();
  this.timerID = setInterval( this.tick.bind(this), this.delay);
};

function Hmi() {
  this.panel = { width: 400, height: 480 };
  this.aspect = this.panel.width / this.panel.height;
  this.center = { x: this.panel.width >> 1, y: this.panel.height >> 1 };
  this.timerID = null;
  this.delay = 250;
  this.paper = Raphael( 'board', this.panel.width, this.panel.height );
  this.paper.setViewBox(0, 0, this.panel.width, this.panel.height, false );
  this.resize();
  this.paper.rect( 0, 0, this.panel.width, this.panel.height ).attr({
    stroke: '#444', 'stroke-width': 0.2, 'stroke-linecap': 'round',
    fill: 'darkslategrey'
  });
  var tmp = this.render( 0 );
  this.circbase = this.paper.circle(tmp.pos.x, tmp.pos.y, 20).attr({
    stroke: '#444', 'stroke-width': 4, 'stroke-linecap': 'round',
    fill: '#f44800'
  });
  this.circbaseGlow = this.circbase.glow({
    color: 'black',
    offsety: 10,
    offsetx: 10,
    fill: 'red'
  });
  this.dial = this.paper.path().attr({
    stroke: 'black', 'stroke-width': 4, 'stroke-linecap': 'round',
    fill: '#f44800'
  }).attr( { path: tmp.path } );
  this.dialGlow = this.dial.glow({
    color: 'black',
    offsety: 10,
    offsetx: 10,
    fill: 'red'
  });
  this.circtop = this.paper.circle(tmp.pos.x, tmp.pos.y, 20).attr({
    stroke: '#444', 'stroke-width': 4, 'stroke-linecap': 'round',
    fill: '#fb8b00'
  });
  this.timeText = this.paper.text(this.center.x, 40, "00:00").attr({ "font-family":"Arial","font-size":"30px", "font-weight": "normal", fill: "#eee", stroke:"black", "stroke-width": "0px", "text-anchor" : "center" , "font-style": "normal"});
  this.circtop.drag(this.onDragMove.bind(this),
    this.onDragStart.bind(this), this.onDragComplete.bind(this));
}

Hmi.prototype.resize = function () {
  var offsetHeight = 64,
    availableWidth = window.innerWidth - 64,
    availableHeight = window.innerHeight - offsetHeight;
  this.size = availableWidth/availableHeight < this.aspect ?
    { x: availableWidth, y: availableWidth / this.aspect } :
    { x: availableHeight * this.aspect, y: availableHeight } ;
  this.paper.setSize( this.size.x, this.size.y );
  this.paper.setViewBox( 0, 0, this.panel.width, this.panel.height, false );
  var boardMarginTop = (availableHeight - this.size.y) / 2;
  $('#board').css({ 'margin-top': boardMarginTop + 'px' });
  $('#selectmenu').css({ 'margin-top': boardMarginTop + 'px' });
  $('#game-page').css({
    'background-size': 'auto ' + (this.size.x * 9 / 6) + 'px',
  });
  var size = (this.size.x + this.size.y) / 2 / 9;
  var minSize = 60;
  var iconSize = size < minSize ? minSize : size;
  var maxSize = 120;
  iconSize = maxSize < iconSize ? maxSize : iconSize;
  $('#customMenu').css({
    'width': iconSize+'px', 'height': iconSize+'px',
    'background-size': iconSize+'px ' + iconSize+'px',
  });
  var backAttributes = {
    'width': iconSize+'px', 'height': iconSize+'px',
    'background-size': iconSize+'px ' + iconSize+'px',
  };
  $('#customBackRules').css(backAttributes);
  $('#customBackAbout').css(backAttributes);
};

Hmi.prototype.tick = function() {
  var nowDate = new Date();
  var nowTime = nowDate.getTime();
  var deltaTime = nowTime - this.startTime;
  var exactTime = (this.timeSpan - deltaTime)/1000.0;
  var time = Math.floor(exactTime);
  var sec = time % 60;
  var min = Math.floor(time / 60);
  min = min < 0 ? 0 : min;
  sec = sec < 0 ? 0 : sec;
  this.timeText.attr({ text: (min<10 ? '0' : '') + min + ':' +
    (sec<10 ? '0' : '') + sec });
  if (exactTime <= 0) {
    exactTime = 0;
    this.stopTimer();
  }
  var exactMin = exactTime / 60.0;
  var exactSec = exactTime - 60.0 * min;
  var showTicking = false;
  var showMinutes = true;
  var amount = showMinutes ?
    (showTicking ? min : exactMin) :
    (showTicking ? sec : exactSec);
  var tmp = this.render( amount * 6.0 );
  this.dial.attr( { path: tmp.path } );
  this.oldDialGlow = this.dialGlow;
  this.dialGlow = this.dial.glow({
    color: 'black',
    offsety: 10,
    offsetx: 10,
    fill: 'red'
  });
  this.oldDialGlow.remove();
  this.circbase.attr( { cx: tmp.pos.x, cy: tmp.pos.y } );
  this.oldCircbaseGlow = this.circbaseGlow;
  this.circbaseGlow = this.circbase.glow({
    color: 'black',
    offsety: 10,
    offsetx: 10,
    fill: 'red'
  });
  this.oldCircbaseGlow.remove();
  this.circtop.attr( { cx: tmp.pos.x, cy: tmp.pos.y } );
};

Hmi.prototype.resetTimer = function() {
  // var multiColored = $('#multicolor').is(':checked');
  var ONESECOND = 1000;
  var ONEMINUTE = 60 * ONESECOND;
  this.timeSpan = ONEMINUTE * 15;
  startDate = new Date();
  this.startTime = startDate.getTime();
  this.startTimer();
};

Hmi.prototype.render = function ( angle ) {
  var radius = 160.0,
      a = (90 - angle) * Math.PI / 180,
      x = this.center.x + radius * Math.cos(a),
      y = this.center.y - radius * Math.sin(a),
      path;
  if ( angle > 359 ) {
      path = [
        ["M", this.center.x, this.center.y - radius],
        ["A", radius, radius, 0, 1, 1, this.center.x-0.01, this.center.y - radius]
      ];
  } else {
      path = [
        ['M', this.center.x, this.center.y],
        ['L', this.center.x, this.center.y - radius],
        ['A', radius, radius, 0, +(angle > 180), 1, x, y],
        ['z']
      ];
  }
  return { path: path, pos: { x: x, y: y } }
}

Hmi.prototype.init = function () {
  var $window = $(window);
  // window.onorientationchange( this.resize.bind( this ) );
  window.addEventListener("orientationchange", this.resize.bind( this ));
  $window.resize( this.resize.bind( this ) );
  $window.resize();
  // $('#restart').on( 'click', this.startChallenge.bind(this) );
  this.resetTimer();
};

var g_Hmi;
$(document).ready( function () {
  g_Hmi = new Hmi();
  g_Hmi.init();
});
