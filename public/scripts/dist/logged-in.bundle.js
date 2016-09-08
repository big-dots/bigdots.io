(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

},{}],2:[function(require,module,exports){
(function (process){
  /* globals require, module */

  'use strict';

  /**
   * Module dependencies.
   */

  var pathtoRegexp = require('path-to-regexp');

  /**
   * Module exports.
   */

  module.exports = page;

  /**
   * Detect click event
   */
  var clickEvent = ('undefined' !== typeof document) && document.ontouchstart ? 'touchstart' : 'click';

  /**
   * To work properly with the URL
   * history.location generated polyfill in https://github.com/devote/HTML5-History-API
   */

  var location = ('undefined' !== typeof window) && (window.history.location || window.location);

  /**
   * Perform initial dispatch.
   */

  var dispatch = true;


  /**
   * Decode URL components (query string, pathname, hash).
   * Accommodates both regular percent encoding and x-www-form-urlencoded format.
   */
  var decodeURLComponents = true;

  /**
   * Base path.
   */

  var base = '';

  /**
   * Running flag.
   */

  var running;

  /**
   * HashBang option
   */

  var hashbang = false;

  /**
   * Previous context, for capturing
   * page exit events.
   */

  var prevContext;

  /**
   * Register `path` with callback `fn()`,
   * or route `path`, or redirection,
   * or `page.start()`.
   *
   *   page(fn);
   *   page('*', fn);
   *   page('/user/:id', load, user);
   *   page('/user/' + user.id, { some: 'thing' });
   *   page('/user/' + user.id);
   *   page('/from', '/to')
   *   page();
   *
   * @param {string|!Function|!Object} path
   * @param {Function=} fn
   * @api public
   */

  function page(path, fn) {
    // <callback>
    if ('function' === typeof path) {
      return page('*', path);
    }

    // route <path> to <callback ...>
    if ('function' === typeof fn) {
      var route = new Route(/** @type {string} */ (path));
      for (var i = 1; i < arguments.length; ++i) {
        page.callbacks.push(route.middleware(arguments[i]));
      }
      // show <path> with [state]
    } else if ('string' === typeof path) {
      page['string' === typeof fn ? 'redirect' : 'show'](path, fn);
      // start [options]
    } else {
      page.start(path);
    }
  }

  /**
   * Callback functions.
   */

  page.callbacks = [];
  page.exits = [];

  /**
   * Current path being processed
   * @type {string}
   */
  page.current = '';

  /**
   * Number of pages navigated to.
   * @type {number}
   *
   *     page.len == 0;
   *     page('/login');
   *     page.len == 1;
   */

  page.len = 0;

  /**
   * Get or set basepath to `path`.
   *
   * @param {string} path
   * @api public
   */

  page.base = function(path) {
    if (0 === arguments.length) return base;
    base = path;
  };

  /**
   * Bind with the given `options`.
   *
   * Options:
   *
   *    - `click` bind to click events [true]
   *    - `popstate` bind to popstate [true]
   *    - `dispatch` perform initial dispatch [true]
   *
   * @param {Object} options
   * @api public
   */

  page.start = function(options) {
    options = options || {};
    if (running) return;
    running = true;
    if (false === options.dispatch) dispatch = false;
    if (false === options.decodeURLComponents) decodeURLComponents = false;
    if (false !== options.popstate) window.addEventListener('popstate', onpopstate, false);
    if (false !== options.click) {
      document.addEventListener(clickEvent, onclick, false);
    }
    if (true === options.hashbang) hashbang = true;
    if (!dispatch) return;
    var url = (hashbang && ~location.hash.indexOf('#!')) ? location.hash.substr(2) + location.search : location.pathname + location.search + location.hash;
    page.replace(url, null, true, dispatch);
  };

  /**
   * Unbind click and popstate event handlers.
   *
   * @api public
   */

  page.stop = function() {
    if (!running) return;
    page.current = '';
    page.len = 0;
    running = false;
    document.removeEventListener(clickEvent, onclick, false);
    window.removeEventListener('popstate', onpopstate, false);
  };

  /**
   * Show `path` with optional `state` object.
   *
   * @param {string} path
   * @param {Object=} state
   * @param {boolean=} dispatch
   * @param {boolean=} push
   * @return {!Context}
   * @api public
   */

  page.show = function(path, state, dispatch, push) {
    var ctx = new Context(path, state);
    page.current = ctx.path;
    if (false !== dispatch) page.dispatch(ctx);
    if (false !== ctx.handled && false !== push) ctx.pushState();
    return ctx;
  };

  /**
   * Goes back in the history
   * Back should always let the current route push state and then go back.
   *
   * @param {string} path - fallback path to go back if no more history exists, if undefined defaults to page.base
   * @param {Object=} state
   * @api public
   */

  page.back = function(path, state) {
    if (page.len > 0) {
      // this may need more testing to see if all browsers
      // wait for the next tick to go back in history
      history.back();
      page.len--;
    } else if (path) {
      setTimeout(function() {
        page.show(path, state);
      });
    }else{
      setTimeout(function() {
        page.show(base, state);
      });
    }
  };


  /**
   * Register route to redirect from one path to other
   * or just redirect to another route
   *
   * @param {string} from - if param 'to' is undefined redirects to 'from'
   * @param {string=} to
   * @api public
   */
  page.redirect = function(from, to) {
    // Define route from a path to another
    if ('string' === typeof from && 'string' === typeof to) {
      page(from, function(e) {
        setTimeout(function() {
          page.replace(/** @type {!string} */ (to));
        }, 0);
      });
    }

    // Wait for the push state and replace it with another
    if ('string' === typeof from && 'undefined' === typeof to) {
      setTimeout(function() {
        page.replace(from);
      }, 0);
    }
  };

  /**
   * Replace `path` with optional `state` object.
   *
   * @param {string} path
   * @param {Object=} state
   * @param {boolean=} init
   * @param {boolean=} dispatch
   * @return {!Context}
   * @api public
   */


  page.replace = function(path, state, init, dispatch) {
    var ctx = new Context(path, state);
    page.current = ctx.path;
    ctx.init = init;
    ctx.save(); // save before dispatching, which may redirect
    if (false !== dispatch) page.dispatch(ctx);
    return ctx;
  };

  /**
   * Dispatch the given `ctx`.
   *
   * @param {Context} ctx
   * @api private
   */
  page.dispatch = function(ctx) {
    var prev = prevContext,
      i = 0,
      j = 0;

    prevContext = ctx;

    function nextExit() {
      var fn = page.exits[j++];
      if (!fn) return nextEnter();
      fn(prev, nextExit);
    }

    function nextEnter() {
      var fn = page.callbacks[i++];

      if (ctx.path !== page.current) {
        ctx.handled = false;
        return;
      }
      if (!fn) return unhandled(ctx);
      fn(ctx, nextEnter);
    }

    if (prev) {
      nextExit();
    } else {
      nextEnter();
    }
  };

  /**
   * Unhandled `ctx`. When it's not the initial
   * popstate then redirect. If you wish to handle
   * 404s on your own use `page('*', callback)`.
   *
   * @param {Context} ctx
   * @api private
   */
  function unhandled(ctx) {
    if (ctx.handled) return;
    var current;

    if (hashbang) {
      current = base + location.hash.replace('#!', '');
    } else {
      current = location.pathname + location.search;
    }

    if (current === ctx.canonicalPath) return;
    page.stop();
    ctx.handled = false;
    location.href = ctx.canonicalPath;
  }

  /**
   * Register an exit route on `path` with
   * callback `fn()`, which will be called
   * on the previous context when a new
   * page is visited.
   */
  page.exit = function(path, fn) {
    if (typeof path === 'function') {
      return page.exit('*', path);
    }

    var route = new Route(path);
    for (var i = 1; i < arguments.length; ++i) {
      page.exits.push(route.middleware(arguments[i]));
    }
  };

  /**
   * Remove URL encoding from the given `str`.
   * Accommodates whitespace in both x-www-form-urlencoded
   * and regular percent-encoded form.
   *
   * @param {string} val - URL component to decode
   */
  function decodeURLEncodedURIComponent(val) {
    if (typeof val !== 'string') { return val; }
    return decodeURLComponents ? decodeURIComponent(val.replace(/\+/g, ' ')) : val;
  }

  /**
   * Initialize a new "request" `Context`
   * with the given `path` and optional initial `state`.
   *
   * @constructor
   * @param {string} path
   * @param {Object=} state
   * @api public
   */

  function Context(path, state) {
    if ('/' === path[0] && 0 !== path.indexOf(base)) path = base + (hashbang ? '#!' : '') + path;
    var i = path.indexOf('?');

    this.canonicalPath = path;
    this.path = path.replace(base, '') || '/';
    if (hashbang) this.path = this.path.replace('#!', '') || '/';

    this.title = document.title;
    this.state = state || {};
    this.state.path = path;
    this.querystring = ~i ? decodeURLEncodedURIComponent(path.slice(i + 1)) : '';
    this.pathname = decodeURLEncodedURIComponent(~i ? path.slice(0, i) : path);
    this.params = {};

    // fragment
    this.hash = '';
    if (!hashbang) {
      if (!~this.path.indexOf('#')) return;
      var parts = this.path.split('#');
      this.path = parts[0];
      this.hash = decodeURLEncodedURIComponent(parts[1]) || '';
      this.querystring = this.querystring.split('#')[0];
    }
  }

  /**
   * Expose `Context`.
   */

  page.Context = Context;

  /**
   * Push state.
   *
   * @api private
   */

  Context.prototype.pushState = function() {
    page.len++;
    history.pushState(this.state, this.title, hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
  };

  /**
   * Save the context state.
   *
   * @api public
   */

  Context.prototype.save = function() {
    history.replaceState(this.state, this.title, hashbang && this.path !== '/' ? '#!' + this.path : this.canonicalPath);
  };

  /**
   * Initialize `Route` with the given HTTP `path`,
   * and an array of `callbacks` and `options`.
   *
   * Options:
   *
   *   - `sensitive`    enable case-sensitive routes
   *   - `strict`       enable strict matching for trailing slashes
   *
   * @constructor
   * @param {string} path
   * @param {Object=} options
   * @api private
   */

  function Route(path, options) {
    options = options || {};
    this.path = (path === '*') ? '(.*)' : path;
    this.method = 'GET';
    this.regexp = pathtoRegexp(this.path,
      this.keys = [],
      options);
  }

  /**
   * Expose `Route`.
   */

  page.Route = Route;

  /**
   * Return route middleware with
   * the given callback `fn()`.
   *
   * @param {Function} fn
   * @return {Function}
   * @api public
   */

  Route.prototype.middleware = function(fn) {
    var self = this;
    return function(ctx, next) {
      if (self.match(ctx.path, ctx.params)) return fn(ctx, next);
      next();
    };
  };

  /**
   * Check if this route matches `path`, if so
   * populate `params`.
   *
   * @param {string} path
   * @param {Object} params
   * @return {boolean}
   * @api private
   */

  Route.prototype.match = function(path, params) {
    var keys = this.keys,
      qsIndex = path.indexOf('?'),
      pathname = ~qsIndex ? path.slice(0, qsIndex) : path,
      m = this.regexp.exec(decodeURIComponent(pathname));

    if (!m) return false;

    for (var i = 1, len = m.length; i < len; ++i) {
      var key = keys[i - 1];
      var val = decodeURLEncodedURIComponent(m[i]);
      if (val !== undefined || !(hasOwnProperty.call(params, key.name))) {
        params[key.name] = val;
      }
    }

    return true;
  };


  /**
   * Handle "populate" events.
   */

  var onpopstate = (function () {
    var loaded = false;
    if ('undefined' === typeof window) {
      return;
    }
    if (document.readyState === 'complete') {
      loaded = true;
    } else {
      window.addEventListener('load', function() {
        setTimeout(function() {
          loaded = true;
        }, 0);
      });
    }
    return function onpopstate(e) {
      if (!loaded) return;
      if (e.state) {
        var path = e.state.path;
        page.replace(path, e.state);
      } else {
        page.show(location.pathname + location.hash, undefined, undefined, false);
      }
    };
  })();
  /**
   * Handle "click" events.
   */

  function onclick(e) {

    if (1 !== which(e)) return;

    if (e.metaKey || e.ctrlKey || e.shiftKey) return;
    if (e.defaultPrevented) return;



    // ensure link
    // use shadow dom when available
    var el = e.path ? e.path[0] : e.target;
    while (el && 'A' !== el.nodeName) el = el.parentNode;
    if (!el || 'A' !== el.nodeName) return;



    // Ignore if tag has
    // 1. "download" attribute
    // 2. rel="external" attribute
    if (el.hasAttribute('download') || el.getAttribute('rel') === 'external') return;

    // ensure non-hash for the same path
    var link = el.getAttribute('href');
    if (!hashbang && el.pathname === location.pathname && (el.hash || '#' === link)) return;



    // Check for mailto: in the href
    if (link && link.indexOf('mailto:') > -1) return;

    // check target
    if (el.target) return;

    // x-origin
    if (!sameOrigin(el.href)) return;



    // rebuild path
    var path = el.pathname + el.search + (el.hash || '');

    // strip leading "/[drive letter]:" on NW.js on Windows
    if (typeof process !== 'undefined' && path.match(/^\/[a-zA-Z]:\//)) {
      path = path.replace(/^\/[a-zA-Z]:\//, '/');
    }

    // same page
    var orig = path;

    if (path.indexOf(base) === 0) {
      path = path.substr(base.length);
    }

    if (hashbang) path = path.replace('#!', '');

    if (base && orig === path) return;

    e.preventDefault();
    page.show(orig);
  }

  /**
   * Event button.
   */

  function which(e) {
    e = e || window.event;
    return null === e.which ? e.button : e.which;
  }

  /**
   * Check if `href` is the same origin.
   */

  function sameOrigin(href) {
    var origin = location.protocol + '//' + location.hostname;
    if (location.port) origin += ':' + location.port;
    return (href && (0 === href.indexOf(origin)));
  }

  page.sameOrigin = sameOrigin;

}).call(this,require('_process'))

},{"_process":4,"path-to-regexp":3}],3:[function(require,module,exports){
var isarray = require('isarray')

/**
 * Expose `pathToRegexp`.
 */
module.exports = pathToRegexp
module.exports.parse = parse
module.exports.compile = compile
module.exports.tokensToFunction = tokensToFunction
module.exports.tokensToRegExp = tokensToRegExp

/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
var PATH_REGEXP = new RegExp([
  // Match escaped characters that would otherwise appear in future matches.
  // This allows the user to escape special characters that won't transform.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?", undefined]
  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined, undefined]
  // "/*"            => ["/", undefined, undefined, undefined, undefined, "*"]
  '([\\/.])?(?:(?:\\:(\\w+)(?:\\(((?:\\\\.|[^()])+)\\))?|\\(((?:\\\\.|[^()])+)\\))([+*?])?|(\\*))'
].join('|'), 'g')

/**
 * Parse a string for the raw tokens.
 *
 * @param  {String} str
 * @return {Array}
 */
function parse (str) {
  var tokens = []
  var key = 0
  var index = 0
  var path = ''
  var res

  while ((res = PATH_REGEXP.exec(str)) != null) {
    var m = res[0]
    var escaped = res[1]
    var offset = res.index
    path += str.slice(index, offset)
    index = offset + m.length

    // Ignore already escaped sequences.
    if (escaped) {
      path += escaped[1]
      continue
    }

    // Push the current path onto the tokens.
    if (path) {
      tokens.push(path)
      path = ''
    }

    var prefix = res[2]
    var name = res[3]
    var capture = res[4]
    var group = res[5]
    var suffix = res[6]
    var asterisk = res[7]

    var repeat = suffix === '+' || suffix === '*'
    var optional = suffix === '?' || suffix === '*'
    var delimiter = prefix || '/'
    var pattern = capture || group || (asterisk ? '.*' : '[^' + delimiter + ']+?')

    tokens.push({
      name: name || key++,
      prefix: prefix || '',
      delimiter: delimiter,
      optional: optional,
      repeat: repeat,
      pattern: escapeGroup(pattern)
    })
  }

  // Match any characters still remaining.
  if (index < str.length) {
    path += str.substr(index)
  }

  // If the path exists, push it onto the end.
  if (path) {
    tokens.push(path)
  }

  return tokens
}

/**
 * Compile a string to a template function for the path.
 *
 * @param  {String}   str
 * @return {Function}
 */
function compile (str) {
  return tokensToFunction(parse(str))
}

/**
 * Expose a method for transforming tokens into the path function.
 */
function tokensToFunction (tokens) {
  // Compile all the tokens into regexps.
  var matches = new Array(tokens.length)

  // Compile all the patterns before compilation.
  for (var i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] === 'object') {
      matches[i] = new RegExp('^' + tokens[i].pattern + '$')
    }
  }

  return function (obj) {
    var path = ''
    var data = obj || {}

    for (var i = 0; i < tokens.length; i++) {
      var token = tokens[i]

      if (typeof token === 'string') {
        path += token

        continue
      }

      var value = data[token.name]
      var segment

      if (value == null) {
        if (token.optional) {
          continue
        } else {
          throw new TypeError('Expected "' + token.name + '" to be defined')
        }
      }

      if (isarray(value)) {
        if (!token.repeat) {
          throw new TypeError('Expected "' + token.name + '" to not repeat, but received "' + value + '"')
        }

        if (value.length === 0) {
          if (token.optional) {
            continue
          } else {
            throw new TypeError('Expected "' + token.name + '" to not be empty')
          }
        }

        for (var j = 0; j < value.length; j++) {
          segment = encodeURIComponent(value[j])

          if (!matches[i].test(segment)) {
            throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
          }

          path += (j === 0 ? token.prefix : token.delimiter) + segment
        }

        continue
      }

      segment = encodeURIComponent(value)

      if (!matches[i].test(segment)) {
        throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but received "' + segment + '"')
      }

      path += token.prefix + segment
    }

    return path
  }
}

/**
 * Escape a regular expression string.
 *
 * @param  {String} str
 * @return {String}
 */
function escapeString (str) {
  return str.replace(/([.+*?=^!:${}()[\]|\/])/g, '\\$1')
}

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {String} group
 * @return {String}
 */
function escapeGroup (group) {
  return group.replace(/([=!:$\/()])/g, '\\$1')
}

/**
 * Attach the keys as a property of the regexp.
 *
 * @param  {RegExp} re
 * @param  {Array}  keys
 * @return {RegExp}
 */
function attachKeys (re, keys) {
  re.keys = keys
  return re
}

/**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {String}
 */
function flags (options) {
  return options.sensitive ? '' : 'i'
}

/**
 * Pull out keys from a regexp.
 *
 * @param  {RegExp} path
 * @param  {Array}  keys
 * @return {RegExp}
 */
function regexpToRegexp (path, keys) {
  // Use a negative lookahead to match only capturing groups.
  var groups = path.source.match(/\((?!\?)/g)

  if (groups) {
    for (var i = 0; i < groups.length; i++) {
      keys.push({
        name: i,
        prefix: null,
        delimiter: null,
        optional: false,
        repeat: false,
        pattern: null
      })
    }
  }

  return attachKeys(path, keys)
}

/**
 * Transform an array into a regexp.
 *
 * @param  {Array}  path
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
function arrayToRegexp (path, keys, options) {
  var parts = []

  for (var i = 0; i < path.length; i++) {
    parts.push(pathToRegexp(path[i], keys, options).source)
  }

  var regexp = new RegExp('(?:' + parts.join('|') + ')', flags(options))

  return attachKeys(regexp, keys)
}

/**
 * Create a path regexp from string input.
 *
 * @param  {String} path
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
function stringToRegexp (path, keys, options) {
  var tokens = parse(path)
  var re = tokensToRegExp(tokens, options)

  // Attach keys back to the regexp.
  for (var i = 0; i < tokens.length; i++) {
    if (typeof tokens[i] !== 'string') {
      keys.push(tokens[i])
    }
  }

  return attachKeys(re, keys)
}

/**
 * Expose a function for taking tokens and returning a RegExp.
 *
 * @param  {Array}  tokens
 * @param  {Array}  keys
 * @param  {Object} options
 * @return {RegExp}
 */
function tokensToRegExp (tokens, options) {
  options = options || {}

  var strict = options.strict
  var end = options.end !== false
  var route = ''
  var lastToken = tokens[tokens.length - 1]
  var endsWithSlash = typeof lastToken === 'string' && /\/$/.test(lastToken)

  // Iterate over the tokens and create our regexp string.
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i]

    if (typeof token === 'string') {
      route += escapeString(token)
    } else {
      var prefix = escapeString(token.prefix)
      var capture = token.pattern

      if (token.repeat) {
        capture += '(?:' + prefix + capture + ')*'
      }

      if (token.optional) {
        if (prefix) {
          capture = '(?:' + prefix + '(' + capture + '))?'
        } else {
          capture = '(' + capture + ')?'
        }
      } else {
        capture = prefix + '(' + capture + ')'
      }

      route += capture
    }
  }

  // In non-strict mode we allow a slash at the end of match. If the path to
  // match already ends with a slash, we remove it for consistency. The slash
  // is valid at the end of a path match, not in the middle. This is important
  // in non-ending mode, where "/test/" shouldn't match "/test//route".
  if (!strict) {
    route = (endsWithSlash ? route.slice(0, -2) : route) + '(?:\\/(?=$))?'
  }

  if (end) {
    route += '$'
  } else {
    // In non-ending mode, we need the capturing groups to match as much as
    // possible by using a positive lookahead to the end or next path segment.
    route += strict && endsWithSlash ? '' : '(?=\\/|$)'
  }

  return new RegExp('^' + route, flags(options))
}

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 *
 * @param  {(String|RegExp|Array)} path
 * @param  {Array}                 [keys]
 * @param  {Object}                [options]
 * @return {RegExp}
 */
function pathToRegexp (path, keys, options) {
  keys = keys || []

  if (!isarray(keys)) {
    options = keys
    keys = []
  } else if (!options) {
    options = {}
  }

  if (path instanceof RegExp) {
    return regexpToRegexp(path, keys, options)
  }

  if (isarray(path)) {
    return arrayToRegexp(path, keys, options)
  }

  return stringToRegexp(path, keys, options)
}

},{"isarray":1}],4:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

