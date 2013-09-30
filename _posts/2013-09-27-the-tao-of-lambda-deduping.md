---
layout: post
title: "The Tao of &lambda;: Deduping"
description: ""
category: code
tags: [javascript, functional]
---
{% include JB/setup %}

My [Y Combinator](http://buzzdecafe.github.io/code/2013/09/05/javascript-y-combinator/) article received a lot of attention, thanks to [DailyJS](http://dailyjs.com/2013/09/20/ycombinator/) and [JavaScript Weekly](http://javascriptweekly.com/archive/149.html). While the Y Combinator is a fascinating thing in itself, it is not exactly practical. In fact, it's almost entirely academic (not that there's anything wrong with that).

Discussions of functional programming are prone to wander into etherealness. It is tempting to keep abstracting and abstracting until the world of real problems is left way down below. But this need not be the case. Functional programming is a powerful and _practical_ tool for solving real-world problems. And *just the right amount* of abstraction can be very productive. 

Here is an example of a common real-world problem: Deduping an array of objects. Let's start with an array of simple objects:

    {% highlight javascript %}
    var xs = [
      {x: {y: 1}}, 
      {x: {y: 2}}, 
      {x: {y: 3}}, 
      {x: {y: 4}}, 
      {x: {y: 1}}, 
      {x: {y: 4}}, 
      {x: {y: 5}}, 
      {x: {y: 6}}
    ];
    {% endhighlight %}

The output we want is:

    {% highlight javascript %}
    [
      {x: {y: 1}}, 
      {x: {y: 2}}, 
      {x: {y: 3}}, 
      {x: {y: 4}}, 
      {x: {y: 5}}, 
      {x: {y: 6}}
    ]
    {% endhighlight %}

For this example, we don't care about the order of the output, if it _is_ sorted, that's just gravy.

I saw code to dedupe an array like this _in production_:

    {% highlight javascript %}
    function removeDuplicates(xs) {
      var i, ilen, prop, xObj = {};
      for (i = 0, ilen = xs.length; i < ilen; i++) {
        xObj[xs[i].x.y] = xs[i];
      }
      xs = []; // Yikes!
      for (prop in xObj) {
        if (xObj.hasOwnProperty(prop)) {
          xs.push(xObj[prop]);
        }
      }
      return xs;
    }
    {% endhighlight %}

It works, but there's a lot to dislike about `removeDuplicates`. For example, `removeDuplicates` mutates the input array. But the primary problem, for this discussion, is that it requires knowledge of the internals of the passed-in array. The key line is:

    {% highlight javascript %}
    xObj[xs[i].x.y] = xs[i];
    {% endhighlight %}
    
Since duplicate values of the `x.y` property will overwrite any prior value on `xObj`, this is where the definition of object equality is (even though it may not look like it). Objects are considered duplicates if they have the same `y` property. We can rewrite this to make a generic deduping function that takes an equality predicate and a list of objects. And this generic version will not mutate the passed-in object either. 

Here is the proposed API:

    {% highlight javascript %}
    function dedupe(equalityPredicate, list) { 
      // dedupe logic here...
      return dedupedList;
    }
    {% endhighlight %}

_Aside_: I deliberately made the predicate the first argument. I am assuming that I can curry this function. I may want to create a specific `xs` deduper to reuse from my `dedupe` function. Or I may want to define different deduping functions and store them for future use.

Here's the equality predicate for our `xs` object:

    {% highlight javascript %}
    function equalXs(objA, objB) {
      return objA.x.y === objB.x.y;
    }
    {% endhighlight %}

And here's an example of how to call `dedupe`:

    {% highlight javascript %}
    var newXs = dedupe(equalXs, xs);
    {% endhighlight %}

All that remains is to _implement_ `dedupe`. The simplest approach is to compare the head of the list to each element in another list (the "accumulator") of objects we've already tested for uniqueness, using the equality predicate. (Therefore, the first element always goes into the accumulator.) Then recursively work our way through the list testing the object against the accumulated list. If we don't find the object in the accumulator, then add it to the accumulator. As usual, I will use functions from [Ramda](https://github.com/Ramda/ramda) to build this. 

Let's take the spec above apart and look at its components. First, we need a way to iterate over the accumulator and test it for equality with the current object from `xs`. The `some` function takes a function and a list returns `true` if any element in the list satisfies the function: 

    {% highlight javascript %}
    some(function(accElem) {            
        return predicate(accElem, current); // the equality predicate we will pass in.
      },                                    // `some` will be true when the `current` 
                                            //  element is in the accumulator.
      acc);                                 // `acc` is the accumulator.
    {% endhighlight %}

And we need to iterate over the passed-in array (`xs`) and use the `some` test above to determine which objects to accumulate. This sounds like a job for `foldl`. 

    {% highlight javascript %}
    foldl(function(acc, curr) {
        // if the element is in the accumulator, return the accumulator;
        // if not, then add the element to the accumulator and return it.
        return (some(function(accElem) { return predicate(accElem, curr); }, acc)) ? 
            acc : 
            append(curr, acc);
      }, 
      [],        // the accumulator
      list);     // `xs` or whatever
    {% endhighlight %}

Put it all together, and we have our generic `dedupe` function:

    {% highlight javascript %}
    function dedupe(predicate, list) {
      return foldl(function(acc, curr) {
        return (some(function(accElem) { return predicate(accElem, curr); }, acc)) ? 
            acc : 
            append(curr, acc);
        }, [], list);
    }
    {% endhighlight %}

There you have it. `dedupe` does not require any knowledge of the array that gets passed to it. The `dedupe` function is generic; it can be used to dedupe _any array of objects that the user can define an equality predicate for_. It is entirely up to the caller to define what equality is for his objects with the equality predicate. 

This design makes `dedupe` robust. Imagine that somehow the spec of `xs` changes tomorrow, and now its objects have a `z` property, e.g. `{x: {y: 1, z: 100}}`. In that case, `removeDuplicates` would require some major rewriting. On the other hand, `dedupe` would not change _at all_. All we have to do to accommodate the `z` property is change the equality predicate that we pass to `dedupe` like so:

    {% highlight javascript %}
    function equalXs(objA, objB) {
      return objA.x.y === objB.x.y && objA.x.z === objB.x.z;
    }
    {% endhighlight %}

I hope this example demonstrates that functional programming isn't all ivory tower stuff. In fact, it can be used to improve real code.

## Update

Scott Sauyet has provided [tests for the code above](http://jsbin.com/oCAvAtU/1); also see the [tests' source code](http://jsbin.com/oCAvAtU/1/edit). Scott also took it another step by currying the `some` function and producing even leaner code.


