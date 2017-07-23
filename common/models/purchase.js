'use strict';
const _ = require('lodash');
const request = require('request');
const util = require('util');

const config = require('../../common/config');

module.exports = function (Purchase) {
  /**
   * Define exposed methods (https://docs.strongloop.com/display/APIC/Operation+hooks)
   */
  // Purchase.disableRemoteMethodByName('create');
  Purchase.disableRemoteMethodByName('findById');
  Purchase.disableRemoteMethodByName('find');
  Purchase.disableRemoteMethodByName('upsert');
  Purchase.disableRemoteMethodByName('updateAll');
  Purchase.disableRemoteMethodByName('exists');
  Purchase.disableRemoteMethodByName('findOne');
  Purchase.disableRemoteMethodByName('deleteById');
  Purchase.disableRemoteMethodByName('count');
  Purchase.disableRemoteMethodByName('replaceOrCreate');
  Purchase.disableRemoteMethodByName('createChangeStream');
  Purchase.disableRemoteMethodByName('replaceById');
  Purchase.disableRemoteMethodByName('upsertWithWhere');
  Purchase.disableRemoteMethodByName('prototype.patchAttributes');

  Purchase.observe('before save', (ctx, next) => {

    const Product = Purchase.app.models.Product;

    const purchase = ctx.instance;
    const { store, productId, transactionId, sandbox, payload, userId } = purchase;

    if (store && transactionId && payload && userId) {

      Purchase
        // 1. check if the transaction has been already registered (for optimization but not secure )
        .find({ where: { transactionId: transactionId } })
        .then(purchases => {
          if (purchases.length === 1) {
            throw new Error("The receipt has been already used");
          }
        })

        // 2. check if the product exists
        .then(() => {
          console.log('productId:' + productId);
          return Product.find({ where: { storeProductId: productId } }).then( products => {
            if (products.length === 0) {
              throw new Error(`No product found with the id: ${productId}`);
            }else if (products.length === 1) {
              return products[0];
            }
          });
        })

        // 2. assign the product (balance and/or token )to the purchase update
        .then(product => {
          let update = {};
          if(product.balance) {
            update.balance = product.balance;
          }
          if(product.token) {
            update.token = product.token;
          }
          purchase.update = update;
        })

        // 3. validate with Apple
        .then(() => {
          return verifyAppleReceipt(payload, sandbox)
          .then(storeSuccessResponse => {
            purchase.storeResponse = storeSuccessResponse;
            return storeSuccessResponse;
          })
          .catch(storeFailureResponse => {
            purchase.storeResponse = storeFailureResponse;
            throw new Error("The receipt has not been validated by Apple");
          });
        })

        // 4. Check if the transaction has been already registered (secure if it's after)
        .then(storeSuccessResponse => {
          const appleTransactionId = _.get(storeSuccessResponse, 'receipt.in_app[0].transaction_id');

          return Purchase.find({ where: { transactionId: appleTransactionId } }).then(purchases => {
            if (purchases.length === 1) {
              throw new Error("The receipt has been already used");
            } else {
              return storeSuccessResponse;
            }
          });
        })

        // success here
        .then(() => {
          purchase.status = 'succeed';
          next();
        })

        .catch(err => {
          purchase.status = 'failed';
          purchase.error = err;
          console.log(util.inspect(purchase, false, null));

          err.statusCode = 400;
          next(err);
        });
    } else {
      const error = new Error("The receipt is not valid");
      error.statusCode = 400;
      return next(error);
    }
  });


  ///////////////////////////////////////////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////
  /**
   * Call Apple endpoint to check receipt validity
   * @param payload
   * @param sandbox
   * @returns {*}
   */
  function verifyAppleReceipt(payload, sandbox) {

    const defer = Promise.defer();

    // determine which endpoint to use for verifying the receipt
    let endpoint = null;
    if (sandbox) {
      endpoint = config.appleReceiptEndpointSandbox;
    } else {
      endpoint = config.appleReceiptEndpoint;
    }

    const formFields = {
      'receipt-data': payload
    };

    request.post({url: endpoint, json: formFields}, (err, res, body) => {
      console.log('Response:', body);

      if ('status' in body && body.status === 0) {

        //ignore valid receipts used for other bundles
        const bundleId =  _.get(body, 'receipt.bundle_id');
        if (bundleId && bundleId === config.bundleId) {
          defer.resolve(body);
        }else{
          defer.reject(body);
        }
      }else{
        defer.reject(body);
      }
    });

    return defer.promise;
  }

  /**
   *
   * @param storeResponse
   * @param userId
   */
  function createPurchaseFromAppleReceipt(storeResponse, userId){

    console.log('==============================');
    console.log('createPurchaseFromAppleReceipt');
    console.log(userId);
    console.dir(storeResponse);
    if (storeResponse.receipt
      && storeResponse.receipt.in_app
      && storeResponse.receipt.in_app.length) {

      const inApp = storeResponse.receipt.in_app[0];

      const Purchase = User.app.models.Purchase;
      const purchase = new Purchase();
      purchase.transactionId = inApp.transaction_id;
      purchase.productId = inApp.product_id;
      purchase.storeResponse = storeResponse;
      purchase.userId = userId;
      purchase.store = 'apple';

      console.dir(purchase);
      console.log('==============================');
      return purchase.save();
    }
  }


  function getUserUpdateFromProductId(productId) {
    switch(productId) {
      case 'com.wordz.game.coin1':
        return { balance: 8 };
      case 'com.wordz.game.coin2':
        return { balance: 18 };
      case 'com.wordz.game.coin3':
        return { balance: 48 };
      case 'com.wordz.game.coin4':
        return { balance: 100 };
      case 'com.wordz.game.coin5':
        return { balance: 210 };
    }
  }
};