(function () {
    try {
        cachedSetTimeout = setTimeout;
    } catch (e) {
        cachedSetTimeout = function () {
            throw new Error('setTimeout is not defined');
        }
    }
    try {
        cachedClearTimeout = clearTimeout;
    } catch (e) {
        cachedClearTimeout = function () {
            throw new Error('clearTimeout is not defined');
        }
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _resource = require('../lib/resource');

var _resource2 = _interopRequireDefault(_resource);

var _displayCoupler = require('display-coupler');

var _displayCoupler2 = _interopRequireDefault(_displayCoupler);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Display = function () {
  function Display($el, displayKey) {
    _classCallCheck(this, Display);

    this.$el = $el;
    this.displayKey = displayKey;
  }

  _createClass(Display, [{
    key: 'load',
    value: function load(width, dimensions, callback) {
      var _this = this;

      this.render(width, dimensions);

      var displayCoupler = new _displayCoupler2.default(firebase.database());
      displayCoupler.connect(this.displayKey, {
        onReady: function onReady(displayData, next) {
          next();
        },
        onPixelChange: function onPixelChange(y, x, hex, displayData) {
          displayData = displayData || {};
          _this.refreshPixelByCoordinates(y, x, hex, displayData);
        }
      });
      callback();
    }
  }, {
    key: 'demo',
    value: function demo(macro, macroConfig, width, dimensions, callback) {
      var _this2 = this;

      var displayConfig = {
        macro: macro,
        macroConfig: macroConfig,
        width: dimensions.width,
        height: dimensions.height
      };

      this.render(width, dimensions);

      var displayCoupler = new _displayCoupler2.default();
      displayCoupler.demo(displayConfig, {
        onReady: function onReady(displayData, next) {
          next();
        },
        onPixelChange: function onPixelChange(y, x, hex, displayData) {
          displayData = displayData || {};
          _this2.refreshPixelByCoordinates(y, x, hex, displayData);
        }
      });
      callback();
    }
  }, {
    key: 'render',
    value: function render(width, dimensions) {
      this.$el.html('\n      <div class="display">\n        <div class="top"></div>\n        <div class="right"></div>\n        <div class="front"></div>\n      </div>\n    ');

      var adjustedBrightness = (50 + 100 / 2) / 100,
          size = (width - 20) / dimensions.width;

      for (var y = 0; y < dimensions.height; y++) {
        var $row = $('<div class="matrix-row" style="opacity: ' + adjustedBrightness + '; height: ' + size + 'px; line-height: ' + size + 'px;">');
        for (var x = 0; x < dimensions.width; x++) {
          $row.append('\n          <span class="matrix-dot-wrapper" style="width: ' + size + 'px; height: ' + size + 'px;">\n            <div class="matrix-dot" data-y="' + y + '" data-x="' + x + '" data-coordinates="' + y + ':' + x + '" style="background-color: #444">\n          </span>\n        ');
        }
        this.$el.find('.front').append($row);
      }
    }
  }, {
    key: 'refreshPixelByCoordinates',
    value: function refreshPixelByCoordinates(y, x, hex, displayData) {
      var el = document.querySelectorAll('[data-coordinates=\'' + y + ':' + x + '\']');
      if (el.length > 0) {
        el[0].style.background = hex === '#000000' ? '#444' : hex;
      }
    }
  }]);

  return Display;
}();

function shadeHex(color, percent) {
  var f = parseInt(color.slice(1), 16),
      t = percent < 0 ? 0 : 255,
      p = percent < 0 ? percent * -1 : percent,
      R = f >> 16,
      G = f >> 8 & 0x00FF,
      B = f & 0x0000FF;
  return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
}

exports.default = Display;

},{"../lib/resource":7,"display-coupler":22}],6:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _userManager = require('../managers/user-manager');

var _userManager2 = _interopRequireDefault(_userManager);

var _displayManager = require('../managers/display-manager');

var _displayManager2 = _interopRequireDefault(_displayManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var userManager = new _userManager2.default(),
    displayManager = new _displayManager2.default();

var Header = function () {
  function Header($el) {
    _classCallCheck(this, Header);

    this.$el = $el;
  }

  _createClass(Header, [{
    key: 'render',
    value: function render() {
      var _this = this;

      this.$el.html('\n      <header class="navbar navbar-static-top" style="border-radius: 0;">\n        <div class="pull-right">\n          <img src="" class="avatar" style="border-radius: 20px; width: 40px; height: 40px;"/>\n        </div>\n        <a class="navbar-brand" href="/">BIGDOTS</a>\n      </header>\n    ');

      firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
          _this.$el.find('header').removeClass('logged-out');
          _this.$el.find('.avatar').attr('src', user.photoURL);
          $signedOut.hide();
          $signedIn.show();

          var identity = {
            name: user.displayName,
            profileImageUrl: user.photoURL,
            uid: user.uid
          };

          userManager.updateIdentity(user.uid, identity, function () {
            // Something...
          });
        } else {
          _this.$el.find('header').addClass('logged-out');
          _this.$el.find('.user-signed-out').show();
          $signedIn.hide();
          $signedOut.show();
        }
      });

      this.$el.find('.sign-in').click(function (ev) {
        ev.preventDefault();
        var provider = new firebase.auth.GoogleAuthProvider();
        firebase.auth().signInWithPopup(provider).then(function (result) {
          var user = result.user;
          _this.$el.find('.avatar').attr('src', user.photoURL);
          $signedOut.hide();
          $signedIn.show();
        }).catch(function (error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          // The email of the user's account used.
          var email = error.email;
          // The firebase.auth.AuthCredential type that was used.
          var credential = error.credential;
          // ...
        });
      });
    }
  }]);

  return Header;
}();

