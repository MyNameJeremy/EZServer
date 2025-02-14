'use strict';
//#region imports and global const's
const { createServer } = require('node:http');

const { Parameters } = require('./src/parameters.js');
const {
  LOG,
  WRN,
  ERR,
  getResFunction,
  addResFunctionWithParams,
  getResFunctionWithParams,
  buildRes,
  throw404,
  getType,
  serveFromFS,
  getBodyJSON,
} = require('./src/utils.js');

const http_methods = { GET: 'GET', HEAD: 'HEAD', POST: 'POST', PUT: 'PUT', DELETE: 'DELETE', CONNECT: 'CONNECT', OPTIONS: 'OPTIONS', TRACE: 'TRACE', PATCH: 'PATCH' };

//#endregion

class App {
  /** @type {Server}*/
  m_http_server;

  //#region resolverLUT data objects
  //#region endpoints
  //#region without param
  /**@type {Object.<string, Object.<string, resFunction>>} */
  m_rest_endpoints = {
    /** @type {resolverLUT} */
    GET: {},
    /** @type {resolverLUT} */
    HEAD: {},
    /** @type {resolverLUT} */
    POST: {},
    /** @type {resolverLUT} */
    PUT: {},
    /** @type {resolverLUT} */
    DELETE: {},
    /** @type {resolverLUT} */
    CONNECT: {},
    /** @type {resolverLUT} */
    OPTIONS: {},
    /** @type {resolverLUT} */
    TRACE: {},
    /** @type {resolverLUT} */
    PATCH: {},
  };

  /** @type {resolverLUT} */
  m_endpoints = {};
  //#endregion

  //#region with param
  m_rest_endpoints_with_params = {
    /** @type {resolverLUT} */
    GET: {},
    /** @type {resolverLUT} */
    HEAD: {},
    /** @type {resolverLUT} */
    POST: {},
    /** @type {resolverLUT} */
    PUT: {},
    /** @type {resolverLUT} */
    DELETE: {},
    /** @type {resolverLUT} */
    CONNECT: {},
    /** @type {resolverLUT} */
    OPTIONS: {},
    /** @type {resolverLUT} */
    TRACE: {},
    /** @type {resolverLUT} */
    PATCH: {},
  };

  m_endpoints_with_params = {};
  //#endregion
  //#endregion

  //#region routs
  /**@type {Object.<string, Object.<string, resFunction>>} */
  m_rest_routes = {
    /** @type {resolverLUT} */
    GET: {},
    /** @type {resolverLUT} */
    HEAD: {},
    /** @type {resolverLUT} */
    POST: {},
    /** @type {resolverLUT} */
    PUT: {},
    /** @type {resolverLUT} */
    DELETE: {},
    /** @type {resolverLUT} */
    CONNECT: {},
    /** @type {resolverLUT} */
    OPTIONS: {},
    /** @type {resolverLUT} */
    TRACE: {},
    /** @type {resolverLUT} */
    PATCH: {},
  };

  /** @type {resolverLUT} */
  m_routs = {};
  //#endregion

  //#region general functions
  /**@type {Object.<string, Object.<string, resFunction>>} */
  m_generic_rest_functions = {
    /** @type {resolverLUT} */
    GET: {},
    /** @type {resolverLUT} */
    HEAD: {},
    /** @type {resolverLUT} */
    POST: {},
    /** @type {resolverLUT} */
    PUT: {},
    /** @type {resolverLUT} */
    DELETE: {},
    /** @type {resolverLUT} */
    CONNECT: {},
    /** @type {resolverLUT} */
    OPTIONS: {},
    /** @type {resolverLUT} */
    TRACE: {},
    /** @type {resolverLUT} */
    PATCH: {},
  };

  /** @type {resolverLUT}*/
  m_generic_functions = {};
  //#endregion
  //#endregion

  constructor() {
    this.m_http_server = createServer((req, res) => {
      const parameters = new Parameters();

      const [uri, query_str] = decodeURIComponent(req.url).split('?');
      Object.defineProperty(req, 'uri', { value: uri });
      if (query_str) parameters.m_add_query(query_str);

      (
        this.m_rest_endpoint(req) ||
        this.m_endpoint(req) ||
        this.m_rest_endpoint_with_param(req, parameters) ||
        this.m_endpoint_with_param(req, parameters) ||
        this.m_rest_route(req) ||
        this.m_route(req) ||
        this.m_404
      )(req, res, parameters);
    });
  }

