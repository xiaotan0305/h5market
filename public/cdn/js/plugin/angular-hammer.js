/*angular-hammer.js*/
!function(t,e,n){"use strict";function i(t,e){if(!t||!e||!e.type)return null;var i;return i=e.type.indexOf("pan")>-1?new n.Pan(e):e.type.indexOf("pinch")>-1?new n.Pinch(e):e.type.indexOf("press")>-1?new n.Press(e):e.type.indexOf("rotate")>-1?new n.Rotate(e):e.type.indexOf("swipe")>-1?new n.Swipe(e):new n.Tap(e),t.add(i),i}function r(t,e){return t&&(e.preventGhosts=t.preventGhosts),e}function o(t){return t.indexOf("pan")>-1?"pan":t.indexOf("pinch")>-1?"pinch":t.indexOf("press")>-1?"press":t.indexOf("rotate")>-1?"rotate":t.indexOf("swipe")>-1?"swipe":"tap"}function s(t,e,n){if(t&&e){var r=t.get(e.type);r||(r=i(t,e)),e.directions||(e.directions="pan"===e.type||"swipe"===e.type?"DIRECTION_ALL":e.type.indexOf("left")>-1?"DIRECTION_LEFT":e.type.indexOf("right")>-1?"DIRECTION_RIGHT":e.type.indexOf("up")>-1?"DIRECTION_UP":e.type.indexOf("down")>-1?"DIRECTION_DOWN":""),e.direction=a(e.directions),r.set(e),e.recognizeWith&&(t.get(e.recognizeWith)||i(t,{type:e.recognizeWith}),r.recognizeWith(t.get(e.recognizeWith))),e.dropRecognizeWith&&t.get(e.dropRecognizeWith)&&r.dropRecognizeWith(t.get(e.dropRecognizeWith)),e.requireFailure&&(t.get(e.requireFailure)||i(t,{type:e.requireFailure}),r.requireFailure(t.get(e.requireFailure))),e.dropRequireFailure&&t.get(e.dropRequireFailure)&&r.dropRequireFailure(t.get(e.dropRequireFailure)),e.preventGhosts&&n&&l(n)}}function a(t){var i=0;return e.forEach(t.split("|"),function(t){n.hasOwnProperty(t)&&(i|=n[t])}),i}function l(e){function n(t){for(var e=0;e<s.length;e++){var n=s[e][0],i=s[e][1];if(Math.abs(t.clientX-n)<a&&Math.abs(t.clientY-i)<a){t.stopPropagation(),t.preventDefault();break}}}function i(){s=[]}function r(){s.splice(0,1)}function o(t){if(t.touches.length-t.changedTouches.length<=0){var e=t.changedTouches[0];s.push([e.clientX,e.clientY]),setTimeout(r,l)}}if(e){var s=[],a=25,l=2500;"ontouchstart"in t&&(e[0].addEventListener("touchstart",i,!0),e[0].addEventListener("touchend",o,!0),e[0].addEventListener("click",n,!0),e[0].addEventListener("mouseup",n,!0))}}if("undefined"==typeof e)if("undefined"!=typeof require&&require)try{e=require("angular")}catch(c){return console.log("ERROR: Angular Hammer could not require() a reference to angular")}else{if("undefined"==typeof t.angular)return console.log("ERROR: Angular Hammer could not find or require() a reference to angular");e=t.angular}if("undefined"==typeof n)if("undefined"!=typeof require&&require)try{n=require("hammerjs")}catch(c){return console.log("ERROR: Angular Hammer could not require() a reference to Hammer")}else{if("undefined"==typeof t.Hammer)return console.log("ERROR: Angular Hammer could not find or require() a reference to Hammer");n=t.Hammer}var u=["hmCustom:custom","hmSwipe:swipe","hmSwipeleft:swipeleft","hmSwiperight:swiperight","hmSwipeup:swipeup","hmSwipedown:swipedown","hmPan:pan","hmPanstart:panstart","hmPanmove:panmove","hmPanend:panend","hmPancancel:pancancel","hmPanleft:panleft","hmPanright:panright","hmPanup:panup","hmPandown:pandown","hmPress:press","hmPressup:pressup","hmRotate:rotate","hmRotatestart:rotatestart","hmRotatemove:rotatemove","hmRotateend:rotateend","hmRotatecancel:rotatecancel","hmPinch:pinch","hmPinchstart:pinchstart","hmPinchmove:pinchmove","hmPinchend:pinchend","hmPinchcancel:pinchcancel","hmPinchin:pinchin","hmPinchout:pinchout","hmTap:tap","hmDoubletap:doubletap"];e.module("hmTouchEvents",[]),e.forEach(u,function(t){var i=t.split(":"),a=i[0],l=i[1];e.module("hmTouchEvents").directive(a,["$parse","$window",function(t,i){return{restrict:"A",link:function(c,u,h){if(!n||!i.addEventListener)return"hmTap"===a&&u.bind("click",v),void("hmDoubletap"===a&&u.bind("dblclick",v));var d=u.data("hammer"),p=e.fromJson(h.hmManagerOptions),f=e.fromJson(h.hmRecognizerOptions);d||(d=new n.Manager(u[0],p),u.data("hammer",d),c.$on("$destroy",function(){d.destroy()}));var m=h[a],g=t(m),v=function(t){function e(){var e=g(c,{$event:t});e&&e.call(c,t)}var n=c.$root.$$phase,i=d.get(t.type);t.element=u,i&&(i.options.preventDefault&&t.preventDefault(),i.options.stopPropagation&&t.srcEvent.stopPropagation()),"$apply"===n||"$digest"===n?e():c.$apply(e)};e.isArray(f)?e.forEach(f,function(t){"hmCustom"===a?l=t.event:(t.type||(t.type=o(l)),t.event&&delete t.event),("hmCustom"===a||l.indexOf(t.type)>-1)&&s(d,r(p,t),u)}):e.isObject(f)?("hmCustom"===a?l=f.event:(f.type||(f.type=o(l)),f.event&&delete f.event),("hmCustom"===a||l.indexOf(f.type)>-1)&&s(d,r(p,f),u)):"hmCustom"!==a?(f={type:o(l)},"hmDoubletap"===a&&(f.event=l,f.taps=2,d.get("tap")&&(f.recognizeWith="tap")),f.type.indexOf("pan")>-1&&d.get("swipe")&&(f.recognizeWith="swipe"),f.type.indexOf("pinch")>-1&&d.get("rotate")&&(f.recognizeWith="rotate"),s(d,r(p,f),u)):l=null,l&&d.on(l,v)}}}])})}(window,window.angular,window.Hammer);