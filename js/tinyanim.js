var cChannels = cChannels || {
	channelArray: new Array()
};

cChannels.initChannels = function() {

	cChannels.channelArray.push({
		displayName:"Opacity",
		name:"opacity",
		cssNames:["opacity"],
		template:"timeline_channel_simple",
		getValue: function(element) {
			return (element.style.opacity*100) || 100;
		},
		applyValue: function(element, value) {
			element.style.opacity = value / 100;
		}
	});

	cChannels.channelArray.push({
		displayName:"X position",
		name:"xposition",
		propertyNames:["left"],
		template:"timeline_channel_simple",
		getValue: function(element) {
			console.log(element);
			return parseInt(element.style.left);
		},
		applyValue: function($element, value) {
			$element.style.left = value+"px";
		}
	});

	cChannels.channelArray.push({
		displayName:"Y position",
		name:"yposition",
		propertyNames:["top"],
		template:"timeline_channel_simple",
		getValue: function(element) {
			console.log(element);
			return parseInt(element.style.top);
		},
		applyValue: function($element, value) {
			$element.style.top = value+"px";
		}
	});

	cChannels.channelArray.push({
		displayName:"Scale",
		name:"scale",
		template:"timeline_channel_scale",
		propertyNames:["transform", "-webkit-transform", "-ms-transform", "moz-transform"],
		components: ["scaleX", "scaleY"],
		getValue: function(element) {

			// CSS Transforms are returned as a matrix so we need to do some
			// matrix mathematics to extract the current scale and rotation
			var decomposedMatrix = cChannels.decomposeMatrix( cChannels.getTransformMatrixFromElement(element) );
			return {x:decomposedMatrix.scaleX, y:decomposedMatrix.scaleY};
		},
		applyValue: function(element, value) {
			var style = element.style;
			var scale = 'scale('+value.x+','+value.y+')';
			var tString = cChannels.addTransformCompnent(style, scale, 'scale');
			element.style.transform = tString;
			element.style.webkitTransform = tString;
		}
	});

	cChannels.channelArray.push({
		displayName:"Rotation",
		name:"rotation",
		propertyNames:["transform", "-webkit-transform", "-ms-transform"],
		components: ["rotate"],
		template:"timeline_channel_simple",
		getValue: function(element) {
			var matrix = cChannels.getTransformMatrixFromElement(element);
			console.log(matrix);
			var decomposedMatrix = cChannels.decomposeMatrix( matrix );
			return decomposedMatrix.rotation;
		},
		applyValue: function(element, value) {
			var style = element.style;
			var rotation = 'rotate('+value+'deg)';
			var tString = cChannels.addTransformCompnent(style, rotation, 'rotate');
			element.style.transform = tString;
			element.style.webkitTransform = tString;
		}
	});

}

cChannels.getChannelFromName = function(name) {
	for (var i in cChannels.channelArray) {
		i = cChannels.channelArray[i];
		if(i.name === name) {
			return i;
		}
	}
	return null;
}

cChannels.getCurrentValueForChannel= function(element, property, component) {
	var channelObj = cChannels.getChannelFromName(property);
	return channelObj.getValue(element);
}

cChannels.applyValueToChannel = function($element, value, property, component) {
	var channelObj = cChannels.getChannelFromName(property);
	//console.log(channelObj);
	channelObj.applyValue($element, value);
}

cChannels.deltaTransformPoint = function(matrix, point)  {
    var dx = point.x * matrix.a + point.y * matrix.c + 0;
    var dy = point.x * matrix.b + point.y * matrix.d + 0;
    return { x: dx, y: dy };
}

