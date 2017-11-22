# giftbit-cassava
Private Giftbit routes for use with [Cassava](https://github.com/Giftbit/cassava).

## Publishing a New Release
How to publish a new release in git after your pull request has been approved.
 
Bump the version in package.json. Versioning guidelines:
```
current = vA.B.C

major: breaking change -> vA+1.0.0
minor: new feature -> vA.b+1.0
micro: bug fix -> vA.B.C+1
```

In your project run: `npm build` 
If this fails, due to missing dependencies, since this project relies on peer dependencies you can run `npm i cassava --no-save`.

This will build the `.js` files. You now want to commit and push your changes (ensure newly created `.js` files are added to git).

In github, go to release. Draft a new release. Use the version for both the tag and the title. 
Ensure a good description of the release is added. Publish. 
