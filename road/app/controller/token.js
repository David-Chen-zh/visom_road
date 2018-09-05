'use strict';
const Controller = require('egg').Controller;
const { AuthClientTwoLegged } = require('forge-apis');
const config = require('../../config/config.js');


class TokenController extends Controller {

  /**
 * Initializes a Forge client for 2-legged authentication.
 * @param {string[]} scopes List of resource access scopes.
 * @returns {AuthClientTwoLegged} 2-legged authentication client.
 */
  getClient(scopes) {
    const { client_id, client_secret } = config.credentials;
    return new AuthClientTwoLegged(client_id, client_secret, scopes || config.scopes.internal);
  }

  async getToken(scopes, ctx) {
    const cache = {};
    const key = scopes.join('+');
    if (cache[key]) {
      return cache[key];
    }
    const client = await this.getClient(scopes);
    const credentials = await client.authenticate();
    cache[key] = credentials;
    setTimeout(() => { delete cache[key]; }, credentials.expires_in * 1000);
    ctx.body = credentials;
  }

  async create(req, res, next) {
    try {
      const token = await this.getPublicToken();
      res.json({
        access_token: token.access_token,
        expires_in: token.expires_in
      });
    } catch (err) {
      next(err);
    }
  }

  /**
 * Retrieves a 2-legged authentication token for preconfigured public scopes.
 * @returns Token object: { "access_token": "...", "expires_at": "...", "expires_in": "...", "token_type": "..." }.
 */
  async getPublicToken(ctx) {
    ctx.body = await this.getToken(config.scopes.public);
  }

  /**
 * Retrieves a 2-legged authentication token for preconfigured internal scopes.
 * @returns Token object: { "access_token": "...", "expires_at": "...", "expires_in": "...", "token_type": "..." }.
 */
  async getInternalToken(ctx) {
    ctx.body = await this.getToken(config.scopes.internal);
  }

}

module.exports = TokenController;