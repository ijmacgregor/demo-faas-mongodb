sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/MessageToast"
], function (Controller, JSONModel, MessageToast) {
	"use strict";
	
	const REST_API_URI = "https://1fd725ad-6261-4485-a133-4928fe151463.ingress.live-us10.faas-live.shoot.live.k8s-hana.ondemand.com/fx/";
	
	return Controller.extend("com.poit.faas-ui.controller.Main", {
		onInit: function(){
			var oModel = new JSONModel({
				products: []
			});
			
			oModel.setSizeLimit(1000);
			
			this.getView().setModel(oModel);
			
			this.readData();
			
			this.getOwnerComponent().getRouter().getRoute("RouteMain").attachMatched(this.readData,this);
		},
		
		readData: function(){
			return jQuery.get(REST_API_URI).done(function(aProducts){
				this.getView().getModel().setProperty("/products",aProducts);
			}.bind(this));
		},
		
		createProduct: function(sProductName){
			jQuery.ajax({
				method: "POST",
				url: REST_API_URI, 
				data: JSON.stringify({
					productName	: sProductName
				}),
				contentType: "application/json"
			}).done(function(oResponse){
				this.readData().then(function(){
					MessageToast.show("Product " + oResponse.productId + " created", { width: "auto" } );
				});
			}.bind(this));
		},
		
		onAddProduct: function(oEvent){
			this.createProduct("New  asdfasdf aaa product");
		}
	});
});