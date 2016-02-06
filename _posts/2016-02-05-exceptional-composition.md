---
layout: post
title: "Exceptional composition"
description: "Making exceptions play nice in function composition"
category: code
tags: [ramda, javascript, ocaml]
---
{% include JB/setup %}

Lately I've been studying OCaml. It's a very nice language. In grad school I 
worked with Standard ML a bit, but never got a good feel for it. OCaml feels 
very comfortable, although I am still learning to write idiomatically.

OCaml will let you be as pure as you need to be, but will also let you wallow 
in the gutter of mutable variables if you need to. It is less judgmental than
some other languages.

One of these compromises is in how OCaml uses exceptions. That got me thinking 
about handling exceptions in ramda. For example, suppose you have a list of a 
billion integers, and you need to get a product over the whole list:

    {% highlight ocaml %}
    (* product : int list -> int *)
    let rec product = function
      | []    -> 1
      | x::xs -> x * (product xs)
    {% endhighlight %}

This is a bit naive. The biggest problem is what if I encounter a zero? At 
that point I know that the whole product will be zero. I can stop multiplying.
Adding as `if` check doesn't quite solve the problem:

    {% highlight ocaml %}
      | x::xs -> if x = 0 then 0 else x * (product xs)
    {% endhighlight %}

What if 0 is the last integer in the list? I have built up nearly a billion 
recursive calls in my stack that I still have to unwind. This is the kind of 
grimy, real-world consideration that some functional programmers like to sweep
under the rug.

OCaml lets you solve this very nicely using exceptions. In the example above
I could define an exception `Zero` and raise it if I encounter a zero in my list:

    {% highlight ocaml %}
    exception Zero

    (* product : int list -> int *)
    let rec product = function
      | []    -> 1
      | x::xs -> if x = 0 then raise Zero else x * (product xs)
    {% endhighlight %}

Now we have to handle the exception:

    {% highlight ocaml %}
    try product billion_ints with Zero -> 0
    {% endhighlight %}

How nice is that? The exception will short-circuit the evaluation, throw away 
any stack I have built up, and return me an answer. 

Unfortunately, there is nothing in the signature to indicate that this function 
might raise an exception:

    {% highlight ocaml %}
    val product : int list -> int = <fun> 
    {% endhighlight %}

I can get a "safe" function by wrapping up `product` inside a function that will 
trap the raised exception:

    {% highlight ocaml %}
    let safe_product ints = try product ints with Zero -> 0 
    {% endhighlight %}

-----------

I thought this was really nice syntax, and got me thinking that we could use a 
function in ramda that would wrap exceptions and let the composition keep 
rolling along. One approach to doing that is to use a data type like `Maybe` or 
`Either` to wrap up the value. That is fine for some cases, but it means you will be 
`map`-ping the rest of the way down your composition. That may be overdoing it 
sometimes.

So I added a simple function `tryCatch`:

    {% highlight ocaml %}
    tryCatch : (a -> b) -> ((e, a) -> b) -> a -> b
    {% endhighlight %}

`tryCatch` evaluates the first function (i.e. `a -> b`). If it does not throw, it 
returns `b`. If it *does* throw, then the second function catches the exception.
It is evaluated with the thrown `Error` and the original arguments, and must return
something of type `b`. _Et voila!_ You can compose with exceptions.

The usual JavaScript caveats apply; The second function *must* return the same type 
as the first function. It is up to the user to enforce this, since JavaScript 
will offer no help in this regard. And, fo course, the syntax is nowhere near as nice 
as OCaml's. And it's unlikely there is any performance benefit to this approach
in JavaScript, but there definitely is an advantage in OCaml. 

On the other hand, exceptions are a fact of life in JavaScript. So it feels right
that ramda should provide some way to deal with them.

`tryCatch` will be introduced in ramda 0.20.

