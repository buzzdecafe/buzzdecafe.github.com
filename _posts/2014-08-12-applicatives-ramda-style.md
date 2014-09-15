---
layout: post
title: "The Tao of &#955;: Applicatives, Ramda style"
description: ""
category: code
tags: [ramda, functional, javascript]
---
{% include JB/setup %}

I've been working on making [Ramda](https://github.com/CrossEye/ramda) integrate with
[Fantasy-land](https://github.com/fantasyland/fantasy-land)-style objects. Specifically, I added the
functions `ap` and `of` to Ramda. These functions satisfy the `Apply` and `Applicative`
specifications, respectively.

`of` is so trivial it appears almost useless. It simply wraps its argument in an array:

    {% highlight javascript %}
    R.of = function(x) { return [x]; };
    {% endhighlight %}

(The actual implementation of `of` in Ramda checks if you have also passed in a Fantasy-land-style object
with an `of` method, and dispatches to that method--but that is beside the point for this discussion.)

`ap` on the other hand, seems so obscure that at first glance, it's difficult even to see how you
would use it. In Ramda, `ap` takes a list of functions (`fns`), and a list of arguments (`args`) to
apply the list of functions to. It returns an array of results from applying each function to each
argument. The output of `ap` is like a cross-product of the `fns` by the `args`, with a length of
`fns.length * args.length`:

    {% highlight javascript %}
    R.ap([R.multiply(2), R.add(3)], [1,2,3]); // => [2, 4, 6, 4, 5, 6]
    R.ap([R.multiply(2), R.add(3), R.subtractN(2)], [1,2,3]); 
        // => [2, 4, 6, 4, 5, 6, -1, 0, 1]
    {% endhighlight %}

I added these functions to Ramda on faith; that is, even though I did not clearly see real-world use cases
for them, I trusted that these functions are useful. After all, `ap` and `of` can both be found in
Haskell (`of` is called `pure` in Haskell). And those Haskell folks are pretty sharp.

Then Thomas Deutsch left a comment on Scott's blog post
[Favoring Curry](http://fr.umio.us/favoring-curry/#post-1529816132). He was working on a function
`hasAllTags` that takes a list of letters and returns `true` if the passed in list contains all of
the letters in an array inside the function. In his posted example of `hasAllTags`, the internal
list is `['a', 'd']`:

    {% highlight javascript %}
    hasAllTags(['a', 'e', 'd']); // => true
    hasAllTags(['a', 'e']); // => false
    {% endhighlight %}

Mr. Deutsch's question: "How is it possible to construct this function only by composition or
currying?"

Good question! Let's take apart what this function is supposed to do:


1. Take a list of letters
2. For each letter in the internal list (`['a', 'd']`), see if the passed in list contains that letter
3. If all the internal letters are found, return `true`, otherwise `false`

<span></span>

This is very close to `contains`. The difference is that we need to apply `contains` repeatedly, with different
arguments, viz.:

    {% highlight javascript %}
    contains('a', list);
    contains('d', list);
    {% endhighlight %}

And somehow we need to `and` all of those results together to see if the whole expression is `true`.
So we want our composition to:

1. Take a list of letters
2. pass it to `contains` once for each internal letter
3. evaluate all the results of all the calls to `contains`
4. output true or false based on #3
    
<span></span>

Here we have a real use case for `ap`: I can take my input list and apply a list of functions to it!
In this case, I am going to apply a list of `contains` partially applied to each letter in the
internal list. 
I generate that list of functions by mapping over the internal letters and partially applying each one
into `contains`. Ramda's auto-curried functions makes this easy:

    {% highlight javascript %}
    R.map(R.contains, ['a', 'd'])
        //=> returns a list of partially-applied `contains` functions.
    {% endhighlight %}

Then I take the list of functions from that mapping, and pass them to `ap`. Of course, `ap` is
also curried. I am giving just the list of functions to it:

    {% highlight javascript %}
    R.ap(R.map(R.contains, ['a', 'd'])) //=> Function ::[Args] -> [Bools]
    {% endhighlight %}

This is the guts of the composition. 
Given just the list of functions, `ap` returns a function that is waiting for
a list of arguments to apply its list of functions to. And then `ap` will return an array of results
of those applications. In this case, it will be an array of booleans.

The final step in the composition is to reduce that output array of booleans from `ap` to a single boolean. 
Simplest thing to do is to pass the output from `ap` to `all`,
partially applied to the `Identity` function:

    {% highlight javascript %}
    R.compose(R.all(R.I), R.ap(R.map(R.contains, ['a', 'd'])))
    {% endhighlight %}


All that remains to do is to prepare the original list to be input to this composition. 
We can't just pass a list of letters in. Recall that `ap` will apply its array of functions to 
each one of its list of arguments. If we passed in the array `['a', 'b', 'c', 'd']`, `ap` 
would call each function four times! Worse than that, we have partially applied `contains` 
inside `ap`, and those functions are expecting an array, not a string.

In other words, we want to pass the input array *inside* the arguments list to `ap`. 
The solution is to wrap the input in an array. That is exactly what `of` does. So the complete
composition of the `hasAllTags` function is:

    {% highlight javascript %}
    hasAllTags = R.compose(R.all(R.I), R.ap(R.map(R.contains, ['a', 'd'])), R.of);

    hasAllTags(['a', 'e', 'd']) // => true
    hasAllTags(['a', 'e'])      // => false
    {% endhighlight %}

Hey, those Haskell folks *are* pretty sharp! 

You can find `ap` and `of` and many more 
fun functions in [Ramda 0.3.0](https://www.npmjs.org/package/ramda). Please take it for a spin.



