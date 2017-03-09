const google = require('googleapis');
const monitoring = google.monitoring('v3');

const EventEmitter = require('events').EventEmitter;
const util = require('util');

var GLM = function (options) {
  options = options || {};

  this.project = options.project;
  this.prefix = options.prefix ||
        `projects/${this.project}/metricDescriptors/custom.googleapis.com/`;
  this._name = `projects/${this.project}`;
  this._resource = options.resource;

  google.auth.getApplicationDefault((err, authClient, projectId) => {
    if (err) {
      throw err;
    }

    if (authClient.createScopedRequired && authClient.createScopedRequired()) {
      authClient = authClient.createScoped([
        'https://www.googleapis.com/auth/monitoring'
      ]);
    }

    this._authClient = authClient;
  });
};

util.inherits(GLM, EventEmitter);

GLM.prototype.setValue = function (name /* instance/iamat/test_v3 */, value, labels) {
  const metric = {
    type: 'custom.googleapis.com/' + name,
    labels };
  const point = { timeSeries: [
    { metric,
      resource: this._resource,
      points: [
        { interval: {
          endTime: (new Date()).toISOString()
        },
          value: {
            int64Value: String(value)
          }
        }]
    }]};

  var params = {
    auth: this._authClient,
    name: this._name,
    resource: point };

  monitoring.projects.timeSeries.create(params, (err) => {
    if (err) {
      err.resource = JSON.stringify(point);
      this.emit('error', err);
    }
  });
};

GLM.prototype.setValues = function (values) {
  const point = {
    timeSeries: values.map(
      (v) => ({
        metric: {
          type: `custom.googleapis.com/${v.name}`,
          labels: v.labels },
        resource: this._resource,
        'points': [{
          interval: {
            'endTime': (new Date()).toISOString()
          },
          value: {
            'int64Value': String(v.value)
          }
        }]
      })
    )
  };

  const params = {
    auth: this._authClient,
    name: this._name,
    resource: point };

  monitoring.projects.timeSeries.create(params, (err) => {
    if (err) {
      err.values = values;
      this.emit('error', err);
    }
  });
};

GLM.prototype.createMetric = function (name, metricDescriptor, callback) {
  const params = {
    auth: this._authClient,
    name,
    resource: metricDescriptor
  };

  monitoring.projects.metricDescriptors.create(params, callback);
};

module.exports = GLM;
