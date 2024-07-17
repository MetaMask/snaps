// src/iframe.ts
async function createWindow(uri, id, sandbox = true) {
  return await new Promise((resolve, reject) => {
    const iframe = document.createElement("iframe");
    iframe.setAttribute("id", id);
    iframe.setAttribute("data-testid", "snaps-iframe");
    if (sandbox) {
      iframe.setAttribute("sandbox", "allow-scripts");
    }
    iframe.setAttribute("src", uri);
    document.body.appendChild(iframe);
    iframe.addEventListener("load", () => {
      if (iframe.contentWindow) {
        resolve(iframe.contentWindow);
      } else {
        reject(
          new Error(
            `iframe.contentWindow not present on load for job "${id}".`
          )
        );
      }
    });
  });
}

export {
  createWindow
};
//# sourceMappingURL=chunk-PJMEJVOB.mjs.map