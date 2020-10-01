const express=require('express')
const bodyParser=require('body-parser')
const path=require('path')
const userRouter=require('./router/home')
const app=express()
const port=process.env.PORT || 3000
const hbs=require('hbs')
app.set('view engine','hbs')
app.use(express.static(path.join(__dirname,'public')))
app.use(bodyParser.urlencoded({extended:true}))
app.use(userRouter)
const viewsPath=path.join(__dirname,'templates/views')
const partialsPath=path.join(__dirname,'templates/partials')
app.set('views',viewsPath)
hbs.registerPartials(partialsPath)
app.get('/home',(req,res)=>{
	res.render('index')
})
app.get('/about',(req,res)=>{
	res.render('about')
})
app.get('/paintings',(req,res)=>{
	res.render('paintings')
})
app.get('/login',(req,res)=>{
	res.render('login')
})
app.get('/signup',(req,res)=>{
	res.render('signup')
})
app.post('/submit',(req,res)=>{
	console.log('Username:',req.body.username)
	console.log('Password',req.body.password)
	res.redirect('/home')
})

app.listen(port,() =>{
	console.log('Server is up on port'+port)
})