const express=require('express')
const multer=require('multer')
const path=require('path')
var session=require('express-session')
var fs = require('fs');
var upload = multer({ dest: 'uploads/'})
var type = upload.single('pain_img');
const { check, validationResult } = require('express-validator')
const router =new express.Router()
const db=require('./db')

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
    let query='SELECT * FROM  User;SELECT * FROM User_Owner;'
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
				response.render('login',{message:'Incorrect Username and/or Password!',isWrong:true,isSell:false})
				return;	
			}
					
		});
	} else {
		response.render('login',{message:'Please enter Username and Password!',isWrong:true,isSell:false})
		return;
	}
})
router.get('/logout',(req,res)=>{
	req.session.loggedin=false;
	req.session.username=null;
	res.redirect('/home')
})
router.get('/:user_ID/profile',(req,res)=>{
	let query=`SELECT * FROM  User WHERE user_ID="${req.session.username}";SELECT owner_ID as owner_id FROM User_Owner WHERE user_ID="${req.session.username}";`
    db.query(query,function(err,result,fields){
		if (err){
			console.log('error in changing database', err);
      				return;
		}
		else{
		console.log(result)
		let user_info={
    				password:result[0][0].password,
    				first_name:result[0][0].first_name,
    				mid_name:result[0][0].mid_name,
    				last_name:result[0][0].last_name,
    				street:result[0][0].street,
    				city:result[0][0].city,
    				state:result[0][0].state,
    				country:result[0][0].country,
    				DOB:new Date(result[0][0].DOB).toDateString(),
    				mail_ID:result[0][0].mail_ID,
    				money_earnings:result[0][0].money_earnings,
    				tot_amt_spent:result[0][0].tot_amt_spent,
    				category_type:result[0][0].category_type
		}
		req.session.user_info=user_info;
		console.log(new Date(result[0][0].DOB).toDateString());
        	if(result[1].length==0){
                  req.session.user_info.paintings_owned=0
                  req.session.user_info.paintings_expired=0
        	}
        	else{
        		query1='SELECT COUNT(painting_ID) as paintings_owned FROM Paintings WHERE owner_ID=?;SELECT COUNT(painting_ID) as paintings_expired FROM Paintings WHERE owner_ID=? and isExpired=1;'
                function insertValues(){
                	db.query(query1,[result[1][0].owner_id,result[1][0].owner_id],function(err,result1,fields){
                	if(err){
                		console.log('error in accesing paintings from profile');
                		return;
                	}
                	else{
                        req.session.user_info.paintings_owned=result1[0][0].paintings_owned
                        req.session.user_info.paintings_expired=result1[1][0].paintings_expired
                        return;
                	}
                })
                	return;
                }
                insertValues();
        	}
	    }
	    console.log(req.session.user_info);
        res.render('profile',{username:req.session.username,isLoggedIn:req.session.loggedin,user_info:req.session.user_info})
	})
	
})

