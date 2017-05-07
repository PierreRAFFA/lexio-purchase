
module.exports = function(app) {
  const Product = app.models.Product;

  Product.count({}, function(err, count) {
    if (count === 0) {
      Product.create([
        {store: 'apple', storeProductId: 'com.wordz.game.coin1', balance: '8', token: '0', price: 0.99},
        {store: 'apple', storeProductId: 'com.wordz.game.coin2', balance: '16', token: '0', price: 1.99},
        {store: 'apple', storeProductId: 'com.wordz.game.coin3', balance: '48', token: '0', price: 4.99},
        {store: 'apple', storeProductId: 'com.wordz.game.coin4', balance: '100', token: '0', price: 9.99},
        {store: 'apple', storeProductId: 'com.wordz.game.coin5', balance: '210', token: '0', price: 19.99},
      ], function(err, products) {
        if (err) throw err;
        console.log('Created products:', products);
      });
    }
  });
};
