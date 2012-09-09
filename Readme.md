# timeline

Flash timeline-like callback scheduler.

timeline.js provide a simple structure for storing callbacks placed on a timeline-like sequence on which user can easily go ahead, stop, and go back. Note that this is not an asynchronous flow controlling library, such as async.js, flow.js or various deferred/promise implementation. 

## Usage

### new Timeline(numFrames)

Create a new Timeline object.

### timeline.at(n, callback)

Registers what you want to do in the form of a callback function.

```javascript
timeline.at(45, function(delta) {
  // do something
});

timeline.at(45, function(delta) {
  // do another thing (this is called after callback above.)
});
````

You can assign callback by its relative position, which is a String with '%' at its end.

```javascript
timeline.at('20%', function(delta) {
  // do something
});
```

Alias created by `timeline#alias()` is also available (see below.)


### timeline.eachFrame(from, to, callback)

You can register a series of callbacks by using `timeline.eachFrame()`. Callbacks are placed at each frame from `from + 1`-th to `to`-th frame. The function of the 3rd parameter is a callback builder, which receives `nthFrame` and the index number `i` (from 0 to `from - to + 1`. This builder function must return a function which is the body of the callback to be registered.

```javascript
timeline.eachFrame(from, to, function(nthFrame, i) {
  return function(delta) {
    // do something
  };
});
```

### timeline.alias()

In some case, attaching an alias will make your code more maintainable.

```javascript
timeline.alias('foo', 45);
timeline.alias('bar', '30%');

timeline.at('foo', function(delta) {
  //do something    
});

timeline.at('bar', function(delta) {
  //do something    
});
```

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