router.get('/disp_pain',(req,res)=>{
	let query=`SELECT * FROM  Paintings`
    db.query(query,function(err,result,fields){
		if (err){
			console.log('error in changing database', err);
      				return;
		}
		else{
		console.log(result.length)
		if(result.length%3==0){
        res.render('sample_pain',{username:req.session.username,isLoggedIn:req.session.loggedin,pain_info:result,result_len:0})
		}
		else{
        res.render('sample_pain',{username:req.session.username,isLoggedIn:req.session.loggedin,pain_info:result,result_len:1})
		}
		
        return;
	    }
        
	})
})
router.get('/paintings/:painting_ID',(req,res)=>{
    let query='SELECT * FROM  Paintings WHERE painting_ID=?'
    db.query(query,[req.params.painting_ID],function(err,result,fields){
		if (err){
			console.log('error in changing database', err);
      				return;
		}
		else{
        res.render('painting_info',{username:req.session.username,isLoggedIn:req.session.loggedin,pain_info:result[0]})
        return;
	    }
        
	})
	
})
router.get('/add_order/:painting_ID',(req,res)=>{
	let query='SELECT * FROM User_Customer WHERE user_ID=?'
	db.query(query,[req.session.username],function(err,result,fields){
		if (err){
			console.log('error in changing database', err);
      				return;
		}
		else{
			if(result.length==0){
				let query1='INSERT INTO User_Customer SET ?'
				db.query(query1,{user_ID:req.session.username},function(err){
					if(err){
						console.log('error in inserting into user customer table',err);
						return;
					}
					res.redirect('/add_order/'+req.params.painting_ID)
					return;
				})
			}
			else{
				query2='SELECT amt_paid,order_ID AS last_index FROM Orders WHERE customer_ID=? and order_ID=(SELECT MAX(order_ID) FROM Orders WHERE customer_ID=?)'
				db.query(query2,[result[0].customer_ID,result[0].customer_ID],function(err,result1,fields){
					if(err){
						console.log('error in selecting from orders table',err);
						return;
					}
					else{
						if(result1.length==0){
							console.log('have to insert');
							db.query('INSERT INTO Orders SET ?',{customer_ID:result[0].customer_ID,order_ID:5000},function(err){
                               if(err){
                               	console.log('error in inserting into Orders when there is no id already',err);
                               	return;
                               }
                               return;
							})
							db.query('INSERT INTO Order_Paint SET ?',{customer_ID:result[0].customer_ID,order_ID:5000,painting_ID:req.params.painting_ID},function(err){
								if(err){
                               	console.log('error in inserting into Order_Paint when there is no id already',err);
                               	return;
                               }
                               return;
							})

						}
						else if(result1[0].amt_paid==null){
							console.log('already exits');
							db.query('INSERT INTO Order_Paint SET ?',{customer_ID:result[0].customer_ID,order_ID:result1[0].last_index,painting_ID:req.params.painting_ID},function(err){
								if(err){
                               	console.log('error in inserting into Order_Paint when there is id already but not ordered',err);
                               	return;
                               }
                               return;
							})
						}
						else{
							console.log('alredy exists but already occupied');
							db.query('INSERT INTO Orders SET ?',{customer_ID:result[0].customer_ID,order_ID:result1[0].last_index+1},function(err){
                               if(err){
                               	console.log('error in inserting into Orders when there is id already and used',err);
                               	return;
                               }
                               return;
							})
							db.query('INSERT INTO Order_Paint SET ?',{customer_ID:result[0].customer_ID,order_ID:result1[0].last_index+1,painting_ID:req.params.painting_ID},function(err){
								if(err){
                               	console.log('error in inserting into Order_Paint when there is id already and used',err);
                               	return;
                               }
                               return;
							})
						}
                        res.redirect('/orders')
                        return;
					}
				})
			}
        
        return;
	    }
        
	})
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
					console.log('error inserting user in  database', err);
      				return;
					}
				})
				let post1={user_ID:req.body.username,phone_No:req.body.phone_no}
				db.query('INSERT INTO User_phone SET ?',post1,err=>{
                   if (err){
					console.log('error in updating phone no in database', err);
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
    check('art_phone_no', 'Mobile number should contains 10 digits').isLength({ min: 10, max: 10 }).isNumeric(),
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
  		var target_path = 'uploads/' +'pain_3.'+req.file.originalname.split('.')[1];
  		let post={
  			artist_first_name:req.body.art_first_name,
  			artist_mid_name:req.body.art_middle_name,
  			artist_last_name:req.body.last_name,
  			artist_street:req.body.art_street,
  			artist_city:req.body.art_city,
  			artist_state:req.body.art_state,
  			artist_country:req.body.art_country,
  			artist_Place_of_birth:req.body.art_place_of_birth,
  			artist_DOB:req.body.art_dob
  		}
  		db.query('SELECT MAX(artist_ID) AS last_index FROM Artist',function(error, result, fields) {
			let sql='INSERT INTO Artist SET ?'
    	 		db.query(sql,post,err=>{
				if (err){
					console.log('error inserting Artist in  database', err);
      				return;
					}
				})
				let post1={artist_ID:result[0].last_index,artist_phone_No:req.body.art_phone_no}
				db.query('INSERT INTO Artist_phone SET ?',post1,err=>{
                   if (err){
					console.log('error in updating phone no in database', err);
      				return;
					}
				})
                function get_owner(callback){
      
      					var sql = 'SELECT owner_ID AS owner_index FROM User_Owner WHERE user_ID=?';

      							db.query(sql,[req.session.username],function(err, results,fields){
            								if (err){ 
            								  throw err;
            								}
            								console.log('inside_get_owner'+results[0].owner_index); // good
            								stuff_i_want = results[0].owner_index;  // Scope is larger than function

           								return callback(results[0].owner_index);
    								})
								}
				var owner_index;
				get_owner(function(results){
    			owner_index= results;
    			let post2={
                    Price:req.body.price,
                    Date_painted:req.body.dopaint,
                    Weight:req.body.weight,
                    Height:req.body.height,
                    Width:req.body.width,
                    Genre:req.body.genre,
                    Title:req.body.title,
                    Description:req.body.desc,
                    artist_ID:result[0].last_index+1,
                    owner_ID:owner_index,
                    No_of_times_rented:0,
                    isHired:0,
                    isExpired:0,
                    Date_posted:"2020-10-29",
                    reinstateDate:"2020-10-29",
                    pic_path:target_path.split('/')[1]
				}
				db.query('INSERT INTO Paintings SET ?',post2,(err)=>{
					if (err){
					console.log('error inserting Paintings in  database', err);
      				return;
					}
				})
    		});
				console.log('outside_get_owner'+owner_index);
			
			fs.readFile(tmp_path, function(err, data)
		{
  			fs.writeFile(target_path, data, function (err)
  			{
    			res.redirect('/home');
  			})
		});
					
		});
  		
    
     }
    } 
});

module.exports=router;