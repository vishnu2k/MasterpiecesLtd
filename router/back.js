const express=require('express')
const router =new express.Router()
const db=require('./db')
router.get('/orders',(req,res)=>{
	if(req.session.loggedin==true){
		let stat='SELECT * FROM User_Customer WHERE user_ID=?'
		db.query(stat,[req.session.username],function(err,value1,fields){
			if (err){
				console.log('error in changing database', err);
      				return;
			}else{
               req.session.customer_ID=value1[0].customer_ID;
			
		let query='SELECT amt_paid,order_ID AS last_index FROM Orders WHERE customer_ID=? and order_ID=(SELECT MAX(order_ID) FROM Orders WHERE customer_ID=?)'
				db.query(query,[req.session.customer_ID,req.session.customer_ID],function(err,result1,fields){
					if(err){
						console.log('error in selecting from orders table',err);
						return;
					}
					else{
						if(result1[0].amt_paid==null){
                        let query1='SELECT * FROM Paintings WHERE painting_ID IN (SELECT painting_ID FROM Order_Paint WHERE customer_ID=? and order_ID=?);SELECT SUM(Price) AS total FROM Paintings WHERE painting_ID IN (SELECT painting_ID FROM Order_Paint WHERE customer_ID=? and order_ID=?);'
                        req.session.order_ID=result1[0].last_index
                        db.query(query1,[req.session.customer_ID,result1[0].last_index,req.session.customer_ID,result1[0].last_index],function(err,result2,fields){
                        	if(err){
                        		console.log('error in selecting from orders paint table in orders route');
                        		return;
                        	}
                        	else{
                        	    console.log(result2);
                        	    req.session.sum=result2[1][0].total;
                        	    req.session.order_summ=result2[0]
                        		res.render('order',{username:req.session.username,isLoggedIn:req.session.loggedin,total:result2[1][0].total,isWrong:false,isSell:true,pain_info:result2[0]})
                        		return;
                        	}
                        })
                    	}
                    	else{
                    		res.render('order',{username:req.session.username,isLoggedIn:req.session.loggedin,total:0,isWrong:false,isSell:true,pain_info:[]})
                    	}
					}
				})
	}
		});
    }
    else{
    res.render('login',{username:req.session.username,isLoggedIn:req.session.loggedin,isWrong:false,isSell:true});
    }
    
})
router.get('/orders/remove/:painting_ID',(req,res)=>{
	let query='DELETE FROM Order_Paint WHERE customer_ID=? AND order_ID=? AND painting_ID=?'
	db.query(query,[req.session.customer_ID,req.session.order_ID,req.params.painting_ID],(err)=>{
     if(err){
     	console.log('error in deleting from orders paint table');
     	return;
     }
     else{
           res.redirect('/orders')
     }
	})
})

router.get('/order_paintings',(req,res)=>{
	var ord_type='';
	var discount=1;
	if(req.session.user_info.category_type=='bronze'){
                ord_type='normal';
                discount=0.99;
	}
	else if(req.session.user_info.category_type=='silver'){
		ord_type='fast';
		discount=0.95;
	}
	else if(req.session.user_info.category_type=='gold'){
		ord_type='fast';
		discount=0.90;
	}
	else{
		ord_type='fast';
		discount=0.80;
	}
	let query='UPDATE Orders SET ord_Date=CURDATE(),ord_Type=?,payment_Date=CURDATE(),amt_paid=? WHERE order_ID=? AND customer_ID=?'
	db.query(query,[ord_type,req.session.sum*discount,req.session.order_ID,req.session.customer_ID],(err)=>{
           if(err){
           	console.log('error in updating order table');
           	return;
           }
           return;
	})
	for(var i=0;i<req.session.order_summ.length;i++){
		let query1='UPDATE Paintings SET isHired=1,reinstateDate=CURDATE()+7,No_of_times_rented=No_of_times_rented+1 WHERE painting_ID=?'
		db.query(query1,[req.session.order_summ[i].painting_ID],(err)=>{
			if(err){
				console.log('error in updating paintings table');
				return;
			}
            return;
		})
		let query2='UPDATE User SET money_earnings=money_earnings+? WHERE User_ID IN (SELECT User_ID FROM User_Owner WHERE owner_ID=?)'
		db.query(query2,[req.session.order_summ[i].Price*0.1*discount,req.session.order_ID],(err)=>{
			if(err){
				console.log('error in updating user money value');
				return;
			}
			return;
		})

	}
    
    res.redirect('/home');

})
router.get('/:user_ID/paintings_rented',(req,res)=>{
   let query='SELECT * FROM Orders WHERE ord_Date+7>=CURDATE() AND customer_ID IN (SELECT customer_ID FROM User_Customer WHERE user_ID=?)'
   db.query(query,[req.session.username],function(err,result,fields){
   	if(err){
   		console.log('error in getting order information for user report');
   		return;
   	}
   	if(result.length!=0){
   		var painting_found=[]
   		for(var i=0;i<result.length;i++){
         let query1='SELECT * FROM Paintings WHERE isHired=1 AND painting_ID IN (SELECT painting_ID FROM Order_Paint WHERE order_ID=? AND customer_ID=?)'
         db.query(query1,[result[i].order_ID,result[i].customer_ID],function(err,result1,fields){
         	if(err){
         		console.log('error in getting paintings using orders for user ');
         		return;
         	}
         	for(var j=0;j<result1.length;j++){
         		painting_found.push(result1[j]);
         	}
         	console.log('loop');
         })
     	}
     	console.log(painting_found);
     	res.render('paintings_rented',{username:req.session.username,isLoggedIn:req.session.loggedin,isWrong:false,isSell:true,pain_info:painting_found})
     	return;
   	}
   	else{
   		res.render('paintings_rented',{username:req.session.username,isLoggedIn:req.session.loggedin,isWrong:false,isSell:true,pain_info:[]})
   	}
   })
})
router.get('/:user_ID/paintings_owned',(req,res)=>{
	let query='SELECT * FROM Paintings WHERE owner_ID IN (SELECT owner_ID FROM User_Owner WHERE user_ID=?)'
	db.query(query,[req.session.username],function(err,result,fields){
		if(err){
			console.log('error in getting owned paintings for profile');
			return;
		}
		if(result.length!=0){
		res.render('paintings_owned',{username:req.session.username,isLoggedIn:req.session.loggedin,isWrong:false,isSell:true,pain_info:result})
		}
		else{
			res.render('paintings_owned',{username:req.session.username,isLoggedIn:req.session.loggedin,isWrong:false,isSell:true,pain_info:[]})
		}
		return;
	})
})
router.get('/return/:painting_ID',(req,res)=>{
	let query='UPDATE Paintings SET isHired=0 WHERE painting_ID=?'
	db.query(query,[req.params.painting_ID],(err)=>{
		if(err){
			console.log('error in updating ishired from returning');
			return;
		}
		return;
	})
	res.redirect('/'+req.session.username+'/paintings_rented')
})

