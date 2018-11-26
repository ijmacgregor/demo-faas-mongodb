sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/json/JSONModel",
	"sap/m/Dialog",
	"sap/m/Button",
	"sap/m/Input",
	"sap/m/MessageToast",
	"sap/m/MessageBox"
], function (Controller, JSONModel, Dialog, Button, Input, MessageToast, MessageBox) {
	"use strict";
	
	const REST_API_URI = "https://1fd725ad-6261-4485-a133-4928fe151463.ingress.live-us10.faas-live.shoot.live.k8s-hana.ondemand.com/productservice/";
	
	return Controller.extend("com.poit.faas-ui.controller.Main", {
		onInit: function(){
			var oModel = new JSONModel({
				products: [],
				productDescription: null
			});
			
			oModel.setSizeLimit(1000);
			
			this.getView().setModel(oModel);
			
			this.readData();
			
			this.getOwnerComponent().getRouter().getRoute("RouteMain").attachMatched(this.readData,this);
		},
		
		getModel: function(sModel){
			return this.getView().getModel(sModel);
		},

		setBusy: function(bBusy){
			this.getModel().setProperty("/busy",bBusy);
		},

		readData: function(){
			this.setBusy(true);
			return jQuery.get(REST_API_URI).done(function(aProducts){
				this.getModel().setProperty("/products",aProducts);
			}.bind(this)).always(function(){
				this.setBusy(false);
			}.bind(this));
		},
		
		createProduct: function(sProductName){
			this.setBusy(true);

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
			}.bind(this)).fail(function(){
				MessageBox.error("Failed to create product");
				this.setBusy(false);
			}.bind(this));
		},
		
		onAddProduct: function(oEvent){
			if(!this._oAddDialog){
				this._oAddDialog = new Dialog({
					title		: "Add product",
					content     : [new Input({
						value: "{/productDescription}",
						placeholder: "Enter product name"
					})],
					beginButton: new Button({
						text: "Create",
						type: sap.m.ButtonType.Emphasized,
						press: function(){
							var sProductDescription = this.getModel().getProperty("/productDescription");
							this._oAddDialog.close();
							this.createProduct(sProductDescription);
						}.bind(this)
					}),
					endButton: new Button({
						text: "Cancel",
						press: function(){
							this._oAddDialog.close();
						}.bind(this)
					}),
					afterClose: function(){
						this.getModel().setProperty("/productDescription",null);
					}.bind(this)
				}).addStyleClass("sapUiContentPadding");

				this.getView().addDependent(this._oAddDialog);
			}

			this._oAddDialog.open();
		}
	});
});