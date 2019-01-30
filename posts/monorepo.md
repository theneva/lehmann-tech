# Monorepo

A monorepo is a single repository (Git or otherwise) that contains all your code for applications, libraries, and configuration. Application code (apps and libraries written by you) are commonly referred to as "packages". The primary goals of a monorepo are to express dependencies between packages, and minimise duplicated configuration.

An app is anything that performs a task, and can be deployed and run: a server, a scheduled job, a web application, or a mobile app.

A library is any reusable component that is used by the applications. Writing a library has many advantages: reuse keeps code duplication to a minimum which keeps the code base maintainable, and keeping utility code in a library keeps the app code base small. Common libraries to implement include utilities for logging, exposing metrics, and utility functions for doing math and formatting.

Each package typically requires some sort of configuration: for example, you might need to compile your code, run style checks (a.k.a. linting), and configure test runs. With a monorepo, this may be defined in one place. If every package were a single 

## Dependencies

A package can depend on another package: typically, an application depends on one or more libraries. Libraries may also depend on other libraries: a logging library might need formatting utilities.

[oao][oao] (pronounced "wow") is a nice tool to organise packages and run commands across all packages in a JavaScript project. oao is built on top of [Yarn workspaces][yarn-workspaces], which handles everything related to dependencies, plus things like hoisting of third-party dependencies. That means we can express dependencies between our own packages and third-party libraries using `package.json`, and let oao deal with the rest.

Setting everything up and defining clear boundaries for what should be libraries and what should just be inlined in an application can be difficult: the [rule of three][rule-of-three] states that duplicating something once is fine, but twice means it's a utility.

After a setup, this works great!

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

[oao]: https://github.com/guigrpa/oao
[yarn-workspaces]: https://yarnpkg.com/lang/en/docs/workspaces
[rule-of-three]: https://en.wikipedia.org/wiki/Rule_of_three_(computer_programming)