  //#region functions
  //#region node:http server functions
  /**
   * @param {number|string} port port the server will listen on
   * @returns {void}
   */
  listen(port) {
    this.m_http_server.listen(port, () => LOG(`server listening on port ${port}`));
  }

  /** @returns {void} */
  close() {
    this.m_http_server.close((err) => (err ? ERR("server couldn't be closed") : WRN('server was closed')));
  }
  //#endregion

  //#region endpoints
  //#region rest endpoints
  /**
   * @param {string} route route to resolve
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean} wether the function was successfully registered
   */
  get(route, fn) {
    LOG('added get:', route);
    this.m_edpoint_addition_helper(this.m_rest_endpoints.GET, this.m_rest_endpoints_with_params.GET, route, fn);
  }

  /**
   * @param {string} route route to resolve
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean} wether the function was successfully registered
   */
  head(route, fn) {
    LOG('added head:', route);
    this.m_edpoint_addition_helper(this.m_rest_endpoints.HEAD, this.m_rest_endpoints_with_params.HEAD, route, fn);
  }

  /**
   * @param {string} route route to resolve
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean} wether the function was successfully registered
   */
  post(route, fn) {
    LOG('added post:', route);
    this.m_edpoint_addition_helper(this.m_rest_endpoints.POST, this.m_rest_endpoints_with_params.POST, route, fn);
  }

  /**
   * @param {string} route route to resolve
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean} wether the function was successfully registered
   */
  put(route, fn) {
    LOG('added put:', route);
    this.m_edpoint_addition_helper(this.m_rest_endpoints.PUT, this.m_rest_endpoints_with_params.PUT, route, fn);
  }

  /**
   * @param {string} route route to resolve
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean} wether the function was successfully registered
   */
  delete(route, fn) {
    LOG('added delete:', route);
    this.m_edpoint_addition_helper(this.m_rest_endpoints.DELETE, this.m_rest_endpoints_with_params.DELETE, route, fn);
  }

  /**
   * @param {string} route route to resolve
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean} wether the function was successfully registered
   */
  connect(route, fn) {
    LOG('added connect:', route);
    this.m_edpoint_addition_helper(this.m_rest_endpoints.CONNECT, this.m_rest_endpoints_with_params.CONNECT, route, fn);
  }

  /**
   * @param {string} route route to resolve
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean} wether the function was successfully registered
   */
  options(route, fn) {
    LOG('added options:', route);
    this.m_edpoint_addition_helper(this.m_rest_endpoints.OPTIONS, this.m_rest_endpoints_with_params.OPTIONS, route, fn);
  }

  /**
   * @param {string} route route to resolve
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean} wether the function was successfully registered
   */
  trace(route, fn) {
    LOG('added trace:', route);
    this.m_edpoint_addition_helper(this.m_rest_endpoints.TRACE, this.m_rest_endpoints_with_params.TRACE, route, fn);
  }

  /**
   * @param {string} route route to resolve
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean} wether the function was successfully registered
   */
  patch(route, fn) {
    LOG('added patch:', route);
    this.m_edpoint_addition_helper(this.m_rest_endpoints.PATCH, this.m_rest_endpoints_with_params.PATCH, route, fn);
  }

  /**
   * @param {IncomingMessage}
   * @returns {resFunction | false}
   */
  m_rest_endpoint({ uri, method }) {
    return method in http_methods ? this.m_rest_endpoints[method][uri] : !!WRN('invalid request method');
  }

  /**
   * @param {IncomingMessage}
   * @param {Parameters} parameters
   * @returns {resFunction | false}
   */
  m_rest_endpoint_with_param({ uri, method }, parameters) {
    return method in http_methods ? getResFunctionWithParams(uri, this.m_rest_endpoints_with_params[method], parameters) : !!WRN('invalid request method');
  }
  //#endregion

  //#region non rest endpoints
  /**
   * @param {string} route route to resolve
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean} wether the function was successfully registered
   */
  add(route, fn) {
    LOG('added:', route);
    this.m_edpoint_addition_helper(this.m_endpoints, this.m_endpoints_with_params, route, fn);
  }

  /**
   * @param {IncomingMessage}
   * @returns {resFunction | false}
   */
  m_endpoint({ uri }) {
    return this.m_endpoints.hasOwnProperty(uri) ? this.m_endpoints[uri] : false;
  }

  /**
   * @param {IncomingMessage}
   * @param {Parameters}
   * @returns {resFunction | false}
   */
  m_endpoint_with_param({ uri }, parameters) {
    return getResFunctionWithParams(uri, this.m_endpoints_with_params, parameters);
  }
  //#endregion
  //#endregion

