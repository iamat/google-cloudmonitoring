const google = require('googleapis');
const cloudmonitoring = google.cloudmonitoring('v2beta2');

const EventEmitter = require('events').EventEmitter;
const util = require('util');

var GLM = function (options) {
  options = options || {};

  this.project = options.project;
  this.prefix = options.prefix || 'custom.cloudmonitoring.googleapis.com';

  this._authJSON = options.authJSON;

  this._jwtClient = new google.auth.JWT(null,
                                        null,
                                        null,
                                        'https://www.googleapis.com/auth/monitoring');
  this._jwtClient.fromJSON(this._authJSON);
};

util.inherits(GLM, EventEmitter);

GLM.prototype.setValue = function (name, value, labels) {
  var self = this;
  var point = {
    'timeseries': [
      {
        'timeseriesDesc': {
          'project': self.project,
          'metric': self.prefix + name,
          'labels': self._transformLables(labels)
        },
        'point': {
          'start': (new Date()).toISOString(),
          'end': (new Date()).toISOString(),
          'int64Value': value
        }
      }
    ]
  };

  var params = { auth: self._jwtClient,
    project: self.project,
    resource: point };

  cloudmonitoring.timeseries.write(params, function (err) {
    if (err) {
      err.value = value;
      self.emit('error', err);
    }
  });
};

GLM.prototype.setValues = function (values) {
  var self = this;
  var point = {
    'timeseries': values.map(function (v) {
      return {
        'timeseriesDesc': {
          'project': self.project,
          'metric': self.prefix + v.name,
          'labels': self._transformLables(v.labels)
        },
        'point': {
          'start': (new Date()).toISOString(),
          'end': (new Date()).toISOString(),
          'int64Value': v.value
        }
      };
    })
  };

  var params = { auth: self._jwtClient,
    project: self.project,
    resource: point};

  cloudmonitoring.timeseries.write(params, function (err) {
    if (err) {
      err.values = values;
      self.emit('error', err);
    }
  });
};

GLM.prototype._transformLables = function (labels) {
  const l = {};

  Object.keys(labels).map((label) => {
    if (label.search(/\./) !== -1) { // use user defined prefix
      l[label] = labels[label];
    } else { // use common prefexi
      l[this.prefix + label] = labels[label];
    }
  });
  return l;
};

module.exports = GLM;
