---
layout: post
title: "AngularJS, RequireJS, AlmondJS, and Google Maps"
description: ""
category: code
tags: [angular, javascript, "google maps"]
---
{% include JB/setup %}

I had to solve the problem of integrating AngularJS and RequireJS with Google Maps. This is not usually a huge challenge, there is even an [async module for RequireJS](https://github.com/millermedeiros/requirejs-plugins), and an [Angular-UI map plugin](https://github.com/angular-ui/ui-map) to make integration pretty seamless. The wrinkle that made this integration trickier is [AlmondJS](https://github.com/jrburke/almond)&mdash;and Almond doesn't support asynchronous module loading.

When you include the Google Maps script, you can [specify a callback](https://developers.google.com/maps/documentation/javascript/examples/map-simple-async) in the querystring that will fire when the Google Maps API is loaded. You could then bootstrap your Angular app in that callback, e.g.:

    {% highlight html %}
    <script>
    function mapReady() {
      angular.bootstrap(document.getElementById("gmap"), ['app.ui-map']);
    }
    </script>

    <!-- funky formatting to fit the whole url on the screen -->
    <script 
    src="https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=mapReady">
    </script>
    {% endhighlight %}

This will work, but it will block your app until you hear back from Google Maps. I didn't want to do that; there was only one spot where a user _might_ use the map. Therefore, I wanted to lazily load it. 

When you are configuring the `$routeProvider`, you can specify an object for the `route` parameter's `resolve` property. Each property on the `resolve` object is a function that can return a promise. The controller will not get instantiated until the promise is resolved. And when the promise _is_ resolved, the value returned from the promise resolution gets passed into the controller as a parameter. 

So the plan of action was to resolve a promise when Google Maps was ready.

    {% highlight javascript %}
    // ...
    $routeProvider.when({
      path: '/path/to/where/ever',
      controller: 'SomeCtrl',
      route: {
        resolve: {
          gmap: function() {
            var dfd = $q.defer();
            // load google maps
            // fire callback
            // resolve promise
            return dfd.promise;
          }
        }
      }
    });
    //...
    {% endhighlight %}

Here's more-or-less how I implemented the `gmap` function.

    {% highlight javascript %}
    gmap: function() {
      var dfd = $q.defer();
      var doc = $window.document;
      var scriptId = 'gmapScript';
      var scriptTag = doc.getElementById(scriptId);

      if (scriptTag) {
        // if `scriptTag` exists, then gmaps must be available, so...
        dfd.resolve(true);
        return true;
      }

      // load google maps
      scriptTag = doc.createElement('script');
      scriptTag.id = scriptId;
      scriptTag.setAttribute('src', 
        'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&callback=mapReady');
      doc.head.appendChild(scriptTag);

      // fire callback, specified in the callback attribute of the script tag's src 
      // attribute.
      // The callback has to be in global (window) scope, so that Google Maps can find
      // it. I used a closure to store a reference to the deferred object we will 
      // resolve when the callback is fired.
      $window.mapReady = (function(dfd) {
        return function() {
          // resolve the promise:
          dfd.resolve(true);
          // cleanup the global space now that we are done:
          delete $window.mapReady;
        };
      }(dfd));
      
      return dfd.promise;
    }
    {% endhighlight %}


With this approach, we don't risk blocking the entire app; just this one route might block. Of course, this example just shows how to handle the "happy path"; it doesn't handle if the Maps API fails to load for some reason. I also wound up extending it to return the current positions coordinates, instead of just `true` when the maps API is ready. That is left as an exercise for the reader ...


