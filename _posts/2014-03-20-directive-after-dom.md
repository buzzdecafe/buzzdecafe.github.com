---
layout: post
title: "Make Your AngularJS Directive Wait for the DOM"
description: ""
category: 
tags: [javascript, angular]
---
{% include JB/setup %}

Sometimes you want your AngularJS directive to execute *after* the affected 
element has been added to the DOM and had its styles computed. 
This can often be solved by putting your DOM-specific logic inside a `$timeout`
and executing it on the next tick. But the `$timeout` trick does not 
guarantee that the element will be ready to manipulate. 

I was working with a directive that needed to access the element's computed 
width property, using the `$window.getComputedStyle` method. If the directive
fires before the styles are computed, it simply returns "auto" for the width
value. 

I needed to get some numeric value back (e.g. "421px"); "auto" is not a useful response:

    {% highlight javascript %}
    .directive('example', ['$window', function($window) {
      return {
        restrict: 'A',
        link: function(scope, element, attrs){
          var width = parseInt($window.getComputedStyle(element[0]).width, 10); 
          // Uh-oh, the element is not on the DOM yet. `getComputedStyle` 
          // returns "auto", so `parseInt` evaluates to NaN, and my 
          // calculations are borked
        }
      };
    }]);
    {% endhighlight %}

In this scenario, wrapping this up in a `$timeout` was insufficient to solve the problem.
`getComputedStyle` was still returning "auto", even when I tried passing fudge-factor 
milliseconds to `$timeout`. Up to 200ms was still not guaranteed to return the pixel value I 
needed.

The solution was to use the magic of recursion:

    {%highlight javascript%}  
        // ...
        link: function(scope, element, attrs){

          function doDomStuff() {
            $timeout(function() {
              var width = parseInt($window.getComputedStyle(element[0]).width, 10); 
             
              if (width) {
                // if width is computed, the element is ready to be manipulated
                // so manipulate the element here, e.g.:
                element.css({ backgroundPositionX: width/2 + "px" });
                // ... and more directive logic ...
              } else {
                // otherwise, the element is not ready, so wait a bit and try again:
                 doDomStuff();
              }
            }, 100);
          }

          doDomStuff();
        }
        // ...
    {% endhighlight %}

That's not bad, but we can do better:

* Backstop the recursion with a limited number of tries.
* Make the timeout milliseconds and number of tries configurable.

Taking those two requirements into account, the directive's `link` function winds up
looking something like this:

    {%highlight javascript%}  
        // ...
        link: function(scope, element, attrs){

          function doDomStuff(tries) {
            // a sanity check, just in case we reuse this function as a handler, 
            // e.g. for `orientationchange`
            if (isNaN(+tries)) {
              tries = attrs.maxTries || 10;
            }

            if (tries > 0) {
              $timeout(function() {
                var width = parseInt($window.getComputedStyle(element[0]).width, 10); 
                if (width) {
                  // if width is computed, the element is ready to be manipulated
                  // so manipulate the element here, e.g.:
                  element.css({ backgroundPositionX: width/2 + "px" });
                  // ...
                } else {
                  // otherwise, the element is not ready, so decrement the tries, 
                  // wait a bit, and try again:
                  doDomStuff(tries - 1);
                }
              }, attrs.msDelay || 100);
            } else {
              // if we got here, we've exhausted our tries, so we probably
              // want to log or warn or throw here.
            }
          }

          doDomStuff(attrs.maxTries);
          
          // maybe you need to do this too:
          $window.addEventListener('orientationchange', doDomStuff);
          // ... etc.
        }
        // ...
    {% endhighlight %}

_Et voil&aacute;_&mdash;this directive will now delay running until the element's computed 
styles are available, or die trying.

