
/*!
 * timeline.js
 * https://github.com/hitsujiwool/timeline
 * version 0.1.1
 * Copyright(c) 2012 hitsujiwool <utatanenohibi@gmail.com>
 * MIT Licensed
 */

;(function(exports) {
  
  /**
   * Initialize timeline.
   * 
   * @param {Number} numFrames
   * @api public
   */

  function Timeline(numFrames) {
    EventEmitter.call(this);
    this.currentFrame = 1;
    this.numFrames = numFrames;
    this.timeline = new Array(numFrames);
    this.locked = false;    
    this.reserved = null;
    this.aliases = {};
  }
  
  // inherit EventEmitter
  Timeline.prototype = new EventEmitter();

  /**
   * Register a function called at nth-frame.
   * 
   * @param {Mixed} n
   * @param {Function} callback
   * @return {Timeline}
   * @api public
   */
  
  Timeline.prototype.at = function(n, callback) {    
    var nthFrame = this.nthFrame(n);
    (this.timeline[nthFrame] = this.timeline[nthFrame] || []).push(callback);
    return this;
  };

  /**
   * Register a callback for each frame.
   * Callback function must return Function object.
   * 
   * @param {Mixed} from
   * @param {Mixed} to
   * @param {Function} callback
   * @api public
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
   * Create an alias for a frame.
   * 
   * @param {Mixed} n
   * @param {String} name
   * @return {Timeline}
   * @api public
   */

  Timeline.prototype.alias = function(n, name) {
    this.aliases[name] = this.nthFrame(n);
    return this;
  };

  /**
   * Resolve aliases.
   * 
   * @param {Mixed} n
   * @return {Number}
   * @api public 
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
   * 
   * @param {Mixed} from
   * @param {Mixed} to
   * @return {Number}
   * @api public
   */

  Timeline.prototype.distanceBetween = function(from, to) {
    return Math.abs(this.nthFrame(from) - this.nthFrame(to));
  };

  /**
   * Change current frame.
   * 
   * @param {Mixed} n
   * @return {Timeline}
   * @api public
   */
  
  Timeline.prototype.set = function(n) {
    if (!this.locked) {
      this.currentFrame = this.nthFrame(n);
    } else {
      throw new Error("Don't call this method during animation!");
    }
    return this;
  };

  /**
   * Stop animation.
   * 
   * @return {Timeline}
   * @api public
   */

  Timeline.prototype.stop = function() {
    clearTimeout(this.loop);
    this.locked = false;
    return this;
  };

  /**
   * Tick the timeline forward. 
   * 
   * @param {Mixed} n
   * @param {Number} interval
   * @return {Timeline}
   * @api public
   */
  
  Timeline.prototype.gotoAndStop = function(n, interval) {
    var nthFrame = this.nthFrame(n);
    if (!(this.currentFrame < nthFrame)) return this;
    // if another loop is running, reserve this request
    if (this.locked) {
      this.reserved = [nthFrame, interval];
      return this;
    }
    this.locked = true;
    if (this.currentFrame === 1) {
      this.emit('setup', 1, 1);
    }
    this.forwardLoop(this.currentFrame + 1, nthFrame, interval);
    return this;
  };

  /**
   * Tick the timeline backward. 
   * 
   * @param {Mixed} n
   * @param {Number} interval
   * @return {Timeline}
   * @api public
   */

  Timeline.prototype.backtoAndStop = function(n, interval) {
    var nthFrame = this.nthFrame(n);
    if (!(nthFrame < this.currentFrame)) return this;
    // if another loop is running, reserve this request
    if (this.locked) {
      // invert frame number to mark backward direction
      this.reserved = [-nthFrame, interval];
      return this;
    }
    this.locked = true;
    if (this.currentFrame === this.numFrames) {
      this.emit('setup', this.numFrames, -1); 
    }
    // invert frame number to mark backward direction
    this.backwardLoop(-this.currentFrame, nthFrame, interval);
    return this;
  };

  /**
   * Forward loop. 
   * 
   * @param {Number} next
   * @param {Number} destination
   * @param {Number} interval
   * @private
   */

  Timeline.prototype.forwardLoop = function(next, destination, interval) {
    var that = this,
        latest;
    // end loop
    if (this.numFrames < next || destination < next) {
      this.locked = false;
      return;
    }
    // update to latest destination
    latest = this.reserved;
    if (latest) {
      this.reserved = null;
      if (latest[0] < 0) {
        this.backwardLoop(-next, latest[0], latest[1]);
        return;
      }
      destination = latest[0];
    }
    // in the case of forwarding, tick and then run callbak
    this.loop = setTimeout(function() {
      var callbacks;
      that.emit('enterframe', next, 1);
      that.runCallbackAt(next, 1);
      that.currentFrame = next;
      if (that.currentFrame === that.numFrames) {
        that.emit('teardown', that.numFrames, 1);
      }
      // next loop
      that.forwardLoop(next + 1, destination, interval);
    }, interval || 0);
  };

  /**
   * Backward loop.
   * 
   * @param {Number} next
   * @param {Number} destination
   * @param {Number} interval
   * @private
   */
  
  Timeline.prototype.backwardLoop = function(next, destination, interval) {
    next = -next;
    var that = this,
        latest;
    // end loop
    if (next < 1 || next <= destination) {
      this.locked = false;
      return;
    }
    // update to latest destination
    latest = this.reserved;
    if (latest) {
      this.reserved = null;
      if (latest[0] > 0) {
        this.forwardLoop(next, latest[0], latest[1]);
        return;
      }
      destination = -latest[0];
    }
    // in the case of backwarding, run callback and then tick
    this.runCallbackAt(next, -1);
    this.loop = setTimeout(function() {
      var callbacks;
      that.emit('enterframe', next - 1, -1);
      that.currentFrame = next - 1;
      if (that.currentFrame === 1) {
        that.emit('teardown', 1, -1);
      }
      // next loop
      that.backwardLoop(-(next - 1), destination, interval);
    }, interval || 0);
  };

  /**
   * Run callbacks registered at n-th frame.
   * 
   * @param {Number} nthFrame
   * @param {Number} delta
   * @private
   */

  Timeline.prototype.runCallbackAt = function(nthFrame, delta) {
    var callbacks = this.timeline[nthFrame] || [];
    for (var i = 0, len = callbacks.length; i < len; i++) {
      (function(i) {
        setTimeout(function() { callbacks[i](delta); });
      })(i);
    }
  };

  // expose
  exports.Timeline = Timeline;

  /**
   * EventEmitter Pattern from move.js written by visionmedia
   * https://github.com/visionmedia/move.js/blob/master/move.js
   */
  
  function EventEmitter() {
    this.callbacks = {};
  };

  EventEmitter.prototype.on = function(event, fn) {
    (this.callbacks[event] = this.callbacks[event] || []).push(fn);
    return this;
  };

  EventEmitter.prototype.emit = function(event) {
    var args = Array.prototype.slice.call(arguments, 1),
        callbacks = this.callbacks[event],
        len;
    if (callbacks) {
      len = callbacks.length;
      for (var i = 0; i < len; ++i) {
        callbacks[i].apply(this, args);
      }
    }
    return this;
  };

})(this);