const express=require('express')
const bodyParser=require('body-parser')
const path=require('path')
var session=require('express-session')
const userRouter=require('./router/home')
const app=express()
const port=process.env.PORT || 3000
const hbs=require('hbs')
app.set('view engine','hbs')
app.use(session({
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}))
app.use(express.static(path.join(__dirname,'public')))
app.use(bodyParser.urlencoded({extended:true}))
app.use(userRouter)
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
app.get('/paintings',(req,res)=>{
	res.render('paintings',{username:req.session.username,isLoggedIn:req.session.loggedin})
})
app.get('/login',(req,res)=>{
	res.render('login',{username:req.session.username,isLoggedIn:req.session.loggedin,isWrong:false,isSell:true});
	
})
app.get('/signup',(req,res)=>{
	res.render('signup',{username:req.session.username,isLoggedIn:req.session.loggedin,isWrong:false,isSell:true})
})

app.get('/sell',(req,res)=>{
	res.render('sell',{username:req.session.username,isLoggedIn:req.session.loggedin,isWrong:false,isSell:true})
})

app.get('/paintings/painting_info',(req,res)=>{
	res.render('painting_info',{username:req.session.username,isLoggedIn:req.session.loggedin})
})
app.listen(port,() =>{
	console.log('Server is up on port'+port)
})