# TinyAnimRuntime
A minuscule (8kb) Javascript tweening library which describes animations using an easy to read and edit JSON format. Integrates perfectly with our commercially available WYSIWYG editor [TinyAnim](http://tinyanim.com) to allow code free animating and exporting, or can be used alone by writing the JSON by hand.

##Features
- Minuscule runtime (8kb) with no dependencies, perfect for banners.
- Easy to understand JSON markup format
- Out of the box support for Translation, Rotation, Scaling and Opacity (with vendor prefixes applied automatically where required).
- Easing options: Linear, Ease-In, Ease-Out, Bounce.
- Looping options: Play Forever, Play Once, Loop n Times
- Parent elements to other elements to build complex hierarchies
- Accurate FPS playback based on requestAnimationFrame with timeout based fallback
- Progress and Completion callbacks
- Commercially available WYSIWYG editor for building complex animations. Available [here](http://tinyanim.com)

##Installation
Download the zip file and link to `tinyanim.js` or `tinyanim.min.js` file like so:

```html
<script src="js/tinyanim.min.js"></script>
````

##Basic usage
To create an animation you need to describe it as a JSON object in your script, the following object will create a small square which bounces from left to right:

```
var theAnimation = {
	"length":180,
	"fps":60,
	"elements":
	[
		{
			"name":"SimpleBox",
			"defaultLeft":0,
			"defaultTop":0,
			"defaultOpacity":1,
			"zindex":"0",
			"content":'<div style="width:20px; height:20px; background-color:#ff0055"></div>',
			"keys":[{
				"channel":"xposition",
				"keys": [
  				{"time":0, "value":0, "easing":"bounce"},
  				{"time":90, "value":280, "easing":"bounce"},
  				{"time":180, "value":0, "easing":"bounce"}]
			}]
		}
	]
};
```

Along with setting the animation length and fps the animation object should contain an array of elements which you wish to animate. The elements contain channel objects which should contain a label for the target channel and a further sub array of actual keyframes and their data. The elements content property contains the actual html you wish to present on stage.

After you have defined your animation you need to provide an element into which the animation can be rendered. At the moment you must specify the container as a string containing the elements id, so an example container may look like this:

```html
<div id="Content" style="position:relative; width:300px; height:250px; overflow:hidden">
```

Once the JSON object and the container have been prepared you can play the animation like so:

```html
TinyAnim.init(
	theAnimation,
	"Content",
	{
		"playback":"play_forever",
		"loopcount":"3"
	}
);
```

##The TinyAnim object

`TinyAnim.init( animationObject, containerID, options )`

* **animationObject**: The JSON object which describes the animation
* **containerID**: A string with the ID of the container element
* **options**:
  * **playback**: (string) play_once(*default*), play_forever, play_n_times
  * **loopcount**: (int) count — Number times to play if play_n_times was specified

##Callbacks

TinyAnim has callbacks for when the animation advances and ends, you can tap into them like so:

```html
TinyAnim.onAdvanceFrame = function() {
  console.log("A frame was played");
}
```

```html
TinyAnim.onAnimationComplete = function() {
  console.log("The animation has completed");
}
```
