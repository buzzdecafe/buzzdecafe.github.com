---
layout: post
title: "The Tao of &#955;: Undoing with higher-order functions and closures"
description: ""
category: code
tags: [functional, javascript]
---
{% include JB/setup %}

Sometimes you need to temporarily change the value of an object property. Maybe you need to stub something for a test; or maybe you need to revert to the prior value for that property. You can do this imperatively, of course, and that is fine. But I want a more generic solution. 

I want a function that I pass an object, the property to override, and the new value for the property, and have it return me an `undo` function to restore the object's prior state:

    {% highlight javascript %}
    var undo = revalue(obj, prop, newValue);
    // do whatever
    undo();
    // hey, my original obj is back!
    {% endhighlight %}

Here's a first try that stores the original value in the closure of the returned `undo` function:

    {% highlight javascript %}
    var revalue = function(obj, prop, newValue) {
        var undo, orig = obj[prop];
        obj[prop] = newValue;
        undo = function() {
            obj[prop] = orig;
            return orig;
        };
        return undo;
    };
    {% endhighlight %}

That pretty much does the trick. Then a colleague asked: "If the value is a function, why not add a `restore` property to it?" OK, it's a bit redundant, since we are returning the `undo` function anyways, but WTH.   

    {% highlight javascript %}
    var revalue = function(obj, prop, newValue) {
        var undo, orig = obj[prop], isFn = typeof newValue === "function";
        obj[prop] = isFn ? function() { return newValue.apply(obj, arguments); } : newValue;
        undo = function() {
            obj[prop] = orig;
            return orig;
        };
        if (isFn) {
            obj[prop].restore = undo;
        }
        return undo;
    };
    {% endhighlight %}

Note that we have to wrap the `newValue` function inside a lambda:

    {% highlight javascript %}
    obj[prop] = isFn ? function() { return newValue.apply(obj, arguments); } : newValue;
    {% endhighlight %}
    
If we don't wrap `newValue` this way, then the `restore` property will be attached to `newValue` and it will leak out of the `undo` function. We don't want that. It's safe to attach the `restore` property to the lambda:

    {% highlight javascript %}
    if (isFn) {
        obj[prop].restore = undo;
    }  
    {% endhighlight %}

And since anything worth doing is worth overdoing, the final version extends `undo` to take a callback function. That callback can be passed in as an optional fourth argument to `revalue`, or as an optional argument to the `undo` function itself. It's up to the user to make the callback return something useful:
    
    {% highlight javascript %}
    var revalue = function(obj, prop, newValue, undoCallback) {
        var undo, orig = obj[prop], isFn = typeof newValue === "function";

        obj[prop] = isFn ? function() { return newValue.apply(obj, arguments); } : newValue;
        undo = function(cb) {
            obj[prop] = orig;
            cb = isFunction(cb) ? cb :
                    (isFunction(undoCallback) ? undoCallback : function() { return orig; });
            return cb(obj, prop, orig, newValue);
        };
        if (isFn) {
            obj[prop].restore = undo;
        }
        return undo;
    };
    {% endhighlight %}

 
