const express=require('express')
const path=require('path')
const app=express()
const port=process.env.PORT || 3000
const hbs=require('hbs')
app.set('view engine','hbs')
app.use(express.static(path.join(__dirname,'public')))
const viewsPath=path.join(__dirname,'templates/views')
const partialsPath=path.join(__dirname,'templates/partials')
app.set('views',viewsPath)
hbs.registerPartials(partialsPath)
app.get('',(req,res)=>{
	res.render('index')
})
app.listen(port,() =>{
	console.log('Server is up on port'+port)
})