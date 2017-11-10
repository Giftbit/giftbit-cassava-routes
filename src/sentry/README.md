# Sentry Wrapper
The sentry wrapper configures cassava's errorHandler to send errors to Sentry. 
The secure config bucket and key for the Sentry object in S3 must be passed into the `sentryLambdaWrapper`.

## Example Sentry object in S3
```
{
 	"apiKey":"https://fb28f9a*********fd3b397c@sentry.io/239845"
}
```

## Usage
The following snippet can be used for initializing sentry. 
```
export const handler = sentryLambdaWrapper(
     process.env["SECURE_CONFIG_BUCKET"],        // the S3 bucket with the Sentry API key
     process.env["SECURE_CONFIG_KEY_SENTRY"],   // the S3 object key for the Sentry API key
     router,
     router.getLambdaHandler()              // the cassava handler
 );
```
 
## Usage with Metrics Datadog Wrapper
If your project is making use of the wrapLambdaHandler from Metrics the following snippet can be used. 
```
export const handler = sentryLambdaWrapper(
    process.env["SECURE_CONFIG_BUCKET"],        // the S3 bucket with the Sentry API key
    process.env["SECURE_CONFIG_KEY_SENTRY"],   // the S3 object key for the Sentry API key
    router,
    metrics.wrapLambdaHandler(
        process.env["SECURE_CONFIG_BUCKET"],        // the S3 bucket with the DataDog API key
        process.env["SECURE_CONFIG_KEY_DATADOG"],   // the S3 object key for the DataDog API key
        router.getLambdaHandler()                   // the cassava handler
);
 ```