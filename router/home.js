const express=require('express')
const mysql=require('mysql')
const router =new express.Router()

const db=mysql.createConnection({
	host:'localhost',
	user:'root',
	password:'Srivathsan99',
	insecureAuth : true,
	database:'sample'
})
db.connect(err => {
	if (err) {
    console.error('error connecting:1 ',err)
    return
  }
	console.log("Mysql is connected")
})
router.get('/createdb',(req,res)=>{
	let sql='CREATE DATABASE sample'
	db.query(sql,err =>{
		if (err){
			console.error('error connecting: ')
    		return
		}
		res.send('Database created')
	})
})
router.get('/createtableuser',(req,res)=>{
	let sql='CREATE TABLE Users(id int AUTO_INCREMENT,username VARCHAR(255),name VARCHAR(255),PRIMARY KEY(id))'
	db.changeUser({
    database : 'sample'
  		}, function(err) {
    			if (err) {
      				console.log('error in changing database', err);
      				return;
    			}})
	db.query(sql,err =>{
		if (err){
			console.error('error connecting: ',err)
    		return
		}
		res.send('Table created')
	})
})
router.get('/insertuser',(req,res)=>{
	let post={username:'vishnu.vk',name:'Vishnu'}
	let sql='INSERT INTO Users SET ?'
	db.query(sql,post,err=>{
		if (err){
			console.log('error in changing database', err);
      				return;
		}
	})
	res.send('User Inserted successfully')
})
module.exports=router;