cChannels.decomposeMatrix = function(matrix) {

    // calculate delta transform point
    var px = cChannels.deltaTransformPoint(matrix, { x: 0, y: 1 });
    var py = cChannels.deltaTransformPoint(matrix, { x: 1, y: 0 });

    // calculate skew
    var skewX = ((180 / Math.PI) * Math.atan2(px.y, px.x) - 90);
    var skewY = ((180 / Math.PI) * Math.atan2(py.y, py.x));

    return {
        translateX: matrix.e,
        translateY: matrix.f,
        scaleX: Math.sqrt(matrix.a * matrix.a + matrix.b * matrix.b),
        scaleY: Math.sqrt(matrix.c * matrix.c + matrix.d * matrix.d),
        skewX: skewX,
        skewY: skewY,
        rotation: skewX // rotation is the same as skew x
    };
}

cChannels.getTransformMatrixFromElement = function (element) {
	var computedStyle = window.getComputedStyle(element, null);
	var matrix = computedStyle.getPropertyValue('transform')
	|| computedStyle.getPropertyValue('-webkit-transform')
	|| computedStyle.getPropertyValue('-ms-transform');

	// The matrix is returned to us as a string. It is easier to deal
	// with as an Array of values so we strip the brackets and
	// split on the commas to get a nice array.
	var values = matrix.split('(')[1];
	values = values.split(')')[0];
	values = values.split(',');
	var aMat = {};
	aMat.a = values[0];
	aMat.b = values[1];
	aMat.c = values[2];
	aMat.d = values[3];
	aMat.e = values[4];
	aMat.f = values[5];
	return aMat;
}

cChannels.addTransformCompnent = function (style, component, token) {
	var transform = style.transform || style.webkitTransform;
	if (typeof(transform) == "string"){
		var components = transform.split("\s+");
		var newComponents = "";
		for (var i in components) {
			if(!components[i].match("^"+token)) {
				newComponents += components[i] + " ";
			}
		}
		newComponents += component;
		return newComponents;
	}
	return "";
}

cChannels.initChannels();
;// Request animation frame polyfill
(function() {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame =
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };

    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

// JavaScript Document

var TinyAnim = {

	anim:null,
    targetEl:null,
	currentFrame:0,
	fps:null,
	interval:null,
	elements:null,
	onAdvanceFrame:null,
	onAnimationComplete:null,
	isPlaying:false,
    options:null,
    playCount:0,
	animStartTime:0

}

TinyAnim.init = function(anim, targetEl, options) {

    // Store settings on object
    TinyAnim.anim = anim;
    TinyAnim.targetEl = targetEl || "Content";
    TinyAnim.fps = 1000 / anim.fps;
    TinyAnim.options = options || null;
    TinyAnim.elements = Array();

    // unescape all of the content properties, they were previously escaped for
    // storage
    for (var n in anim.elements)
    {
        anim.elements[n].content = unescape(anim.elements[n].content);
    }

	// remove old dom elements
	var myNode = document.getElementById(TinyAnim.targetEl);
	while (myNode.firstChild) {
		myNode.removeChild(myNode.firstChild);
	}

    // To handle parent/child relationships
    var childBag = new Array();


	// prepare the elements of the animation
	for (var i in TinyAnim.anim.elements)
	{
		var el = TinyAnim.anim.elements[i];

		// The elements root node
		var domEl = document.createElement("div");
		domEl.setAttribute('id', "TAnimEl"+i);
		domEl.setAttribute('name', el.name);
        domEl.setAttribute('data-guid', el.guid || 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
		    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
		    return v.toString(16);
		}));
        if(el.parent !== undefined && el.parent !== null) {
            domEl.setAttribute('parent', el.parent);
            childBag.push(domEl);
        } else if (el.parentName !== undefined && el.parentName !== null) {
			domEl.setAttribute('parentName', el.parentName);
            childBag.push(domEl);
		}

			domEl.setAttribute('class', "ill-anim-element");

		domEl.setAttribute('data-layer-id', i);
		domEl.style.zIndex = el.zindex;
		domEl.style.top = el.defaultTop+"px";
		domEl.style.left = el.defaultLeft+"px";
		domEl.animdata = el;




			domEl.innerHTML = el.content;

		// Store a reference to the element
		TinyAnim.elements.push(domEl);

		// Add it to the DOM
		document.getElementById("Content").appendChild(domEl);
	}

    // apply parent relationships
    for(var c in childBag) {
        var child = childBag[c];
        var pGUID = child.getAttribute("parent");
		if(pGUID != null) {
			var parentEl = document.querySelectorAll("[data-guid=\""+pGUID+"\"]");
        	parentEl[0].appendChild(child);
		} else {
			console.log(child)
			var pName = child.getAttribute("parentName");
			var parentEl = document.querySelectorAll("[name=\""+pName+"\"]");
			parentEl[0].appendChild(child);
		}
    }

};

