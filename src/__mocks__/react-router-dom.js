// NOT a behavioral mock — tests get the real react-router-dom.
//
// react-router-dom@7 publishes a package.json whose "main" points at
// ./dist/main.js, a file that does not exist; only the "exports" map is
// valid. Jest 27 (react-scripts 5) cannot read "exports", so every bare
// `import ... from 'react-router-dom'` fails to resolve under test. This
// manual mock redirects the bare specifier at the real CJS build, which
// jest's resolver CAN load (it ignores "exports" for subpaths).
module.exports = require("react-router-dom/dist/index.js");
