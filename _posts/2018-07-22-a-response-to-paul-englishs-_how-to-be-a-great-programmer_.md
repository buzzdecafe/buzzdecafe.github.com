---
layout: post
title: "A response to Paul English's \"How to be a great programmer\""
description: ""
category: 
tags: []
---
{% include JB/setup %}
<style>
ol {
  margin-bottom: 1.5em;
}
</style>

> There are only two things you need to do to become a great, world-class programmer. First, you must maximize 
> customer impact, and second, you must maximize team output.
>
> -- [Paul English, _How to be a great programmer_][english]

Paul English asserts there are merely two ingredients to becoming a "great, world-class programmer". Unfortunately, the article does not
deliver on its title; it is not even *about* programming. The concerns of the article--namely, "maximizing customer impact" 
and "maximize team performance"--are _architectural_ concerns. 

By "architectural" I am not even speaking about *application architecture*. No, I mean *enterprise architecture*, i.e. the discipline that deals with the question "What are the business priorities that drive technical decisions?" This kind of architectural thinking relies on defining one's priorities, and then imposing a 
[strict total order](sto) on them. 

We can tease out some of English's architectural priorities and their order:

> you must make smart trade-offs of working quickly vs. working thoroughly. [...] If you try to be thorough with all 
> tasks ... this will result in your being able to do fewer tasks, of which a certain percent will fail. [...]
> the best engineers try to narrow scope of tasks so they can achieve and test them quickly with customers.

This passage highlights the priorities _speed to market_, _the feedback loop_, and _thoroughness_.
That is also how English orders their importance.

The trade-off here is that we should expect to see more failures. The expectation is that several small 
failures are less harmful than one large failure; and that small failures are more easily mitigated by 
a rapid feedback loop. 

A little later, more priorities are added:

> you must always write clean, understandable code.

These terms are not defined, and for many programmers these terms are fraught. What is "clean"? "Understandable" 
to whom? Making "understandibility" a priority runs the risk of reducing the team's intelligence to the lowest common
denominator. 

>  [Clean, understandable code] gives super powers to other engineers who might have to change your code later.

One could argue that the constraint of "clean, understandable" code is in conflict with the priority of "speed to market". 
But in this case, "speed to market" is the primary goal, and "understandability" is meant to serve that goal.
English prioritizes "understandability" because that enables rapid refactoring, and that helps optimize speed to market.

The dominance of speed to market as an architectural priority is pervasive in the article:

> When we try to accomplish tasks quickly, so that we can test many things with customers, the way to save time is not
> to write crappy code, but instead, to narrow the initial scope of a task.

Of course, one programmer's "crappy code" is another's JavaScript.

The priorities here include _teamwork_, and _understandibility/cleanliness_, which I take to be a synonym for "refacorability".
Teamwork is higher priority than refactorability, although both are secondary to speed to market.

This struck me as an odd assertion: 

> Speed is under-appreciated by most programmers. The best engineers always make sure that their code is fast ..."

I have not found this to be true. I have seen developers of all levels fetishize performance,
trying to squeeze microseconds out of some function without regard for whether such optimization *matters*. 

As a *general* rule, I feel like you should only optimize code for performance when 

  1. you know the code is correct, and 
  2. you can *prove* that the optimization is worth the cost.   
  

Writing performant code is not free, it involves trading off with other priorities. Focusing on performance 
is almost always in conflict with "refactorability". For English, in this case as well, performance is 
necessary for a rapid feedback loop; and the feedback loop helps optimize speed to market:

> The best engineers always make sure that their code is fast, resulting in a customer experience of 
> ask-question-get-answer with as little delays as possible between those two things. 

The overall ordered list of priorities I gather from this article is:

<ol>
  <li>Speed to market</li>
  <li>Feedback loop</li>
  <li>Performance</li>
  <li>Teamwork</li>
  <li>Understandibility/Cleanliness/Refactorability</li>
</ol>
<p>...</p>
<ol start="100">
  <li>Thoroughness</li>
</ol>

I have no argument with these being Paul English's priorities. He certainly knows what works for his business. I do have 
two basic objections to the article:

<ol>
  <li>I object to the clickbait-and-switch title about becoming a great <em>programmer</em> when that is really not what the article is
about <em>at all</em>. Now, one could argue English is <em>really</em> saying that a programmer can increase their value to their employer
by being acutely aware of the architectural constraints of the business and using those to guide technical decisions.
I would not argue with that at all, that is practically a truism. But that is not what the article says.  I would counter that the thesis of the article is explicitly about "greatness", not "value"; and its examples of "greatness" are all bound to particular architectural concerns, especially speed to market, as shown above.</li>
  <li>I object to the assertion that "adhering to my priorities" is a recipe for "greatness" in general.</li>
</ol>

It is not hard to imagine business scenarios where speed to market is not the primary concern, and in fact, could 
be positively harmful. For example, consider developing a life-or-death medical device. Speed to market with a rapid feedback loop is not a 
good fit for such a product: "Well, 60% of the patients died with v1, but we got version 2 out in two weeks and cut the 
mortality rate to 48%!" In such a case, thoroughness, accuracy, correctness would (I hope) be higher priorities
than speed to market. 

The tacit assumption in English's definition is that "greatness" in programming may only occur in a business context. 
A more apt title for the article might be "How to be a great employee for Paul English". It is also not hard to 
imagine a notion of "great programmer" outside of a business context. But that would be a whole other article.


[english]: https://www.linkedin.com/pulse/how-great-programmer-paul-english/
[sto]: https://en.wikipedia.org/wiki/Total_order#Strict_total_order
