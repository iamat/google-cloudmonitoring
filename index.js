/**
 * Simple API version selector
 */

module.exports = (version) => {
  return require(`./${version}`);
};
