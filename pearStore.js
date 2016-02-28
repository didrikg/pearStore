Products = new Mongo.Collection("products");

if (Meteor.isClient) {
  // This code runs only on the client

  // Login code, not used atm. Saved for future implementation
  /*
  Template.pearLogin.events({
    'click [data-action=login]'(e, tmpl) {
      e.preventDefault();
      Meteor.login();
    },
    'click [data-action=logout'(e, tmpl) {
      e.preventDefault();
      Meteor.logout();
    }
  });
  */
  Meteor.subscribe("products");

  Template.registerHelper('formatDate', function(date) {
    return moment(date).format('YYYY-MM-DD');
  });

  Template.body.helpers({
    products: function () {
      return Products.find({}, {sort: {prodNum: -1}});
    }
  });

  Template.body.events({
    "submit .add-product": function(event) {
      // Prevent default browser form submit
      event.preventDefault();

      // Get value from form
      var prodNum = event.target.prodNum.value;
      var prodName = event.target.prodName.value;
      var price = event.target.price.value;

      // Insert into collection
      Meteor.call("addProduct", prodNum, prodName, price);

      // Clear form
      event.target.prodNum.value = "";
      event.target.prodName.value = "";
      event.target.price.value = "";
    },
    "click .delete": function() {
      Meteor.call("clearDB");
    }
  });

  Template.product.events({
    "submit .add-inventory": function(event) {
      // Prevent default browser form submit
      event.preventDefault();

      // Get value from form
      var city = event.target.city.value;
      var stock = event.target.stock.value;

      // Insert into collection
      Meteor.call("addInventory", this._id, city, stock);

      // Clear form
      event.target.city.value = "";
      event.target.stock.value = "";
    }
  });
}

if (Meteor.isServer) {
  // This code runs only on the server 
 
  // Publish the products for fetching
  Meteor.publish("products", function () {
    return Products.find();
  });
}

Meteor.methods({
  addProduct: function(prodNum, prodName, price) {
    Products.insert({
      registeredAt: new Date(),
      productNumber: prodNum,
      productName: prodName,
      price: price
    });
  },
  addInventory: function(prodId, city, stock) {
    Products.update({ _id:prodId}, { $push: { inventory: { city:city, stock:stock } }});
  },
  addDelivery: function(qty, productName, cityName) {
    // TODO
  },
  clearDB: function() {
    Products.remove({});
  }

});