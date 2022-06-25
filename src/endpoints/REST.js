const { IncomingMessage } = require('http');

const { getRes } = require('./getRes');

class REST {
  /** @type {import('./index').resolvers} */
  GET = {};
  /** @type {import('./index').resolvers} */
  POST = {};
  /** @type {import('./index').resolvers} */
  PUT = {};
  /** @type {import('./index').resolvers} */
  DELETE = {};
  /** @type {import('./index').resolvers} */
  PATCH = {};

  /**
   * @param {string} route URL of the endpoint
   * @param {resFunction} fn
   */
  get(route, fn) {
    console.log('addet REST.get()', route);
    this.GET[route] = fn;
  }

  /**
   * @param {string} route URL of the endpoint
   * @param {resFunction} fn
   */
  post(route, fn) {
    console.log('addet REST.post()', route);
    this.POST[route] = fn;
  }

  /**
   * @param {string} route URL of the endpoint
   * @param {resFunction} fn
   */
  put(route, fn) {
    console.log('addet REST.put()', route);
    this.PUT[route] = fn;
  }

  /**
   * @param {string} route URL of the endpoint
   * @param {resFunction} fn
   */
  delete(route, fn) {
    console.log('addet REST.delete()', route);
    this.DELETE[route] = fn;
  }

  /**
   * @param {string} route URL of the endpoint
   * @param {resFunction} fn
   */
  patch(route, fn) {
    console.log('addet REST.patch()', route);
    this.PATCH[route] = fn;
  }

  /**
   * @returns {(resFunction|false)}
   */
  getRes(req) {
    switch (req.method) {
      case 'GET':
        return getRes(req, this.GET);
      case 'POST':
        return getRes(req, this.POST);
      case 'PUT':
        return getRes(req, this.PUT);
      case 'DELETE':
        return getRes(req, this.DELETE);
      case 'PATCH':
        return getRes(req, this.PATCH);
    }
    return false;
  }
}

/**
 * @param {IncomingMessage} req
 * @return {Promise<{json: Object<string, any>, http_code: number}>}
 */
function getBodyJSON(req) {
  return new Promise((resolve) => {
    let buff = '';

    req.on('data', (chunk) => {
      buff += chunk;
    });

    req.on('end', () => {
      let json = { value: null };
      let resCode = 500; // internal server error as fallback; should always be overwritten

      try {
        json = JSON.parse(buff);
        resCode = req.method === 'PUT' ? 201 : 200;
      } catch (e) {
        console.warn('error while parsing request body; sending code 400');
        console.error(e);
        resCode = 400;
      }

      resolve({ json: json, http_code: resCode });
    });
  });
}

/** @typedef {import('./index.js').resFunction} resFunction */

module.exports = { REST, getBodyJSON };

