var express = require('express');
var bodyParser = require('body-parser');
var multer = require('multer');
var upload = multer();
var app = express();
var mysql = require('mysql');
Eos = require('eosjs')
const ecc = require('eosjs-ecc')

// Default configuration (additional options below)
config = {
  chainId: '038f4b0fc8ff18a4f0842a8f0564611f6e96e8535901dd45e43ac8691a1c4dca', // 32 byte (64 char) hex string
  keyProvider: ['5JDjWvh34Rasq51DmtgRo6Dba8gNSZZoHpyuhJMKoSfufsyauMu'], // WIF string or array of keys..
  httpEndpoint: 'http://195.29.45.119:80',
  expireInSeconds: 60,
  broadcast: true,
  verbose: false, // API activity
  sign: true
}

eos = Eos(config)



var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "blockone007",
  database: "p2p"
});
con.connect(function(err) {
  if (err) throw err;
});

//app.get('/regis', function(req, res){
//   res.render('form');
//});

app.set('view engine', 'pug');
app.set('views', './views');

// for parsing application/json
app.use(bodyParser.json()); 

// for parsing application/xwww-
app.use(bodyParser.urlencoded({ extended: true })); 
//form-urlencoded

// for parsing multipart/form-data
app.use(upload.array()); 
app.use(express.static('public'));

function makeid() {
var text = "";
var possible = "abcdefghijklmnopqrstuvwxyz12345";

for (var i = 0; i < 12; i++)
text += possible.charAt(Math.floor(Math.random() * possible.length));

return text;
}

function getAge(dateString) {
var today = new Date();
var birthDate = new Date(dateString);
var age = today.getFullYear() - birthDate.getFullYear();
var m = today.getMonth() - birthDate.getMonth();
if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
	age--;
   }
return age;
}
app.post('/invalid_age', function(req, res){
   res.write('age should more than or equal to 21 to register')
});

app.post('/invalid_income', function(req, res){
   res.write('income should more than 3 lakh per annum')
});

app.get('/', function(req, res){
   res.render('register');
});

app.get('/lender_form', function(req, res){
   res.render('investor_form');
});
app.get('/borrower_login', function(req, res){
   res.render('borrower_login');
});

app.get('/borrower_form', function(req, res){
   res.render('borrower_form');
});

app.get('/lender_login', function(req, res){
   res.render('lender_login');
});

app.get('/personal_details', function(req, res){
	
	res.render('personal_details', { id : req.query.id});
});

app.get('/borrower_home', function(req, res){
	
	var sql = "SELECT * FROM personal_details WHERE ID = '"+req.query.id+"' "; 
  con.query(sql, function (err, result) {
    if (err) throw err;
	  
    res.render('homepage_borrower',{
		amount      : result[0].amount,
		tenure      : result[0].tenure,
		purpose     : result[0].purpose,
		description : result[0].description,
		dob         : result[0].dob,
		city        : result[0].city,
		job         : result[0].job,
		exp         : result[0].exp,
	    pincode     : result[0].pincode,
		prof        : result[0].prof,
		turnover    : result[0].turnover,
		profit      : result[0].profit,
		residence   : result[0].residence,
		sp_inc      : result[0].sp_inc,
		other_inc   : result[0].other_inc,
		
	});
});
	
	
});
app.get('/lender_home', function(req, res){
	
	res.render('homepage_lender');
});
//when clicked signup for lender
app.post('/lender_signup', function(req, res) {
 
 var account_name = makeid()
 if (getAge(req.body.dob) < 21){
     res.redirect("/invalid_age")
     res.end()
     
   }else{


ecc.randomKey().then(privateKey => {
console.log('Private Key:\t', privateKey) // wif
console.log('Public Key:\t', ecc.privateToPublic(privateKey)) // EOSkey...
return (privateKey)

}).then( function(privateKey){

eos.transaction(tr => {
  tr.newaccount({
    creator: 'tester',
    name: account_name,
    owner: ecc.privateToPublic(privateKey),
    active: ecc.privateToPublic(privateKey)
  })

  tr.buyrambytes({
    payer: 'tester',
    receiver: account_name,
    bytes: 8192
  })

  tr.delegatebw({
    from: 'tester',
    receiver: account_name,
    stake_net_quantity: '10.0000 EOS',
    stake_cpu_quantity: '10.0000 EOS',
    transfer: 0
  })
  })
    

	var sql = "INSERT INTO lenders_login (fname, mname, lname, gender, aadhar, pancard, dob, pincode, city, email, password, contact, uname, prikey) VALUES ('"+req.body.fname+"','"+req.body.mname+"','"+req.body.lname+"','"+req.body.gender+"','"+req.body.aadhar+"','"+req.body.pancard+"','"+req.body.dob+"','"+req.body.pincode+"','"+req.body.city+"','"+req.body.email+"','"+req.body.password+"','"+req.body.contact+"', '"+ account_name +"', '"+ privateKey +"' )";
	con.query(sql, function (err, result) {
	if (err) throw err;
	console.log("1 record inserted in lenders_login, ID: " + result.insertId);
	res.redirect('/lender_home?id='+ result.insertId);
	res.end()

     eos.transaction(
  {
    // ...headers,
    actions: [
      {
        account: 'tester123455',
        name: 'createl',
        authorization: [{
          actor: 'adminl123455',
          permission: 'active'
        }],
        data: {
          lender_n: account_name,
          age: getAge (req.body.dob)
        }
      }
      ]
      })
     
  });

})
	
 }  
	  
});

