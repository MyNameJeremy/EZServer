import { IncomingMessage, ServerResponse } from 'http';

import { getRes } from './index.js';

/**
 * @callback resfunction
 * @param {IncomingMessage} req
 * @param {ServerResponse} res
 */

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
   * @param {string} url URL of the endpoint
   * @param {resfunction} fn
   */
  get(url, fn) {
    console.log('addet REST.get()', url);
    this.GET[url] = fn;
  }

  /**
   * @param {string} url URL of the endpoint
   * @param {resfunction} fn
   */
  post(url, fn) {
    console.log('addet REST.post()', url);
    this.POST[url] = fn;
  }

  /**
   * @param {string} url URL of the endpoint
   * @param {resfunction} fn
   */
  put(url, fn) {
    console.log('addet REST.put()', url);
    this.PUT[url] = fn;
  }

  /**
   * @param {string} url URL of the endpoint
   * @param {resfunction} fn
   */
  delete(url, fn) {
    console.log('addet REST.delete()', url);
    this.DELETE[url] = fn;
  }

  /**
   * @param {string} url URL of the endpoint
   * @param {resfunction} fn
   */
  patch(url, fn) {
    console.log('addet REST.patch()', url);
    this.PATCH[url] = fn;
  }

  /**
   * @param {string} url URL of the endpoint
   * @param {Object<string, resfunction>} functions functions for resolving the different methods { GET, POST, PUT, DELETE, PATCH }
   */
  addMulti(url, functions) {
    console.log('REST.addMulti', url);
    let { GET, POST, PUT, DELETE, PATCH } = functions;

    let noop = () => console.log('REST multi noop');

    this.get(url, GET || noop);
    this.post(url, POST || noop);
    this.put(url, PUT || noop);
    this.delete(url, DELETE || noop);
    this.patch(url, PATCH || noop);
  }

  /**
   * @returns {(resfunction|false)}
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
 * @param {ServerResponse} res
 * @param {string} val
 * @return {Object || false}
 */
function getBodyJSON(req, res, val = '') {
  let buff = '';
  req.on('data', (chunk) => {
    buff += chunk;
  });

  req.on('end', () => {
    let data;
    let http_code = 500; // internal server error as fallback; should always be overwritten

    try {
      data = JSON.parse(buff);
      if (!!val && !(data = data[val])) http_code = 400;
      else http_code = req.method === 'PUT' ? 201 : 200;
    } catch (e) {
      console.error(e);
      console.warn('error while parsing request body; sending code 400');
      http_code = 400;
    }

    res.writeHead(http_code);
    res.end();
    return data || false;
  });
}

export { REST, getBodyJSON };