  //#region routs
  //#region rest routs
  /**
   * @param {string} method http-method of the request
   * @param {string} route start of the route to resolve
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean} wether the function was successfully registered
   */
  addRestRoute(method, route, fn) {
    const m = method.toUpperCase();
    if (!http_methods.hasOwnProperty(m)) return !!WRN('invalid method', m);

    LOG('adding rest-route for method ' + m, route);
    return !!(this.m_rest_routes[m][route] = fn);
  }

  /**
   * @param {IncomingMessage} req
   * @returns {(resFunction|false)}
   */
  m_rest_route(req) {
    return http_methods.hasOwnProperty(req.method) ? getResFunction(req, this.m_rest_routes[req.method]) : !!WRN('invalid request method');
  }
  //#endregion

  //#region non rest endpoints
  /**
   * @param {string} route start of the route to resolve
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean} wether the function was successfully registered
   */
  addRoute(route, fn) {
    LOG('adding route', route);
    return !!(this.m_routs[route] = fn);
  }

  /**
   * @param {IncomingMessage} req
   * @returns {(resFunction|false)}
   */
  m_route(req) {
    return getResFunction(req, this.m_routs);
  }
  //#endregion
  //#endregion

  //#region generic functions
  //#region generic rest functions
  /**
   * @param {string} method http-method
   * @param {string} functionName name of the generic function
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean} wether the function was successfully registered
   */
  addGenericRestFunction(method, functionName, fn) {
    const m = method.toUpperCase();
    if (!(m in http_methods)) return !!WRN('invalid method', m);
    if (!functionName) return !!WRN('invalid functionName', functionName);
    return LOG('adding generic rest function for method ' + method, functionName) || !(this.m_generic_rest_functions[m][functionName] = fn);
  }

  /**
   * @param {string} method http-method
   * @param {string} functionName name of the generic function
   * @param {string} route route to resolve
   * @param {boolean} isRoute wether to register a route or endpoint
   * @returns {boolean} wether the function was successfully registered
   */
  useGenericRestFunction(method, functionName, route, isRoute = false) {
    const m = method.toUpperCase();
    if (!(m in http_methods)) return !!WRN('invalid method', m);

    const fn = this.m_generic_rest_functions[m][functionName];
    if (!fn) return !!WRN('invalid function name');

    return !!(isRoute ? (this.m_rest_routes[m][route] = fn) : (this.m_rest_endpoints[m][route] = fn));
  }
  //#endregion

  //#region generic non rest functions
  /**
   * @param {string} functionName name of the generic function
   * @param {resFunction} fn function to resolve the request
   * @returns {boolean} wether the function was successfully registered
   */
  addGenericFunction(functionName, fn) {
    if (!functionName) return !!WRN('invalid functionName', functionName);
    return !!(this.m_generic_functions[functionName] = fn);
  }

  /**
   * @param {string} functionName name of the generic function
   * @param {string} route route to resolve
   * @param {boolean} isRoute wether to register a route or endpoint
   * @returns {boolean} wether the function was successfully registered
   */
  useGenericFunction(functionName, route, isRoute = false) {
    const fn = this.m_generic_functions[functionName];
    if (!fn) return !!WRN('invalid function name');

    return !!(isRoute ? (this.m_routs[route] = fn) : (this.m_endpoints[route] = fn));
  }
  //#endregion
  //#endregion

  //#region helper
  /**
   *
   * @param {resolverLUT} lut_without_params
   * @param {resolverLUT} lut_with_params
   * @param {string} route
   * @param {resFunction} fn
   * @returns {boolean} wether the function was successfully registered
   */
  m_edpoint_addition_helper(lut_without_params, lut_with_params, route, fn) {
    if (route.includes('/:')) return !!addResFunctionWithParams(lut_with_params, route, fn);
    else return !!(lut_without_params[route] = fn);
  }
  //#endregion

  /** @type {resFunction} */
  m_404 = throw404;

  //#endregion
}

module.exports = { App, buildRes, getType, serveFromFS, getBodyJSON, throw404, HTTP_METHODS: http_methods };

//#region typedef's
/**
 * @typedef {import('http').Server} Server
 * @typedef {import('http').IncomingMessage} IncomingMessage
 * @typedef {import('http').ServerResponse} ServerResponse
 */

/**
 * @callback resFunction
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 * @param {Parameters} parameters
 * @returns {void}
 */

/** @typedef {Object.<string, resFunction>} resolverLUT */
//#endregion
