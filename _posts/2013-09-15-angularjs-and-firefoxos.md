---
layout: post
title: "AngularJS and FirefoxOS"
description: ""
category: code
tags: [angular, javascript, mobile]
---
{% include JB/setup %}

I have been happily developing an app for FirefoxOS. I got it into a state of almost working-ish, so on Sunday, I decided it was time to move from testing in the browser to installing it as a "packaged" app; either in the simulator or on the actual phone. 

I read the docs on MDN about how to build the app, and how to install it. I got it installed in the simulator and on the phone. I could load the app, and visit its "About" page, but when I tried to load up the "Board" page, it bombed, with the error:

> The address wan't understood 
>
> Firefox doesn't know how to open this address, because the protocol 
> (unsafe) isn't associated with any program. 

WTF? This had never occurred when testing in the browser. After searching around for a while, I posted in the [mozilla.dev.b2g](https://groups.google.com/forum/#!topic/mozilla.dev.b2g/42sm342mBaU) group, and after a few hours, I got a solution. The problem is that AngularJS sanitizes URLs that it generates dynamically. Angular has a whitelist of protocols that it supports (viz. http, https, ftp, mailto). Any URL with a protocol not in that list gets prefixed with the protocol "unsafe:". FirefoxOS packaged apps use the pseudoprotocol "app:". So if you want to use a URL in your app that relies on AngularJS's data binding in a FirefoxOS packaged app, you must add the "app" protocol to the whitelist.

Fortunately, this is simple to do. When you configure your Angular app, update the regex it uses for its whitelist:

    {% highlight javascript %}
    var app = angular.module( 'myApp', [] ).config(['$compileProvider', function($compileProvider) {
        $compileProvider.urlSanitizationWhitelist(/^\s*(https?|ftp|mailto|app):/);
      }
    ]);
    {% endhighlight %}

Thanks to Julien Wajsberg for pointing me to the solution, and to [this post on stackoverflow](http://stackoverflow.com/questions/15606751/angular-changes-urls-to-unsafe-in-extension-page) for the details.
