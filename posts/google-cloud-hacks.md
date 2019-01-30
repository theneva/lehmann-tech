# Google Cloud hacks

## Introduction

I've been working as a developer at Folio since September. We're pretty small, so "developer" means I sometimes hack away on DevOps-y things like build configuration and deployments, and sometimes spend three days straight making a dropdown menu look nice.

We're building a bank account for small businesses that combines banking and accounting. Usually, you collect your expenses from your bank, and feed them into an accounting system. We figure that If you use our card, we already know how much you spent and roughly what you purchased. That lets us export everything to an accounting system automatically, rather than you spending days on not getting it right and spending thousands on an accountant's time in the end. If you've ever filed a travel expense, you know part of the story. We have already released a tool for generating all the documents you need to start a company, and we're currently working on the first version of the bank.

The whole idea behind Folio is to let business owners focus on the work they want to do, rather than being a business manager by day and moonlighting as an accountant-slash-lawyer. We employ the same strategy for building the bank: instead of actually starting a bank and dealing with all the legal stuff, we've partnered with an actual bank that handles actual accounts, money, and transfers. That way, we can focus exclusively on building our product.

Except _of course_ we can't do that. Even though we've removed most of the administrative stuff from our process, we still had to choose a technology stack at one point. That stack is going to have its advantages and drawbacks, and this post will tell you about a few of the drawbacks---and how we've hacked around them.

## Our tech stack

We use Google Cloud for pretty much everything. We build our applications with Cloud Build, run them in Kubernetes Engine, access application logs in Cloud Logging, and monitor applications using Stackdriver.

This all works really well, under one condition: you need to do things like Google intended. We sometimes don't.

We've let the decision to run everything on Google Cloud dictate our backend stuff: we write servers in Go, and communicate behind the firewall over gRPC, rather than something like REST. Using Google's <span title="Software Development Kits">SDKs</span> and libraries to communicate gives us things like request tracing and timings for free, which is really nice.

Our frontend apps are mostly dictated by them running in a browser, and a desire to render things on the server. The actual browser applications are written in React with TypeScript, and the servers are TypeScript using Express on whatever is the latest Node <span title="Long-term support">LTS</span> release. The frontend communicates with the backend using GraphQL.

All this requires a lot of configuration, so we have our first problem. In this post, I'll consider the frontend stuff: we have a bunch of packages using TypeScript and either Node or React. We want to reuse the project configuration without a lot of extra hassle. Enter the monorepo.

I'm not going to complain about TypeScript in this post, but I do believe it to be impossible to use it without both loving and despising it.

## The monorepo

The monorepo is a single Git repository which contains our Dockerfiles, applications, libraries, and configuration. I'll refer to our application code (apps and libraries) as "packages".

We use [oao][oao] (pronounced "wow") to organise our packages. oao is built on top of [Yarn workspaces][yarn-workspaces], which handles the package dependency graph, plus hoisting of third-party dependencies. That means we can express dependencies between our own packages and third-party libraries using `package.json`, and let oao-slash-Yarn deal with the rest.

After a bit of finicky setup, this works great!

… locally, that is. Then we tried to actually use it.

After pushing new code, we want to perform the following tasks:

1. Determine which packages are affected by the new changes (including any packages depending on the changed packages)
2. Lint &amp; typecheck &amp; build &amp; test the affected packages
3. Create Docker images for the affected applications
4. Run any end-to-end tests against the new Docker images
5. (Preferably) perform a build and test of every package in the project, to make sure nothing got broken.
6. If everything went well, upload the Docker images to the container registry
7. Perform a deployment to the testing environment

Let's tackle these in order.

## Determine what was affected

The nature of Cloud Build is that you specify a context directory and a cloudbuild.yaml file which defines the build steps and configuration, and "submit" a build. Submitting the build creates a zip file containing the context directory (excluding files specified in .gitignore and (optionally) .cloudbuildignore), and uploads that directory alone with the configuration specified in the file to Cloud Build, which in turn starts the build on an available agent.

In other words, Cloud Build is not designed to handle a monorepo where you want to run specific commands based on which file paths were changed. For example, a change in an application package should (usually) only lead to a rebuild and new Docker image for that particular package. A change in a common file, such as `yarn.lock`, on the other hand, must always cause everything to be rebuilt.

__TODO: Insert an illustration of a dependency graph between packages?__

This type of build is supported out of the box in some build tools, such as Bamboo, which lets you specify several builds (read: jobs) per repository and determine which one to run based on a regular expression.

[oao]: https://github.com/guigrpa/oao
[yarn-workspaces]: https://yarnpkg.com/lang/en/docs/workspaces/

<!-- new post ideas
- Simen should write something about using TypeScript for type checking and type declaration file generation, and and Babel for actually building the code
-->
