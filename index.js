const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

const { Pool } = require('pg');
var pool;
pool = new Pool({
  
  connectionString: process.env.DATABASE_URL || "postgres://postgres:InderR_01@localhost/rectangle",
  ssl: {rejectUnauthorized: false}
})

var app = express()
app.use(express.json())
app.use(express.urlencoded({extended:false}))
app.use(express.static(path.join(__dirname, 'public')))

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.get('/', (req, res) => res.render('pages/index'))
app.get('/database', async (req, res) => {
  try{
    const result = await pool.query(`SELECT * FROM rectinfo`);
    const data = {'rows':result.rows }
    res.render('pages/db', data);
  }
  catch(error){
    res.end(error);
  }
})


app.get('/rectangleinformation/:rectid', (req,res)=>{
  
  pool.query(`SELECT * FROM rectinfo where rectid=$1`, [req.params.rectid], (error, result) => {
    if (error){
      res.end(error);
    } 
    const data = {'rows':result.rows }
    res.render('pages/rectangleinformation', data);
  })
      
   
})

app.get('/addrectangle', (req,res) =>{
  res.render('pages/addrectangle');
})

app.post('/addrectangle', (req,res) =>{
  console.log("post request for /addrectangle")
  var rectname = req.body.rectname
  var rectheight = req.body.rectheight
  var rectwidth = req.body.rectwidth
  var rectcolour = req.body.rectcolour
  pool.query('INSERT into rectinfo(rectname,rectheight,rectwidth,rectcolour) values($1,$2,$3,$4)',[rectname,rectheight,rectwidth,rectcolour]);
  res.redirect('/database');
})


app.post('/editrectangle/:rectid', async (req,res) =>{
  try {
    
    pool.query("UPDATE rectinfo SET rectname =$1, rectheight =$2, rectwidth =$3, rectcolour =$4 WHERE rectid =$5 RETURNING *",[req.body.rectname,req.body.rectheight,req.body.rectwidth,req.body.rectcolour,req.params.rectid], (error,result) =>{
      const data = {'rows':result.rows }
      res.render('pages/db', data);
    });
    
  } catch (error) {
    console.error(error.message);
  }
})

app.get('/editrectangle/:rectid', (req,res)=>{
  
  pool.query(`SELECT * FROM rectinfo where rectid =$1`, [req.params.rectid], (error, result) => {
    if (error){
      res.end(error);
    } 
    const data = {'rows':result.rows }
    res.render('pages/editrectangle', data);
  })
      
   
})

app.post('/delete/:rectid', async (req, res) => {
  try {
    await pool.query(`DELETE FROM rectinfo WHERE rectid =$1`, [req.params.rectid], (error,result) =>{
      var getUsersQuery = `SELECT * FROM rectinfo`;
      pool.query(getUsersQuery, (error, result) => {
        if (error){
          res.end(error);
        } 
        const data = {'rows':result.rows }
        res.render('pages/db', data);
    });
      
  });
  }
  catch (error){
    console.error(error.message);
} 
});

app.listen(PORT, () => console.log(`Listening on ${ PORT }`))


