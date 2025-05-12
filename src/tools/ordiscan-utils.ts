import { z } from "zod";

/**
 * Creates a schema that accepts both string and number inputs for numeric parameters.
 * Converts string inputs to numbers and validates them.
 */
export const flexibleNumber = () => z.union([z.string(), z.number()]).optional().transform(val => {
  if (typeof val === 'string') {
    const num = parseInt(val, 10);
    return isNaN(num) ? undefined : num;
  }
  return val;
});

/**
 * Creates a schema that accepts string inputs and validates them against an enum of values.
 */
export const flexibleEnum = <T extends readonly string[]>(values: T) => 
  z.string().optional().refine(val => !val || values.includes(val as T[number]), {
    message: `Value must be one of: ${values.join(', ')}`
  }); 