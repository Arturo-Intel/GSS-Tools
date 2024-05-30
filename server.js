if (process.env.NODE_ENV !== 'production') {
  require("dotenv").config();
}

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
    res.json({
        message: "ok",
        dbStatus: db.state 
    });
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


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`GCS-Services app listening at ${PORT}`);
});

