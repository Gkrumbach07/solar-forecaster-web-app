This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `yarn start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

### `yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## Deploy on OpenShift
To deploy this web app on OpenShift, we can you a wource to image technique to easily build the service. Open a CLI terminal and tun this command with the [backend](https://github.com/Gkrumbach07/openshift-flask-api) url as the env variable.
`oc new-app nodeshift/ubi8-s2i-web-app:latest~https://github.com/Gkrumbach07/solar-forecaster-web-app.git -e REACT_APP_BACKEND_URL=temp`
Then expose the app using `oc expose`.

