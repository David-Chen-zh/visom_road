module.exports = () => {

  return async function auth(ctx, next) {
    const token = await ctx.app.getInternalToken();
    ctx.request.body.oauth_token = token;
    await next();
  };
};