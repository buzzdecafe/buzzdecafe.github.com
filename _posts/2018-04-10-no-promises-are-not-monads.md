---
layout: post
title: "No, Promise is not a monad"
description: ""
category: 
tags: []
---
{% include JB/setup %}

> If you want to see how sloppy your thinking is, try writing. If you want to see how sloppy your writing is, 
> try writing math.  
> -- _Someone said this_

"Monad" is a well-defined mathematical object that must satisfy axioms known as [the monad laws][1]: Left Identity, 
Right Identity, and Associativity. One way to implement a monad is to define the functions `return` and `bind` such
that they obey the monad laws. (And once you have that, you can derive other functions, as well.)

`return :: a -> m a` is the "unit" operation for the monad `m`. Essentially, `return` takes any value and puts it 
into the monadic context. The candidate for an analogous function on the `Promise` API is `resolve`. However, 
because of the OO nature of JavaScript we can't use `Promise.resolve` as a pure function. 
I cannot simply write `.then(Promise.resolve)` -- that gives me this delightful error: "Receiver of Promise.resolve
call is not a non-null object". So to be fair, we can use the lambda `x => Promise.resolve(x)` as our `return`.

`bind :: m a -> (a -> m b) -> m b` enables you to compose, flattening as you go. The analogous `Promise` function for 
`bind` is `then`.

Note that in the examples below, the `≡` symbol in an expression like `a ≡ b` indicates that you can confidently
replace one side of `≡` with the other side, and your program will behave the same way. 

The question is: Does `Promise` satisfy the monad laws?


## Left Identity

    Promise.resolve(a).then(f) ≡ f(a)

Left Identity appears to hold as long as the function `f` that takes an `a` and returns a `Promise` (i.e. `a -> Promise b`). 
But not quite. What if the type `a` is itself a `Promise`? Suppose `f` is 

    const f = p => p.then(n => n * 2)
    
In this example `f` is a function from `Promise Number -> Promise Number`. Let's plug in a `Promise Number` for `a` to match up
with the expected input for `f`. When we can evaluate the expression:

    const a = Promise.resolve(1)
    const output = Promise.resolve(a).then(f)    
    // output :: RejectedPromise TypeError: p.then is not a function

The value that gets passed to `f` is implicitly unwrapped. It is a `TypeError` to pass a function to `then` that takes a `Promise` 
for an argument. Note that we can evaluate the right-hand side of the equivalence to get a different result: 

    const output = f(a)  
    // output :: ResolvedPromise 2

Therefore, Left Identity does not hold for *every* function of the form `a -> Promise b`: It only holds if `a` is 
not itself a `Promise`.


## Right Identity

    p.then(x => Promise.resolve(x)) ≡ p

This holds (where `p` is some `Promise`). 


## Associativity

    p.then(f).then(g) ≡ p.then(x => f(x).then(g))

As with Left Identity above, Associativity is only satisifed if `f` and `g` play nice. If `f` or `g` take a `Promise`
argument, then, for the same reason as shown above, this law will not hold. 


## Conclusion

Failing to satisfy one law would have been sufficient to disqualify `Promise` from being a monad. The examples 
above show that `Promise` satisfies only one out of three: Right Identity.

## Is this a problem?

Laws matter. They can give you confidence about the properties of the code you write, and how you can rewrite it.
They permit you to port concepts across languages -- to the extent the language can support them. 
On the other hand, if you are using JavaScript, then lawfulness may not be a priority.


[1]: https://wiki.haskell.org/Monad_laws
