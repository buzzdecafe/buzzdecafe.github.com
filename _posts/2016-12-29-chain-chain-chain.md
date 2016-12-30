---
layout: post
title: "Chain, chain, chain"
description: ""
category: 
tags: [javascript, functional, ramda]
---
{% include JB/setup %}


Consider this problem, from a [question on stack overflow](http://stackoverflow.com/questions/40026018/using-ramda-and-pointfree-style-how-can-i-copy-the-first-item-of-an-array-to-t/40028255#40028255). 
Given a list `x::xs`, how can one write a function `f` that will output `x::xs::x`? In other 
words, write a function that takes the head of the list and appends it to the end of the 
list?

The description above almost writes the function for us. Here are the component parts:

* _Take the head of the list_: We have a function for that: `head`. Note the type of `head`:


    `head :: [x] -> x`

  That signature simply says that when you give `head` a list, it will return 
  the first element of that list.
* _Append it to the end of the list_: We have a function for that as well: `append`. The type 
  of `append` is: 
  
    `append :: x -> [x] -> [x]`

  When you give `append` an element and a list, it gives you 
  back a new list with the element at the end.

What will our function `f` look like?

* It will be of the type `[x] -> [x]`
* It will be composed of the parts above, viz. `head :: [x] -> x` and 
  `append :: x -> [x] -> [x]`.
* Somehow we have to get the output of `head` fed into `append` to get us a new 
  function `[x] -> [x]`.

Before I pull a rabbit out of this hat, a few words about 
[`chain`](http://ramdajs.com/docs/#chain): 

    `chain :: Chain m => (a -> m b) -> m a -> m b`

Let's break this signature down into bite-sized pieces and digest them one-by-one.

* `Chain m`: There is some _thing_ `m` that is a `Chain`. 
* `=>`: This tells us that whenever we see an `m` in the rest of the singature, 
  we know it is a `Chain`-_thing_.
* `(a -> m b)`: The first argument to `chain` is a function from some type `a`
  to a `Chain-`_thing_ that "contains" a value of type `b`.
* `m a`: The second argument to `chain` is a `Chain`-_thing_ wrapping a value of type `a`.
* `m b`: This is our return type. `chain` will return a `Chain`-_thing_ wrapping a value `b`.

Here is an example of `chain`. It is often called `flatMap`:

    {% highlight javascript %}
    const dup = x => [x, x];
    chain(dup, [1, 2, 3]); //=> [1, 1, 2, 2, 3, 3]
    {% endhighlight %}

In this example, 
* `(a -> m b)` is the function `dup`, `a` is `Number`, and the `Chain`-_thing_ `m b` is 
  an Array of Numbers.
* The `Chain`-_thing_ `m a` is an Array of Numbers. 
* The returned value `m b` is the same type as `m a`: A `Chain`-_thing_ of an Array of Numbers.
* Note that in this example, both type variables `a` and `b` refer to the same type: 
  an Array of Numbers. Likewise, `m a` and `m b` both refer to a `Chain`-_thing_ of an
  Array of Numbers. This need not always be the case, but it is also not a problem when it 
  is the case.

It should be pretty clear how `chain` works in the context of Array of _Something_. In this case, though, 
we want to output a Function `f`. Is Function a `Chain`-_thing_?

Recall the signature:

    {% highlight javascript %}
    chain :: Chain m => (a -> m b) -> m a -> m b
    {% endhighlight %}

Replace `Chain m => m` with `Function x`:

    {% highlight javascript %}
    chain :: (a -> Function x b) -> Function x a -> Function x b
    {% endhighlight %}

You can look at a function from `x` to `a` as a _wrapper_ around its return value `a`. 
It is analogous to an Array wrapping its elements.

Now use `x -> y` as sugar for `Function x y`:

    {% highlight javascript %}
    chain :: (a -> x -> b) -> (x -> a) -> (x -> b)
    {% endhighlight %}

Adding an extra pair parenthesis to make this clearer:

    {% highlight javascript %}
    chain ::      (a -> (x -> b)) -> (x -> a) -> (x -> b)
                         ^^^^^^       ^^^^^^      ^^^^^^
    // analogous to:       m b          m a         m b
    // analogous to:       [b]          [a]         [b]
    {% endhighlight %}
                                           
That looks like it should work! Let's compare this `chain` signature with the components 
we are going to use to build `f`:

* `f :: [x] -> [x]`
* `head :: [x] -> x`
* `append :: x -> [x] -> [x]`

`append` is of type `a -> m b`; `head` is of type `m a`. Recall that what we are trying 
to produce is a function `f` of type `m b`. Now our types line up perfectly:

    {% highlight javascript %}
    const f = chain(append, head); //=> f :: [x] -> [x]`
    f([1, 2, 3]); //=> [1, 2, 3, 1]
    {% endhighlight %}

<img src="/assets/img/rabbit-hat-sherlock.gif" alt="ta-da" style="display:block; margin:auto" />

But wait -- there's more! Does this mean that you can do this with any function
that satisfies those signatures? That's exactly what it means. For example, you could 
`chain` `toLower` and `concat` over a String:

    {% highlight javascript %}
    chain(concat, toLower)("ABCD"); //=> "abcdABCD"
    {% endhighlight %}

... or `chain` `assoc(keyname)` and `keys` over an Object:

    {% highlight javascript %}
    chain(R.assoc('keylist'), keys)({a: 1, b: 2, c: 3}); //=> {a: 1, b: 2, c: 3, keylist: ['a', 'b', 'c']}
    {% endhighlight %}

... and so on. 

You may be surprised to learn that was a demonstration of how `Function` is a Monad. 
Proving that -- by defining `join` and `return` for Function and showing that it satisfies
associativity, left identity, and right identity is left as an exercise for the reader.
