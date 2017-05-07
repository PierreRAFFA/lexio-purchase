'use strict';

module.exports = function(Product) {

  /**
   * Define exposed methods (https://docs.strongloop.com/display/APIC/Operation+hooks)
   */
  Product.disableRemoteMethodByName('create');
  Product.disableRemoteMethodByName('findById');
  // Product.disableRemoteMethodByName('find');
  Product.disableRemoteMethodByName('upsert');
  Product.disableRemoteMethodByName('updateAll');
  Product.disableRemoteMethodByName('exists');
  Product.disableRemoteMethodByName('findOne');
  Product.disableRemoteMethodByName('deleteById');
  Product.disableRemoteMethodByName('count');
  Product.disableRemoteMethodByName('replaceOrCreate');
  Product.disableRemoteMethodByName('createChangeStream');
  Product.disableRemoteMethodByName('replaceById');
  Product.disableRemoteMethodByName('upsertWithWhere');
  Product.disableRemoteMethodByName('prototype.patchAttributes');
};