router.post('/filter',(req,res)=>{
	let query=``
	if(req.body.theme=="all") {
		if (req.body.fil == "new") {
			query = `SELECT * FROM  Paintings where isExpired=0 order by Date_posted desc`
		}
		else if (req.body.fil == "old") {
			query = `SELECT * FROM  Paintings where isExpired=0 order by Date_posted`
		}
		else if (req.body.fil == "nothired") {
			query = `SELECT * FROM  Paintings where isHired=0 and isExpired=0`
		}
		else if (req.body.fil == "all") {
			query = `SELECT * FROM  Paintings`
		}
		else if (req.body.fil == "best") {
			query = `SELECT * FROM  Paintings where isExpired=0 order by No_of_times_rented desc`
		}
		else if (req.body.fil == "alpha") {
			query = `SELECT * FROM  Paintings where isExpired=0 order by Title`
		}
		else {
			query = `SELECT * FROM  Paintings where isExpired=0 order by Price`
		}
		query+=`;Select distinct Genre FROM Paintings;`
		db.query(query, [req.body.theme],function (err, result, fields) {
			if (err) {
				console.log('error in changing database', err);
				return;
			}
			else{
				console.log(result[0].length)
				if (result[0].length % 3 == 0) {
					res.render('sample_pain', {
						username: req.session.username,
						isLoggedIn: req.session.loggedin,
						pain_info: result[0],
						pain_theme: result[1],
						result_len: 0
					})
				}
				else {
					res.render('sample_pain', {
						username: req.session.username,
						isLoggedIn: req.session.loggedin,
						pain_info: result[0],
						pain_theme: result[1],
						result_len: 1
					})
				}
				return;
			}
		})
	}
	else{
		if (req.body.fil == "new") {
			query = `SELECT * FROM  Paintings where isExpired=0 and Genre=? order by Date_posted desc`
		}
		else if (req.body.fil == "old") {
			query = `SELECT * FROM  Paintings where isExpired=0 and Genre=? order by Date_posted`
		}
		else if (req.body.fil == "nothired") {
			query = `SELECT * FROM  Paintings where isHired=0 and isExpired=0 and Genre=? `
		}
		else if (req.body.fil == "all") {
			query = `SELECT * FROM  Paintings where Genre=?`
		}
		else if (req.body.fil == "best") {
			query = `SELECT * FROM  Paintings where isExpired=0 and Genre=? order by No_of_times_rented desc`
		}
		else if (req.body.fil == "alpha") {
			query = `SELECT * FROM  Paintings where isExpired=0 and Genre=? order by Title`
		}
		else {
			query = `SELECT * FROM  Paintings where isExpired=0 and Genre=? order by Price`
		}
		query+=`;Select distinct Genre FROM Paintings;`
		db.query(query, [req.body.theme],function (err, result, fields) {
			if (err) {
				console.log('error in changing database', err);
				return;
			}
			else{
				console.log(result[0].length)
				if (result[0].length % 3 == 0) {
					res.render('sample_pain', {
						username: req.session.username,
						isLoggedIn: req.session.loggedin,
						pain_info: result[0],
						pain_theme: result[1],
						result_len: 0
					})
				}
				else {
					res.render('sample_pain', {
						username: req.session.username,
						isLoggedIn: req.session.loggedin,
						pain_info: result[0],
						pain_theme: result[1],
						result_len: 1
					})
				}
				return;
			}
		})
	}
})
module.exports=router;