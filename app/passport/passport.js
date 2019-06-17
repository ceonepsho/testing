var FacebookStrategy =          require('passport-facebook');
var GoogleStrategy =            require('passport-google-oauth').OAuth2Strategy;
var ConfigSocial =              require('../../config/auth');
var MongoClient =               require('mongodb').MongoClient; // for mongo db MLAB Used
var session =                   require('express-session');
var mongoUrl =                  "mongodb://admin:admin123@ds253840.mlab.com:53840/users";
//------------------------------------------------------------------------------
module.exports = function(app,passport){

  app.use(passport.initialize());
  app.use(passport.session());
//  app.use(session({secret: "qwertyuiopasdfghjklzxcvbnm"}));
  //app.use(session({ secret:'keyboard cat' , resave:false, saveUninitialized: true, cookie:{secure:false}}));
//---------------------------------------------------
  passport.serializeUser(function(user,done)
  {
    done(null,user.id);
  });

  passport.deserializeUser(function(id,done)
  {
    User.findById(id,function(err,user){
      done(err,user);
    });
  })
//---------------------------------------------------------------------------
    passport.use(new FacebookStrategy({
          clientID: ConfigSocial.Facebook.clientID,
        	clientSecret: ConfigSocial.Facebook.clientSecret,
        	callbackURL: ConfigSocial.Facebook.callbackURL,
        	profileFields: ['id','displayName','emails']
        },
        function(accessToken,refreshToken,profile,done)
        {
          console.log(profile,"++++++++++++++++++++++++++++");
              var UniqueId;
              if(profile._json.email==null)
              {
                  UniqueId=profile.id;
              }
              else
              {
                UniqueId=profile._json.email;
              }
              console.log("------Facebook Auth----"+UniqueId);
                    var flag=true;
                    MongoClient.connect(mongoUrl,function(err,db)
                    {
                    	if(err) throw err;
                    	else
                    	{
                    		db.db('users').collection('facebook').find({}).toArray(function(err,result)
                    		{
                    			if(err) throw err;
                              for(i=0;i<result.length;i++)
                              {
                                if(result[i].uid==UniqueId)
                                {
                                  flag=false;
                                  break;
                                }
                              }
                              if(flag) // if new user
                              {
                                  console.log("---New_User---"+UniqueId);
                                  var data={"uid":UniqueId};
                              		db.db('users').collection('facebook').insert(data,function(err,results)
                              		{
                              			if(err) throw err;
                              		})

                              }
                              else //if old user
                              {
                                console.log("---Old_User---"+UniqueId);
                              }
                    		})
                    	}
                    });
              done(null,profile);
        }
        ));

        app.get('/auth/facebook/callback',passport.authenticate('facebook',{successRedirect:'/social',failureRedirect: '/'}));
        app.get('/auth/facebook',passport.authenticate('facebook',{scope: 'email'}));
//-----------------------------------------------------------------------------------------
passport.use(new GoogleStrategy({
      clientID: ConfigSocial.Google.clientID,
      clientSecret: ConfigSocial.Google.clientSecret,
      callbackURL: ConfigSocial.Google.callbackURL
    },
    function(accessToken,refreshToken,profile,done)
    {
          console.log(profile,"++++++++++++++++++++++++++++");
          var UniqueId;
          if(profile.emails[0].value==null || profile.emails[0].value==undefined)
          {
              UniqueId=profile.id;
          }
          else
          {
              UniqueId=profile.emails[0].value;
          }
          console.log("-------Google Auth---"+UniqueId);
                var flag=true;
                MongoClient.connect(mongoUrl,function(err,db)
                {
                  if(err) throw err;
                  else
                  {
                    db.db('users').collection('google').find({}).toArray(function(err,result)
                    {
                      if(err) throw err;
                          for(i=0;i<result.length;i++)
                          {
                            if(result[i].uid==UniqueId)
                            {
                              flag=false;
                              break;
                            }
                          }
                          if(flag) //if new user
                          {
                              console.log("---New_User---"+UniqueId);
                              var data={"uid":UniqueId};
                              db.db('users').collection('google').insert(data,function(err,results)
                              {
                                if(err) throw err;
                              })
                          }
                          else
                          {
                            console.log("---Old_User---"+UniqueId);
                          }
                    })
                  }
                });
          done(null,profile);
    }
    ));

    app.get('/auth/google/callback',passport.authenticate('google',{successRedirect:'ensureAuthenticated()',failureRedirect: '/'}));
    app.get('/auth/google',passport.authenticate('google',{scope:['profile','email']}));
    
    function ensureAuthenticated(req, res) {
        //if (req.isAuthenticated()) { return next(); }
          res.redirect('/profile');
    }

//------------------------------------------------------------------------------------------
return passport;
}
