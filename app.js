var express =           require("express");
var app =               express();
var path =              require("path");
var ejs =               require("ejs");
var port =              process.env.PORT || 8080;
var bodyParser =        require('body-parser');
var passport =          require('passport');
//var cookieParser =    require('cookie-parser');
var session =           require('express-session');
//const bcrypt =          require('bcrypt');
//const salt =            bcrypt.genSaltSync(10);
var social =            require('./app/passport/passport')(app,passport);
var MongoClient =       require('mongodb').MongoClient; // for mongo db MLAB Used
var mongoUrl =          "mongodb://admin:admin123@ds253840.mlab.com:53840/users";
//--------------------------------------------------------------------------------
//app.use(cookieParser());
app.use(session({secret: "qwertyuiopasdfghjklzxcvbnm"}));
app.set('view engine','ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,"public")));
//--------------------------------------------------------------------------------
//var hash = bcrypt.hashSync("testing password", salt);
//console.log(hash);

app.get('/', function(req, res){
    if(req.session.user==undefined || req.session.user==null)
    {
      res.sendFile(__dirname + '/index.html');
    }
    else
    {
      res.redirect("/profile");
    }
});

app.post('/login', function(req, res){
		var data=req.body;
		var flag=false;
		var pass=false;
		var uindex;
		useremail=data.usermailLog;
		userpassword=data.userpassLog;
		    MongoClient.connect(mongoUrl,function(err,db)
		    {
		    	if(err) throw err;
		    	else
		    	{
		    		db.db('users').collection('userdata').find({}).toArray(function(err,result)
		    		{
		    			if(err) throw err;
							for(i=0;i<result.length;i++)
							{
								if(result[i].userid==useremail)
								{
									uindex=i;
									flag=true;
									if(result[i].userpass==userpassword)
									{
                    req.session.user=useremail;
										pass=true;
									}
									else
									{
											pass=false;
									}
                  break;
								}
							}
							if(flag)
							{

									if(pass){res.redirect('/profile');}//is password correct
									else{res.render('signlog',{data:"Password does not match"});}
							}
							else
							{
								res.render('signlog',{data:"No such user found"});
							}
		    		})
		    	}
		    });
});
//-------------------------------------------------------------------------------------------------
app.post('/signup', function(req, res){
		var data=req.body;
		var flag=false;
		useremail=data.usermailSign;
		userpassword=data.userpassSign;
					MongoClient.connect(mongoUrl,function(err,db)
					{
						if(err) throw err;
						else
						{
							db.db('users').collection('userdata').find({}).toArray(function(err,result)
							{
								if(err) throw err;
								for(i=0;i<result.length;i++)
								{
									if(result[i].userid==useremail)
									{
											flag=true;
											break;
									}
								}
								if(flag)
								{
										res.render('signlog',{data:"User alraedy exist with these details."});
								}
								else
								{
								//--------------------------------------------------------------------
									var data={"userid":useremail,"userpass":userpassword};
											 db.db('users').collection('userdata').insert(data,function(err,results)
											 {
												 if(err) throw err;
											 })
								//-----------------------------------------------------------------------
									res.render('signlog',{data:"Successfully Signup"});
								}
							})
						}
					});
});

app.get('/profile', function(req, res){
  if(req.session.user==undefined || req.session.user==null)
  {
    res.redirect("/");
  }
  else
  {
    res.sendFile(__dirname + '/public/logged.html');
  }
});

app.get('/social',ensureAuthenticated, function(req, res){
    res.sendFile(__dirname + '/public/social.html');
});

app.get('/logout', function(req, res){
  if(req.session.user==undefined || req.session.user==null)
  {
    res.redirect("/");
  }
  else
  {
    req.session.user=null;
    res.redirect("/");
  }
});

function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated())
  	{
  		console.log("*****************************"+req.isAuthenticated());
  	 return next(); 
  	}
  	else
  	{
  		console.log("*****************************"+req.isAuthenticated());
  		 return next();
  	}
}

app.get('*', function(req, res){
  var requrl=req.originalUrl;
    if(requrl=="/admin" || requrl=="/signup" || requrl=="/login")
    {
        if(req.session.user==undefined || req.session.user==null)
        {
          res.sendFile(__dirname + '/index.html');
        }
        else
        {
          res.redirect("/profile");
        }
    }

});
app.listen(port);
