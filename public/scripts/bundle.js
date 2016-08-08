(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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
},{"_process":4,"path-to-regexp":2}],2:[function(require,module,exports){
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

},{"isarray":3}],3:[function(require,module,exports){
module.exports = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) == '[object Array]';
};

},{}],4:[function(require,module,exports){
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
    var timeout = cachedSetTimeout(cleanUpNextTick);
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
    cachedClearTimeout(timeout);
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
        cachedSetTimeout(drainQueue, 0);
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

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ColorPicker = function () {
  function ColorPicker($el) {
    _classCallCheck(this, ColorPicker);

    this.$el = $el;
  }

  _createClass(ColorPicker, [{
    key: 'render',
    value: function render() {
      var colors = ['#990000', '#CC4400', '#FFAA00', '#CCCC00', '#88CC00', '#00CC88', '#0066CC', '#CC00CC', '#000000'];
      this.$el.html('\n      <ul class="colors"></ul>\n    ');

      var $colors = this.$el.find('ul');
      colors.forEach(function (color) {
        var displayColor = color;

        if (color === '#000000') {
          displayColor = '#444444';
        }

        $colors.append('\n        <li>\n          <div class="color-selector" style="background-color: ' + displayColor + ';" data-hex="' + color + '"></div>\n        </li>\n      ');
      });

      this.$el.find('ul li:first-child').addClass('selected');
    }
  }, {
    key: 'attach',
    value: function attach(callback) {
      var _this = this;

      this.$el.find('ul.colors li').on("click", function (ev) {
        var $el = $(ev.currentTarget);
        _this.$el.find("ul.colors .selected").removeClass('selected');
        $el.addClass('selected');
        callback($el.find('.color-selector').data('hex'));
      });
    }
  }, {
    key: 'getSelectedColor',
    value: function getSelectedColor() {
      return $('ul.colors .selected .color-selector').data('hex');
    }
  }]);

  return ColorPicker;
}();

exports.default = ColorPicker;

},{}],6:[function(require,module,exports){
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

var ConnectedHardware = function () {
  function ConnectedHardware($el, ids) {
    _classCallCheck(this, ConnectedHardware);

    this.$el = $el;
    this.ids = ids;
  }

  _createClass(ConnectedHardware, [{
    key: 'render',
    value: function render() {
      var _this = this;

      this.$el.html('\n      <a href="#" class="btn btn-link" data-toggle="modal" data-target="#connected-hardware">\n        Connected Hardware\n        (' + this.ids.length + ')\n      </a>\n      <div id="connected-hardware" class="modal fade">\n        <div class="modal-dialog" role="document">\n          <div class="modal-content">\n            <div class="modal-header">\n              <button type="button" class="close" data-dismiss="modal" aria-label="Close">\n                <span aria-hidden="true">&times;</span>\n              </button>\n              <h4 class="modal-title">Connected Hardware</h4>\n            </div>\n            <div class="modal-body">\n              <ul class="hardware"></ul>\n            </div>\n          </div>\n        </div>\n      </div>\n    ');

      this.ids.forEach(function (id) {
        _this.$el.find('.hardware-count').html(_this.ids.count);
        var hardwareRef = new _resource2.default().hardware(id);
        hardwareRef.on('value', function (snapshot) {
          var hardware = snapshot.val();

          _this.$el.find('.hardware').append('\n          <li class="list-group-item">\n            <span class="label label-default label-pill pull-right">\n              ' + hardware.rows + 'x' + hardware.columns + '\n            </span>\n            ' + id + '\n          </li>\n        ');
        });
      });
    }
  }]);

  return ConnectedHardware;
}();

exports.default = ConnectedHardware;

},{"../lib/resource":10}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _colorPicker = require('./color-picker');

var _colorPicker2 = _interopRequireDefault(_colorPicker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MatrixControls = function () {
  function MatrixControls($el, displayData) {
    _classCallCheck(this, MatrixControls);

    this.$el = $el;
    this.displayData = displayData;
  }

  _createClass(MatrixControls, [{
    key: 'load',
    value: function load() {
      this.render();
      this.attach();
    }
  }, {
    key: 'render',
    value: function render() {
      this.$el.html('\n      <div style="height: 50px;">\n        <ul class="controls">\n          <li class="color-picker"></li>\n          <li>\n            <input type="range" min="0" max="100" value="' + this.displayData.brightness + '" id="brightness">\n          </li>\n        </ul>\n      </div>\n    ');

      this.colorPicker = new _colorPicker2.default($('.color-picker'));
      this.colorPicker.render();
    }
  }, {
    key: 'attach',
    value: function attach(callbacks) {
      this.colorPicker.attach(function (hex) {
        callbacks.onColorChange(hex);
      });

      this.$el.find('#brightness').on('change', function (ev) {
        var brightness = $(ev.currentTarget).val();
        callbacks.onBrightnessChange(brightness);
      });
    }
  }]);

  return MatrixControls;
}();

exports.default = MatrixControls;

},{"./color-picker":5}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _color = require('../lib/color');

var _color2 = _interopRequireDefault(_color);

var _resource = require('../lib/resource');

var _resource2 = _interopRequireDefault(_resource);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Matrix = function () {
  function Matrix($el) {
    _classCallCheck(this, Matrix);

    this.$el = $el;
  }

  _createClass(Matrix, [{
    key: 'load',
    value: function load(displayData, width, callback) {
      var _this = this;

      this.matrixKey = displayData.matrix;

      var matrixRef = new _resource2.default().matrix(this.matrixKey);

      matrixRef.once('value').then(function (snapshot) {
        _this.render(snapshot.val(), width, displayData);
        callback();
      });

      matrixRef.on('child_changed', function (snapshot) {
        var hex = snapshot.val().hex;

        var _snapshot$key$split = snapshot.key.split(':');

        var _snapshot$key$split2 = _slicedToArray(_snapshot$key$split, 2);

        var y = _snapshot$key$split2[0];
        var x = _snapshot$key$split2[1];


        _this.refreshPixelByCoordinates(y, x, hex);
      });
    }
  }, {
    key: 'render',
    value: function render(matrixData, width, displayData) {
      this.$el.html('');

      var adjustedBrightness = (50 + displayData.brightness / 2) / 100,
          size = (width - 20) / displayData.width;

      for (var y = 0; y < displayData.height; y++) {
        var $row = $('<div class="matrix-row" style="opacity: ' + adjustedBrightness + '; height: ' + size + 'px; line-height: ' + size + 'px;">');
        for (var x = 0; x < displayData.width; x++) {
          $row.append('\n          <span class="matrix-dot-wrapper" style="width: ' + size + 'px; height: ' + size + 'px;">\n            <div class="matrix-dot"\n                        data-y="' + y + '"\n                        data-x="' + x + '"\n                        style="background-color: ' + parseBackgroundColor(matrixData[y + ':' + x].hex) + '">\n          </span>\n        ');
        }
        this.$el.append($row);
      }
    }
  }, {
    key: 'attach',
    value: function attach(callbacks) {
      var _this2 = this;

      var dragging = false;
      this.$el.find('.matrix-dot').on("mousedown", function (ev) {
        dragging = true;

        _this2.updatePixelByElement($(ev.currentTarget), _this2.editColor);

        _this2.$el.find('.matrix-dot-wrapper').on("mouseenter", function (ev) {
          _this2.updatePixelByElement($(ev.currentTarget).find('.matrix-dot'), _this2.editColor);
        });
        _this2.$el.on('mouseup', function (evt) {
          dragging = false;
          $('.matrix-dot-wrapper').off("mouseenter");
        });
      });
    }
  }, {
    key: 'refreshPixelByCoordinates',
    value: function refreshPixelByCoordinates(y, x, hex) {
      var $el = $('[data-y=' + y + '][data-x=' + x + ']');
      updatePixelColor($el, hex);
    }
  }, {
    key: 'refreshBrightness',
    value: function refreshBrightness(brightness) {
      var adjustedBrightness = (50 + brightness / 2) / 100;
      this.$el.find('.display-row').css({ opacity: adjustedBrightness });
    }
  }, {
    key: 'updatePixelByElement',
    value: function updatePixelByElement($el, hex) {
      var _$el$data = $el.data();

      var y = _$el$data.y;
      var x = _$el$data.x;


      new _resource2.default().matrixPixel(this.matrixKey, y, x).set({
        hex: hex,
        updatedAt: Date.now()
      });

      updatePixelColor($el, hex);
    }
  }, {
    key: 'updateEditColor',
    value: function updateEditColor(hex) {
      this.editColor = hex;
    }
  }]);

  return Matrix;
}();

function updatePixelColor($el, hex) {
  $el.css({ backgroundColor: parseBackgroundColor(hex) });
}

function parseBackgroundColor(hex) {
  return hex === '#000000' ? '#444' : hex;
}

exports.default = Matrix;

},{"../lib/color":9,"../lib/resource":10}],9:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var Color = {
  shadeHex: function shadeHex(color, percent) {
    var f = parseInt(color.slice(1), 16),
        t = percent < 0 ? 0 : 255,
        p = percent < 0 ? percent * -1 : percent,
        R = f >> 16,
        G = f >> 8 & 0x00FF,
        B = f & 0x0000FF;
    return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
  }
};
exports.default = Color;

},{}],10:[function(require,module,exports){
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
    key: 'hardwares',
    value: function hardwares() {
      return firebase.database().ref('hardware');
    }
  }, {
    key: 'hardware',
    value: function hardware(id) {
      return firebase.database().ref('hardware/' + id);
    }
  }]);

  return Resource;
}();

