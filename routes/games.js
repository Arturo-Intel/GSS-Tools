var express = require('express');
var router = express.Router();
var dbConn = require('../services/db');

router.get('/', async (req, res, next) => {
    try {
        const rows = await dbConn.query(`SELECT *  from game_inventory;`)
        res.render('games', { data: rows });
    } catch (err){
        req.flash('error', err);
        res.render('games', { data: '' });   
    }
});

module.exports = router;
