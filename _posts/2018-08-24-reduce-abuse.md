---
layout: post
title: "Reduce abuse"
description: ""
category: 
tags: []
---
{% include JB/setup %}

It all started, as so many things do these days, with a tweet.

<blockquote class="twitter-tweet" data-lang="en"><p lang="en" dir="ltr">I am beginning to think `reduce` is a code smell</p>&mdash; Buzz de Cafe (@buzzdecafe) <a href="https://twitter.com/buzzdecafe/status/1030520341561597953?ref_src=twsrc%5Etfw">August 17, 2018</a></blockquote>
<script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

And as with so many tweets, this one lacks nuance. So let me clarify.

## Recognize `reduce` abuse

As Scott Sauyet [pointed out](https://twitter.com/scott_sauyet/status/1030554467727564800), `reduce` is fundamental. 
He is correct, of course. There are essentially two types of `reduce` that bother me:

1. Gigantic monoliths 
2. Re-implementing `map`, `filter`, and `flatMap`|`chain`

### Examples

The following examples are pulled form actual production codebases I have been acquanted with over the years. The variable
names have been changed to obscure the origin.

* Reinventing filter
    xs.reduce((acc, x) => {
      if (x.id === id) {
        return acc.concat(x);
      }
      return acc;
    }, []);

Could be:
    xs.filter(x => x.id === id)
    
That isn't just more succinct; it is the right tool for the job.


Enum.find(x, fn {key, _} -> key == :heroku_timeout end)

## Let's talk about monoids

Monoid is an algebraic structure that consists of

* A set of elements
* A binary, closed, associative operator: In other words, there is a function that takes two arguments from the 
  set and returns another element from that set.
* An identity element. This is the "special" element w/r/t the binary operator 