exports.default = Resource;

},{}],11:[function(require,module,exports){
'use strict';

var _page = require('page');

var _page2 = _interopRequireDefault(_page);

var _display = require('./pages/display');

var _display2 = _interopRequireDefault(_display);

var _displayForm = require('./pages/display-form');

var _displayForm2 = _interopRequireDefault(_displayForm);

var _displayList = require('./pages/display-list');

var _displayList2 = _interopRequireDefault(_displayList);

var _home = require('./pages/home');

var _home2 = _interopRequireDefault(_home);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

firebase.initializeApp({
  apiKey: "AIzaSyANob4DbCBvpUU1PJjq6p77qpTwsMrcJfI",
  authDomain: "led-fiesta.firebaseapp.com",
  databaseURL: "https://led-fiesta.firebaseio.com",
  storageBucket: "led-fiesta.appspot.com"
});

(0, _page2.default)('/', function (ctx) {
  new _home2.default($('.page')).render();
});

(0, _page2.default)('/displays', function (ctx) {
  new _displayList2.default($('.page')).render();
});

(0, _page2.default)('/displays/new', function (ctx) {
  new _displayForm2.default($('.page')).render();
  $('select').select2();
});

(0, _page2.default)('/displays/:id', function (ctx) {
  new _display2.default($('.page'), {
    id: ctx.params.id
  }).render();
});

(0, _page2.default)();

},{"./pages/display":15,"./pages/display-form":13,"./pages/display-list":14,"./pages/home":16,"page":1}],12:[function(require,module,exports){
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
    value: function create(matrix, config, cb) {
      var matrixKey = firebase.database().ref('matrices').push().key,
          displayKey = firebase.database().ref('displays').push().key;

      config.matrix = matrixKey;

      new _resource2.default().matrix(matrixKey).set(matrix).then(function () {
        new _resource2.default().display(displayKey).set(config).then(function () {
          var _loop = function _loop(hardwareKey) {
            var hardwareRef = new _resource2.default().hardware(hardwareKey);

            hardwareRef.once('value').then(function (snapshot) {
              var hardware = snapshot.val();

              if (hardware.display) {
                var ref = new _resource2.default().displayConnectedHardware(hardware.display);
                var data = {};
                data[hardwareKey] = null;
                ref.update(data);
              }

              hardwareRef.update({ display: displayKey });

              cb(displayKey);
            });
          };

          for (var hardwareKey in config.connectedHardware) {
            _loop(hardwareKey);
          }
        });
      });
    }
  }]);

  return DisplayManager;
}();

