# timeline

Timeline-based callback scheduler for JavaScript.

timeline.js provide a simple structure for storing callbacks placed on a flash-timeline-like sequence through which user can easily go ahead, stop, and go back. Note that this is not an asynchronous flow controlling library, such as async.js, flow.js or various deferred/promise implementation. 

## Usage

```javascript
// create timeline which has 200 frames
var tl = new Timeline(200);

// add callback executed at 45-th frame
tl.at(45, function(delta) {
  if (delta > 0) {
    console.log('do something when the timeline goes ahead');
  } else {
    console.log('do something when the timeline goes back');
  }
});

// add callback executed at 40-th frame
tl.at('20%', function(delta) {
  console.log('do something');
});

tl.eachFrame(5, 50, function(nthFrame, i) {
  return function(delta) {
    console.log("I'm registered at " + nthFrame + '-th frame.');
  };
});

// create an alias
tl.alias(90, 'foo');

// add callback executed at 90-th frame
tl.at('foo', function() {
  console.log('do something');
});

tl.gotoAndStop(150);

tl.stop();

tl.backtoAndStop(1);
```

## API

### new Timeline(numFrames)

Create a new Timeline object.

### timeline.at(n, callback)

Registers what you want to do in the form of a callback function.

### timeline.eachFrame(from, to, callback)

You can register a series of callbacks by using `timeline.eachFrame()`. Callbacks are placed at each frame from `from + 1`-th to `to`-th frame. The function of the 3rd parameter is a callback builder, which receives `nthFrame` and the index number `i` (from 0 to `from - to + 1`. This builder function must return a function which is the body of the callback to be registered.

### timeline.alias(n, name)

Creates an alias named `name` for `n`-th frame.

### timeline.stop()

Stops current animation.

### timeline.set(n)

Set the current frame to n. This does not raise animation, only moves the pointer of the current frame. Note that this method throws error if it is called during animation loop.

### timeine.distanceBetween(m, n)

Returns the number of frames between m-th frame and n-th frame. `m` and `n` may be a frame number, relative position, alias.

### timeline.gotoAndStop(nthFrame, interval)

Forwards the timeline to `nthFrame`. Firstly, callbacks registered at `<current frame> + 1` are executed, then `<current frame + 2>`, `<current frame> + 3` ... `nthFrame + ` are sequentially called. `interval` is a duration between frames.

### timeline.backtoAndStop(nthFrame, interval)

Backwards the timeline to `nthFrame`. Contrary to timeline forwarding, functions run first are those who are registered at `<current frame>`, moreover, callbacks at `nthFrame` do _not_ be called.

### timeline.currentFrame

Current timeline position (positive integer.)

### timeline.numFrames

Number of frames (positive integer.)

### Event: 'setup'

`function(nthFrame, delta) {}`

This event is triggered if the timeline start from the 1st frame, or, in the case of backwarding, from the last frame which equals to `timeline.numFrames` value. Callback receives 2 parameters. `nthFrame` is the frame number, and `delta` is the direction of timeline ticking, which is 1 (forwarding) or -1 (backwarding).

### Event: 'teardown'

`function(nthFrame, delta) {}`

This event is triggered if the timeline end at the last frame, or, in the case of backwarding, at the 1st frame.

### Event: 'enterframe'

`function(nthFrame, delta) {}`

This event is triggered whenever the timeline ticks.

## License

(The MIT License)

Copyright (c) 2012 hitsujiwool &lt;utatanenohibi@gmail.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
