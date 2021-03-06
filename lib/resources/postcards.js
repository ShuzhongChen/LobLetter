'use strict';

var util         = require('util');
var ResourceBase = require('./resourceBase');

var Postcards = function (config) {
  ResourceBase.call(this, 'postcards', config);
};

util.inherits(Postcards, ResourceBase);

(function () {

  this.list = function (options, callback) {

    if (typeof options === 'function') {
      callback = options;
      options  = {};
    }

    return this._transmit('GET', null, options, null, callback);
  };

  this.retrieve = function (id, callback) {
    return this._transmit('GET', id, null, null, callback);
  };

  this.delete = function (id, callback) {
    return this._transmit('DELETE', id, null, null, callback);
  };

  this.create = function (params, headers, callback) {

    var isBuffer;

    if (params.front) {
      isBuffer = Buffer.isBuffer(params.front);

      if (isBuffer) {
        params.front = {
          value: params.front,
          options: { filename: 'front.pdf' }
        };
      }
    }

    if (params.back) {
      isBuffer = Buffer.isBuffer(params.back);

      if (isBuffer) {
        params.back = {
          value: params.back,
          options: { filename: 'back.pdf' }
        };
      }
    }

    for (var p in params) {

      if (p === 'front' || p === 'back' || !(params[p] instanceof Object)) {
        continue;
      }

      for (var key in params[p]) {
        params[p + '[' + key + ']'] = params[p][key];
      }

      delete params[p];
    }

    return this._transmit('POST', null, null, params, headers, callback);
  };

}).call(Postcards.prototype);

module.exports = Postcards;
