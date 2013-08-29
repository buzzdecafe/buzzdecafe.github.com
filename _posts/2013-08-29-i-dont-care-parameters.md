---
layout: post
title: "&ldquo;I don&rsquo;t care&rdquo; parameters"
description: ""
category: code 
tags: [javascript, erlang]
---
{% include JB/setup %}

I've been studying Erlang lately. It's a lot of fun, and the language has some great features. One aspect of Erlang that appeals to me is pattern matching. You implement a function with different behaviors based on the arguments. For example, the `factorial` function in Erlang can be defined as:
    {% highlight erlang %}
    factorial(1) -> 1;
    factorial(N) ->
       N * factorial(N-1).
    {% endhighlight %}

This makes for tight and elegant code; you don't need to check your arguments and have branching logic. Of course in this case, I would probably add a constraint to the second one, i.e. `factorial(N) when N > 1 -> ...`, since if `N < 1` then we'll have a problem. Constraints are another great, expressive feature of the language. 

Erlang takes pattern matching an extra step, borrowing from its ancestor Prolog: It uses the underscore character `_` (or any parameter name that starts with `_`) as a throw-away parameter. So you can pattern match on a function with a signature like:

    {% highlight erlang %}
    some_func(_, X, _) when X =:= 0 ->
        X + 1;
    some_func(_, _, Y) when Y =:= 0 ->
        Y + 2;
    some_func(_, _, _) ->
        ok.
    {% endhighlight %}

Again, I find this clear and elegant.

At work, I'm on a *very* large project that uses some jQuery, probably more jQuery than most of us would like. It seems like at least once a day, I get burned by writing code like this:

    {% highlight javascript %}
    $.each([10,20,30,40], function(item) {
      console.log(item);
    });
    {% endhighlight %}

See the bug? What do you think this will log to console? The answer is `[0,1,2,3]`. Oops. The bug is that jQuery's `each` function, for some God-forsaken reason, _takes the index of the collection as its first argument_, and the item as its second argument. 

So I've borrowed the "I don't care" parameter idea from Erlang, and now I write `jQuery.each` like so:

    {% highlight javascript %}
    $.each([10,20,30,40], function(_, item) {
      console.log(item); // 10, 20, 30, 40
    });
    {% endhighlight %}

I like the look of this--the underscore character suggests "I could be any value; I don't care" to me. I prefer it to `function(index, item)` where `index` never gets used. It seems like `index` should get used--it has a name!

There are some downsides to this approach: 

* If you lint your code (and you should), JSLint will complain about the underscore character, although you can turn that warning off.  
* Using the underscore for multiple "I don't care" parameters will also fail lint, e.g. `function f(_, _, x)`. You can turn that off too, but probably shouldn't.
* If you are using a library such as Underscore or Lodash, the underscore parameter will mask that variable inside the function in question.
* Some dev in the future may work on the code and decide he wants to use the "I don't care" argument, but not change the parameter name. Well, you'll be long gone by then, right?

So, _caveat emptor_. 

