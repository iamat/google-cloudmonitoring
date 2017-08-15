const metadata = require('google-compute-metadata');
const google = require('googleapis');
const monitoring = google.monitoring('v3');

const EventEmitter = require('events').EventEmitter;
const util = require('util');

var GLM = function (options) {
  options = options || {};

  this.project = options.project;
  this._resource = options.resource;
  this._initalized = false;

  metadata.instance((err, data) => {
    if (err && !this._resource) {
      // only raise error if user didn't provide resource data
      this.emit('error', err);
      return;
    }

    if (!this._resource) {
      const zoneSplit = data.zone.split('/');
      const zone = zoneSplit[zoneSplit.length - 1];
      this._resource = {
        type: 'gce_instance',
        labels: {
          project_id: this.project,
          instance_id: data.id,
          zone
        }
      };
    }
  });

  google.auth.getApplicationDefault((err, authClient, projectId) => {
    if (err) {
      this.emit('error', err);
      return;
    }

    if (authClient.createScopedRequired && authClient.createScopedRequired()) {
      authClient = authClient.createScoped([
        'https://www.googleapis.com/auth/monitoring'
      ]);
    }

    if (!this.project) {
      // autodetect projectId if not set by user
      this.project = projectId;
    }

    this.prefix = options.prefix ||
      `projects/${this.project}/metricDescriptors/custom.googleapis.com/`;
    this._name = `projects/${this.project}`;

    this._authClient = authClient;
    this._initalized = true;
  });
};

util.inherits(GLM, EventEmitter);

GLM.prototype.setValue = function (name, value, labels) {
  if (!this._initalized) {
    // don't do anything if we didn't get authenticated yet
    return;
  }

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
  if (!this._initalized) {
    // don't do anything if we didn't get authenticated yet
    return;
  }

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