/*function signup(req, res, next) {
     var sql = "INSERT INTO borrower_login (fname,mname, lname, gender, aadhar, pancard, email, password, contact) VALUES ('"+req.body.fname+"','"+req.body.mname+"','"+req.body.lname+"','"+req.body.gender+"','"+req.body.aadhar+"','"+req.body.pancard+"','"+req.body.email+"','"+req.body.password+"','"+req.body.contact+"')";
	con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted in borrower_login table, ID: " + result.insertId);
     })
    return next();  
}
function personal_details(req, res) {
    res.render('personal_details');
}
app.post('/borrower_signup', signup, personal_details);**/

//when clicked signup for borrower

app.post('/borrower_signup', function(req, res) {
	 
 var account_name = makeid()
 
ecc.randomKey().then(privateKey => {
console.log('Private Key:\t', privateKey) // wif
console.log('Public Key:\t', ecc.privateToPublic(privateKey)) // EOSkey...
return (privateKey)

}).then( function(privateKey){

eos.transaction(tr => {
  tr.newaccount({
    creator: 'tester',
    name: account_name,
    owner: ecc.privateToPublic(privateKey),
    active: ecc.privateToPublic(privateKey)
  })

  tr.buyrambytes({
    payer: 'tester',
    receiver: account_name,
    bytes: 8192
  })

  tr.delegatebw({
    from: 'tester',
    receiver: account_name,
    stake_net_quantity: '10.0000 EOS',
    stake_cpu_quantity: '10.0000 EOS',
    transfer: 0
  })
  })
    
	
	//res.sendFile('/home/developer/Documents/LoanChain/public/personal_details.html')
    var sql = "INSERT INTO borrower_login (fname,mname, lname, gender, aadhar, pancard, email, password, contact,uname, prikey) VALUES ('"+req.body.fname+"','"+req.body.mname+"','"+req.body.lname+"','"+req.body.gender+"','"+req.body.aadhar+"','"+req.body.pancard+"','"+req.body.email+"','"+req.body.password+"','"+req.body.contact+"','"+ account_name +"', '"+ privateKey +"' )";

	con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted in borrower_login table, ID: " + result.insertId);

	  res.redirect('/personal_details?id='+ result.insertId);
	 
     //res.write('Congratulation "' + req.body.fname+'" you are now registered at p2p platform.\n');
	 res.end()
    });
});
});

app.post('/homepage_borrower', function(req, res) {
	
	if (getAge(req.body.dob) < 21){
     res.redirect("/invalid_age")
     res.end()
     
   }else if(req.body.profit < 300000){
   res.redirect("/invalid_income")
	   res.end();
   
   }
	else	
	{
	console.log(req.body.id)
 var sql1="SELECT uname FROM borrower_login WHERE ID= '"+req.body.id+"'";
 con.query(sql1, function (err, result) {
    if (err) throw err;
	 var uname = result[0].uname;
	 
	 console.log(parseInt(req.body.profit))

     eos.transaction(
  {
    // ...headers,
    actions: [
      {
        account: 'tester123455',
        name: 'createb',
        authorization: [{
          actor: 'adminb123455',
          permission: 'active'
        }],
        data: {
          borrower_n: uname,
          age: getAge(req.body.dob),
          income: parseInt(req.body.profit)
        }
      }
    ]
  }
)
  });
		
	//res.sendFile('/home/developer/Documents/LoanChain/public/personal_details.html')
  var sql = "INSERT INTO personal_details (ID, amount, tenure,purpose, description, married, dob, pincode, city, job, exp, prof, turnover, profit, residence, sp_inc, other_inc, loan, credcard) VALUES ('"+req.body.id+"','"+req.body.amount+"','"+req.body.tenure+"','"+req.body.purpose+"','"+req.body.description+"','"+req.body.married+"','"+req.body.dob+"','"+req.body.pincode+"','"+req.body.city+"','"+req.body.job+"','"+req.body.exp+"','"+req.body.prof+"','"+req.body.turnover+"','"+req.body.profit+"','"+req.body.residence+"','"+req.body.sp_inc+"','"+req.body.other_inc+"','"+req.body.loan+"','"+req.body.credcard+"')";

	con.query(sql, function (err, result) {
    if (err) throw err;
    console.log("1 record inserted in personal_details table, ID: " + req.body.id);

	 res.redirect('/borrower_home?id='+ req.body.id)
     //res.write('Congratulation "' + req.body.fname+'" you are now registered at p2p platform.\n');
	 res.end()
  });
}

 });


//when clicked login for lender
app.post('/lender_valid', function(req, res) {
  var sql = "SELECT id,email, password FROM lenders_login WHERE email = '"+req.body.email+"'  AND  password= '"+req.body.password+"' "; 
  con.query(sql, function (err, result) {
    if (err) throw err;
    res.redirect('/lender_home?id='+ result[0].id);
	 res.end()
  });
});
	
//when clicked login for borrower
app.post('/borrower_valid', function(req, res) {
  var sql = "SELECT id, email, password FROM borrower_login WHERE email = '"+req.body.email+"'  AND  password= '"+req.body.password+"'"; 
  con.query(sql, function (err, result) {
    if (err) throw err;
     res.redirect('/borrower_home?id='+ result[0].id);
	 res.end()
  });
});
	



app.listen(3000);