exports.default = Header;

},{"../managers/display-manager":9,"../managers/user-manager":11}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Resource = function () {
  function Resource() {
    _classCallCheck(this, Resource);
  }

  _createClass(Resource, [{
    key: 'matrix',
    value: function matrix(id) {
      return firebase.database().ref('matrices/' + id);
    }
  }, {
    key: 'matrixPixel',
    value: function matrixPixel(id, y, x) {
      return firebase.database().ref('matrices/' + id + '/' + y + ':' + x);
    }
  }, {
    key: 'displays',
    value: function displays() {
      return firebase.database().ref('displays');
    }
  }, {
    key: 'display',
    value: function display(id) {
      return firebase.database().ref('displays/' + id);
    }
  }, {
    key: 'displayConnectedHardware',
    value: function displayConnectedHardware(id) {
      return firebase.database().ref('displays/' + id + '/connectedHardware');
    }
  }, {
    key: 'displayMacroConfig',
    value: function displayMacroConfig(id, mode) {
      return firebase.database().ref('displays/' + id + '/macros/' + mode);
    }
  }, {
    key: 'displayOwners',
    value: function displayOwners(id) {
      return firebase.database().ref('displays/' + id + '/owners');
    }
  }, {
    key: 'macros',
    value: function macros() {
      return firebase.database().ref('macros');
    }
  }, {
    key: 'hardwares',
    value: function hardwares() {
      return firebase.database().ref('hardware');
    }
  }, {
    key: 'hardware',
    value: function hardware(id) {
      return firebase.database().ref('hardware/' + id);
    }
  }, {
    key: 'userIdentity',
    value: function userIdentity(id) {
      return firebase.database().ref('users/public/' + id + '/identity');
    }
  }, {
    key: 'userDisplays',
    value: function userDisplays(id) {
      return firebase.database().ref('users/private/' + id + '/displays');
    }
  }]);

  return Resource;
}();

