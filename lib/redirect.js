var url = require('url');
var fs = require('fs');

var getHandler = function(redirects) {
  return function (req, res) {
    var redirect;
    if (req.headers.host) {
      var requestHost = req.headers.host.split(':')[0];
      redirect = redirects[requestHost];
    }

    // if the host is not found in the configuration, we default to the catch all
    if (!redirect){
      redirect = redirects['*'];
    }

    if (redirect){
      var newUrl = redirect.host + url.parse(req.url).pathname;

      res.statusCode = redirect.code || 302;
      res.setHeader('Content-Type', 'text/plain');
      res.setHeader('Location', newUrl);
      res.end('Redirecting to '+newUrl);
    } else {
      // there is no catch all, we will just show an error message
      res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Host not found');
    }
  };
};

// module.exports is a middleware
module.exports = function (redirects, port, ssl) {
  return require(typeof ssl === 'object' ? 'https' : 'http').createServer(function () {
    if (typeof ssl === 'object') return ['key', 'cert', 'ca'].reduce(function (options, prop) {

        if (typeof ssl[prop] === 'string' && fs.existsSync(ssl[prop]))
            options[prop] = fs.readFileSync(ssl[prop]).toString();
        return options;
    }, {}); else return getHandler(redirects);
  }(), getHandler(redirects)).listen(port);
};
