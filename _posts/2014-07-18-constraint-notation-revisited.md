---
layout: post
title: "Constraint notation revisited"
description: ""
category: code
tags: [functional, javascript, ramda, performance]
---
{% include JB/setup %}

A little while ago I wrote a [post about a `where` function](/code/2014/02/14/constraint-notation/)
I was adding to [Ramda](https://github.com/ramda/ramda). The function takes two objects, a spec 
and a test object, and returns `true` if the test object satisfies the spec. Since `where` is curried,
it is great for generating predicates; and in context, e.g. with a `find` or `filter`, it produces
code that *reads well*. Here's a toy example to illustrate what I mean:

    {% highlight javascript %}
    function isDivBy3(x) { return x % 3 === 0; }
    R.find(R.where({x: isDivBy3}), listOfObjects);
    {% endhighlight %}

The Ramda `where` function was inspired by Lodash's object constraint notation (e.g., `_.find({x: 10})`), but 
the two functions are not the same. Lodash's does some things Ramda's doesn't, and Ramda's does some 
things Lodash's doesn't. 

I used `where` in my examples when I [introduced Ramda](/code/2014/05/16/introducing-ramda/), and Scott
also used `where` in his examples in [Why Ramda?](http://fr.umio.us/why-ramda/) Then we got 
a bit of a shock. John-David Dalton (of Lodash fame) pointed out that Ramda `where` was 
[dog slow](http://jsperf.com/lodash-vs-ramda) 
(**Caution:** The graphs at this link are _fuuuuuuugly_). 

The good news is that we were able, after much struggle, to achieve 
[parity with Lodash's performance](http://jsperf.com/lodash-vs-ramda/7). This warrants a major hat-tip to 
Dalton for the heads up, and again to Dalton and Mathias Bynens for
[Benchmark.js](http://benchmarkjs.com/) and [jsperf.com](http://jsperf.com) which made these improvements possible.

Now for the bad news. We had to turn the implementation of `where` from this artful, compact code (if I do say so myself):

    {% highlight javascript %}
    where = curry(function(spec, test) {
        return all(function(key) {
           var val = spec[key];
           return (typeof val === 'function') ? 
               val(test[key], test) : 
               (test[key] === val);
           }, keys(spec));
    });
    {% endhighlight %}

... to this horrific imperative monstrosity:

    {% highlight javascript %}
    function satisfiesSpec(spec, parsedSpec, testObj) {
        if (spec === testObj) { return true; }
        if (testObj == null) { return false; }
        parsedSpec.fn = parsedSpec.fn || [];
        parsedSpec.obj = parsedSpec.obj || [];
        var key, val, i = -1, fnLen = parsedSpec.fn.length, 
            j = -1, objLen = parsedSpec.obj.length;
        while (++i < fnLen) {
            key = parsedSpec.fn[i];
            val = spec[key];
            if (!(key in testObj)) {
                return false;
            }
            if (!val(testObj[key], testObj)) {
                return false;
            }
        }
        while (++j < objLen) {
            key = parsedSpec.obj[j];
            if (spec[key] !== testObj[key]) {
                return false;
            }
        }
        return true;
    }

    where = function where(spec, testObj) {
        var parsedSpec = R.partition(function(key) {
            return typeof spec[key] === "function" ? "fn" : "obj";
        }, keys(spec));
        switch (arguments.length) {
            case 0: throw NO_ARGS_EXCEPTION;
            case 1:
                return function(testObj) {
                    return satisfiesSpec(spec, parsedSpec, testObj);
                };
        }
        return satisfiesSpec(spec, parsedSpec, testObj);
    };
    {% endhighlight %}

**Two** `while` loops? Ugh. The primary problem with the original `where`'s performance was that it was
parsing the `spec` on every call. Parsing that object is expensive. The revised, performant version does 
the parsing once.

And now, the irony: I started writing Ramda with Scott because I wanted to write Javascript in the elegant, terse 
functional style. Now it turns out that to do that I have to write some really inelegant, prolix code.

