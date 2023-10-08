/**
 * Creates a {@link Date} constructor, with most of the same properties as the global object.
 * The Date.now() function has added noise as to limit its precision and prevent potential timing attacks.
 * The Date constructor uses this now() function to seed itself if no arguments are given to the constructor.
 *
 * @returns A modified {@link Date} constructor with limited precision.
 */
declare function createDate(): {
    Date: DateConstructor;
};
declare const endowmentModule: {
    names: readonly ["Date"];
    factory: typeof createDate;
};
export default endowmentModule;
