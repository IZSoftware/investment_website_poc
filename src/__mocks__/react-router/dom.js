// NOT a behavioral mock — tests get the real react-router/dom.
//
// The "react-router/dom" subpath only exists in react-router's "exports"
// map, which jest 27 (react-scripts 5) cannot read. This manual mock
// redirects the specifier at the concrete file the map points to.
// See src/__mocks__/react-router-dom.js for the sibling shim.
module.exports = require("react-router/dist/development/dom-export.js");