exports.default = Resource;

},{}],8:[function(require,module,exports){
'use strict';

var _page = require('page');

var _page2 = _interopRequireDefault(_page);

var _displayPage = require('./pages/display-page');

var _displayPage2 = _interopRequireDefault(_displayPage);

var _createDisplayPage = require('./pages/create-display-page');

var _createDisplayPage2 = _interopRequireDefault(_createDisplayPage);

var _homePage = require('./pages/home-page');

var _homePage2 = _interopRequireDefault(_homePage);

var _dashboardPage = require('./pages/dashboard-page');

var _dashboardPage2 = _interopRequireDefault(_dashboardPage);

var _installMacrosPage = require('./pages/install-macros-page');

var _installMacrosPage2 = _interopRequireDefault(_installMacrosPage);

var _howToBuildADisplayPage = require('./pages/how-to-build-a-display-page');

var _howToBuildADisplayPage2 = _interopRequireDefault(_howToBuildADisplayPage);

var _header = require('./components/header');

var _header2 = _interopRequireDefault(_header);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

firebase.initializeApp({
  apiKey: "AIzaSyANob4DbCBvpUU1PJjq6p77qpTwsMrcJfI",
  authDomain: "led-fiesta.firebaseapp.com",
  databaseURL: "https://led-fiesta.firebaseio.com",
  storageBucket: "led-fiesta.appspot.com"
});

(0, _page2.default)('/my/dashboard', function () {
  new _dashboardPage2.default().render();
});

(0, _page2.default)('/displays/new', function () {
  new _createDisplayPage2.default().render();
  $('select').select2();
});

(0, _page2.default)('/displays/:id', function (ctx) {
  new _displayPage2.default({
    id: ctx.params.id
  }).render();
});

(0, _page2.default)('/install-macros', function () {
  new _installMacrosPage2.default().render();
});

(0, _page2.default)('/how-to-build-a-display', function () {
  new _howToBuildADisplayPage2.default().render();
});

firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    new _header2.default($('.header')).render();
    (0, _page2.default)();
  }
});

},{"./components/header":6,"./pages/create-display-page":15,"./pages/dashboard-page":16,"./pages/display-page":17,"./pages/home-page":18,"./pages/how-to-build-a-display-page":19,"./pages/install-macros-page":20,"page":2}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _resource = require('../lib/resource');

var _resource2 = _interopRequireDefault(_resource);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DisplayManager = function () {
  function DisplayManager() {
    _classCallCheck(this, DisplayManager);
  }

  _createClass(DisplayManager, [{
    key: 'create',
    value: function create(matrix, config, uid, cb) {
      var matrixKey = firebase.database().ref('matrices').push().key,
          displayKey = firebase.database().ref('displays').push().key;

      new _resource2.default().matrix(matrixKey).set(matrix).then(function () {
        new _resource2.default().display(displayKey).set(config).then(function () {
          var data = {};
          data[displayKey] = true;

          new _resource2.default().userDisplays(uid).update(data).then(function () {
            cb(displayKey);
          });
        });
      });
    }
  }, {
    key: 'getUserDisplays',
    value: function getUserDisplays(uid, callback) {
      var _this = this;

      new _resource2.default().userDisplays(uid).once('value').then(function (snapshot) {
        var displayKeys = Object.keys(snapshot.val()),
            assembledDisplays = [];

        displayKeys.forEach(function (displayKey) {
          _this.getDisplay(displayKey, function (displayData) {
            assembledDisplays.push(displayData);

            if (assembledDisplays.length == displayKeys.length) {
              callback(displayKeys, assembledDisplays);
            }
          });
        });
      });
    }
  }, {
    key: 'getOwners',
    value: function getOwners(key, callback) {
      new _resource2.default().displayOwners(key).once('value').then(function (snapshot) {
        var userKeys = Object.keys(snapshot.val()),
            assembledUsers = [];

        userKeys.forEach(function (userKey) {
          new _resource2.default().userIdentity(userKey).once('value').then(function (identity) {
            assembledUsers.push(identity.val());

            if (assembledUsers.length == userKeys.length) {
              callback(userKeys, assembledUsers);
            }
          });
        });
      });
    }
  }, {
    key: 'getDisplay',
    value: function getDisplay(key, callback) {
      new _resource2.default().display(key).once('value').then(function (snapshot) {
        callback(snapshot.val());
      });
    }
  }, {
    key: 'getDisplay',
    value: function getDisplay(key, callback) {
      new _resource2.default().display(key).once('value').then(function (snapshot) {
        callback(snapshot.val());
      });
    }
  }, {
    key: 'update',
    value: function update(key, config, cb) {
      new _resource2.default().display(key).update(config).then(function () {
        cb();
      });
    }
  }]);

  return DisplayManager;
}();

exports.default = DisplayManager;

},{"../lib/resource":7}],10:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _resource = require('../lib/resource');

var _resource2 = _interopRequireDefault(_resource);

var _macroLibrary = require('macro-library');

var _macroLibrary2 = _interopRequireDefault(_macroLibrary);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MacroManager = function () {
  function MacroManager() {
    _classCallCheck(this, MacroManager);
  }

  _createClass(MacroManager, [{
    key: 'install',
    value: function install(key, config, cb) {
      var data = {};
      data[key] = config;

      new _resource2.default().macros().update(data).then(function () {
        cb(key);
      });
    }
  }, {
    key: 'getInstalledMacros',
    value: function getInstalledMacros(callback) {
      new _resource2.default().macros().once('value').then(function (snapshot) {
        callback(snapshot.val());
      });
    }
  }, {
    key: 'getAvailableMacros',
    value: function getAvailableMacros() {
      var macroLibrary = new _macroLibrary2.default();
      macroLibrary.registerMacros();
      return macroLibrary.availableMacros();
    }
  }]);

  return MacroManager;
}();

exports.default = MacroManager;

},{"../lib/resource":7,"macro-library":23}],11:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _resource = require('../lib/resource');

var _resource2 = _interopRequireDefault(_resource);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UserManager = function () {
  function UserManager() {
    _classCallCheck(this, UserManager);
  }

  _createClass(UserManager, [{
    key: 'create',
    value: function create(matrix, config, cb) {
      var matrixKey = firebase.database().ref('matrices').push().key,
          displayKey = firebase.database().ref('displays').push().key;

      new _resource2.default().matrix(matrixKey).set(matrix).then(function () {
        new _resource2.default().display(displayKey).set(config).then(function () {
          cb(displayKey);
        });
      });
    }
  }, {
    key: 'getDisplay',
    value: function getDisplay(key, callback) {
      new _resource2.default().display(key).once('value').then(function (snapshot) {
        callback(snapshot.val());
      });
    }
  }, {
    key: 'updateIdentity',
    value: function updateIdentity(key, identity, cb) {
      new _resource2.default().userIdentity(key).update(identity).then(function () {
        cb();
      });
    }
  }]);

  return UserManager;
}();

exports.default = UserManager;

},{"../lib/resource":7}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _page = require('page');

var _page2 = _interopRequireDefault(_page);

var _modal = require('./modal');

var _modal2 = _interopRequireDefault(_modal);

var _displayManager = require('../managers/display-manager');

var _displayManager2 = _interopRequireDefault(_displayManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ApiUsageModal = function (_Modal) {
  _inherits(ApiUsageModal, _Modal);

  function ApiUsageModal($el, displayKey, displayData) {
    _classCallCheck(this, ApiUsageModal);

    var _this = _possibleConstructorReturn(this, (ApiUsageModal.__proto__ || Object.getPrototypeOf(ApiUsageModal)).call(this, $el));

    _this.displayKey = displayKey;
    _this.displayData = displayData;
    return _this;
  }

  _createClass(ApiUsageModal, [{
    key: '$',
    value: function $(selector) {
      return this.$el.find(selector);
    }
  }, {
    key: 'render',
    value: function render() {
      this.$el.html('\n      <div id="api-usage" class="modal fade">\n        <div class="modal-dialog" role="document">\n          <div class="modal-content">\n            <div class="modal-header">\n              <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n                <span aria-hidden="true">&times;</span>\n              </button>\n              <h4 class="modal-title">Using the API</h4>\n            </div>\n            <div class="modal-body">\n              <p class="alert alert-danger">\n                Treat <strong>' + this.displayData.matrix + '</strong> like an <strong>API SECRET</strong>. Whoever possesses it can write to this LED board.\n              </p>\n              <h5>Updating one point</h5>\n              <p>To update a specific point on your Display, replace <strong>Y</strong> and <strong>X</strong> with the coordinate to update</p>\n              <pre>\nhttps://led-fiesta.firebaseio.com/matrices/' + this.displayData.matrix + '/Y:X.json\'</pre>\n              </pre>\n              <p>Then just perform a PATCH request to update the point and pass json with the <strong>hex</strong> color and the <strong>updatedAt</strong> timestamp. Here is a curl example that you can run from the commandline.</p>\n              <pre>\ncurl -X PATCH -d \'{\n  "hex": "#FFFFFF",\n  "updatedAt": ' + new Date().getTime() + '\n}\'   \'https://led-fiesta.firebaseio.com/matrices/' + this.displayData.matrix + '/0:0.json\'\n              </pre>\n              <h5>Updating multiple points</h5>\n              <pre>\ncurl -X PATCH -d \'{\n  "0:0": {\n    "hex": "#FFFFFF",\n    "updatedAt": ' + new Date().getTime() + '\n  },\n  "0:1": {\n    "hex": "#FFFFFF",\n    "updatedAt": ' + new Date().getTime() + '\n  },\n  "0:2": {\n    "hex": "#FFFFFF",\n    "updatedAt": ' + new Date().getTime() + '\n  }\n}\'   \'https://led-fiesta.firebaseio.com/matrices/' + this.displayData.matrix + '.json\'\n              </pre>\n            </div>\n          </div>\n        </div>\n      </div>\n    ');
    }
  }]);

  return ApiUsageModal;
}(_modal2.default);

exports.default = ApiUsageModal;

},{"../managers/display-manager":9,"./modal":14,"page":2}],13:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _page = require('page');

var _page2 = _interopRequireDefault(_page);

var _modal = require('./modal');

var _modal2 = _interopRequireDefault(_modal);

var _displayManager = require('../managers/display-manager');

var _displayManager2 = _interopRequireDefault(_displayManager);

var _macroManager = require('../managers/macro-manager');

