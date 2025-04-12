/**
 * A custom transformer for SVG files in Jest tests.
 */
module.exports = {
  /**
   * Process an SVG file for Jest tests.
   *
   * @param {string} sourceText - The content of the SVG file.
   * @returns {object} The transformed code.
   */
  process(sourceText) {
    return {
      code: `module.exports = ${JSON.stringify(sourceText)};`,
    };
  },

  /**
   * Generate a cache key for the transformation.
   *
   * @param {string} sourceText - The content of the SVG file.
   * @returns {string} A cache key for Jest to use for caching purposes.
   */
  getCacheKey(sourceText) {
    return sourceText;
  },
};