exports.default = DisplayManager;

},{"../lib/resource":10}],13:[function(require,module,exports){
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

var DisplayForm = function () {
  function DisplayForm($el) {
    _classCallCheck(this, DisplayForm);

    this.$el = $el;
  }

  _createClass(DisplayForm, [{
    key: 'render',
    value: function render() {
      var _this = this;

      this.$el.html('\n      <h1>\n        Create a Display\n      </h1>\n      <hr />\n      <div class="row">\n        <div class="col-xs-12 col-sm-6">\n          <form>\n            <fieldset class="form-group">\n              <label for="name">Display name</label>\n              <input type="text" class="form-control" id="display-name" placeholder="My cool display" />\n              <small class="text-muted">This will function as a label</small>\n            </fieldset>\n            <div class="row">\n              <div class="col-xs-12 col-sm-6">\n                <fieldset class="form-group">\n                  <label for="display-width">Select width</label>\n                  <select class="form-control" id="display-width" name="width">\n                    <option value="16">16</option>\n                    <option value="32">32</option>\n                    <option value="64">64</option>\n                  </select>\n                </fieldset>\n              </div>\n              <div class="col-xs-12 col-sm-6">\n                <fieldset class="form-group">\n                  <label for="display-height">Select height</label>\n                  <select class="form-control" id="display-height" name="height">\n                    <option value="16">16</option>\n                    <option value="32">32</option>\n                    <option value="64">64</option>\n                  </select>\n                </fieldset>\n              </div>\n              <div class="col-xs-12">\n                <fieldset class="form-group">\n                  <label for="connect-hardware">Connect Hardware</label>\n                  <select class="form-control" id="connect-hardware" name="connect-hardware" multiple="multiple">\n                  </select>\n                </fieldset>\n              </div>\n            </div>\n            <button type="submit" class="btn btn-success pull-right">Create Matrix</button>\n          </form>\n        </div>\n      </div>\n    ');

      this.populateHardwareOptions();

      this.$el.find('form').submit(function (ev) {
        ev.preventDefault();

        var displayName = $('#display-name').val(),
            displayWidth = parseInt($('#display-width').val(), 10),
            displayHeight = parseInt($('#display-height').val(), 10),
            requestedHardware = _this.$el.find('select#connect-hardware').val();

        var matrixData = assembleMartix(displayWidth, displayHeight),
            connectedHardware = assembleHardware(requestedHardware);

        new _displayManager2.default().create(matrixData, {
          brightness: 100,
          name: displayName,
          width: displayWidth,
          height: displayHeight,
          connectedHardware: connectedHardware
        }, function (displayKey) {
          (0, _page2.default)('/displays/' + displayKey);
        });
      });
    }
  }, {
    key: 'populateHardwareOptions',
    value: function populateHardwareOptions() {
      var $hardwareSelect = this.$el.find('select#connect-hardware');

      new _resource2.default().hardwares().once('value').then(function (snapshot) {
        var hardwares = snapshot.val();

        for (var key in hardwares) {
          var width = hardwares[key].rows,
              height = hardwares[key].columns * hardwares[key].chains;

          $hardwareSelect.append('<option value=' + key + '>' + key + ' ' + width + 'x' + height + '</option>');
        }
      });
    }
  }]);

  return DisplayForm;
}();

function assembleHardware(hardwareKeys) {
  var hardware = {};

  hardwareKeys.forEach(function (key) {
    hardware[key] = true;
  });

  return hardware;
}

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

exports.default = DisplayForm;

},{"../lib/resource":10,"../managers/display-manager":12,"page":1}],14:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _resource = require('../lib/resource');

