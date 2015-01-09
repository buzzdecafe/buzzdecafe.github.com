---
layout: post
title: "Is JavaScript getting worse?"
description: ""
category: code
tags: [javascript]
---
{% include JB/setup %}

> Any headline which ends in a question mark can be answered by the word "no."<br/>
> -- [Betteridge's law of headlines](https://en.wikipedia.org/wiki/Betteridge%27s_law_of_headlines)

There is a lot of anticipation about the next release of JavaScript, 
[ES6](http://tc39wiki.calculist.org/es6/). There are certainly going to be some very nice 
features:

* [Fat arrow (`=>`) syntax](http://tc39wiki.calculist.org/es6/arrow-functions)
* [Spread operator](http://tc39wiki.calculist.org/es6/spread/)
* Best of all, [proper tail calls](http://wiki.ecmascript.org/doku.php?id=harmony:proper_tail_calls)

But JavaScript is not content merely to improve. It has to maintain -- and even increase --
its lead in WTF's per minute.

**Classes.** Whoop-dee-freakin'-doo. Very hard to get excited about quadrupling down on a 
bad bet.

**Default parameters.** By itself, this is another "so what" feature. But default parameters 
have an obnoxious side effect: [They are not reflected in the function's 
`length` property](http://tc39wiki.calculist.org/es6/default-parameter-values/). 
This makes currying tricky indeed. With [Ramda](http://ramdajs.com) you
could hack around this infirmity by specifying arity when currying with `curryN`, but 
geez. C'mon, man.

**`let` considered harmful** 
The
problem with `let` is that it is not "hoisted" to the top of its block, as `var` is with 
its containing function. So if you:
 
      {%highlight javascript%}
      (function() {
         "use strict";
         console.log(x);
         let x = 1;
      }())
      {%endhighlight %}

you will get "ReferenceError: can't access lexical declaration 'x' before initialization."
[_This means that `typeof` can now **throw**_](http://es-discourse.com/t/why-typeof-is-no-longer-safe/15).
It's like the `let` keyword has inadvertently introduced a new kind of nil value to a 
language that already has at least one too many. 

So is Javascript getting worse? Well ... no. But that doesn't mean it's only getting better.
