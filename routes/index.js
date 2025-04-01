var express = require('express');
var router = express.Router();

var fetch = require('../fetch');
var { GRAPH_ME_ENDPOINT, PHOTO } = require('../authConfig');

/* GET home page. */


router.get('/',
    fetch.isAuthenticated,
    async (req, res, next) => {
        const admin = await fetch.isAdmin(req.session.account?.username);
        res.render('index', {
            isAdmin: admin, 
            token: req.session.accessToken, 
            isAuthenticated: req.session.isAuthenticated,
            username: req.session.account?.username,
            profile: await fetch.fetch(GRAPH_ME_ENDPOINT, req.session.accessToken),
            photo: await fetch.fetchPhoto(PHOTO, req.session.accessToken),
            sidebar: 'sidebarHome',
        });
    });


module.exports = router;
