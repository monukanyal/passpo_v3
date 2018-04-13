const express = require('express');
const passport = require('passport');
const flash = require('connect-flash');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn('/');
const router = express.Router();
var async=require('async');
var User=require('../Models/user.js'); //including model
var Song=require('../Models/Songs.js'); //including model
var search = require('youtube-search');
var request = require('request');
var cheerio = require('cheerio');
require('../config.js');

var opts = {
  maxResults: 6,
  key: 'AIzaSyDnjiB1yHIkT3BDVTpf80LqC3fMZ8_ygIU'
};


/* var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;
var url ="mongodb://Esfera:esfera456@ds133547.mlab.com:33547/esferasoft"; */


/* GET user dashbard. */
router.get('/', ensureLoggedIn, function(req, res, next) 
{
	 //var arr="[{title: 'Happy Forever Alone Day',file: 'Happy Forever Alone Day (Forever Alone Song)',howl: null},{title:'In The End',file:'In The End _Official Video_ - Linkin Park',howl:null},{title:'Swag Se Swagat Song',file:'Swag Se Swagat Song',howl:null}]";
	Song.find({}).sort([['createdAt', 'descending']]).exec().then((results)=>{
	   var mainarr=[];
	   var i=0;
	 	var news=[];
		async.each(results, function(result, callback) {
			    var myObj = {};
			       i=i+1;
					myObj.title = result.filepath;
					myObj.file = result.filepath;
					myObj.howl = null;
					mainarr.push(myObj);
					if(i==parseInt(results.length))
					{
					  callback(mainarr,null);
					}
			}, function(result,err) {
			 
			    if( err ) {
			      console.log('failed to process');
			    } else {
			    	 request('https://www.indiatoday.in/india', function (error, response, html) {
				  if (!error && response.statusCode == 200) {
				    var $ = cheerio.load(html);
				    var maindata= $('.view-content').children();
				   console.log(parseInt(maindata.length));
				    $('.view-content').children().each(function(j,element){
				    	  var newsobj={};
				    	  var details=$(element).html($('.detail h3').attr('title')).text();
				    	//console.log(i);
				    	//console.log('onediv length:'+$(element).children().length);
				    	//console.log('onediv:'+$(element).html());
				    	newsobj.picurl=$(element).html($('.pic img').attr('src')).text();
				    	newsobj.desc=details;
				    	news.push(newsobj);
				    	//console.log('j='+j+':'+$(element).html($('img').attr('src')).text());
				    	//console.log('j='+j+':'+$(element).html($('.detail').text()).text());
				    });
				    //console.log(news);
			      	res.render('dashboard',{message:req.flash('success'),Name:req.session.passport.user.Name,newsdata:news,playerlist:JSON.stringify(result)});
				  }
				});
			    	
			    }
			});  
	
		//
	}).catch((err)=>{
		console.log(err);
		res.render('dashboard'	,{message:req.flash('success'),Name:req.session.passport.user.Name,playerlist:'',newsdata:news});
	});
	//console.log('session email:'+req.session.passport.user.Name);
   

	
});

router.post('/search', ensureLoggedIn, function(req, res, next) 
{
	var searchterm=req.body.query;

	search(searchterm, opts, function(err, results) {
	  if(err) return console.log(err);
	      //console.log(results);
	      var x='<div class="owl-carousel owl-theme"><div class="item-video" style="height: 200px" ><a class="owl-video" href="'+results[0]['link']+'" ></a></div><div class="item-video" style="height: 200px" ><a class="owl-video" href="'+results[1]['link']+'" ></a></div><div class="item-video" style="height: 200px" ><a class="owl-video" href="'+results[2]['link']+'" ></a></div><div class="item-video" style="height: 200px" ><a class="owl-video" href="'+results[3]['link']+'" ></a></div><div class="item-video" style="height: 200px" ><a class="owl-video" href="'+results[4]['link']+'" ></a></div><div class="item-video" style="height: 200px" ><a class="owl-video" href="'+results[5]['link']+'" ></a></div> </div>';
          res.status(200).json({ term:searchterm,data:x });
	});
});


router.get('/shop', ensureLoggedIn, function(req, res, next) 
{
	//res.render('test_server'); //server side paypal payment
	res.render('test_client'); //client side paypal payment

});

/* paypal */
router.post('/payment',ensureLoggedIn,function(req,res,next){

	var create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://localhost:8080/dashboard/success",
        "cancel_url": "http://localhost:8080/dashboard/cancel"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                        "name": "bowling",
                        "description": "Bowling Team Shirt",
                        "quantity": "5",
                        "price": "3",
                       // "tax": "0.01",
                        "sku": "1",
                        "currency": "GBP"
                    },
                    {
                        "name": "mesh",
                        "description": "80s Mesh Sleeveless Shirt",
                        "quantity": "1",
                        "price": "5",
                       // "tax": "0.02",
                        "sku": "product34",
                        "currency": "GBP"
                    }]
        },
        "amount": {
            "currency": "GBP",
            "total": "20.00"
        },
        "description": "This is the payment description."
    }]
};


paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
        throw error;
    } else {
       
        for(let i=0;i<payment.links.length;i++)
        {
        	if(payment.links[i].rel==='approval_url')
        	{
        		res.redirect(payment.links[i].href);
        	}
        }
       
    }
});

});

router.get('/success',function(req,res,next){
		var payerid=req.query.PayerID;
		var paymentId=req.query.paymentId;
		//res.send({'payerid':payerid,'paymentId':paymentId});
		var execute_payment_json = {
		    "payer_id": payerid,
		    "transactions": [{
		        "amount": {
		            "currency": "GBP",
		            "total": "20.00"
		        }
		    }]
		};

		paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
		    if (error) {
		        console.log(error.response);
		        //res.status(200).json({ res:'',error:true });
		        res.render('success',{result:'',error:true});
		        //throw error;
		    } else {
		       // console.log("Get Payment Response");
		       	//res.status(200).json({ res:payment,error:true });
		       res.render('success',{result:payment,error:false});
		    }
		});


});

router.get('/cancel',function(req,res,next){
	   res.send('cancel');
});

/*-- paypal end --*/

/*--stripe start---*/
router.post('/charge',function(req,res){
			var token=req.body.stripetoken; 
			var charge=req.body.stripecharge;  //session cart total charge
			
			stripe.charges.create({
			  amount: charge,
			  currency: "GBP",
			  source:token, // obtained with Stripe.js
			  description: "Charge for user"
			}, function(err, charge) {
			  // asynchronously called
			  if(err && err.type =="StripeCardError")
			  {
			  	console.log('card is invalid');
			  }
			  res.status(200).json({ result:charge });
		});
});

/*--stripe end ---*/
module.exports = router;
