require('dotenv').config()
const db = require("./services/db"); 
var express = require('express')
var app = express()


app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);

app.get('/', (req, res) => {
  res.json({ message: "ok" });
})

app.get("/tc", async (req, res) => {
  try {
    const data = await db.query(`SELECT *  from users;`);
    res.status(200).json({
      users: data[0],
    });
  } catch (err) {
    res.status(500).json({
      message: err,
    });
  }
});

/*const getUser = async (req, res) => {
    let queryString = `SELECT * from acct WHERE ACCT_KEY = 89`;  
    const [user] = await db.query(queryString).catch(err => {throw err}); 
    res.json(user); 
}*/

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`GCS-Services app listening at ${PORT}`);
});