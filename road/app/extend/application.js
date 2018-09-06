const { AuthClientTwoLegged } = require('forge-apis');
const cache = {};


module.exports = {

/**
 * Initializes a Forge client for 2-legged authentication.
 * @param {string[]} scopes List of resource access scopes.
 * @returns {AuthClientTwoLegged} 2-legged authentication client.
 */
  getClient(scopes) {
    const { clientId, clientSecret } = this.config.forge;
    return new AuthClientTwoLegged(clientId, clientSecret, scopes || this.config.scopes.internal);
  },

  async getToken(scopes) {
    const key = scopes.join('+');
    if (cache[key]) {
      return cache[key];
    }
    const client = this.getClient(scopes);
    const credentials = await client.authenticate();
    cache[key] = credentials;
    setTimeout(() => { delete cache[key]; }, credentials.expires_in * 1000);
    return credentials;
  },

  /**
 * Retrieves a 2-legged authentication token for preconfigured public scopes.
 * @returns Token object: { "access_token": "...", "expires_at": "...", "expires_in": "...", "token_type": "..." }.
 */
  async getPublicToken() {
    return this.getToken(this.config.scopes.public);
  },

  /**
 * Retrieves a 2-legged authentication token for preconfigured internal scopes.
 * @returns Token object: { "access_token": "...", "expires_at": "...", "expires_in": "...", "token_type": "..." }.
 */
  async getInternalToken() {
    return this.getToken(this.config.scopes.internal);
  }
};