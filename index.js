var google = require('googleapis'),
    cloudmonitoring = google.cloudmonitoring("v2beta2");

var GLM = function (options) {
    options = options || {};

    this.project = options.project;
    this.prefix = options.prefix || "custom.cloudmonitoring.googleapis.com";

    this._authJSON = options.authJSON,

    this._jwtClient = new google.auth.JWT(null,
                                          null,
                                          null,
                                          "https://www.googleapis.com/auth/monitoring");
    this._jwtClient.fromJSON(this._authJSON);
};

GLM.prototype.setValue = function (name, value, labels) {
    var self = this;
    var point = {
        "timeseries": [
            {
                "timeseriesDesc": {
                    "project": self.project,
                    "metric": self.prefix + name,
                    "labels": self._transformLables(labels)
                },
                "point": {
                    "start": (new Date()).toISOString(),
                    "end": (new Date()).toISOString(),
                    "int64Value": value
                }
            }
        ]
    };

    cloudmonitoring.timeseries.write({ auth: self._jwtClient,
                                       project: self.project,
                                       resource: point});
};

GLM.prototype.setValues = function (values) {
    var self = this;
    var point = {
        "timeseries": values.map(function (v) {
            return {
                "timeseriesDesc": {
                    "project": self.project,
                    "metric": self.prefix + v.name,
                    "labels": self._transformLables(v.labels)
                },
                "point": {
                    "start": (new Date()).toISOString(),
                    "end": (new Date()).toISOString(),
                    "int64Value": v.value
                }
            };
        })
    };

    cloudmonitoring.timeseries.write({ auth: self._jwtClient,
                                       project: self.project,
                                       resource: point});
};

GLM.prototype._transformLables = function (labels) {
    var self = this,
        l = {};

    Object.keys(labels).map(function (label) {
        if (label.search(/\./) !== -1) { // use user defined prefix
            l[label] = labels[label];
        } else { // use common prefexi
            l[self.prefix + label] = labels[label];
        }
    });
    return l;
};

module.exports = GLM;
