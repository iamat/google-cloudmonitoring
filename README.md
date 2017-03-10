# Google Cloud Monitoring Wrapper

A simple node.js wrapper arround the [Google Cloud Monitoring API](https://cloud.google.com/monitoring/api/v3/)

## Installation

```bash
npm install google-cloudmonitoring
```

## Usage

1. Enable *Google Cloud Monitoring API* in your Google Developer Console.
2. The library will autodetect an existing [GCloud](https://cloud.google.com/sdk/downloads)
   installation or tries to pull the service account from the
   [GCE instance metadata](https://cloud.google.com/compute/docs/storing-retrieving-metadata).
3. Include it into your app!

## Example

```javascript
const GLM = require('google-cloudmonitoring')('v3');

const resource = { 'type': 'gce_instance',
                   'labels': { 'instance_id': 'your-instance-id',
                               'zone': 'us-central1-a' }};

const glm = new GLM({ resource });

const value = 42;

glm.on('error', function (err) {
  console.log('Something bad happened:', err.message);
})

glm.setValue('/your/metric/name', value, { '/your/label': 'glm' });

```