var _resource2 = _interopRequireDefault(_resource);

var _matrix = require('../components/matrix');

var _matrix2 = _interopRequireDefault(_matrix);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DisplayList = function () {
  function DisplayList($el) {
    _classCallCheck(this, DisplayList);

    this.$el = $el;
  }

  _createClass(DisplayList, [{
    key: 'render',
    value: function render() {
      var _this = this;

      this.$el.html('\n      <h1>\n        <a href="/displays/new" class="btn btn-primary pull-right">Add Display</a>\n        Displays\n      </h1>\n      <hr />\n      <div class="row list-group"></div>\n    ');

      var displaysRef = new _resource2.default().displays();
      displaysRef.once('value').then(function (snapshot) {
        var displays = snapshot.val();
        var connectedCount = Object.keys(displays['-KJYAuwg3nvgTdSaGUU9'].connectedHardware);
        for (var key in displays) {
          _this.$el.find('.list-group').append('\n          <div class="col-xs-12 col-sm-6 col-md-4 col-lg-3 col-xl-2">\n            <div class="card">\n              <div class="card-img-top">\n                <div data-matrix="' + displays[key].matrix + '"></div>\n              </div>\n              <div class="card-block">\n                <h4 class="card-title">' + displays[key].name + '</h4>\n                <p class="card-text">' + connectedCount.length + ' connected hardware</p>\n                <a href="/displays/' + key + '" class="btn btn-link">View / Edit</a>\n              </div>\n            </div>\n          </div>\n        ');
        }

        for (var _key in displays) {
          var $el = _this.$el.find('[data-matrix="' + displays[_key].matrix + '"]'),
              width = $el.parent().width();

          new _matrix2.default($el).load(displays[_key], width, function () {
            // Something?
          });
        }
      });
    }
  }]);

  return DisplayList;
}();

