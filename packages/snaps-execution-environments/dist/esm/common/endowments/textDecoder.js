/**
 * Creates TextDecoder function hardened by SES.
 *
 * @returns An object with the attenuated `TextDecoder` function.
 */ const createTextDecoder = ()=>{
    return {
        TextDecoder: harden(TextDecoder)
    };
};
const endowmentModule = {
    names: [
        'TextDecoder'
    ],
    factory: createTextDecoder
};
export default endowmentModule;

//# sourceMappingURL=textDecoder.js.map