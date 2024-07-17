// src/jsx/jsx-runtime.ts
function jsx(component, props, key) {
  if (typeof component === "string") {
    throw new Error(
      `An HTML element ("${String(
        component
      )}") was used in a Snap component, which is not supported by Snaps UI. Please use one of the supported Snap components.`
    );
  }
  if (!component) {
    throw new Error(
      "A JSX fragment was used in a Snap component, which is not supported by Snaps UI. Please use one of the supported Snap components."
    );
  }
  return component({ ...props, key });
}
function jsxs(component, props, key) {
  return jsx(component, props, key);
}
export {
  jsx,
  jsxs
};
//# sourceMappingURL=jsx-runtime.mjs.map