/* -------paypal config start ---*/
var paypal = require('paypal-rest-sdk');
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AaSp8eXOVxdKgIuZevbNMx5VaBovlZYpGkhDpx6yRMEQSPpFrNqfpiyWUbGm-VsMLdjdNGQV7tdLd_Qg',
  'client_secret': 'EO-UAnZOLvru8QMdUJwpydJm8uxApPfFt-uRIMnuR_466eC0CVeA-FL8oPwM_98-XbMKH6wOMRGsSeAy'
});
/*--------- paypal config end-------*/

/*----stripe -----*/

// Replace with your stripe public and secret keys
const keyPublishable = 'pk_test_031SDkDPI2e64WhNF2uRXXUT';
const keySecret = 'sk_test_H5YqbaiRoWH5a7LTGm3JfzP4';
const stripe = require("stripe")(keySecret);