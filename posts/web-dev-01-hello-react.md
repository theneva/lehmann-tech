# Hello, React!

This will be the first post in a series about web development with React and Node.

# Introduction

Let's get a few things out of the way first.

## Who am I?

My name is Martin, and I work as a software developer in Norway. I've been a university college lecturer on web development and API design and Android development. I enjoy helping others to make things work.

## What's this series?

This post is the first part in a series on web development and API design, based loosely on a teaching module I put together in 2015 and have revised twice since.

That module is divided with blurred lines into two main parts:

- Web development for the browser, which is based loosely on [the book _Write Modern Web Apps with the MEAN Stack][dickey-mean-stack] by Jeff Dickey (although the technologies have evolved and I have replaced Angular with React)
- Designing predictable and secure internet-facing APIs, which is based loosely on [the book Irresistible APIs by Kirsten Hunter][hunter-irresistible-apis].

## Okay, but why should I read it?

After reading the series, you will have an understanding with key concepts and best practises for building a stable and secure "full-stack" web application comprising a browser client, a web server, and a database.

I will also touch upon how to build a [universal web app][universal-web-app] and a native mobile application with the same technology.

The series is primarily intended for someone learning the ropes of modern web development, but can also act as a refresher or quick-start on each particular topic I will cover.

I assume basic programming skills (i.e., you have written a program before in your life and can read a C-style language like JavaScript), but little to no knowledge of web development. Advanced or JavaScript-specific concepts will be explained as we go.

## Which technologies will we use?

It's easy to talk about the concepts of web development, but hard to get anything done without a concrete technology stack. I've chosen to use:

- Client side
  - React as a view framework
- Server side
  - [Node.js][nodejs] as a server runtime
  - [Express][express] as a server-side web application framework
  - [MongoDB][mongodb] as a database
- Shared
  - [REST][rest] and [GraphQL][graphql] for synchronous communication between client and server
  - [WebSockets][websockets] for real-time communication between client and server
  - [JSON Web Token][jwt] as an authentication token format

  Sound good? I think so. Let's say hello to JavaScript!

# Hello, JavaScript!

I don't know what you've heard about JavaScript, but it's actually good now—and it has been for a few years. It also happens to be the only real choice in the web browser<sup>[footnote](#compile-to-js)</sup>.

Part of what changed was a thorough refurbishing of the language (called [EcmaScript 2015][es2015]) that came hand-in-hand with a flourishing developer community of shared modules and GitHub issues, and a willingness to compile and bundle modern JavaScript into something that can run in a browser.

Here's a tiny taste of what modern JavaScript looks like:

```js
const numbers = [1, 2, 3, 4];

const evenNumbers = numbers.filter(
  n => n % 2 === 0
);

// evenNumbers is [2, 4]
```

Some cool things to notice here:

- `const` doesn't get hoisted to the function scope like `var` does, and doesn't let you reassign the variable name (use `let` if you need to do that)
- Arrow functions are a thing now: `(params) => { … }` (and they don't mess with `this`!)
- The standard library includes quite a few functional-style programming constructs (like `map` and `filter`)

Another part was the development and popular adoptation of [Node.js][nodejs], which lets you run JavaScript on the server side (or on your local machine). Servers and tools can be—and are—written in JavaScript!

Suddenly, JavaScript went from being the annoying language you _had to_ use to make things happen in the browser, to the primary language throughout the entire web stack.

The best things about the current state of JavaScript development:

- It has a gigantic and extremely active [module ecosystem][npm] with over 650,000 published modules
- Almost anything that's industry standard is also open source
- You can use the same language for web, native mobile, desktop, servers, tooling, and interfacing with databases
- Developer tools to debug both browser- and server-side code are built into all major browsers, and some of them are extremely powerful

If you feel like being overwhelmed, you can check out [this list of JavaScript tools][javascript-tools-list] published by Eugeniya Korotya in June 2017.

Well-known [members of the Node.js Foundation][nodejs-foundation-members] include Google, IBM, Intel, Microsoft, and PayPal.

## Node.js: JavaScript on the server

[Node.js][nodejs] is a JavaScript runtime built on top of [Google's V8 JavaScript engine][v8]. It's the de facto standard for running JavaScript outside the browser, and is under very active development. It's also extremely fast.

For example, here's a program for printing out the content of a file:

```js
// poem-reader.js
const fs = require('fs');

const poem = fs.readFileSync('./poem.txt', 'utf8');

console.log(poem);
```

… and here's how to run that program (assuming you have installed Node.js):

```sh-session
$ node poem-reader.js
Hello, world!
Isn't it great?
```

Node.js lets you write terse applications in a language that is familiar to anyone who has done any web development and execute them with [performance similar to that of popular compiled languages like Java][citation-needed].

## React

React is a view framework for the browser.

## Footnotes

<p id="compile-to-js">Footnote</p>


[dickey-mean-stack]: http://www.peachpit.com/store/write-modern-web-apps-with-the-mean-stack-mongo-express-9780133962352
[hunter-irresistible-apis]: https://www.manning.com/books/irresistible-apis
[nodejs]: https://nodejs.org/en/
[express]: https://expressjs.com/
[universal-web-app]: http://www.acuriousanimal.com/2016/08/10/universal-applications.html
[mongodb]: https://www.google.no/search?q=mongodb&oq=mongodb&aqs=chrome..69i57j69i60l5.1632j0j1&sourceid=chrome&ie=UTF-8
[jwt]: https://jwt.io/
[rest]: https://en.wikipedia.org/wiki/Representational_state_transfer
[graphql]: https://graphql.org/learn/
[websockets]: https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API
[es2015]: https://developers.google.com/web/shows/ttt/series-2/es2015
[npm]: https://www.npmjs.com/
[javascript-tools-list]: ate-list-of-javascript-tools-e0a5351b98e3
[nodejs-foundation-members]: https://foundation.nodejs.org/about/members
[v8]: https://en.wikipedia.org/wiki/Chrome_V8
