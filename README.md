# Docker Secrets

A simple module to read [docker secrets](https://docs.docker.com/engine/swarm/secrets/) created in a Swarm cluster

# Usage

### Read All

Given the below secrets - 

`dbuser` // readonly   
`dupass` // super-secret-pass

```javascript
const secrets = require('secrets-docker');

secrets.readAll().then((data) => {
  console.log(data.dbuser) // readonly
  console.log(data.dbpass) // super-secret-pass
})
```


### Read a single secret

Docker secrets are available to a container as files under /run/secrets. Since they are files, you can create a secret whose value is a property file like below.   

`test-secret`

```
dbuser=readonly
dbpass=super-secret-pass
apikey=super-secret-apiKey
```

So if an application needs multiple users/pass or apikeys, you can simply provide all of them in a single file instead of starting the container with mulitple docker secrets.   

And read the secret file as below

```javascript
const secrets = require('secrets-docker');

secrets.read('test-secret').then((data) => {
  console.log(data.dbuser) // readonly
  console.log(data.apikey) // super-secret-apiKey
})
```

Note that Docker allows a secret to be upto 500 kb in size.

### Specify a fallback path

In situations where the /run/secrets directory is not available, you can configure docker-secrets to
use a fallback path with the init method

```javascript
const secrets = require('secrets-docker');
secrets.init({ fallbackPath: './foo/bar/baz' });
```
