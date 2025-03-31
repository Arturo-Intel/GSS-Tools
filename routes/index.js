var express = require('express');
var router = express.Router();
var dbConn = require('../lib/db');
var fetch = require('../fetch');
var { GRAPH_ME_ENDPOINT, PHOTO } = require('../authConfig');

/* GET home page. */


router.get('/',
    fetch.isAuthenticated,
    async (req, res, next) => {
        const isadmin = await dbConn.query(`SELECT IF(username = '`+req.session.account?.username+`', TRUE, FALSE) as isAdmin FROM vip_list;`) 
        res.render('index', {
            isAdmin: isadmin[0]['isAdmin'], 
            token: req.session.accessToken, 
            isAuthenticated: req.session.isAuthenticated,
            username: req.session.account?.username,
            profile: await fetch.fetch(GRAPH_ME_ENDPOINT, req.session.accessToken),
            photo: await fetch.fetchPhoto(PHOTO, req.session.accessToken),
            sidebar: 'sidebarHome',
        });
    });


module.exports = router;
