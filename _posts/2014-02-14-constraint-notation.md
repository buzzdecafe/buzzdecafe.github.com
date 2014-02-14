---
layout: post
title: "Constraint notation in Javascript"
description: ""
category: code
tags: [javascript]
---
{% include JB/setup %}

> Instead of imagining that our main task is to instruct a computer what to do,
> let us concentrate rather on explaining to human beings
> what we want a computer to do.
>
> -- Donald Knuth

One of the things I really like about working with Lodash is its object 
constraint notation. For example, suppose I want to find an item in a list 
where `x === 10`. Lodash lets me express that like this:

    {% highlight javascript %}
    var xIs10 = _.find(list, {x: 10});
    {% endhighlight %}

I find this syntax easy to write, and at least as important, easy to read.
The intent is perfectly clear.

Naturally, I wanted to incorporate this elegant syntax into [Ramda](https://github.com/CrossEye/ramda).
But this would not be an easy fit. Ramda is significantly different from Lodash.
Since Ramda emphasizes function composition, the biggest obstacle to integrating the 
object constraint syntax is that Ramda methods always take the function *first* and 
the list *last*.

I pitched the idea to my co-author, Scott. We didn't want to rewrite Ramda to 
type-check the arguments. So we found solution that preserves the composability 
of Ramda functions, while gaining the readable, expressive object syntax. And 
then we took it a little bit further.... 

Here is what the API looks like:

    {% highlight javascript %}
    var xIs10 = find(where({x: 10}), list);
    {% endhighlight %}

`where` takes a spec object and a test object and returns `true` if the test
satisfies the spec (`false` otherwise, of course). Since Ramda automatically
curries its methods, when called with one argument (the spec) as in the 
example above, `where` returns a function that takes a test object. This makes 
it a good helper for generating predicates for methods like `find` and `filter`.

This would be a fine place to stop, and we could be satisfied with a nice 
object-to-predicate method. But this `where` can only express *equality 
relations*. If we want to match objects where `x > 10`, or more complex 
queries, such as `x > 2 AND y > (x * 2) AND y % 2 === 0`, then we would have 
to write a function.

So we opted to take the object constraint notation one step further: If a
property on the spec object maps to a function, we use that function as the 
constraint on that property. Here's how the examples above would look:

    {% highlight javascript %}
    // example 1: find objects where x > 10
    var xGt10 = filter(where({x: function(val) { return x > 10; }}), list);

    // example 2: find objects where x > 2 && y > x*2  && y is even
    var xGt2etc = find(where({
      x: function(val, obj) { return val > 10; },
      y: function(val, obj) { return val > obj.x * 2 && val % 2 === 0; }
    }), list);
    {% endhighlight %}

This is not as immediately readable as the straight equality object syntax. But 
I like specifying the constraints property-by-property and having the ability
to express more complex relations than just equality. And we still have the 
object notation for plain equality relations.

If you're curious, here is how `where` is implemented in Ramda:

    {% highlight javascript %}
    where = curry(function(spec, test) {
      return all(function(key) {
        var val = spec[key];
        return (typeof val === 'function') ? 
          val(test[key], test) : 
          (test[key] === spec[key]);
      }, keys(spec));
    });
    {% endhighlight %}