var _macroManager2 = _interopRequireDefault(_macroManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var macroManager = new _macroManager2.default(),
    displayManager = new _displayManager2.default();

var EditDisplayModal = function (_Modal) {
  _inherits(EditDisplayModal, _Modal);

  function EditDisplayModal($el, displayKey, displayData) {
    _classCallCheck(this, EditDisplayModal);

    var _this = _possibleConstructorReturn(this, (EditDisplayModal.__proto__ || Object.getPrototypeOf(EditDisplayModal)).call(this, $el));

    _this.displayKey = displayKey;
    _this.displayData = displayData;
    return _this;
  }

  _createClass(EditDisplayModal, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      this.$el.html('\n      <div id="edit-display" class="modal fade">\n        <div class="modal-dialog" role="document">\n          <div class="modal-content">\n            <div class="modal-header">\n              <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n                <span aria-hidden="true">&times;</span>\n              </button>\n              <h4 class="modal-title">Edit Display</h4>\n            </div>\n            <div class="modal-body">\n              <form>\n                <ul class="nav nav-tabs">\n                  <li class="nav-item">\n                    <a class="nav-link active" data-toggle="tab" href="#edit-general">General</a>\n                  </li>\n                  <li class="nav-item">\n                    <a class="nav-link" data-toggle="tab" href="#edit-owners">Owners</a>\n                  </li>\n                  <li class="nav-item">\n                    <a class="nav-link" data-toggle="tab" href="#edit-macro">Macro</a>\n                  </li>\n                </ul>\n                <div class="tab-content">\n                  <br />\n                  <div id="edit-general" class="tab-pane active">\n                    <div class="row">\n                      <div class="col-xs-12">\n                        <fieldset class="form-group">\n                          <label for="display-name">Display name</label>\n                          <input type="name" name="display-name" class="form-control" id="display-name" />\n                        </fieldset>\n                      </div>\n                    </div>\n                    <div class="row">\n                      <div class="col-xs-12 col-sm-6">\n                        <fieldset class="form-group">\n                          <label for="display-width">Select width</label>\n                          <select class="form-control" id="display-width" name="width">\n                            <option value="16">16</option>\n                            <option value="32">32</option>\n                            <option value="64">64</option>\n                            <option value="96">96</option>\n                            <option value="128">128</option>\n                          </select>\n                        </fieldset>\n                      </div>\n                      <div class="col-xs-12 col-sm-6">\n                        <fieldset class="form-group">\n                          <label for="display-height">Select height</label>\n                          <select class="form-control" id="display-height" name="height">\n                            <option value="16">16</option>\n                            <option value="32">32</option>\n                            <option value="64">64</option>\n                            <option value="96">96</option>\n                            <option value="128">128</option>\n                          </select>\n                        </fieldset>\n                      </div>\n                    </div>\n                  </div>\n                  <div id="edit-owners" class="tab-pane">\n                    <ul id="display-owners" class="list-group"></ul>\n                  </div>\n                  <div id="edit-macro" class="tab-pane">\n                    <div class="row">\n                      <div class="col-xs-12">\n                        <fieldset class="form-group">\n                          <label for="macro">Select macro</label>\n                          <select name="macro" class="form-control" id="macro"></select>\n                        </fieldset>\n                      </div>\n                    </div>\n                    <div class="programmable options row" style="display: none;">\n                      <div class="col-xs-12">\n                        <p class="programmable description"></p>\n                        <p>Warning you need programming skills to use this display macro. Learn more about this option <a href="#">here.</a>\n                      </div>\n                    </div>\n                    <div class="twinkle options row" style="display: none;">\n                      <div class="col-xs-12">\n                        <p class="twinkle description"></p>\n                        <fieldset class="form-group">\n                          <h5>Macro options</h5>\n                          <label for="twinkle-base-color">Seed Color</label>\n                          <div class="input-group colorpicker-component">\n                            <input type="text" id="twinkle-seed-color" value="#006e91" class="form-control" />\n                            <span class="input-group-addon"><i></i></span>\n                          </div>\n                          <small class="text-muted">The brightest hex value you want to display</small>\n                        </fieldset>\n                      </div>\n                    </div>\n                    <div class="solid-color options row" style="display: none;">\n                      <div class="col-xs-12">\n                        <p class="solid-color description"></p>\n                        <fieldset class="form-group">\n                          <h5>Macro options</h5>\n                          <label for="solid-color">Color</label>\n                          <div class="input-group colorpicker-component">\n                            <input type="text" id="solid-color" value="#006e91" class="form-control" />\n                            <span class="input-group-addon"><i></i></span>\n                          </div>\n                        </fieldset>\n                      </div>\n                    </div>\n                  </div>\n                </div>\n                <br /><br />\n                <button type="submit" class="btn btn-success">Update</button>\n              </form>\n            </div>\n          </div>\n        </div>\n      </div>\n    ');

      this.populateMacros();
      this.populateOwners();

      this.$('#edit-display').on('show.bs.modal', function () {
        _this2.$('select#macro').val(_this2.displayData.macro).change();
        _this2.$('select#display-width').val(_this2.displayData.width).change();
        _this2.$('select#display-height').val(_this2.displayData.height).change();
      });
      this.$('#display-name').val(this.displayData.name);

      this.$('#edit-display').on('shown.bs.modal', function () {
        $('select').select2();
      });
      this.$('a[data-toggle="tab"]').on('shown.bs.tab', function () {
        $('select').select2();
      });

      this.$('.colorpicker-component').colorpicker();

      var $twinkleOptions = this.$('.options.twinkle'),
          $programmableOptions = this.$('.options.programmable'),
          $solidColorOptions = this.$('.options.solid-color');

      this.$('select#macro').change(function (el) {
        $twinkleOptions.hide();
        $programmableOptions.hide();
        $solidColorOptions.hide();

        if (this.value === 'twinkle') {
          $twinkleOptions.show();
        } else if (this.value == 'programmable') {
          $programmableOptions.show();
        } else if (this.value == 'solid-color') {
          $solidColorOptions.show();
        }
      });

      this.$('form').submit(function (ev) {
        ev.preventDefault();

        var newData = {
          macro: _this2.$('select#macro').val(),
          name: _this2.$('#display-name').val()
        };

        if (newData.macro === 'twinkle') {
          newData.macroConfig = { seedColor: _this2.$('#twinkle-seed-color').val() };
        } else if (macro === 'solid-color') {
          newData.macroConfig = { color: _this2.$('#solid-color').val() };
        }

        displayManager.update(_this2.displayKey, newData, function (displayKey) {
          _this2.$('#edit-display').modal('hide');

          // Why doesn't this happen automatically?!
          $('body').removeClass('modal-open');
          $('.modal-backdrop').remove();

          (0, _page2.default)('/displays/' + _this2.displayKey);
        });
      });
    }
  }, {
    key: 'populateMacros',
    value: function populateMacros() {
      var _this3 = this;

      var $macrosSelect = this.$('select#macro');
      macroManager.getInstalledMacros(function (macros) {
        for (var key in macros) {
          $macrosSelect.append('<option value=' + key + '>' + macros[key].name + '</option>');
          _this3.$('.description.' + key).text(macros[key].description);
        }
      });
    }
  }, {
    key: 'populateOwners',
    value: function populateOwners() {
      var _this4 = this;

      displayManager.getOwners(this.displayKey, function (userskeys, users) {
        var $displayOwners = _this4.$('#display-owners');
        users.forEach(function (user) {
          $displayOwners.append('\n          <li class="list-group-item">\n            <img src="' + user.profileImageUrl + '" style="width: 40px; height: 40px; border-radius: 20px;" />\n            ' + user.name + '\n          </li>\n        ');
        });
      });
    }
  }]);

  return EditDisplayModal;
}(_modal2.default);

exports.default = EditDisplayModal;

},{"../managers/display-manager":9,"../managers/macro-manager":10,"./modal":14,"page":2}],14:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Modal = function () {
  function Modal($el) {
    _classCallCheck(this, Modal);

    this.$el = $el;
  }

  _createClass(Modal, [{
    key: "$",
    value: function $(selector) {
      return this.$el.find(selector);
    }
  }]);

  return Modal;
}();

exports.default = Modal;

},{}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _page = require('page');

var _page2 = _interopRequireDefault(_page);

var _displayManager = require('../managers/display-manager');

var _displayManager2 = _interopRequireDefault(_displayManager);

var _resource = require('../lib/resource');

var _resource2 = _interopRequireDefault(_resource);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var CreateDisplayPage = function (_Page) {
  _inherits(CreateDisplayPage, _Page);

  function CreateDisplayPage() {
    _classCallCheck(this, CreateDisplayPage);

    return _possibleConstructorReturn(this, (CreateDisplayPage.__proto__ || Object.getPrototypeOf(CreateDisplayPage)).apply(this, arguments));
  }

  _createClass(CreateDisplayPage, [{
    key: 'render',
    value: function render() {
      this.$el.html('\n      <h1>\n        Create a Display\n      </h1>\n      <hr />\n      <div class="row">\n        <div class="col-xs-12 col-sm-6">\n          <form>\n            <fieldset class="form-group">\n              <label for="name">Display name</label>\n              <input type="text" class="form-control" id="display-name" placeholder="My cool display" />\n              <small class="text-muted">This will function as a label</small>\n            </fieldset>\n            <div class="row">\n              <div class="col-xs-12 col-sm-6">\n                <fieldset class="form-group">\n                  <label for="display-width">Select width</label>\n                  <select class="form-control" id="display-width" name="width">\n                    <option value="16">16</option>\n                    <option value="32">32</option>\n                    <option value="64">64</option>\n                    <option value="96">96</option>\n                    <option value="128">128</option>\n                  </select>\n                </fieldset>\n              </div>\n              <div class="col-xs-12 col-sm-6">\n                <fieldset class="form-group">\n                  <label for="display-height">Select height</label>\n                  <select class="form-control" id="display-height" name="height">\n                    <option value="16">16</option>\n                    <option value="32">32</option>\n                    <option value="64">64</option>\n                    <option value="96">96</option>\n                    <option value="128">128</option>\n                  </select>\n                </fieldset>\n              </div>\n            </div>\n            <button type="submit" class="btn btn-success pull-right">Create Display</button>\n          </form>\n        </div>\n      </div>\n    ');

      this.$el.find('form').submit(function (ev) {
        ev.preventDefault();

        var displayName = $('#display-name').val(),
            displayWidth = parseInt($('#display-width').val(), 10),
            displayHeight = parseInt($('#display-height').val(), 10);

        var matrixData = assembleMartix(displayWidth, displayHeight),
            uid = firebase.auth().currentUser.uid;

        new _displayManager2.default().create(matrixData, {
          brightness: 100,
          name: displayName,
          width: displayWidth,
          height: displayHeight
        }, uid, function (displayKey) {
          (0, _page2.default)('/displays/' + displayKey);
        });
      });
    }
  }]);

  return CreateDisplayPage;
}(_page2.default);

function assembleMartix(width, height) {
  var matrix = {};
  for (var y = 0; y < height; y++) {
    for (var x = 0; x < width; x++) {
      matrix[y + ':' + x] = {
        hex: '#000000',
        updatedAt: Date.now()
      };
    }
  }

  return matrix;
}

exports.default = CreateDisplayPage;

},{"../lib/resource":7,"../managers/display-manager":9,"page":2}],16:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _displayManager = require('../managers/display-manager');

var _displayManager2 = _interopRequireDefault(_displayManager);

var _page = require('./page');

