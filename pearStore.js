Products = new Mongo.Collection("products");
Deliveries = new Mongo.Collection("deliveries");
Inventories = new Mongo.Collection("inventories");

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
  Meteor.subscribe("inventories");
  Meteor.subscribe("deliveries");
  Session.set("currentProduct", null);

  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

  Template.registerHelper("formatDate", function(date) {
    return moment(date).format("YYYY-MM-DD");
  });

  Template.body.helpers({
    products: function () {
      return Products.find({}, {sort: {prodNum: -1}});
    },
    deliveries: function () {
      return Deliveries.find({}, {sort: {registeredAt: 1}});
    },
    inventories: function () {
      if (Session.get("currentProduct") !== null) {
        return Inventories.find({ product: Session.get("currentProduct") });
      } else {
        //return Inventories.find();
      }
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
    "submit .add-delivery": function(event) {
      // Prevent default browser form submit
      event.preventDefault();

      // Get value from form
      var prodName = event.target.elements["product"].options[event.target.elements["product"].selectedIndex].value;
      var cityName = event.target.elements["city"].options[event.target.elements["city"].selectedIndex].value;
      var amount = event.target.amount.value;

      // Insert into collection
      Meteor.call("addDelivery", prodName, cityName, amount);

      // Clear form
      event.target.amount.value = "";
    },
    "submit .add-inventory": function(event) {
      // Prevent default browser form submit
      event.preventDefault();

      // Get value from form
      var product = event.target.product.value;
      var city = event.target.city.value;
      var stock = event.target.stock.value;
      // Insert into collection
      Meteor.call("addInventory", product, city, stock);

      // Clear form
      event.target.product.value = "";
      event.target.city.value = "";
      event.target.stock.value = "";
    },
    "change .product-selected": function (event) {
      var currentTarget = event.currentTarget;
      var newValue = currentTarget.options[currentTarget.selectedIndex].value;
      Session.set("currentProduct", newValue);
    },
    "click .delete-delivery": function() {
      Meteor.call("deleteDelivery", this._id);
    },
    "click .delete-product": function() {
      Meteor.call("deleteProduct", this._id);
    },
    "click .delete-inventory": function() {
      Meteor.call("deleteInventory", this._id);
    }
  });

  function drawChart(){
    var data = {
      labels: [ "January", "February", "March" ],
      datasets: [
          {
            label: "jTelefon",
            fillColor: "rgba(200,0,0,0.2)",
            strokeColor: "rgba(200,0,0,1)",
            pointColor: "rgba(200,0,0,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(200,0,0,1)",
            data: [181700, 331700, 326700]              
          },
          {
            label: "jPlatta",
            fillColor: "rgba(0,75,150,0.2)",
            strokeColor: "rgba(0,75,150,1)",
            pointColor: "rgba(0,75,150,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(151,187,205,1)",
            data: [203200, 218200, 218200]
          },
          {
            label: "P&auml;ronklocka",
            fillColor: "rgba(75,150,0,0.2)",
            strokeColor: "rgba(75,150,0,1)",
            pointColor: "rgba(75,150,0,1)",
            pointStrokeColor: "#fff",
            pointHighlightFill: "#fff",
            pointHighlightStroke: "rgba(75,150,0,1)",
            data: [138000, 133000, 153000]
          }
      ] 
    };
    var ctx = $("#mainChart").get(0).getContext("2d");
    var myMainChart = new Chart(ctx);
    new Chart(ctx).Line(data, {
          responsive: true,
          legendTemplate : "<ul class=\"<%=name.toLowerCase()%>-legend\"><% for (var i=0; i<datasets.length; i++){%><li><span style=\"background-color:<%=datasets[i].strokeColor%>\"></span><%if(datasets[i].label){%><%=datasets[i].label%><%}%></li><%}%></ul>"
    });
  }

  Template.chartArea.rendered = function(){
    drawChart();
  };

  Tracker.autorun(myMainChart.update());
}

if (Meteor.isServer) {
  // This code runs only on the server 
 
  // Publish the products for fetching
  Meteor.publish("products", function () {
    return Products.find();
  });
  Meteor.publish("deliveries", function () {
    return Deliveries.find();
  });
  Meteor.publish("inventories", function () {
    return Inventories.find();
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
  addInventory: function(prodName, cityName, stock) {
    Inventories.insert({
      registeredAt: new Date(),
      product: prodName,
      city: cityName,
      stock: stock
    });
  },
  addDelivery: function(prodName, cityName, amount) {
    Deliveries.insert({
      registeredAt: new Date(),
      product: prodName,
      city: cityName,
      amount: amount
    });
    Meteor.call("updateTotalInventory", prodName, cityName, amount);
  },
  updateTotalInventory: function(prodName, cityName, amount) {
    // Update inventory of a product in a city
    var inventory = Inventories.findOne({product : prodName, city : cityName});
    var newStock = parseInt(inventory.stock) + parseInt(amount);
    Inventories.update({ product : prodName, city : cityName }, { $set : { stock : newStock }});
  },
  fetchTotalProdInventory: function(prodName) {
    // Calculate total product inventory
  },
  fetchTotalCityInventory: function(cityName) {
    // Calculate total city inventory
  },
  deleteDelivery: function(id) {
    var delivery = Deliveries.findOne({_id:id});
    Meteor.call("updateTotalInventory", delivery.product, delivery.city, parseInt(-delivery.amount));
    Deliveries.remove({_id:id});
  },
  deleteProduct: function(id) {
    Products.remove({_id:id});
  },
  deleteInventory: function(id) {
    Inventories.remove({_id:id});
  }
  /*calculateTotalStock: function(product, city) {
    Products.aggregate([
    ]);
  }*/
});