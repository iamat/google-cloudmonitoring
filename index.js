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
                    "labels": {}
                },
                "point": {
                    "start": (new Date()).toISOString(),
                    "end": (new Date()).toISOString(),
                    "int64Value": value
                }
            }
        ]
    };

    Object.keys(labels).forEach(function (label) {
        point
            .timeseries[0]
            .timeseriesDesc
            .labels[self.prefix + label] = labels[label];
    });

    cloudmonitoring.timeseries.write({ auth: self._jwtClient,
                                       project: self.project,
                                       resource: point});
};

module.exports = GLM;
