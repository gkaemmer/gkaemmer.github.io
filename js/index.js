function rgba(r,g,b,a) {
  if (a>1) a=1;
  return "rgba("+r+","+g+","+b+","+a+")";
}

function viewport() {
  var e = window, a = 'inner';
  if (!('innerWidth' in window)) {
    a = 'client';
    e = document.documentElement || document.body;
  }
  return { width : e[ a+'Width' ] , height : e[ a+'Height' ] }
}

var funcs = [
  function(x, y) { return Math.sin(y) },
  function(x, y) { return Math.sin(x) },
  function(x, y) { return Math.cos(x) },
  function(x, y) { return Math.cos(y) },
  function(x, y) { return Math.exp(y / 3) },
  function(x, y) { return Math.exp(x / 3) },
  function(x, y) { return 2 * x; },
  function(x, y) { return 2 * y; }
];
var funcNames = [
  'cos(y)',
  'cos(x)',
  'sin(x)',
  'sin(y)',
  'exp(y)',
  'exp(x)',
  'x²',
  'y²'
];

// Field
function Field() {
  this.engine = new Engine('bg-canvas');
  this.engine.maximize();

  this.engine.draw = this.draw.bind(this);
  this.W = this.engine.W;
  this.H = this.engine.H;

  this.scale = 8;
  this.xRange = this.engine.W / this.engine.H * this.scale;
  this.yRange = this.scale;
  this.speed = 0.1;
  this.fieldStr = 0.01;
  this.life = 100;
  this.maxSpeed = 0;
  this.N = this.W;

  this.speed = 0.1;

  this.particles = [];

  this.xFunc = Math.floor(Math.random() * funcs.length);
  this.yFunc = Math.floor(Math.random() * funcs.length);
  this.change();

}

Field.prototype.change = function() {
  var toChange = Math.random() > 0.5 ? 'xFunc' : 'yFunc';
  this[toChange] = Math.floor(Math.random() * funcs.length);
  $('#dx').text(funcNames[this.xFunc]);
  $('#dy').text(funcNames[this.yFunc]);
  if (this.changeTimeout)
    clearTimeout(this.changeTimeout);
  this.changeTimeout = setTimeout(this.change.bind(this), 5000);
}

Field.prototype.start = function() {
  this.engine.start();
  console.log(this);
}

Field.prototype.drawPixel = function(x,y) {
  this.engine.ctx.beginPath();
  this.engine.ctx.fillRect(x,y,1,1);
}

Field.prototype.field = function(x,y,z) {
  var resX = funcs[this.xFunc](x, y);
  var resY = funcs[this.yFunc](x, y);
  var resZ = 0;
  return [resX*this.fieldStr,resY*this.fieldStr,0];
}

Field.prototype.initParticleAtIndex = function(i) {
  var coords = [
    (Math.random()-0.5)*this.xRange,
    (Math.random()-0.5)*this.yRange
  ];

  if (this.particles[i]) this.particles[i].reset(coords[0], coords[1]);
  else this.particles[i] = new Particle(coords[0], coords[1], 0, this);
  speed = Math.random()*Math.random()*this.speed;
  ang = Math.random() * Math.PI;
  this.particles[i].vx = speed*Math.cos(ang);
  this.particles[i].vy = speed*Math.sin(ang);
}

Field.prototype.draw = function() {
  var ctx = this.engine.ctx;

  ctx.fillStyle = rgba(255,255,255,0.05);
  ctx.fillRect(0,0,this.W,this.H);
  for (var i=0; i<this.N; i++) {
    if (this.particles[i].life<0) {
      this.initParticleAtIndex(i);
    }
    this.particles[i].update();
    this.particles[i].draw(ctx);
  }
  this.maxSpeed *= 0.99;
}

// Particle
function Particle(x,y,z,field) {
  this.field = field;
  this.ax = 0;
  this.ay = 0;
  this.vx = 0;
  this.vy = 0;
  this.vz = 0;
  this.fv = 0;
  this.x = x;
  this.y = y;
  this.z = 0;
  this.lastX = this.sx = this.getSX();
  this.lastY = this.sy = this.getSY();
  this.speed = 1;
  this.life = Math.random()*this.field.life;
}

Particle.prototype.getSX = function() {
  return this.x / (1+this.z*0.2) / this.field.scale * this.field.H + this.field.W/2;
}

Particle.prototype.getSY = function() {
  return this.field.H - (this.y / (1+this.z*0.2) / this.field.scale * this.field.H + this.field.H/2);
}
Particle.prototype.reset = function(x,y,z) {
  this.vx = 0;
  this.vy = 0;
  this.vz = 0;
  this.x = x;
  this.y = y;
  this.z = 0//z;
  this.lastX = this.sx = this.getSX();
  this.lastY = this.sy = this.getSY();
  this.life = Math.random()*this.field.life;
}
Particle.prototype.draw = function(ctx) {
  ctx.strokeStyle = rgba(0,0,0,0.05 + this.fv/this.field.maxSpeed * 0.05);
  // ctx.fillStyle = rgba(Math.max(this.z * 255, 0),0,0,0.7 + this.fv/maxSpeed * 0.1);
  // drawPixel(this.sx, this.sy, ctx);

  ctx.beginPath();
  ctx.moveTo(this.lastX,this.lastY);
  ctx.lineTo(this.sx,this.sy);
  ctx.stroke();
}
Particle.prototype.update = function() {
  var f = this.field.field(this.x,this.y,this.z);
  this.ax = this.speed*f[0];
  this.ay = this.speed*f[1];
  this.vx += this.ax;
  this.vy += this.ay;
  this.fv = f[0]*f[0]+f[1]*f[1];
  if (this.fv > this.field.maxSpeed) {
    this.field.maxSpeed = this.fv;
  }
  this.lastX = this.sx;
  this.lastY = this.sy;
  this.x += this.vx;
  this.y += this.vy;
  this.z += this.vz;
  this.sx = this.getSX();
  this.sy = this.getSY();
  this.vx *= 0.8;
  this.vy *= 0.8;
  this.life--;
}

$(function() {
  var field = new Field();

  for (var i=0; i<field.N; i++) {
    field.initParticleAtIndex(i);
  }

  field.start();

  $('.field').click(function() {
    field.change();
  })
});
