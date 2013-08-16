---
layout: post
title: "Function composition"
description: ""
category: code
tags: [functional, javascript]
---
{% include JB/setup %}

My friend and former (and future?) colleague, Paul Grenier, recently posted on the topic of [function composition](http://autosponge.github.io/blog/2013/02/09/variadic-composition-without-recursion/) in Javascript. Paul takes the angle that we can avoid some of the performance problems associated with the functional style (although at the cost of some maintainability--constructed functions are not the most pleasant thing to debug).

We use a similar approach to "memoizing" functions by arity in [Ramda](https://github.com/CrossEye/ramda) that Paul recommends (cf. `nAry` function). Our implementation of a variadic `compose` function is straightforward:

    var compose = function() { 
      var fns = slice(arguments);
      return function() {
        return foldr(function(fn, args) {return [fn.apply(this, args)];}, slice(arguments), fns)[0];
      };
    };

Since we've implemented `foldr` in an imperative fashion (eeeeew), the performance penalty is negligible; and since the intent of compose is typically to load up a function and then reuse it, then `compose` may not be a great target for performance optimization in the first place. 

Ultimately, what I want to do is be able to compose some really useful functions on the fly, with as little code as possible. I'm not there yet. Part of the problem is how to handle variadic functions. (That may be a topic for another time.)

What I'd like to do is compose `map` and `pick` to give me a function that would project attributes over an array of objects. (Scott started down this road, but when he took some time off, I took up the torch.) This would be nice:

    var project = compose(map, pick);
    var selected = project(attrs, objects);

At present, this doesn't work in Ramda because `pick` comes out of `curry` not knowing what its arity is. You can work around that like this, but isn't as elegant:

    var project = compose(map, pick);
    var selected = project(attrs)(objects);

Why do something if you can't do it elegantly? Furthermore, the "function butt" makes some Puritanical developers uncomfortable. 

In Ramda we have another issue. Since `pick` will return an empty object if the passed-in object doesn't have any of the passed in properties, this simple `project` will not behave like you might think `project` should: It won't filter objects with undefined properties; it will include as many objects in its output as are given to it in its table parameter.

You can hack around that, of course, by filtering the table on the way into `project`:

    project = curry(function(keys, table) {
      return compose(map, pick)(keys)(filter(function(row) {
        return all(function(key){ return row[key] !== undef; }, keys);
      }, table));
    });

... but now this is starting to get ugly. It seems the better approach is to compose `project` out of a function that won't return an empty object.

Well, it's a work in progress, and there is plenty of room to improve!






