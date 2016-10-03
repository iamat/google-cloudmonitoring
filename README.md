# Google Cloud Monitoring Wrapper

A simple node.js wrapper arround the [Google Cloud Monitoring API](https://cloud.google.com/monitoring/api/v3/)

## Installation

```bash
npm install google-cloudmonitoring
```

## Usage

1. Enable *Google Cloud Monitoring API* in your Google Developer Console.
2. Create a new Client ID for a Service Account (JSON Key) and download it.
3. Create a [Custom Metric](https://cloud.google.com/monitoring/custom-metrics/)
4. Include it into you app!

## Example

```javascript
const GLM = require("google-cloudmonitoring");

const resource = { 'type': 'gce_instance',
                   'labels': { 'instance_id': 'your-instance-id',
                               'zone': 'us-central1-a' }};

const glm = new GLM({ project: "your-project-id",
                      authJSON: require("./your-JSON-key.json"),
                      resource });

const value = 42;

glm.on("error", function (err) {
  console.log("Something bad happened:", err.message);
})

glm.setValue("/your/metric/name", value, { "/your/label": "glm" });

```
