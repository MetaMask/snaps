/* eslint-disable no-console, import/unambiguous */

// Upon running this file, this `console.log` shows up as expected. However, the
// second one does not. It seems that hardening `console._stdout` breaks it.
console.log(1);

// `harden(console)` does not harden non-enumerable properties. Potentially a
// separate issue. In the endowment we were extracting all properties from
// `console`, including `_stdout`, and trying to harden that. It seems to fail
// with a couple of Node.js-specific properties, such as `_stdout` and
// `_stderr`. This is a minimal reproduction of the issue.
// @ts-expect-error - `_stdout` is Node-specific.
harden(console._stdout);

// This `console.log` does not show up. There appears to be an SES error in the
// console, but since the error properties are non-enumerable, it does not show
// the message or stack. I'm not sure how to get the error message out of SES.
console.log(2);
