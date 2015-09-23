var Engine = function(id) {
  this.fps = 50;
  this.drawFps = 50;
  this.canvas = document.getElementById(id);
  this.ctx = this.canvas.getContext("2d");
  this.W = this.canvas.width;
  this.H = this.canvas.height;
}
Engine.prototype.update = function() {};
Engine.prototype.draw = function() {};

Engine.prototype.start = function() {
  setInterval(this.update,1000/this.fps);
  setInterval(this.draw,1000/this.drawFps);
}

Engine.prototype.setFps = function(fps) {
  this.fps = fps;
}

Engine.prototype.setDrawFps = function(fps) {
  this.drawFps = fps;
}

Engine.prototype.maximize = function() {
  var e = window, a = 'inner';
  if (!('innerWidth' in window)) {
    a = 'client';
    e = document.documentElement || document.body;
  }
  this.W = e[a+'Width'];
  this.H = e[a+'Height'];
  this.canvas.width = this.W;
  this.canvas.height = this.H;
}





// HELPER FUNCTIONS:

/*
each: calls func on each element of the array, passing the element and the index to the function.
*/
function each(ary,func) {
  var i = 0;
  while (ary[i] != null) {
    func(ary[i],i);
    i++;
  }
}

function rgb(r,g,b) {
  return 'rgb('+r+','+g+','+b+')';
}

function rgba(r,g,b,a) {
  if (a>1) a = 1;
  return 'rgba('+r+','+g+','+b+','+a+')';
}
