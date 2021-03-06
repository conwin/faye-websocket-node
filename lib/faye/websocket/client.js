var util   = require('util'),
    net    = require('net'),
    tls    = require('tls'),
    driver = require('websocket-driver'),
    API    = require('./api');

var Client = function(url, protocols, options) {
  this.url     = url;
  this._uri    = require('url').parse(url);
  this._ping   = options && options.ping;
  this._pingId = 0;
  this._driver = driver.client(url, {protocols: protocols});

  var secure     = (this._uri.protocol === 'wss:'),
      onConnect  = function() { self._driver.start() },
      tlsOptions = {},
      self       = this;

  if (options && options.verify === false) tlsOptions.rejectUnauthorized = false;

  var connection = secure
                 ? tls.connect(this._uri.port || 443, this._uri.hostname, tlsOptions, onConnect)
                 : net.createConnection(this._uri.port || 80, this._uri.hostname);

  this._stream = connection;
  this._stream.setTimeout(0);
  this._stream.setNoDelay(true);

  if (!secure) this._stream.on('connect', onConnect);

  API.call(this);

  ['error', 'end'].forEach(function(event) {
    this._stream.on(event, function() { self._finalize('', 1006) });
  }, this);
};
util.inherits(Client, API);

module.exports = Client;

