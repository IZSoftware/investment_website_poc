# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Environment

The API base URL is compiled into the bundle by Create React App, so it is a
**build-time** setting — a Cloud Run environment variable set at deploy time never
reaches the browser.

| Variable | Purpose |
| --- | --- |
| `REACT_APP_API_BASE_URL` | Investors Portal backend origin, no trailing slash. |
| `DISABLE_ESLINT_PLUGIN` | `true` in CI: otherwise CRA turns lint warnings into build failures when `CI=true`. |
| `FAST_REFRESH` | `false`; dev server only. |

- Local development: `.env.development.local` (git-ignored), e.g.
  `REACT_APP_API_BASE_URL=http://localhost:8080`.
- Production builds: committed `.env.production`. The Docker build passes the same
  values as build args; a real environment variable always wins over the file.

## Deployment (Cloud Build -> Cloud Run)

Pushing to `develop` runs the `Investors-Portal-Web-Trigger` Cloud Build trigger,
which uses `cloudbuild.yaml` in this repo to build the image, push it to Artifact
Registry, and deploy Cloud Run service **`investors-portal-web`** in
`europe-west1` (project `izepr-405023`) — the same shape as the backend pipeline.

The image is a two-stage build: `node:20-alpine` runs `npm ci && npm run build`,
then `nginx:1.27-alpine` serves `build/` with an SPA fallback so React Router
routes survive a hard refresh. nginx listens on Cloud Run's `$PORT` (8080).

Overridable substitutions (defaults live in `cloudbuild.yaml`, so a manual
`gcloud builds submit --config cloudbuild.yaml .` behaves the same):
`_REGION`, `_REPO`, `_SERVICE`, `_API_BASE_URL`.

Backend CORS must list the deployed origin (`app.cors.allowed-origins` /
`CORS_ALLOWED_ORIGINS` on the backend service).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
