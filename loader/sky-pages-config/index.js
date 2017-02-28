/*jshint node: true*/
'use strict';

module.exports = function (source) {
  return `
${source}

SKY_PAGES = ${JSON.stringify(this.options.SKY_PAGES)};
`;
};
