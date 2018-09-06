
module.exports = app => {

  const { router, controller } = app;

  router.get('/api/forge/oauth/token', app.controller.token.create);

  router.get('/api/article/list', app.controller.app.list);
  router.get('/api/article/:id', app.controller.app.detail);
  router.get('/*', app.controller.app.index);

  router.use('/api/buckets', app.controller.buckets.use);
  router.get('/api/buckets', app.controller.buckets.list);
  router.post('/api/buckets', app.controller.buckets.create);

  router.post('/api/objects', app.controller.objects.create);

  router.use('/api/jobs', app.controller.jobs.use);
  router.post('/api/jobs', app.controller.jobs.create);


};
