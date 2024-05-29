var express = require('express')
var app = express()
var port = 4000
app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(process.env.PORT || port, () => {
  console.log(`GCS-Services app listening at ${port}`);
});