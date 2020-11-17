const mysql=require('mysql')
const db=mysql.createConnection({
	host:'localhost',
	user:'root',
	password:'password',
	insecureAuth : true,
	database:'painting_hire_buss',
	multipleStatements: true
})
db.connect(err => {
	if (err) {
    console.error('error connecting:1 ',err)
    return
  }
	console.log("Mysql is connected")
})
module.exports=db;