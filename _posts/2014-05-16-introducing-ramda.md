---
layout: post
title: "Introducing Ramda"
description: "A practical functional library for Javascript programmers"
category: code
tags: [functional, javascript]
---
{% include JB/setup %}

For the past year plus, my colleague Scott Sauyet and I have been working in our free time on [Ramda](https://github.com/CrossEye/ramda), 
"a practical functional library for Javascript programmers." When we signed up for Frontend Masters 
"Hardcore Functional Programming with Javascript" workshop, we were surprised to learn that they had selected 
Ramda to illustrate their examples. With that vote of confidence, we figured it is time to announce the arrival of
Ramda.

There are already some excellent libraries with a functional flavor, such as 
[Underscore](https://github.com/jashkenas/underscore) and [Lodash](https://github.com/lodash/lodash). 
Ramda includes all of the favorite list-manipulation functions you expect, e.g. `map`, `filter`, `reduce`, `find`,
etc. But Ramda is significantly different from libraries like Underscore and Lodash. The primary distinguishing features of Ramda are:

*  **Ramda takes the function first, and the data last.** 
    [Brian Lonsdorf explains why this parameter ordering is a big deal](http://www.youtube.com/watch?v=m3svKOdZijA). 
    In a nutshell, the combination of currying and function-first enables the developer to compose functions with very 
    little code (often in a "point-free" fashion), before finally passing in the data. So instead of this:

        {% highlight javascript %}
        // Underscore/Lodash style:
        var validUsersNamedBuzz = function(users) {
          return _.filter(users, function(user) { 
            return user.name === 'Buzz' && _.isEmpty(user.errors); 
          });
        };
        {%endhighlight%}

... you can do this:

        {% highlight javascript %}
        // Ramda style:
        var validUsersNamedBuzz = R.filter(R.where({name: 'Buzz', errors: R.isEmpty}));
        {%endhighlight%}

*  **Ramda methods are automatically curried.** While you can curry (or partially apply) functions in Underscore and Lodash, Ramda does it for you. Virtually all methods of 2 or more arguments are curried by default in Ramda. For example:

        {% highlight javascript %}
        // `prop` takes two arguments. If I just give it one, I get a function back
        var moo = R.prop('moo');
        // when I call that function with one argument, I get the result.
        var value = moo({moo: 'cow'}); // => 'cow'    
        {%endhighlight%}

This auto-currying makes it easy to _compose_ functions to create new functions. Because the API 
is function-first, data-last, you can continue composing and composing until you build up the 
function you need before dropping in the data. (Hugh Jackson published [an excellent article](http://hughfdjackson.com/javascript/why-curry-helps/)
describing the advantages of this style.)

    {% highlight javascript %}
    // take an object with an `amount` property
    // add one to it
    // find its remainder when divided by 7
    var amtAdd1Mod7 = R.compose(R.moduloBy(7), R.add(1), R.prop('amount'));

    // we can use that as is:
    amtAdd1Mod7({amount: 17}); // => 4
    amtAdd1Mod7({amount: 987}); // => 1
    amtAdd1Mod7({amount: 68}); // => 6
    // etc. 
    
    // But we can also use our composed function on a list of objects, e.g. to `map`:
    var amountObjects = [
      {amount: 903}, {amount: 2875654}, {amount: 6}
    ]
    R.map(amtAdd1Mod7, amountObjects); // => [1, 6, 0]

    // of course, `map` is also curried, so you can generate a new function 
    // using `amtAdd1Mod7` that will wait for a list of "amountObjects" to 
    // get passed in:
    var amountsToValue = map(amtAdd1Mod7);
    amountsToValue(amountObjects); // => [1, 6, 0]
    {%endhighlight%}
    
[Ramda is available on npm](https://www.npmjs.org/package/ramda), so please take it for a spin. 
[Look over the annotated source code](https://rawgit.com/CrossEye/ramda/master/docs/ramda.html).  And 
[please let us know](https://github.com/CrossEye/ramda/issues)
what you think, and how the library can be improved.
