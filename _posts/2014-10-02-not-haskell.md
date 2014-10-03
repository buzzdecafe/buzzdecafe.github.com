---
layout: post
title: "It turns out that JavaScript is not Haskell"
description: ""
category: code 
tags: [ramda, functional]
---
{% include JB/setup %}


We were pretty excited about one feature of [Ramda](http://ramdajs.com) v0.5.0. I even wrote a 
[blog post](/code/2014/09/14/the-prefix-is-infix) about it. 

The problem we thought we were solving was: How do you curry infix operators in prefix form, when
the operation is not commutative? Haskell solves this problem very elegantly.  For example, 
exponentiation. Haskell uses the caret symbol (`^`) for this operation. You can use it infix
as you'd expect:

    {%highlight haskell%}
    λ 2^10
        1024
        :: Num a => a
    {%endhighlight%}

Converting to prefix and currying is beatiful. If you want a function to calculate e.g. `2^n`:

    {%highlight haskell%}
    λ (2^) 
        :: (Integral b, Num a) => b -> a
    λ (2^) 10
        1024
        :: Num a => a
    {%endhighlight%}

And if you want a function for `n^2`:

    {%highlight haskell%}
    λ (^2) 
        :: Num a => a -> a
    λ (^2) 10
        100
        :: Num a => a
    {%endhighlight%}

That's what we wanted; that's what we made ourselves believe we were getting. But it turns 
out--SPOILER ALERT--Javascript is *not* Haskell. What we got instead was confusing and inconsistent.
David Chambers, a regular, and very valuable Ramda contributor, observed:

> This is very surprising:
>
> `R.divide(10, 2) //=> 5`
>
> `R.divide(10)(2) //=> 0.2`

Uh-oh. Then J. A. Forbes pointed out:

> Why is it that flipping twice removes the inconsistency?
>
> `R.divide = R.compose(R.flip,R.flip)(R.divide)`
>
> `R.divide(10,2) //=> 5` 
>
> `R.divide(10)(2) //=> 5`

This cat sums up the process pretty well. Started with so much optimism ...

![Wow, it is so much better on this side of the fence](/assets/img/cat-stuck.png)

Clearly, our shiny, new implementation of `op`--a way to curry operators in a left-section/right-section
fashion--was not only confusing, but inconsistent. It was holed below the waterline and sinking fast.

So, my apologies. I really thought we had something cool there. But it wound up being a dud.

We have learned from it, however. In the master branch of Ramda now, I have [re-implemented 
`op`](https://github.com/CrossEye/ramda/commit/a234239e08fd4b5e4a8f07a459a4dc2586c45925)
with consistent behavior and semantics, essentially using a "placeholder" approach, e.g:

    {%highlight javascript%}
    R.divide = R.op(function(a, b) { return a / b; });
    
    var half = R.divide(__, 2); // `__` here is some undefined value
    half(100) //=> 50
    
    var reciprocal = divide(1);
    reciprocal(4) //=> 0.25
    {%endhighlight%}

But we may not stop there. This has us thinking we can have a generalized placeholder
approach to currying. Early experiments are promising. I'll try to keep you posted.


