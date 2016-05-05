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
<script src="../../js/tinyanim.min.js"></script>
````
