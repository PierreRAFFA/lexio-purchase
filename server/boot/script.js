
module.exports = function(app) {
  const Product = app.models.Product;

  app.remotes().phases.addBefore('invoke', 'options-from-request').use(function (ctx, next) {
    ctx.args.options.accessToken = ctx.req.user.accessToken;
    ctx.args.options.currentUser = ctx.req.user;
    next();
  });

  return;

  Product.destroyAll({}, function(err, count) {
      Product.create([
        {store: 'apple', storeProductId: 'com.lexio.game.coin1', balance: '8', token: '0', price: 0.99},
        {store: 'apple', storeProductId: 'com.lexio.game.coin2', balance: '16', token: '0', price: 1.99},
        {store: 'apple', storeProductId: 'com.lexio.game.coin3', balance: '48', token: '0', price: 4.99},
        {store: 'apple', storeProductId: 'com.lexio.game.coin4', balance: '100', token: '0', price: 9.99},
        {store: 'apple', storeProductId: 'com.lexio.game.coin5', balance: '210', token: '0', price: 19.99},
      ], function(err, products) {
        if (err) throw err;
        console.log('Created products:', products);
      });
  });
};