exports.default = DisplayList;

},{"../components/matrix":8,"../lib/resource":10}],15:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _matrix = require('../components/matrix');

var _matrix2 = _interopRequireDefault(_matrix);

var _matrixControls = require('../components/matrix-controls');

var _matrixControls2 = _interopRequireDefault(_matrixControls);

var _connectedHardware = require('../components/connected-hardware');

var _connectedHardware2 = _interopRequireDefault(_connectedHardware);

var _resource = require('../lib/resource');

var _resource2 = _interopRequireDefault(_resource);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Display = function () {
  function Display($el, config) {
    _classCallCheck(this, Display);

    this.id = config.id;
    this.$el = $el;
  }

  _createClass(Display, [{
    key: 'render',
    value: function render() {
      var _this = this;

      this.$el.html('\n      <div class="frame" style="display: none;">\n        <div class="matrix-controls"></div>\n        <div class=\'matrix\'></div>\n        <div class="display-meta">\n          <div class="connected-hardware pull-right"></div>\n          <h4 class="display-name text-left"></h4>\n        </div>\n      </div>\n    ');

      var matrix = new _matrix2.default(this.$el.find('.matrix'));

      var displayRef = new _resource2.default().display(this.id);
      displayRef.on('value', function (snapshot) {
        var displayData = snapshot.val();

        var matrixControls = new _matrixControls2.default(_this.$el.find('.matrix-controls'), displayData);
        matrixControls.render();
        matrixControls.attach({
          onBrightnessChange: function onBrightnessChange(brightness) {
            displayRef.update({ brightness: parseInt(brightness, 10) });
            matrix.refreshBrightness(brightness);
          },
          onColorChange: function onColorChange(color) {
            matrix.updateEditColor(color);
          }
        });

        matrix.load(displayData, $('.frame').width(), function () {
          _this.$el.find('.display-name').text(displayData.name);
          _this.$el.find('.frame').fadeIn();
          matrix.attach();
        });

        var hardwareKeys = [];
        for (var key in displayData.connectedHardware) {
          hardwareKeys.push(key);
        }

        var connectedHardware = new _connectedHardware2.default(_this.$el.find('.connected-hardware'), hardwareKeys);
        connectedHardware.render();
      });
    }
  }]);

  return Display;
}();

exports.default = Display;

},{"../components/connected-hardware":6,"../components/matrix":8,"../components/matrix-controls":7,"../lib/resource":10}],16:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Home = function () {
  function Home($el) {
    _classCallCheck(this, Home);

    this.$el = $el;
  }

  _createClass(Home, [{
    key: "render",
    value: function render() {
      this.$el.html("\n      <div class=\"jumbotron jumbotron-fluid\">\n        <div class=\"container\">\n          <h1 class=\"display-3\">Hello, world!</h1>\n          <p class=\"lead\">This is a simple hero unit, a simple jumbotron-style component for calling extra attention to featured content or information.</p>\n          <hr class=\"m-y-2\">\n          <p>It uses utility classes for typography and spacing to space content out within the larger container.</p>\n          <p class=\"lead\">\n            <a class=\"btn btn-primary btn-lg\" href=\"#\" role=\"button\">Learn more</a>\n          </p>\n        </div>\n      </div>\n    ");
    }
  }]);

  return Home;
}();

exports.default = Home;

},{}]},{},[11]);
