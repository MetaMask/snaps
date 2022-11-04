/*
 * Generated type guards for "snap-config.ts".
 * WARNING: Do not manually change this file.
 */
import { SnapConfig } from "./snap-config";

export function isSnapConfig(obj: any, _argumentName?: string): obj is SnapConfig {
    return (
        (obj !== null &&
            typeof obj === "object" ||
            typeof obj === "function") &&
        (typeof obj.cliOptions === "undefined" ||
            (obj.cliOptions !== null &&
                typeof obj.cliOptions === "object" ||
                typeof obj.cliOptions === "function") &&
            Object.entries<any>(obj.cliOptions)
                .every(([key, _value]) => (typeof key === "string"))) &&
        (typeof obj.bundlerCustomizer === "undefined" ||
            typeof obj.bundlerCustomizer === "function")
    )
}
