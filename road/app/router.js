
module.exports = app => {

  const { router, controller } = app;

  router.get('/api/token', app.controller.token.create);

  router.get('/api/article/list', app.controller.app.list);
  router.get('/api/article/:id', app.controller.app.detail);
  router.get('/*', app.controller.app.index);

  router.use('/buckets', app.controller.buckets.use);
  router.get('/buckets', app.controller.buckets.list);
  router.post('/buckets', app.controller.buckets.create);

  router.post('/objects', app.controller.objects.create);

  router.use('/jobs', app.controller.jobs.use);
  router.post('/jobs', app.controller.jobs.create);


};
