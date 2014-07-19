---
layout: post
title: "The project project"
description: ""
category: code
tags: [functional, javascript, ramda]
---
{% include JB/setup %}

What should the contract of a function called `project` be? Suppose you have a collection of objects like this:

    var table = [
      {a: 1, b: 2, c: 3},
      {a: 10, b: 20, c: 30},
      {a: 12, c: 32},
      {b: 22, c: 42},
      {c: 300}
    ];

... and we want to fetch the `a` and `b` attributes of each object in `table`. Maybe I want to get back a set like this:

    [
      {a:1, b:2}, 
      {a:10, b:20}
    ]

i.e., if an attribute is undefined on the input object, then the object doesn't appear in the output. In terms of relational algebra, getting this output takes two operations; one to select the objects that have defined properties, and one project those properties onto the output objects. They are associative, but it's smart to select first, then project, since you may have fewer objects to iterate over after the selection. 

For now, the simple, algebraic approach is what we're going to take with `project` in [Ramda](https://github.com/CrossEye/ramda). In other words, `project` will simply project; it's up to the caller to pre-select the input table or filter the output results. But there is more to it than that. The implementation of `pick` checks for the existence of a name on the input object before copying the value over to the projected object, i.e.:

    project(['a', 'b'])(table) 

will output:

    [
      {a: 1, b:2}, 
      {a:10, b: 20}, 
      {a: 12}, 
      {b: 22}, 
      {}
    ]

So we've got a projected object out for every object in the input `table`, but if the attribute was undefined in the table, it doesn't exist in the output. (Incidentally, this is how underscore does it.) Is that what we want? Or does this output make more sense for a simple `project`:

    [
      {a: 1, b:2}, 
      {a:10, b: 20}, 
      {a: 12, b: undefined}, 
      {a: undefined, b: 22}, 
      {a: undefined, b: undefined}
    ]

This is essentially how a SQL-style `project` works (substitute `null` for `undefined`). This is simple enough to achieve by writing a new version of `pick`, called say, `pickAll`, that does not test for properties on the input object:

    R.pickAll = curry(function(names, object) {
        var copy = {};
        each(function(name) {
            copy[name] = object[name];
        }, names);
        return copy;
    });

Then compose `map` and `pickAll`, and you've got a `project`-style function that guarantees that the output objects will have the desired properties, even if they are undefined. There are two benefits of this; first, this is consistent with relational algebra and familiar from SQL; and second, projected objects will report the same result when enumerating their keys. Of course, they will still report the value of that key as undefined, exactly as the original `pick` would.






    



