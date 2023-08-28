# Execution Environment

The MetaMask Snaps platform has several execution **environments**, not to be
confused with execution **services**. The execution environment is responsible
for executing the snap code, and for communicating with the [Execution Service].

Each execution environment consists of an **executor**, which is a JavaScript
bundle that is built with LavaMoat and run LavaMoat at runtime for runtime
protections. They are designed to run in a specific environment and to be paired
with a specific [Execution Service].

Currently, the following execution environments are supported:

- Iframe (Manifest V2), which creates an iframe in the extension background DOM.
- Node.js process, which spawns a new process for each snap execution.
- Node.js worker threads, which creates a new worker thread for each snap
  execution.
- Offscreen (Manifest V3), which uses the [Offscreen Document API] to create a
  proxy to the iframe execution environment.
- WebWorker (Manifest V2), which creates a web worker for each snap execution.

## Proxy execution environments

The web worker and offscreen execution environments use proxy execution
environments. This means that the execution environment is actually a proxy to
another execution environment. This is done because the corresponding
[Execution Service]s of these execution environments are not able to communicate
directly with the execution environment. Instead, they communicate with the
proxy execution environment, which then forwards the messages to the actual
execution environment.

[execution service]: ./execution-service.md
[offscreen document api]: https://developer.chrome.com/docs/extensions/reference/offscreen/
