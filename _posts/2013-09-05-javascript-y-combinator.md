---
layout: post
title: "Javascript Y Combinator"
description: ""
category: code
tags: [functional, javascript]
---
{% include JB/setup %}

At the end of [The Little Schemer](http://www.amazon.com/The-Little-Schemer-4th-Edition/dp/0262560992), the authors lead you step-by-step through the process of deriving the Y Combinator. They do this repeatedly abstracting a `length` function--and then magically, the Y Combinator appears. It is a pretty neat trick, and certainly mind-bending on your first read through the book. 

Since Javascript has first-class functions, we can derive the Y Combinator in Javascript as well. I will take a different approach than _The Little Schemer_. This approach owes a lot to a couple of blog posts I read on the subject<sup><a href="#notes">1</a></sup>.

Since this is a post about recursive functions, then we can use that old chesnut, `factorial`. Here is a possible implementation of `factorial` in Javascript:


    {% highlight javascript %}
    function basicFactorial(n) {
      return n === 0 ? 1 : n * basicFactorial(n-1);
    }
    {% endhighlight %}

Let's start by making a non-recursive `basicFactorial`, which we'll call `nonRecursive`:

    {% highlight javascript %}
    function nonRecursive(f) {
      return function(n) {
        return n === 0 ? 1 : n * f(n-1);
      }
    }
    {% endhighlight %}

All we've done here is replace the recursive call of `basicFactorial`. Instead, we pass in a function that will get called. We can pass any function that returns something that supports the `*` operator:

    {% highlight javascript %}
    nonRecursive(function(x) { return 0; })(100); // => 0
    nonRecursive(function(x) { return 1; })(100); // => 100
    nonRecursive(function(x) { return 10; })(100); // => 1000
    // ... etc.
    {% endhighlight %}

But it starts to get a little interesting when we pass `basicFactorial` in there. Then we get back ... `basicFactorial`!

    {% highlight javascript %}
    nonRecursive(basicFactorial)(4) === basicFactorial(4); 
    nonRecursive(basicFactorial)(10) === basicFactorial(10); 
    nonRecursive(basicFactorial)(17) === basicFactorial(17);
    // ... etc.
    {% endhighlight %}

In other words, `basicFactorial` is a [fixed point](http://mathworld.wolfram.com/FixedPoint.html) of the function `nonRecursive`. 

This is pointless in this case, since we have defined `basicFactorial` already. But suppose we had not defined `basicFactorial`. Wouldn't it be nice if there was a function that we could pass `nonRecursive` to that would return the fixed point of it, i.e. the `factorial` function?

That is what the Y Combinator does. Pass `nonRecursive` to `Y`, and out comes the factorial function:

    {% highlight javascript %}
    Y(nonRecursive)(100); // 9.33262154439441e+157
    {% endhighlight %}

Note that:
 
    {% highlight javascript %}
    Y(nonRecursive)(100) === nonRecursive(basicFactorial)(100);
    {% endhighlight %}
    
Or in other words:
 
    {% highlight javascript %}
    Y(nonRecursive)(100) === nonRecursive(Y(nonRecursive))(100);
    {% endhighlight %}

So if we have `Y`, we do not need to define `basicFactorial` *at all*, we let `Y` derive it from the non-recursive function `nonRecursive`. Now let's look at it from the other direction, and build up to `Y`. Here again, is the functional `nonRecursive` that we want to calculate the fixed point of:

    {% highlight javascript %}
    function nonRecursive(f) {
      return function(n) {
        return n === 0 ? 1 : n * f(n-1);
      }
    }
    {% endhighlight %}

As noted above, pass `basicFactorial` in, and `nonRecursive` returns  `basicFactorial`. Notice that we have pretty much defined factorial in the body of `nonRecursive`: `return n === 0 ? 1 : n * f(n-1);`--why not use that? So here's our next try: Apply `nonRecursive` to itself. This requires a small change to the body of `nonRecursive`, to self-apply the passed-in function to get the body out and apply it to the inner argument.

    {% highlight javascript %}
    function nonRecursive(f) {
      return function(n) {
        return n === 0 ? 1 : n * f(f)(n-1); 
      };
    }
    nonRecursive(nonRecursive)(5); // => 120
    {% endhighlight %}

Now we want to isolate the fixed point function. Let's wrap that in a function `g`:

    {% highlight javascript %}
    function nonRecursive(f) {
      return function(x) {
        var g = function(q) {
          return function(n) {
            return n === 0 ? 1 : n * q(n-1);
          };
        };
        return g(f(f))(x);
      };
    }
    {% endhighlight %}

Since inner function `g` does not depend on anything in closure, we can pull it out:

    {% highlight javascript %}
    function g(f) {
      return function(n) {
        return n === 0 ? 1 : n * f(n-1);
      };
    }
    {% endhighlight %}

The pulled-out function may look familiar--it's `nonRecursive` again. Here's what's left over after `g` (a.k.a. `nonRecursive`) is pulled out; let's call it `almostY`:

    {% highlight javascript %}
    function almostY(f) {
      return function(x) {
        return g(f(f))(x);
      };
    }
    almostY(almostY)(5); // => 120
    {% endhighlight %}

We've pulled `g` out of `almostY`, but `almostY` still depends on `g`. The final step is to wrap `almostY` in a function that takes the functional `g` as an argument. Then `almostY` will have no dependencies.
 
So, let's wrap it in a function that takes our non-recursive factorial functional and returns the fixed point of it. And since this is the last step, let's call that function `Y`:

    {% highlight javascript %}
    function Y(f) {
      var p = function(h) {
        return function(x) {
          return f(h(h))(x);
        };
      };
      return p(p);
    }
 
    Y(g)(6); // => 720
    {% endhighlight %}

Holy crap! It works! But it's not just for factorial--`Y` will provide a fixed point for any unary function, e.g.

    {% highlight javascript %}
    function nonRecursiveFibonacci(f) {
      return function(n) {
        return n < 2 ? n : f(n-1) + f(n-2); 
      };
    }
    Y(nonRecursiveFibonacci)(10); // => 55
    {% endhighlight %}

As presented, this version of `Y` can only handle unary functions, and it will blow up the stack for relatively low values of `n`. It is straightforward to extend `Y` to handle functions of any arity, and to memoize it. 

### Notes
1. I found these articles helpful: [Fixed-point combinators in JavaScript: Memoizing recursive functions](http://matt.might.net/articles/implementation-of-recursive-fixed-point-y-combinator-in-javascript-for-memoization/) and [Deriving the Y combinator](http://blog.jcoglan.com/2008/01/10/deriving-the-y-combinator/).
