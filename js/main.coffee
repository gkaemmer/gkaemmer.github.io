---
# Main script
---

window.pointsCount = 75
window.lineToPoints = 10
window.recalcTicks = 25

class Point

  constructor: (@x, @y, @vx, @vy) ->
    @nearbyCounter = Math.random() * window.recalcTicks

  placeRandom: (maxX, maxY) ->
    @maxX = maxX
    @maxY = maxY
    @x = Math.random() * @maxX
    @y = Math.random() * @maxY
    angle = Math.random() * 2 * Math.PI
    speed = 0.3 + Math.random() * 0.3
    @vx = speed * Math.cos(angle)
    @vy = speed * Math.sin(angle)

  resetDistanceCache: ->
    @distanceCache = {}

  distanceSquaredToCache: (point) ->
    return @distanceCache[point] if @distanceCache[point]
    @distanceSquaredTo(point)

  distanceSquaredTo: (point) ->
    dx = @x - point.x
    dy = @y - point.y
    dx * dx + dy * dy

  getNearbyPoints: (points) ->
    self = @
    nearbyPoints = points.sort (pointA, pointB) ->
      self.distanceSquaredToCache(pointA) - self.distanceSquaredToCache(pointB)
    @nearbyPoints = nearbyPoints[0..window.lineToPoints]

  move: ->
    @x += @vx
    @y += @vy

  update: (points) ->
    @x -= @maxX if @x > @maxX
    @x += @maxX if @x < 0
    @y -= @maxY if @y > @maxY
    @y += @maxY if @y < 0
    @nearbyCounter++
    if !@nearbyPoints || @nearbyCounter > window.recalcTicks
      @nearbyCounter -= window.recalcTicks
      @resetDistanceCache()
      @getNearbyPoints(points)

  draw: (ctx) ->
    return unless @nearbyPoints
    @alphaMultiplier = 0
    if window.mousePoint
      @alphaMultiplier = Math.exp(-@distanceSquaredToCache(window.mousePoint) / 25000)
    for point, i in @nearbyPoints
      continue if point == @
      alpha = @lineAlpha @alphaMultiplier, @distanceSquaredToCache(point)
      ctx.strokeStyle = rgba(0, 0, 0, alpha)
      ctx.beginPath();
      ctx.moveTo(@x, @y)
      ctx.lineTo(point.x, point.y)
      ctx.stroke()

  lineAlpha: (multiplier, distance) ->
    multiplier = 0.1 + multiplier * 0.1
    multiplier * Math.exp(-distance / 3000)

$ ->
  engine = new Engine('bg-canvas')
  engine.maximize()
  engine.setFps(50)
  ctx = engine.ctx

  points = []

  for i in [1..window.pointsCount]
    point = new Point
    point.placeRandom(engine.W, engine.H)
    points.push(point)

  draw = ->
    ctx.fillStyle = rgb(255,255,255);
    ctx.fillRect(0, 0, engine.W, engine.H)
    point.move() for point in points
    point.draw(ctx) for point in points
    setTimeout(draw, 20)

  update = ->
    point.update(points) for point in points
    setTimeout(update, 20)

  $(window).mousemove (e) ->
    window.mousePoint ||= new Point()
    window.mousePoint.x = e.pageX
    window.mousePoint.y = e.pageY

  setTimeout(update, 20)
  setTimeout(draw, 20)
