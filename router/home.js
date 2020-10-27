const express=require('express')
const mysql=require('mysql')
const multer=require('multer')
const path=require('path')
var session=require('express-session')
var fs = require('fs');
var upload = multer({ dest: 'uploads/'})
var type = upload.single('pain_img');
const { check, validationResult } = require('express-validator')
const router =new express.Router()

const db=mysql.createConnection({
	host:'localhost',
	user:'root',
	password:'Srivathsan99',
	insecureAuth : true,
	database:'painting_hire_buss'
})
db.connect(err => {
	if (err) {
    console.error('error connecting:1 ',err)
    return
  }
	console.log("Mysql is connected")
})
router.get('/createtableuser',(req,res)=>{
	let sql='CREATE TABLE Users(id int AUTO_INCREMENT,username VARCHAR(255),password VARCHAR(255),name VARCHAR(255), PRIMARY KEY(id))'
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
	let post={username:'vishnu.vk',password:'codingkumar',name:'Vishnu'}
	let sql='INSERT INTO Users SET ?'
	db.query(sql,post,err=>{
		if (err){
			console.log('error in changing database', err);
      				return;
		}
	})
	res.send('User Inserted successfully')
})
router.get('/submit',(req,res)=>{
	console.log('Username:','root_user')
	console.log('Password','onepiece@1')
    let query=`SELECT * FROM  User WHERE user_ID="root_user"`
    db.query(query,function(err,result,fields){
		if (err){
			console.log('error in changing database', err);
      				return;
		}
		console.log(result)
	})
	res.redirect('/home')
})
router.post('/auth', function(request, response) {
	var username = request.body.username
	var password = request.body.password
	if (username && password) {
		db.query('SELECT * FROM User WHERE user_ID = ? AND password = ?', [username, password], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true
				request.session.username = username
				response.redirect('/home')
			} else {
				response.render('login',{message:'Incorrect Username and/or Password!',isWrong:true,isSell:true})
				return;	
			}
					
		});
	} else {
		response.render('login',{message:'Please enter Username and Password!',isWrong:true,isSell:true})
		return;
	}
})
router.get('/logout',(req,res)=>{
	req.session.loggedin=false;
	req.session.username=null;
	res.redirect('/home')
})

router.post('/submit_signup', [ 
	check('username','Username should be 5 to 20 characters').isLength({min:5,max:20}),
    check('email_id', 'Email length should be 10 to 30 characters').isEmail().isLength({ min: 10, max: 30 }).normalizeEmail(), 
    check('first_name', 'Name length should be 1 to 20 characters').isLength({ min: 1, max: 20 }), 
    check('middle_name', 'Name length should be 1 to 20 characters').isLength({ min: 0, max: 20 }),
    check('last_name', 'Name length should be 1 to 20 characters').isLength({ min: 0, max: 20 }),
    check('phone_no', 'Mobile number should contains 10 digits').isLength({ min: 10, max: 10 }).isNumeric(),
    check('dob', 'wrong date of birth').not().isEmpty(),
    check('password', 'Password length should be 8 to 10 characters').isLength({ min: 8, max: 20 }),
    check('street','Street length should be 1 to 20 characters').isLength({min:1}),
    check('city','city length should be 1 to 20 characters').isLength({min:1,max:20}),
    check('state','State length should be 1 to 20 characters').isLength({min:1,max:20}),
    check('country','country length should be 1 to 20 characters').isLength({min:1,max:20}),

], (req, res) => { 
    const errors = validationResult(req); 
    if (!errors.isEmpty()) { 
        res.render('signup',{username:req.session.username,isLoggedIn:req.session.loggedin,isWrong:true,errors:errors["errors"],isSell:false}) 
    } 
    else {
        db.query('SELECT * FROM User WHERE user_ID = ?', [req.body.username], function(error, results, fields) {
			if (results.length > 0) {
				var error2=[{
    			msg:"User Name already taken!!!"
    		}]
    		res.render('signup',{username:req.session.username,isLoggedIn:req.session.loggedin,isWrong:true,errors:error2,isSell:false})
			}
			else{
				let post={
    				user_ID:req.body.username,
    				password:req.body.password,
    				first_name:req.body.first_name,
    				mid_name:req.body.middle_name,
    				last_name:req.body.last_name,
    				street:req.body.street,
    				city:req.body.city,
    				state:req.body.state,
    				country:req.body.country,
    				DOB:req.body.dob,
    				mail_ID:req.body.email_id,
    				money_earnings:0,
    				tot_amt_spent:0,
    				category_type:'bronze'

    				}
				let sql='INSERT INTO User SET ?'
    	 		db.query(sql,post,err=>{
				if (err){
					console.log('error in changing database', err);
      				return;
					}
				})
    	 		req.session.loggedin = true
				req.session.username = req.body.username
        		res.redirect("/home")
				} 
					
			});
    	
    	} 
}); 

router.post('/submit_painting',type,[ 
	check('price','Price should be Number greater than 1').isNumeric({gt:1}),
	check('title','Title length should be 1 to 20 characters').isLength({min:1}),
	check('desc','Street length should be 1 to 20 characters').isLength({min:1}),
	check('weight','Weight should be Number greater than 1').isNumeric({gt:1}),
	check('genre','Genre length should be 1 to 20 characters').isLength({min:1}),
	check('height','Height should be Number greater than 1').isNumeric({gt:1}),
	check('width','Width should be Number greater than 1').isNumeric({gt:1}),
	check('dopaint', 'wrong date of painting').not().isEmpty(),
    check('art_first_name', 'Name length should be 1 to 20 characters').isLength({ min: 1, max: 20 }), 
    check('art_middle_name', 'Name length should be 1 to 20 characters').isLength({ min: 0, max: 20 }),
    check('art_last_name', 'Name length should be 1 to 20 characters').isLength({ min: 0, max: 20 }),
    check('art_place_of_birth','Place of Birth length should be 1 to 20 characters').isLength({min:1,max:20}),
    check('art_dob', 'wrong date of birth').not().isEmpty(),
    check('art_street','Street length should be 1 to 20 characters').isLength({min:1}),
    check('art_city','city length should be 1 to 20 characters').isLength({min:1,max:20}),
    check('art_state','State length should be 1 to 20 characters').isLength({min:1,max:20}),
    check('art_country','Country length should be 1 to 20 characters').isLength({min:1,max:20}),

], (req, res) => { 
    const errors = validationResult(req); 
    if (!errors.isEmpty()) { 
    	console.log(errors["errors"]);
        res.render('sell',{username:req.session.username,isLoggedIn:req.session.loggedin,isWrong:true,errors:errors["errors"],isSell:true}) 
    } 
    else { 
    	if(req.file==undefined){
    		var error1=[{
    			msg:"Please select an Image"
    		}]
    		res.render('sell',{username:req.session.username,isLoggedIn:req.session.loggedin,isWrong:true,errors:error1,isSell:true})
    	}else{
    	console.log(req.file);
        var tmp_path = req.file.path;
        console.log(req.file.originalname);
  		var target_path = 'uploads/' +'pain_1.'+req.file.originalname.split('.')[1];
		fs.readFile(tmp_path, function(err, data)
		{
  			fs.writeFile(target_path, data, function (err)
  			{
    			res.redirect('/home');
  			})
		});
    
     }
    } 
});

module.exports=router;