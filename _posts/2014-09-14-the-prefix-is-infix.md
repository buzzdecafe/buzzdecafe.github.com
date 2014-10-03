---
layout: post
title: "The (pre)fix is in(fix)"
description: ""
category: code
tags: [javascript, ramda, functional]
---
{% include JB/setup %}

For [Ramda](https://github.com/CrossEye/ramda) we've wrapped several JavaScript
infix operators as functions, i.e. in prefix form. You gotta do that if you want to curry 
and compose with those operations. Some of the time, that works out fine. `add`, for example,
converts to prefix form with no confusion:

    {%highlight javascript%}
    R.add(10, 3) // 10 + 3
    var add10 = R.add(10);
    add10(3); // 13, duh
    {%endhighlight%}

`add` converts to infix easily because it is commutative: `a + b == b + a`.
Infix operators that are not commutative convert awkwardly. Consider `divide`:

    {%highlight javascript%}
    R.divide(10, 2) // 10 / 2
    var divide10 = R.divide(10); // uh ... wait a second ...
    divide10(2); // 5 ... something smells funny ...
    {%endhighlight%}

Here the order of arguments matters, and the semantics start to wobble. 
`add(10)` clearly means "If you give me a number, I will add 10 to it." 
`divide(10)` on the other hand, seems to be saying "If you give me a number,
I will divide it by 10." But that is not what it means. What `divide(10)`
means is "if you give me a number, I will *divide that number into 10*."

The partially applied version of `divide` is also probably not very useful. How often do you 
store a number so you can divide it by a bunch of other numbers? I'd guess not 
very frequently. It's typically more useful to curry in the *divisor* of this 
operation, not the *dividend*.

We noticied this peculiar property of the non-commutative operators converted
to prefix functions pretty early on. It always rankled us, but we didn't have a good solution for it. 
To get around it, we defined functions like `divideBy`. `divideBy` was a 
flipped version of `divide`; so when you partially applied `divideBy` 
it would read more like what the behavior is: 

    {%highlight javascript%}
    R.divideBy(2, 10) // 10 / 2
    var divideBy2 = R.divideBy(2);
    divideBy2(10); // 5, duh
    {%endhighlight%}

... but that always felt like a hack. Why should this *one* operation take *two* functions to express?

This behavior was especially obnoxious with curried relational operators, viz.
`<`, `<=`, `>`, `>=`. (Equality operators are commutative, so those were cool.)

For example, consider `<` (less than) converted to the prefix function `lt`:

    {%highlight javascript%}
    R.lt(2, 10) // 2 < 10
    var lt2 = R.lt(2); // oh no
    lt2(10); // true. wtf?
    {%endhighlight%}

We couldn't hack around these by flipping them and giving them separate names, because the flipped
versions have the opposite meaning, e.g. `R.flip(R.lt) == R.gte`. The cure is worse than the disease.

Scott posted this problem as a desparate plea on Stack Exchange, and got a
[spectacular answer and solution](http://stackoverflow.com/a/25720884/1243641). 
Not surprisingly, the insight comes from Haskell. I recommend you read the response by Aadit M. Shah, it's 
well worth a read. Go ahead, I'll wait.

The essence of the solution is to treat infix operators differently. Instead of currying them from left to right,
they are curried in the following manner:

* When given 1 argument, that argument is *applied right*. So `lt(10)` returns a function like `x -> x < 10`
* When given 2 arguments, but the second one is `undefined`, then it is *applied left*, i.e 
`lt(10, undefined) :: x -> 10 < x`.
* When given 2 arguments and both are defined, evaluate the function and return the result. 

This approach threads the needle of converting from infix to prefix while maintaining (improving) readability.
An added bonus: we can get rid of all the flipped/renamed functions, so the API footprint is a little smaller. 
Win-win-win.

This distinction in the way we are treating infix operators is coming up in ramda v0.5.0.
We will also be exposing an `op` function on ramda, so you can make your infix-style functions behave this way,
should you so desire.


