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
			
		let query='SELECT order_ID AS last_index FROM Orders WHERE customer_ID=? and order_ID=(SELECT MAX(order_ID) FROM Orders WHERE customer_ID=?)'
				db.query(query,[req.session.customer_ID,req.session.customer_ID],function(err,result1,fields){
					if(err){
						console.log('error in selecting from orders table',err);
						return;
					}
					else{
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
                        		res.render('order',{username:req.session.username,isLoggedIn:req.session.loggedin,total:result2[1][0].total,isWrong:false,isSell:true,pain_info:result2[0]})
                        		return;
                        	}
                        })
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

router.post('/order_paintings',(req,res)=>{
	/*let query=''
	
	1.update amt_paid
	2.update values in order table
	3.update values in painting table
	
	db.query(,function(){

	})*/
})
module.exports=router;