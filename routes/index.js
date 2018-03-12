const express = require('express');
const passport = require('passport');
const md5 = require('md5');
const router = express.Router();
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn('/');
var User=require('../Models/user.js'); //including model
var jwt = require('jsonwebtoken');
var csrf = require('csurf');  //For csrf
var csrfProtection = csrf({ cookie: true });
/* GET home page. */

router.get('/', csrfProtection, function (req, res) {

      //console.log('flash'+req.flash('error'));
      res.render('login',{message:req.flash('error'),csrfToken: req.csrfToken()});
});




router.post('/login',csrfProtection,passport.authenticate('local', { successRedirect: '/dashboard', failureRedirect: '/', failureFlash: 'Please provide correct username and password!!',successFlash: 'Welcome!'  }));

router.get('/logout', ensureLoggedIn, function(req, res, next) {
    req.session.destroy();
    //res.json({ status: 'done' });
    res.redirect('/');
}); 

router.get('/auth/google',
  passport.authenticate('google', { scope: ['profile','email'] }));

router.get('/auth/google/callback', 
  passport.authenticate('google', { successRedirect: '/dashboard', failureRedirect: '/', failureFlash: 'Something is wrong!',successFlash: 'Welcome!'  }),
  function(req, res) {
    res.redirect('/dashboard');
  });

router.get('/auth/facebook', passport.authenticate('facebook', { scope: ['email'] }));
router.get('/auth/facebook/callback',passport.authenticate('facebook', { successRedirect: '/dashboard', failureRedirect: '/', failureFlash: 'Something is wrong',successFlash: 'Welcome!'  }));


router.get('/profile', ensureLoggedIn, function(req, res, next) {
    User.find({_id:req.session.passport.user._id}).exec(function(err,results){
    if(err){
      console.log(err);
    }else
    {
      console.log(results);
      res.render('profile',{data:results,Name:req.session.passport.user.Name})
    }
    
  });
}); 

//for api
router.post('/apilogin',function(req,res){
     var query=User.findOne({ email:req.body.username,password:md5(req.body.password) });
     query.exec().then((userdata)=>{
      if (!userdata) {
        res.status(201).json({ auth:false,result: userdata });
      }
      else
      {
         var token = jwt.sign({ id: userdata._id },'supersecret', {
          expiresIn: 86400 // expires in 24 hours
        });
         var obj={};
         obj._id=userdata._id;
         obj.Name=userdata.Name;
         obj.email=userdata.email;
         res.status(200).json({ auth:true,result:obj ,token:token, token_expire_on:'86400' });
      }

     }).catch((err)=>{

      res.status(400).json({ error: err });

     });
    
});

router.get('/privacy',function(req,res){
   res.render('privacy');
});


module.exports = router;
