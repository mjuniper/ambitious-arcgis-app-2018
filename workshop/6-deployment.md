# Deployment

Great - now we have a working app! Let's get it off our local machine and out into the world. There are many ways to deploy an app; today we are going to cover two of them.

## surge

http://surge.sh/

https://github.com/kiwiupover/ember-cli-surge

- stop app (`cmd+C`)
- `ember install ember-cli-surge`
- `ember g surge-domain ambitious-arcgis-app-<something-unique>.surge.sh`
- `ember surge --environment=development` (create an account if you haven't already)
- visit ambitious-arcgis-app-&lt;something-unique&gt;.surge.sh

## ember-cli-deploy & s3 (demo)

http://ember-cli-deploy.com/

https://github.com/Gaurav0/ember-cli-deploy-s3-pack

- `ember install ember-cli-deploy`
- `ember install ember-cli-deploy-s3-pack`
- [I already have an s3 account, have created my buckets, have created the .env file, & .gitignored it!]
- config/deploy.js ==>

```js
/* jshint node: true */

module.exports = function(deployTarget) {
  var ENV = {
    's3': {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      bucket: 'ambitious-arcgis-app',
      region: 'us-east-1'
    },
    's3-index': {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      bucket: 'ambitious-arcgis-app-index',
      region: 'us-east-1'
    }
  };

  return ENV;
};
```

- open ember-cli-build.js and add:
 - `var env = EmberApp.env() || 'development';` below `var EmberApp...`
 - the following above the `amd` section:

```js
  fingerprint: {
    enabled: env === 'production',
    prepend: 'http://ambitious-arcgis-app.s3-website-us-east-1.amazonaws.com/'
  },
```

- `ember deploy production --activate`
- visit http://ambitious-arcgis-app-index.s3-website-us-east-1.amazonaws.com/
