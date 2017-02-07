The location of the secureConfig bucket should be passed in in an environment variable, say `SECURE_CONFIG_BUCKET` and `SECURE_CONFIG_AUTH_BADGE_KEY`. 

`secureConfig.fetchFromS3()` should be called in the script setup, outside of the handler: 

``` typescript
    const secureConfigBucket = process.env["SECURE_CONFIG_BUCKET"] || console.error("Env SECURE_CONFIG_BUCKET is required to run this lambda");
    const secureConfigAuthBadgeKey = process.env["SECURE_CONFIG_AUTH_BADGE_KEY"] ||  console.error("Env SECURE_CONFIG_AUTH_BADGE_KEY is required to run this lambda");
  
    const authBadgeKeyPromise = secureConfig.fetchFromS3<AuthenticationBadgeKey>(secureConfigBucket, secureConfigAuthBadgeKey);
   ```
   
This way, credentials are only fetched on a cold start. 

Credentials can then be passed into the JwtAuthorizationRoute.
``` typescript
router.addCustomRoute(new JwtAuthorizationRoute(authBadgeKeyPromise, {algorithms: ["HS256"]}));
```