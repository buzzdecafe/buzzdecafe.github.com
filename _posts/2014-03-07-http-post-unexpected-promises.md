---
layout: post
title: "AngularJS $http.post unexpected promises"
description: ""
category: code
tags: [angular, javascript]
---
{% include JB/setup %}

Me, today: "Why am I getting two different objects back from an `$http.post` 
service call?"

This is a tale of unexpected promises. There were two functions calling two 
methods on the backend service using an `$http.post` call. The client-side 
handlers were written by two different developers. Because the handlers should 
have been working with the same kind of object, I saw an opportunity for some 
code reuse. But somehow, the handlers were getting different objects.
 
Both backend service methods return the same kind of object, something like 
this:

    {% highlight javascript %}
    // Handler A gets passed this as its first argument:
    {
      status: {
        // ...
      }
      payload: {
        // ...
      }
    };
    {% endhighlight %}

Handler A received an object just like the one described above. But Handler B 
got the expected object wrapped inside another object, like this:

    {% highlight javascript %}
    // Handler B gets passed this as its first argument:
    {
      data: { // This is the object I expected
        status: {
          // ...
        },
        payload: {
          // ...
        }
      },
      headers: {
        // ...
      },
      status: 200,
      config: {
        // ...
      }
    }
    {% endhighlight %}

Both handlers were chained to `$http.post` calls. Why were they getting 
different objects?

It turns out that `$http.post` can return promises with different interfaces, 
depending on how you attach your handlers to the promise.

The `$http.post` method returns a [Q](https://github.com/kriskowal/q)-style 
promise. (It's instructive to look at the 
[Angular q.js source code](https://github.com/angular/angular.js/blob/master/src/ng/q.js).)
That promise only has the properties `then`, `catch`, and `finally`. 
Angular's `$http` service decorates that promise with two additional properties:
`success` and `error`. These two extra properties unpack the full response 
object into its components, and take a function like:

    {% highlight javascript %}
    // note the mapping from params to `then` object properties
    $http.post(url).success(function(data, status, headers, config) { 
      /* etc. */ 
    });
    {% endhighlight %}

Handler A was relying on these extra `success` and `error` methods, and got the 
expected object in the first parameter. 

Handler B attached a `then` to the `$http()` call, and got the full `$http` 
response object instead. The expected object comes attached to the response 
object's `data` property. Worse, the promise returned from `then` on `$http` 
*does not have `success` and `error` properties.* So anyone trying to add 
their own `success` or `error` handler to the chain will discover they don't work.

I rewrote Handler B to use `success` instead of `then` _et voila_: Handler B 
started getting the expected object, I could reuse handler code, and 
everything was copasetic. 