TinyAnim.lerp = function(a, b, f, ease) {
	switch(ease) {
		case "linear":
			return a + f * (b - a);
		case "ease-out":
			f = Math.sin(f*1.5707);
			return a + f * (b - a);
		case "ease-in":
			f = Math.cos(f*1.5707);
			return a + f * (b - a);
		case "bounce":
			f = Math.cos(f * 1.57079632 * 2) /2 + 0.5;
			return a + f * (b - a);
		default:
			return a + f * (b - a);
	}
};

TinyAnim.play = function() {


	// If we are not already playing (else just continue playing, i.e. do
	// nothing)
	if(TinyAnim.isPlaying == false) {

		TinyAnim.isPlaying = true;

		// Set Time of initial call, for calculating how much time has passed
		// between frames
		TinyAnim.animStartTime = new Date().getTime() - ( TinyAnim.currentFrame * TinyAnim.fps );
		// Start play loop
		TinyAnim.advanceFrameWhilePlaying();
	}
};

TinyAnim.advanceFrameWhilePlaying = function() {

    // Calculate time since last frame
	var now = new Date().getTime();
	var dt = now - TinyAnim.animStartTime;
	TinyAnim.currentFrame = dt / TinyAnim.fps;


	TinyAnim.updateAnimation();

	// check for end of animation
	if(TinyAnim.currentFrame > TinyAnim.anim.length) {
        TinyAnim.playbackEnded();
	}

	// Call whatever has been attached to onAdvanceFrame
	if(TinyAnim.onAdvanceFrame) {
		TinyAnim.onAdvanceFrame();
	}


	// Request next frame if playing
	if(TinyAnim.isPlaying) {
		window.requestAnimationFrame(function(){ TinyAnim.advanceFrameWhilePlaying() });
	}


};

TinyAnim.playbackEnded = function() {

    TinyAnim.playCount++;

    if(TinyAnim.onAnimationComplete) {
        TinyAnim.onAnimationComplete();
    }


    // Apply looping if freestanding
    if(typeof Project == "undefined") {
        switch (TinyAnim.options.playback) {
            case "play_forever":
                TinyAnim.seek(0);
                setTimeout(function() {
                    TinyAnim.play();
                },1);
                break;
            case "play_n_times":
                var count = parseInt(TinyAnim.options.loopcount);
                var loops = TinyAnim.playCount;
                console.log(count, loops);
                if(loops < count) {
                    TinyAnim.seek(0);
                    setTimeout(function() {
                        TinyAnim.play();
                    },1);
                } else {
                    TinyAnim.isPlaying = false;
                }
            default:
                TinyAnim.isPlaying = false;
                break;
        }
    }
}

TinyAnim.seek = function(frame) {
	TinyAnim.currentFrame = frame;
	// Reset counter so we have a new point against which to measure time
	// passed since the start of the animation
	TinyAnim.animStartTime = new Date().getTime() - ( TinyAnim.currentFrame * TinyAnim.fps );
	TinyAnim.updateAnimation();
};

TinyAnim.stop = function() {
	TinyAnim.isPlaying = false;
};

