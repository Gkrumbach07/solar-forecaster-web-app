# Solar Forecasting Web Application
This React web app is meant to be used in conjuction with a backend service located [here](https://github.com/Gkrumbach07/openshift-flask-api)

## Deploy on OpenShift
First we need to find the backend url after we have successfully deployed the backend. To do this we can set a variable using the command bellow.
```
BACKEND_URL=http://$(oc get route/backend -o jsonpath='{.spec.host}')
```

To deploy the front end on OpenShift, we can use the source to image technique to easily build the service. Open a CLI terminal and run this command with the [backend](https://github.com/Gkrumbach07/openshift-flask-api) url as the env variable. If you set the `BACKEND_URL` variable in the previous step, then you can subsitute `$BACKEND_URL` for the literal url.
```
oc new-app nodeshift/ubi8-s2i-web-app:latest~https://github.com/Gkrumbach07/solar-forecaster-web-app.git \
	--build-env REACT_APP_BACKEND_URL=$BACKEND_URL \
	--name=client
oc expose svc/client
```
