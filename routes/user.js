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


router.post('/test', ensureLoggedIn, function(req, res, next) 
{
	res.render('test');
});

module.exports = router;
