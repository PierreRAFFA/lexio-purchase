'use strict';
const get = require('lodash/get');
const request = require('request');
const util = require('util');

const config = require('../../common/config');

module.exports = function (Purchase) {
  /**
   * Define exposed methods (https://docs.strongloop.com/display/APIC/Operation+hooks)
   */
  // Purchase.disableRemoteMethodByName('create');
  Purchase.disableRemoteMethodByName('findById');
  // Purchase.disableRemoteMethodByName('find');
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

    const purchase = ctx.instance;
    const Product = Purchase.app.models.Product;

    //may be used in case of error
    let error = null;

    //check user (should have been checked in the middleware)
    const userId = get(ctx, 'options.currentUser.id');
    if (!userId) {
      error = new Error("Not Authorized");
      error.statusCode = 401;
      return next(error);
    }

    //check receipt structure
    const { receipt, productId, sandbox } = purchase;
    const {Store: store, TransactionID: transactionId, Payload: payload} = receipt;

    console.log(receipt)
    console.log(productId)
    if (!receipt || !store || !transactionId) {
      error = new Error("The receipt is not valid");
      error.statusCode = 400;
      return next(error);
    }

    purchase.userId = userId;
    purchase.transactionId = transactionId;
    purchase.store = store;

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
        const appleTransactionId = get(storeSuccessResponse, 'receipt.in_app[0].transaction_id');

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
  });

  Purchase.observe('after save', (ctx, next) => {
    const Product = Purchase.app.models.Product;

    const purchase = ctx.instance;
    const accessToken = get(ctx, 'options.accessToken');
    const user = get(ctx, 'options.currentUser');

    Product.find({ where: { storeProductId: purchase.productId } })
      .then( products => {
        if (products.length === 0) {
          throw new Error(`No product found with the id: ${productId}`);
        }else if (products.length === 1) {
          return products[0];
        }
      })
      .then(product => {

        console.log('balance:' + user.balance);
        console.log('new balance:' + user.balance + product.balance);
        const options = {
          url: `http://wordz-authentication:3010/api/users/${user.id}?access_token=${accessToken}`,
          form: {
            balance: user.balance + product.balance,
          }
        };

        request.patch(options, (error, response, body) => {
          if (error) {
            res.status(response.status).send(error);
          } else {
            console.log(JSON.parse(body));
            next();
          }
        });
      });
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
        const bundleId =  get(body, 'receipt.bundle_id');
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
};