var _page2 = _interopRequireDefault(_page);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var displayManager = new _displayManager2.default();

var DashboardPage = function (_Page) {
  _inherits(DashboardPage, _Page);

  function DashboardPage() {
    _classCallCheck(this, DashboardPage);

    return _possibleConstructorReturn(this, (DashboardPage.__proto__ || Object.getPrototypeOf(DashboardPage)).apply(this, arguments));
  }

  _createClass(DashboardPage, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      this.$el.html('\n      <div class="displays"></div>\n    ');

      var uid = firebase.auth().currentUser.uid;
      displayManager.getUserDisplays(uid, function (displayKeys, displays) {
        var $displays = _this2.$el.find('.displays');
        displays.forEach(function (display, i) {
          $displays.append('\n          <a href="/displays/' + displayKeys[i] + '">' + display.name + '</a>\n        ');
        });
      });
    }
  }]);

  return DashboardPage;
}(_page2.default);

exports.default = DashboardPage;

},{"../managers/display-manager":9,"./page":21}],17:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _display = require('../components/display');

var _display2 = _interopRequireDefault(_display);

var _page = require('./page');

var _page2 = _interopRequireDefault(_page);

var _editDisplayModal = require('../modals/edit-display-modal');

var _editDisplayModal2 = _interopRequireDefault(_editDisplayModal);

var _apiUsageModal = require('../modals/api-usage-modal');

var _apiUsageModal2 = _interopRequireDefault(_apiUsageModal);

var _displayManager = require('../managers/display-manager');

var _displayManager2 = _interopRequireDefault(_displayManager);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var displayManager = new _displayManager2.default();

var DisplayPage = function (_Page) {
  _inherits(DisplayPage, _Page);

  function DisplayPage(config) {
    _classCallCheck(this, DisplayPage);

    var _this = _possibleConstructorReturn(this, (DisplayPage.__proto__ || Object.getPrototypeOf(DisplayPage)).call(this));

    _this.id = config.id;
    return _this;
  }

  _createClass(DisplayPage, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      this.$el.html('\n      <div class="frame" style="display: none;">\n        <div class="display-meta" style="display: none;">\n          <a href="#" class="btn btn-link pull-right change-macro" data-toggle="modal" data-target="#edit-display">\n            <span class="display-macro"></span>\n            <i class="fa fa-pencil"></i>\n          </a>\n          <span class="display-name text-left"></span>\n        </div>\n        <div class=\'matrix-container\'></div>\n        <div class="display-meta" style="display: none;">\n          <a href="#" class="btn btn-link pull-right api-usage" data-toggle="modal" data-target="#api-usage">\n            Using the API...\n          </a>\n        </div>\n        <div class="edit-display-modal"></div>\n        <div class="api-usage-modal"></div>\n      </div>\n    ');

      firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
          _this2.$('.display-meta').show();
        } else {
          _this2.$('.display-meta').hide();
        }
      });

      var display = new _display2.default(this.$('.matrix-container'), this.id);

      displayManager.getDisplay(this.id, function (displayData) {
        var dimensions = {
          width: displayData.width,
          height: displayData.height
        };

        display.load($('.frame').width(), dimensions, function () {
          _this2.$('.display-name').text(displayData.name);
          _this2.$('.display-macro').text(displayData.macro);
          _this2.$('.frame').fadeIn();
        });

        var $editDisplayModal = _this2.$('.edit-display-modal');
        new _editDisplayModal2.default($editDisplayModal, _this2.id, displayData).render();

        var $apiUsageModal = _this2.$('.api-usage-modal');
        new _apiUsageModal2.default($apiUsageModal, _this2.id, displayData).render();
      });
    }
  }]);

  return DisplayPage;
}(_page2.default);

exports.default = DisplayPage;

},{"../components/display":5,"../managers/display-manager":9,"../modals/api-usage-modal":12,"../modals/edit-display-modal":13,"./page":21}],18:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _display = require('../components/display');

var _display2 = _interopRequireDefault(_display);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HomePage = function () {
  function HomePage() {
    _classCallCheck(this, HomePage);

    this.$el = $('');
  }

  _createClass(HomePage, [{
    key: 'render',
    value: function render() {
      this.$el.html('\n      <header class="navbar navbar-static-top navbar-dark logged-out" style="border-radius: 0;">\n        <div class="pull-right">\n          <a href="#" class="btn btn-secondary sign-in">Sign in</a>\n        </div>\n        <a class="navbar-brand" href="/">BIGDOTS</a>\n        <div class="demo">\n          <div class="matrix" style="width: 650px; margin: auto;"></div>\n          <p style="font-size: 30px; margin: 30px 0;">A programmable LED display for... anything!</p>\n        </div>\n      </header>\n    ');

      var display = new _display2.default(this.$el.find('.matrix'), '-KQBqz3I3aSMgWvPQKxz');
      display.load(650, { width: 128, height: 32 }, function () {
        // Something...
      });
    }
  }]);

  return HomePage;
}();

exports.default = HomePage;

},{"../components/display":5}],19:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _page = require('./page');

var _page2 = _interopRequireDefault(_page);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var HowToBuildADisplayPage = function (_Page) {
  _inherits(HowToBuildADisplayPage, _Page);

  function HowToBuildADisplayPage() {
    _classCallCheck(this, HowToBuildADisplayPage);

    return _possibleConstructorReturn(this, (HowToBuildADisplayPage.__proto__ || Object.getPrototypeOf(HowToBuildADisplayPage)).apply(this, arguments));
  }

  _createClass(HowToBuildADisplayPage, [{
    key: 'render',
    value: function render() {
      this.$el.html('\n      <div class="container-fluid">\n        <div class="row">\n          <div class="col-lg-6 offset-lg-3" style="margin-top: 100px;">\n            <h1>How To Build An LED Display</h1>\n            <p>Taking it to the next level is easy, let\'s get going..</p>\n            <hr style="margin-bottom: 40px;" />\n            <h4 style="margin: 20px 0;">You will need...</h4>\n            <ul>\n              <li>\n                <strong>At least one RBG LED board</strong>\n                <p>The <a href="http://www.adafruit.com/products/420">16x32</a> or <a href="#">32x32</a> model will work just fine. I would recommend chaining at least 3 together.</p>\n              </li>\n              <li>\n                <strong>Raspberry PI</strong>\n                <p>Sure the previous generation of pi will work, but if you want to update the LEDs as fast as possible, get the <a href="#">latest PI</a>.</p>\n              </li>\n              <li>\n                <strong>Female to Female wires</strong>\n                <p>These <a href="http://www.adafruit.com/products/266">wires</a> are for connecting the first LED board to the GPIO pins on your raspberry PI.</p>\n              </li>\n              <li>\n                <strong>Power supply</strong>\n                <p>You\'ll need a <a href="http://www.adafruit.com/products/276">5v</a> or 10v (if you have a 3 or more chained) powersupply to run your board(s).</p>\n              </li>\n              <li>\n                <strong>2.1mm to Screw Jack Adapter</strong>\n                <p>This <a href="http://www.adafruit.com/products/368">adapter</a> will connect your powersupply to your LED boards.</p>\n              </li>\n            </ul>\n            <h4 style="margin-top: 100px;">Wiring the first LED board to your raspberry PI</h4>\n            <p>Just following the wiring diagram below...</p>\n            <img src="http://placehold.it/350x150" style="width: 100%;">\n\n            <h4 style="margin-top: 100px;">Chaining your boards (if required)</h4>\n            <p>All the boards come with a ribbon cable and a power cable to be used for chaining. Follow the outline below to chain your boards.</p>\n            <img src="http://placehold.it/350x150" style="width: 100%;">\n\n            <h4 style="margin-top: 100px;">Connecting the power adapter to the LED board power cabled</h4>\n            <p>Just following the picture below...</p>\n            <img src="http://placehold.it/350x150" style="width: 100%;">\n\n            <h4 style="margin-top: 100px;">Installing BIGDOTS on your PI</h4>\n            <ol>\n              <li>\n                SSH into your raspberry PI\n              </li>\n              <li>\n                Clone the hardware client into your home directory\n<pre>\n$ cd\n$ git clone git@github.com:bigdots-io/hardware-client.git\n</pre>\n              </li>\n              <li>\n                Run the install script from the cloned directory\n<pre>\ncd hardware-client\nsudo ./install.sh\n</pre>\n              </li>\n              <li>\n                Using an editor, add a <strong>display-config.json</strong> file.\n              <pre>\n{\n  "display": "YOUR DISPLAY ID",\n  "rows": 32,\n  "chains": 3,\n  "parallel": 1\n}\n              </pre>\n              </li>\n              <li>\n                To start the client run..\n                <pre>\nsudo start hardware-client\n                </pre>\n                ...or simple restart the raspberry PI.\n              </li>\n            </ol>\n          </div>\n        </div>\n      </div>\n    ');
    }
  }]);

  return HowToBuildADisplayPage;
}(_page2.default);

exports.default = HowToBuildADisplayPage;

},{"./page":21}],20:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _macroManager = require('../managers/macro-manager');

var _macroManager2 = _interopRequireDefault(_macroManager);

var _page = require('./page');

var _page2 = _interopRequireDefault(_page);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var macroManager = new _macroManager2.default();

var InstallMacrosPage = function (_Page) {
  _inherits(InstallMacrosPage, _Page);

  function InstallMacrosPage() {
    _classCallCheck(this, InstallMacrosPage);

    return _possibleConstructorReturn(this, (InstallMacrosPage.__proto__ || Object.getPrototypeOf(InstallMacrosPage)).apply(this, arguments));
  }

  _createClass(InstallMacrosPage, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      this.$el.html('\n      <h1>Macros</h1>\n      <hr />\n      <div class="container-fluid">\n        <div class="row list-group"></div>\n      </div>\n    ');

      var availableMacros = macroManager.getAvailableMacros();

      for (var key in availableMacros) {
        var macro = availableMacros[key];
        this.$el.find('.list-group').append('\n        <div class="list-group-item list-group-item-action">\n          <a href="#" class="btn btn-success pull-right install-macro" data-macro="' + key + '">Install</a>\n          <h5 class="list-group-item-heading">' + macro.name + '</h5>\n          <p class="list-group-item-text">' + macro.description + '</p>\n        </div>\n      ');
      }

      this.$el.find('.install-macro').click(function (ev) {
        ev.preventDefault();

        var $el = $(this),
            key = $el.data('macro'),
            config = availableMacros[key];

        macroManager.install(key, config, function () {
          $el.hide();
        });
      });

      macroManager.getInstalledMacros(function (macros) {
        for (var _key in macros) {
          _this2.$el.find('.install-macro[data-macro=' + _key + ']').hide();
        }
      });
    }
  }]);

  return InstallMacrosPage;
}(_page2.default);

