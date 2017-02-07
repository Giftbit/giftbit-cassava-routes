**Usage**

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

**Permissions**

Keep in mind that you will need sufficient permissions to read `s3:secureConfigBucket/secureConfigAuthBadgeKey`. The role for the lambda should include `s3:GetObject` for the bucket. 


``` yaml
Policies:
  - Version: 2012-10-17
    Statement:
      - Effect: Allow
        Action:
          - s3:GetObject
        Resource:
          - !Sub "arn:aws:s3:::${SecureConfigBucket}/*"
          - !Sub "arn:aws:s3:::${SecureConfigBucket}"
```

You will also need the role to be added to the bucket policy, as the bucket policy most likely is denying access by default. 

Last, the role will need read access to the KMS key that goes with the bucket.

``` yaml
- Effect: Allow
  Action:
    - kms:DescribeKey
    - kms:Decrypt
  Resource: !Ref SecureConfigKMSArn
```
