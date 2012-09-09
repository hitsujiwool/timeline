
/*!
 * timeline.js
 * https://github.com/hitsujiwool/timeline
 * version 0.1.0
 * Copyright(c) 2012 hitsujiwool <utatanenohibi@gmail.com>
 * MIT Licensed
 */

;(function(exports) {
  
  function Timeline(numFrames) {
    EventEmitter.call(this);
    this.currentFrame = 1;
    this.numFrames = numFrames;
    this.timeline = new Array(numFrames);
    this.locked = false;
    
    this.aliases = {};
    this.reserved = null;
  }
  
  Timeline.prototype = new EventEmitter();

  /**
   * Register a function called at nth-frame.
   */
  
  Timeline.prototype.at = function(n, callback) {    
    var nthFrame = this.nthFrame(n);
    (this.timeline[nthFrame] = this.timeline[nthFrame] || []).push(callback);
    return this;
  };

  /**
   * Register a callback for each frame.
   * Callback function must return Function object.
   */

  Timeline.prototype.eachFrame = function(from, to, callback) {
    var val;
    from = this.nthFrame(from) + 1;
    to = this.nthFrame(to);
    for (var i = 0, len = to - from + 1; i < len; i++) {
      this.at(from + i, (function(i) {
        // call the function immediately with a frame number and index.
        // therefore, callback must return a function, which is registered by Timeline#at() method
        return callback(from + i, i);
      })(i));
    }
  };

  /**
   * Run callbacks registered at n-th frame.
   */

  Timeline.prototype.runCallbackAt = function(nthFrame, delta) {
    var callbacks = this.timeline[nthFrame] || [];
    for (var i = 0, len = callbacks.length; i < len; i++) {
      (function(i) {
        setTimeout(function() { callbacks[i](delta); });
      })(i);
    }
  };

  /**
   * Change current frame
   */
  
  Timeline.prototype.set = function(n) {
    if (!this.locked) {
      this.currentFrame = this.nthFrame(n);
    } else {
      throw new Error("Don't call this method during animation!");
    }
  };

  /**
   *  Create an alias for a frame.
   */

  Timeline.prototype.alias = function(n, name) {
    this.aliases[name] = this.nthFrame(n);
    return this;
  };

  /**
   * Resolve aliases.
   */

  Timeline.prototype.nthFrame = function(n) {
    if (typeof n === 'string') {
      if (n.charAt(n.length - 1) === '%') {
        return this.nthFrame(Math.round(this.numFrames * (parseFloat(n.slice(0, n.length - 1), 10) / 100)));
      } else {
        return this.nthFrame(this.aliases[n]);
      }
    } else if (typeof n === 'number') {
      n = Math.floor(n);
      if (1 <= n && n <= this.numFrames) {
        return n;
      } else {
        throw new Error('Frame must be 1 <= n <=' + this.numFrames);
      }
    } else {
      throw new Error('Cannot find ' + n + '-th frame');
    }
  };

  /**
   * Return the number of frames between two frames.
   */

  Timeline.prototype.distanceBetween = function(from, to) {
    return Math.abs(this.nthFrame(from) - this.nthFrame(to));
  };

  /**
   * Stop animation.
   */

  Timeline.prototype.stop = function() {
    clearTimeout(this.loop);
    this.locked = false;
  };

  /**
   * Tick the timeline forward. 
   */
  
  Timeline.prototype.gotoAndStop = function(n, interval) {
    var that = this,
        nthFrame = this.nthFrame(n);
    if (!(this.currentFrame < nthFrame)) return;
    if (this.locked) {
      this.reserved = [nthFrame, interval];
      return;
    }
    this.locked = true;
    if (this.currentFrame === 1) {
      this.emit('setup', 1, 1);
    }
    this.forwardLoop(this.currentFrame + 1, nthFrame, interval);
  };

  /**
   * Forward loop. 
   */

  Timeline.prototype.forwardLoop = function(next, destination, interval) {
    var that = this,
        latest;
    if (this.numFrames < next || destination < next) {
      this.locked = false;
      return;
    }
    latest = this.reserved;
    if (latest) {
      this.reserved = null;
      if (latest[0] < 0) {
        this.backwardLoop(-next, latest[0], latest[1]);
        return;
      }
      destination = latest[0];
    }
    this.loop = setTimeout(function() {
      var callbacks;
      that.emit('enterframe', next, 1);
      that.runCallbackAt(next, 1);
      that.currentFrame = next;
      if (that.currentFrame === that.numFrames) {
        that.emit('teardown', that.numFrames, 1);
      }
      that.forwardLoop(next + 1, destination, interval);
    }, interval || 0);
  };

  /**
   * Tick the timeline backward. 
   */

  Timeline.prototype.backtoAndStop = function(n, interval) {
    var that = this,
        nthFrame = this.nthFrame(n);
    if (!(nthFrame < this.currentFrame)) return;
    if (this.locked) {
      this.reserved = [-nthFrame, interval];
      return;
    }
    this.locked = true;
    if (this.currentFrame === this.numFrames) {
      this.emit('setup', this.numFrames, -1); 
    }
    this.backwardLoop(-this.currentFrame, nthFrame, interval);
  };

  /**
   * Backward loop.
   */
  
  Timeline.prototype.backwardLoop = function(next, destination, interval) {
    next = -next;
    var that = this,
        latest;
    if (next < 1 || next <= destination) {
      this.locked = false;
      return;
    }
    latest = this.reserved;
    if (latest) {
      this.reserved = null;
      if (latest[0] > 0) {
        this.forwardLoop(next, latest[0], latest[1]);
        return;
      }
      destination = -latest[0];
    }
    this.runCallbackAt(next, -1);
    this.loop = setTimeout(function() {
      var callbacks;
      that.emit('enterframe', next - 1, -1);
      that.currentFrame = next - 1;
      if (that.currentFrame === 1) {
        that.emit('teardown', 1, -1);
      }
      that.backwardLoop(-(next - 1), destination, interval);
    }, interval || 0);
  };

  exports.Timeline = Timeline;

})(this);