TinyAnim.updateAnimation = function() {

	// Iterate each element
	for(var i in TinyAnim.elements)
	{
		var domEl = TinyAnim.elements[i];
		var keys = domEl.animdata.keys;

		// Iterate each channel
		for (var n in keys)
		{
			var channel = keys[n];

			// Calculate the current active keyframe(s)
			// That being the keyframe upcoming (currenttime < keyNext but > keyPrev

			// check for hold before first key
			var prevKeyIndex;
			var nextKeyIndex;

			var isHolding = false;

			// Only bother doing the lerp if this channel has some keys
			if(channel.keys.length > 0)
			{
				if(TinyAnim.currentFrame < channel.keys[0].time)
				{
					isHolding = true;
					prevKeyIndex = 0;
					nextKeyIndex = 0;
				}

				if(TinyAnim.currentFrame > channel.keys[channel.keys.length-1].time)
				{

					isHolding = true;
					prevKeyIndex = channel.keys.length-1;
					nextKeyIndex = channel.keys.length-1;
				}

				// if we are not in the hold state
				if(isHolding === false)
				{
					// iterate each key
					for(var c=0; c<channel.keys.length; c++)
					{
						// Is the current frame greater then this key?
						if(TinyAnim.currentFrame >= channel.keys[c].time)
						{
							// Is there a next key to compare too?
							if( (c+1) < channel.keys.length )
							{
								// Is it also lower then the next key
								if(TinyAnim.currentFrame < channel.keys[c+1].time)
								{
									// if everything was true then we must be between this key and the next key
									prevKeyIndex = c;
									nextKeyIndex = c+1;
									break;
								} else {
									// TODO: What happens if we are on the last key, not sure. Work this out.
									prevKeyIndex = c;
									nextKeyIndex = c;
								}
							} else {
								prevKeyIndex = c;
								nextKeyIndex = c;
							}
						}
					}
				}


				// now we know our previous and next keys, we need to interpolate between them
				//console.log("P: " + prevKeyIndex + ", N: " + nextKeyIndex);

				// and finally position our object

				var channelName = channel.channel;

				// work out a normalized value (0-1) that represents how far through this section we are and store in stepVal
				var keyLength = channel.keys[nextKeyIndex].time - channel.keys[prevKeyIndex].time;
				var framesIn = TinyAnim.currentFrame - channel.keys[prevKeyIndex].time;

				// for some reason the normalized value is backwards once put through the lerp
				// So for now I am just reversing the input (so 1-n) but the real problem is
				// in the lerp routine and needs to be looked at in more detail eventually
				if(prevKeyIndex != nextKeyIndex)
				{
					var stepVal = 1 - framesIn / keyLength;
				} else {
					// We're holding or there is only one keyframe or we are on the last keyframe
					var stepVal = 0;
				}

				// Do the lerp
                var valA = channel.keys[prevKeyIndex].value;
                var valB = channel.keys[nextKeyIndex].value;
				var easing = channel.keys[prevKeyIndex].easing || "bounce";

                // Are we interpolating a single or compund value?
                if( typeof(valA) === "number" && typeof(valB) === "number" ) {
                    // Value is a number so just ineterpolate it normally
                    var newValue = TinyAnim.lerp(channel.keys[prevKeyIndex].value, channel.keys[nextKeyIndex].value, stepVal, easing);
                } else {
                    // Value is a compund object

                    var newValue = {};
                    for (var property in valA) {
                        if ( valA.hasOwnProperty(property) ) {
                            var componentA = valA[property];
                            var componentB = valB[property];
                            var componentVal = TinyAnim.lerp(componentA, componentB, stepVal, easing);
                            newValue[property] = componentVal;

                        }
                    }
                }
                cChannels.applyValueToChannel(domEl, newValue, channelName, null);
			}
		}
	}
};

TinyAnim.resolveGUID = function(guid) {
    for (var n in TinyAnim.anim.elements) {
        var el = TinyAnim.anim.elements[n];
        if(el.guid == guid) {
            return el;
        }
    }
    return null;
}

TinyAnim.checkCyclical = function(el, guid, callback) {
    if(el.parent !== null) {
        var parent = TinyAnim.resolveGUID(el.parent);
        if(parent.guid == guid) {
            // we found ourselves
            callback(false);
        } else {
            TinyAnim.checkCyclical(parent, guid, callback);
        }
    } else {
        callback(true);
    }
}
