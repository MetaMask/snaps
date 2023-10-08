/**
 * Creates TextEncoder function hardened by SES.
 *
 * @returns An object with the attenuated `TextEncoder` function.
 */ const createTextEncoder = ()=>{
    return {
        TextEncoder: harden(TextEncoder)
    };
};
const endowmentModule = {
    names: [
        'TextEncoder'
    ],
    factory: createTextEncoder
};
export default endowmentModule;

//# sourceMappingURL=textEncoder.js.map