exports.default = InstallMacrosPage;

},{"../managers/macro-manager":10,"./page":21}],21:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Page = function () {
  function Page() {
    _classCallCheck(this, Page);

    this.$el = $('#page');
  }

  _createClass(Page, [{
    key: '$',
    value: function $(selector) {
      return this.$el.find(selector);
    }
  }]);

  return Page;
}();

exports.default = Page;

},{}],22:[function(require,module,exports){
"use strict";

var MacroLibrary = require('macro-library');

var macroLibrary = new MacroLibrary();
macroLibrary.registerMacros();

class DisplayCoupler {
  constructor(db) {
    this.db = db;
    this.startingUp = true;
  }

  static registeredMacros() {
    return macroLibrary.registeredMacros();
  }

  startUp({dimensions, callbacks}) {
    this.activateMacro = macroLibrary.loadMacro('start-up', {
      dimensions: dimensions,
      callbacks: callbacks
    });
    this.activateMacro.start();
  }

  demo(displayConfig, callbacks) {
    var next = () => {
      var macro = displayConfig.macro,
          options = {
            config: displayConfig.macroConfig || {},
            dimensions: {
              width: displayConfig.width,
              height: displayConfig.height
            },
            callbacks: {
              onPixelChange: (y, x, hex) => {
                callbacks.onPixelChange(y, x, hex, displayConfig);
              }
            }
          };

      if(this.activateMacro) {
        this.activateMacro.stop();
      }
      this.activateMacro = macroLibrary.loadMacro(macro, options);
      this.activateMacro.start();
    };

    if(this.startingUp) {
      callbacks.onReady(displayConfig, () => {
        this.startingUp = false;
        next();
      });
    } else {
      next()
    }
  }

  connect(displayKey, callbacks) {
    this.db.ref(`displays/${displayKey}/`).on('value', (snapshot) => {
      var displayData = snapshot.val();

      var next = () => {
        var macro = displayData.macro,
            options = {
              config: displayData.macroConfig || {},
              dimensions: {
                width: displayData.width,
                height: displayData.height
              },
              db: this.db,
              callbacks: {
                onPixelChange: (y, x, hex) => {
                  callbacks.onPixelChange(y, x, hex, displayData);
                }
              }
            };

        if(macro === "programmable") {
          options.config.matrix = displayData.matrix;
        }

        if(this.activateMacro) {
          this.activateMacro.stop();
        }
        this.activateMacro = macroLibrary.loadMacro(macro, options);
        this.activateMacro.start();
      };

      if(this.startingUp) {
        callbacks.onReady(displayData, () => {
          this.startingUp = false;
          next();
        });
      } else {
        next()
      }
    });
  }
}

module.exports = DisplayCoupler;

},{"macro-library":23}],23:[function(require,module,exports){
"use strict";

var ProgrammableMacro = require('./macros/programmable'),
    TwinkleMacro = require('./macros/twinkle'),
    StartUpMacro = require('./macros/start-up'),
    SolidColorMacro = require('./macros/solid-color'),
    UnsupportedMacro = require('./macros/unsupported');

var MacroConfig = require('./macro-config');

class MacroLibrary {
  constructor() {
    this.Macros = {};
  }

  registerMacros() {
    this.Macros[ProgrammableMacro.identifier] = ProgrammableMacro;
    this.Macros[TwinkleMacro.identifier] = TwinkleMacro;
    this.Macros[StartUpMacro.identifier] = StartUpMacro;
    this.Macros[SolidColorMacro.identifier] = SolidColorMacro;
  }

  availableMacros() {
    return MacroConfig;
  }

  loadMacro(name, options) {
    var Macro = this.Macros[name] || UnsupportedMacro;
    return new Macro(options);
  }
}

module.exports = MacroLibrary;

},{"./macro-config":24,"./macros/programmable":26,"./macros/solid-color":27,"./macros/start-up":28,"./macros/twinkle":29,"./macros/unsupported":30}],24:[function(require,module,exports){
module.exports={
  "twinkle": {
    "name": "Twinkle",
    "description": "Choose a color and randomly toggle the brightness of each LED on the board."
  },
  "programmable": {
    "name": "Programmable",
    "description": "Update each LED via a restful interface programmatically."
  },
  "solid-color": {
    "name": "Solid Color",
    "description": "Fill the board with one solid color."
  },
  "start-up": {
    "name": "Start up",
    "description": "The starting up animation"
  },
  "unsupported": {
    "name": "Unsupported",
    "description": "When a macro can't be found, this is macro is used"
  }
}

},{}],25:[function(require,module,exports){
"use strict";

class Macro {
  constructor({config, dimensions, db, callbacks}) {
    this.config = config;
    this.dimensions = dimensions;
    this.db = db;
    this.callbacks = callbacks;

    if(!this.constructor.identifier) {
      throw new Error("A macro is missing it's class identifier function");
    } else {
      if(!this.start) {
        throw new Error(`${this.identifier()} did not implement a start method`);
      }

      if(!this.stop) {
        throw new Error(`${this.identifier()} did not implement a stop method`);
      }
    }
  }

  setColor(color) {
    var height = this.dimensions.height,
        width = this.dimensions.width;
        
    for(var y = 0; y < height; y++) {
      for(var x = 0; x < width; x++) {
        this.callbacks.onPixelChange(y, x, color);
      }
    }
  }
}

module.exports = Macro;

},{}],26:[function(require,module,exports){
"use strict";

var Macro = require('./macro');

const identifier = 'programmable';

class ProgrammableMacro extends Macro {
  static get identifier() {
    return identifier;
  }

  start() {
    var matrixKey = this.config.matrix;
    this.matrixRef = this.db.ref(`matrices/${matrixKey}`);
    this.matrixRef.once('value').then((snapshot) => {
      var data = snapshot.val();

      for(let key in snapshot.val()) {
        var hex = data[key].hex,
            [y, x] = key.split(':');

        this.callbacks.onPixelChange(y, x, hex);
      }
    });

    this.childChangedCallback = this.matrixRef.on('child_changed', (snapshot) => {
      var hex = snapshot.val().hex,
          [y, x] = snapshot.key.split(':');

      this.callbacks.onPixelChange(y, x, hex);
    });
  }

  stop() {
    this.matrixRef.off('child_changed', this.childChangedCallback);
  }
}

module.exports = ProgrammableMacro;

},{"./macro":25}],27:[function(require,module,exports){
"use strict";

var Macro = require('./macro');

const identifier = 'solid-color';

class SolidColorMacro extends Macro {
  static get identifier() {
    return identifier;
  }

  start() {
    var config = this.config || this.defaultConfig();

    var height = this.dimensions.height,
        width = this.dimensions.width,
        color = this.config.color;

    for(var y = 0; y < height; y++) {
      for(var x = 0; x < width; x++) {
        this.callbacks.onPixelChange(y, x, color);
      }
    }
  }

  stop() {
    // nothing...
  }
}

module.exports = SolidColorMacro;

},{"./macro":25}],28:[function(require,module,exports){
"use strict";

var Macro = require('./macro');

const identifier = 'start-up';

class StartUpMacro extends Macro {
  static get identifier() {
    return identifier;
  }

  start() {
    this.setColor('#000000');

    this.frameIndex = 0;
    this.interval = setInterval(() => {
      for (let key in frames[this.frameIndex]) {
        var [y, x] = key.split(':'),
            hex = frames[this.frameIndex][key].hex;
        this.callbacks.onPixelChange(y, x, hex);
      }

      if(this.frameIndex == frames.length - 1) {
        this.frameIndex = 0;
      } else {
        this.frameIndex = this.frameIndex + 1;
      }

    }, 100);
  }

  stop() {
    clearInterval(this.interval);
  }
}

var frames = [
  {
    '0:0': {hex: '#990000'},
    '0:1': {hex: '#000000'},
    '0:2': {hex: '#000000'},
    '0:3': {hex: '#000000'},
    '0:4': {hex: '#000000'},
    '0:5': {hex: '#000000'},
    '0:6': {hex: '#000000'},
    '0:7': {hex: '#000000'}
  }, {
    '0:0': {hex: '#990000'},
    '0:1': {hex: '#CC4400'},
    '0:2': {hex: '#000000'},
    '0:3': {hex: '#000000'},
    '0:4': {hex: '#000000'},
    '0:5': {hex: '#000000'},
    '0:6': {hex: '#000000'},
    '0:7': {hex: '#000000'}
  }, {
    '0:0': {hex: '#990000'},
    '0:1': {hex: '#CC4400'},
    '0:2': {hex: '#FFAA00'},
    '0:3': {hex: '#000000'},
    '0:4': {hex: '#000000'},
    '0:5': {hex: '#000000'},
    '0:6': {hex: '#000000'},
    '0:7': {hex: '#000000'}
  }, {
    '0:0': {hex: '#990000'},
    '0:1': {hex: '#CC4400'},
    '0:2': {hex: '#FFAA00'},
    '0:3': {hex: '#CCCC00'},
    '0:4': {hex: '#000000'},
    '0:5': {hex: '#000000'},
    '0:6': {hex: '#000000'},
    '0:7': {hex: '#000000'}
  }, {
    '0:0': {hex: '#990000'},
    '0:1': {hex: '#CC4400'},
    '0:2': {hex: '#FFAA00'},
    '0:3': {hex: '#CCCC00'},
    '0:4': {hex: '#88CC00'},
    '0:5': {hex: '#000000'},
    '0:6': {hex: '#000000'},
    '0:7': {hex: '#000000'}
  }, {
    '0:0': {hex: '#990000'},
    '0:1': {hex: '#CC4400'},
    '0:2': {hex: '#FFAA00'},
    '0:3': {hex: '#CCCC00'},
    '0:4': {hex: '#88CC00'},
    '0:5': {hex: '#00CC88'},
    '0:6': {hex: '#000000'},
    '0:7': {hex: '#000000'}
  }, {
    '0:0': {hex: '#990000'},
    '0:1': {hex: '#CC4400'},
    '0:2': {hex: '#FFAA00'},
    '0:3': {hex: '#CCCC00'},
    '0:4': {hex: '#88CC00'},
    '0:5': {hex: '#00CC88'},
    '0:6': {hex: '#0066CC'},
    '0:7': {hex: '#000000'}
  }, {
    '0:0': {hex: '#990000'},
    '0:1': {hex: '#CC4400'},
    '0:2': {hex: '#FFAA00'},
    '0:3': {hex: '#CCCC00'},
    '0:4': {hex: '#88CC00'},
    '0:5': {hex: '#00CC88'},
    '0:6': {hex: '#0066CC'},
    '0:7': {hex: '#CC00CC'}
  }
];

module.exports = StartUpMacro;

},{"./macro":25}],29:[function(require,module,exports){
"use strict";

var Macro = require('./macro');

const identifier = 'twinkle';

class TwinkleMacro extends Macro {
  static get identifier() {
    return identifier;
  }

  start() {
    var height = this.dimensions.height,
        width = this.dimensions.width,
        seedColor = this.config.seedColor;

    for(var y = 0; y < height; y++) {
      for(var x = 0; x < width; x++) {
        this.callbacks.onPixelChange(y, x, generateColorShade(seedColor));
      }
    }

    this.interval = setInterval(() => {
      for(let i = 0; i < 100; i++) {
        var y = Math.floor(Math.random() * ((height - 1) - 0 + 1)) + 0;
        var x = Math.floor(Math.random() * ((width - 1) - 0 + 1)) + 0;
        this.callbacks.onPixelChange(y, x, generateColorShade(seedColor));
      }
    }, 100)
  }

  stop() {
    clearInterval(this.interval);
  }
}

function generateColorShade(seedColor) {
  var colors = [];

  colors.push(colorLuminance(seedColor, 0))
  colors.push(colorLuminance(seedColor, -0.5))
  colors.push(colorLuminance(seedColor, -0.8))
  colors.push(colorLuminance(seedColor, -0.8))
  colors.push(colorLuminance(seedColor, -0.8))
  colors.push(colorLuminance(seedColor, -1))

  var index = Math.floor(Math.random() * (5 - 0 + 1)) + 0;

  return colors[index];
}

function colorLuminance(hex, lum) {
	hex = String(hex).replace(/[^0-9a-f]/gi, '');
	if (hex.length < 6) {
		hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
	}
	lum = lum || 0;
	var rgb = "#", c, i;
	for (i = 0; i < 3; i++) {
		c = parseInt(hex.substr(i*2,2), 16);
		c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
		rgb += ("00"+c).substr(c.length);
	}
	return rgb;
}

module.exports = TwinkleMacro;

},{"./macro":25}],30:[function(require,module,exports){
"use strict";

var Macro = require('./macro');
var TypeWriter = require('typewriter');

const identifier = 'unsupported';

class UnsupportedMacro extends Macro {
  static get identifier() {
    return identifier;
  }

  start() {
    this.setColor('#000000');
    var typeWriter = new TypeWriter({ font: 'system-micro'});
    typeWriter.text("UNSUPPORTED", (item) => {
      this.callbacks.onPixelChange(item.y, item.x, '#FFFFFF');
    });
  }

  stop() {
    // Nothing..
  }
}

var data = [
  [1, 0],
  [2, 0],
  [3, 0],
  [4, 0]
];

module.exports = UnsupportedMacro;

},{"./macro":25,"typewriter":33}],31:[function(require,module,exports){
module.exports={
  "height": 14,
  "width": 6,
  "characters": {
    "0": {
      "coordinates": [
        {
          "y": 2,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 7,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 8,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 9,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 10,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 11,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 11,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 10,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 9,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 8,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 7,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 4,
          "opacity": 1
        }
      ]
    },
    "1": {
      "coordinates": [
        {
          "y": 12,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 11,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 10,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 9,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 8,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 7,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        }
      ]
    },
    "2": {
      "coordinates": [
        {
          "y": 2,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 10,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 11,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 7,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 8,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 9,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 5,
          "opacity": 1
        }
      ]
    },
    "3": {
      "coordinates": [
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 7,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 8,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 9,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 10,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 11,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 11,
          "x": 0,
          "opacity": 1
        }
      ]
    },
    "4": {
      "coordinates": [
        {
          "y": 1,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 7,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 8,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 9,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 10,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 11,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 4,
          "opacity": 1
        }
      ]
    },
    "5": {
      "coordinates": [
        {
          "y": 1,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 7,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 8,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 9,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 10,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 11,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 11,
          "x": 0,
          "opacity": 1
        }
      ]
    },
    "6": {
      "coordinates": [
        {
          "y": 2,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 7,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 8,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 9,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 10,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 11,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 11,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 10,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 9,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 8,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 7,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 1,
          "opacity": 1
        }
      ]
    },
    "7": {
      "coordinates": [
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 7,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 8,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 9,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 10,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 11,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 2,
          "opacity": 1
        }
      ]
    },
    "8": {
      "coordinates": [
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 7,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 8,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 9,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 10,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 11,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 11,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 10,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 9,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 8,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 7,
          "x": 0,
          "opacity": 1
        }
      ]
    },
    "9": {
      "coordinates": [
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 6,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 7,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 8,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 9,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 10,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 11,
          "x": 5,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 11,
          "x": 0,
          "opacity": 1
        }
      ]
    },
    ",": {
      "width": 3,
      "coordinates": [
        {
          "y": 13,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 12,
          "x": 1,
          "opacity": 1
        }
      ]
    }
  }
}

},{}],32:[function(require,module,exports){
module.exports={
  "height": 6,
  "width": 5,
  "characters": {
    "0": {
      "coordinates": [
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 3,
          "opacity": 1
        }
      ]
    },
    "1": {
      "coordinates": [
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        }
      ]
    },
    "2": {
      "coordinates": [
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 3,
          "opacity": 1
        }
      ]
    },
    "3": {
      "coordinates": [
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        }
      ]
    },
    "4": {
      "coordinates": [
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        }
      ]
    },
    "5": {
      "coordinates": [
        {
          "y": 0,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        }
      ]
    },
    "6": {
      "coordinates": [
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        }
      ]
    },
    "7": {
      "coordinates": [
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 4,
          "opacity": 1
        }
      ]
    },
    "8": {
      "coordinates": [
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 4,
          "opacity": 1
        }
      ]
    },
    "9": {
      "coordinates": [
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        }
      ]
    },
    "R": {
      "coordinates": [
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 1,
          "opacity": 1
        }
      ]
    },
    "Y": {
      "coordinates": [
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 4,
          "opacity": 1
        }
      ]
    },
    "O": {
      "coordinates": [
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        }
      ]
    },
    "U": {
      "coordinates": [
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 4,
          "opacity": 1
        }
      ]
    },
    "N": {
      "coordinates": [
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 4,
          "opacity": 1
        }
      ]
    },
    "S": {
      "coordinates": [
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        }
      ]
    },
    "P": {
      "coordinates": [
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        }
      ]
    },
    "T": {
      "coordinates": [
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 4,
          "opacity": 1
        }
      ]
    },
    "A": {
      "coordinates": [
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        }
      ]
    },
    "B": {
      "coordinates": [
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        }
      ]
    },
    "C": {
      "coordinates": [
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        }
      ]
    },
    "D": {
      "coordinates": [
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        }
      ]
    },
    "E": {
      "coordinates": [
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        }
      ]
    },
    "F": {
      "coordinates": [
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        }
      ]
    },
    "G": {
      "coordinates": [
        {
          "y": 3,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        }
      ]
    },
    "H": {
      "coordinates": [
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 4,
          "opacity": 1
        }
      ]
    },
    "I": {
      "coordinates": [
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 4,
          "opacity": 1
        }
      ]
    },
    "J": {
      "coordinates": [
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        }
      ]
    },
    "K": {
      "coordinates": [
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 4,
          "opacity": 1
        }
      ]
    },
    "M": {
      "coordinates": [
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        }
      ]
    },
    "Q": {
      "coordinates": [
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        }
      ]
    },
    "V": {
      "coordinates": [
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 4,
          "opacity": 1
        }
      ]
    },
    "L": {
      "coordinates": [
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        }
      ]
    },
    "W": {
      "coordinates": [
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 4,
          "opacity": 1
        }
      ]
    },
    "X": {
      "coordinates": [
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 1,
          "opacity": 1
        }
      ]
    },
    "Z": {
      "coordinates": [
        {
          "y": 0,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 0,
          "opacity": 1
        },
        {
          "y": 4,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 3,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 2,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 1,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 1,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 2,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 3,
          "opacity": 1
        },
        {
          "y": 5,
          "x": 4,
          "opacity": 1
        },
        {
          "y": 0,
          "x": 4,
          "opacity": 1
        }
      ]
    }
  }
}

},{}],33:[function(require,module,exports){
"use strict";

var Fonts = {
  'system-micro': require('./fonts/system-micro'),
  'system-medium': require('./fonts/system-medium')
};

class TypeWriter {
  constructor(options) {
    options = options || {};
    debugger
    this.font = options.font;
    this.column = options.startingColumn || 0;
    this.row = options.startingRow || 0;
    this.spaceBetweenLetters = options.spaceBetweenLetters || 1;
    this.alignment = options.alignment || 'left';
  }

  text(copy, callback) {
    var font = Fonts[this.font],
        characters = font.characters;

    if(this.alignment === 'left') {
      for (let i = 0; i < copy.length; i++) {
        var character = characters[copy[i]],
            coordinates = character.coordinates;

        if(coordinates) {
          coordinates.forEach((point) => {
            callback({
              y: this.row + point.y,
              x: this.column + point.x
            });
          });

          var width = character.width || font.width;
          this.column = this.column + width + this.spaceBetweenLetters;
        }
      }
    } else {
      this.column -= characters[copy[copy.length - 1]].width || font.width;
      for (let i = copy.length - 1; i >= 0; i--) {
        var character = characters[copy[i]],
            coordinates = character.coordinates;

        if(coordinates) {
          coordinates.forEach((point) => {
            callback({
              y: this.row + point.y,
              x: this.column + point.x
            });
          });

          var width = character.width || font.width;
          this.column = this.column - width - this.spaceBetweenLetters;
        }
      }
    }
  }
}

module.exports = TypeWriter;

},{"./fonts/system-medium":31,"./fonts/system-micro":32}]},{},[8])


//# sourceMappingURL=logged-in.bundle.js.map
