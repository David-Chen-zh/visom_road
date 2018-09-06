'use strict';
const Controller = require('egg').Controller;

class TokenController extends Controller {

  async create(ctx) {
    try {
      const token = ctx.app.getPublicToken();
      ctx.body = {
        access_token: token.access_token,
        expires_in: token.expires_in
      };
    } catch (err) {
      console.log(err);
    }
  }

}

module.exports = TokenController;