const mysql = require("mysql");
const util = require("util");

var connection;

connection = mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER_NM,
    password: process.env.DB_PASSWORD,
    database: process.env.DB
});
// promise wrapper to enable async await with MYSQL
connection.query = util.promisify(connection.query).bind(connection);

// connect to the database
connection.connect(function (err) {
    if (err) {
        console.log(typeof (err));
        for (var k in err) {
            console.log(`${k}: ${err[k]}`)
        }
        return;
    };
    console.log("Database online!");
});

module.exports = connection;