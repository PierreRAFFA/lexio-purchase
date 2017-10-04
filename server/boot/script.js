
module.exports = function(app) {
  const Product = app.models.Product;

  app.remotes().phases.addBefore('invoke', 'options-from-request').use(function (ctx, next) {
    ctx.args.options.accessToken = ctx.req.user.accessToken;
    ctx.args.options.currentUser = ctx.req.user;
    next();
  });

  Product.destroyAll({}, function(err, count) {
      Product.create([
        {store: 'apple', storeProductId: 'lexio.coin1', balance: '16', token: '0', price: 0.99},
        {store: 'apple', storeProductId: 'lexio.coin2', balance: '36', token: '0', price: 1.99},
        {store: 'apple', storeProductId: 'lexio.coin3', balance: '100', token: '0', price: 4.99},
        {store: 'apple', storeProductId: 'lexio.coin4', balance: '220', token: '0', price: 9.99},
        {store: 'apple', storeProductId: 'lexio.coin5', balance: '500', token: '0', price: 19.99},
      ], function(err, products) {
        if (err) throw err;
        console.log('Created products:', products);
      });
  });
};
