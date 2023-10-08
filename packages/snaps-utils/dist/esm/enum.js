import { literal } from './structs';
/**
 * Superstruct struct for validating an enum value. This allows using both the
 * enum string values and the enum itself as values.
 *
 * @param constant - The enum to validate against.
 * @returns The superstruct struct.
 */ export function enumValue(constant) {
    return literal(constant);
}

//# sourceMappingURL=enum.js.map