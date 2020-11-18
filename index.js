const express=require('express')
const mysql=require('mysql')
const bodyParser=require('body-parser')
const path=require('path')
var session=require('express-session')
const userRouter=require('./router/home')
const backRouter=require('./router/back')
const app=express()
const port=process.env.PORT || 3000
const hbs=require('hbs')
hbs.registerHelper("check", function(index,options) {
      	if ((index+1)%3==0){
      		return options.fn(this);
      	}
      	else{
      		return options.inverse(this);
      	}
      });
app.set('view engine','hbs')
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}))
app.use(express.static(path.join(__dirname,'public')))
app.use(express.static(path.join(__dirname,'uploads')))
app.use(bodyParser.urlencoded({extended:true}))
app.use(userRouter)
app.use(backRouter)
const viewsPath=path.join(__dirname,'templates/views')
const partialsPath=path.join(__dirname,'templates/partials')
app.set('views',viewsPath)
hbs.registerPartials(partialsPath)
app.get('/home',(req,res)=>{
	res.render('index',{username:req.session.username,isLoggedIn:req.session.loggedin})
})
app.get('/about',(req,res)=>{
	res.render('about',{username:req.session.username,isLoggedIn:req.session.loggedin})
})
/*app.get('/paintings',(req,res)=>{
	res.render('paintings',{username:req.session.username,isLoggedIn:req.session.loggedin})
})*/
app.get('/login',(req,res)=>{
	res.render('login',{username:req.session.username,isLoggedIn:req.session.loggedin,isWrong:false,isSell:false});
	
})
app.get('/signup',(req,res)=>{
	res.render('signup',{username:req.session.username,isLoggedIn:req.session.loggedin,isWrong:false,isSell:false})
})

app.get('/sell',(req,res)=>{
	if(req.session.loggedin==true){
	res.render('sell',{username:req.session.username,isLoggedIn:req.session.loggedin,isWrong:false,isSell:true})
    }
    else{
    	res.render('login',{username:req.session.username,isLoggedIn:req.session.loggedin,isWrong:false,isSell:true});
    }
})

app.listen(port,() =>{
	console.log('Server is up on port'+port)
})