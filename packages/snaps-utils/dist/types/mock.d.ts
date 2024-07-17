export declare const ALL_APIS: string[];
/**
 * Check if a value is a constructor.
 *
 * @param value - The value to check.
 * @returns `true` if the value is a constructor, or `false` otherwise.
 */
export declare const isConstructor: (value: any) => boolean;
/**
 * Generate mock endowments for all the APIs as defined in {@link ALL_APIS}.
 *
 * @returns A map of endowments.
 */
export declare const generateMockEndowments: () => Record<string, any>;
