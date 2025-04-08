var express = require('express');
var router = express.Router();
var dbConn = require('../lib/db');
var fetch = require('../fetch');
var { GRAPH_ME_ENDPOINT, PHOTO } = require('../authConfig');

/* GET home page. */


router.get('/',
    fetch.isAuthenticated,
    async (req, res, next) => {
        const graphResponse = await fetch.fetch(GRAPH_ME_ENDPOINT, req.session.accessToken);
        const admin = await fetch.isAdmin(req.session.account?.username);
        res.render('index', {
            home: false,
            isAdmin: admin, 
            token: req.session.accessToken, 
            isAuthenticated: req.session.isAuthenticated,
            username: req.session.account?.username,
            profile: graphResponse,
            photo: await fetch.fetchPhoto(PHOTO, req.session.accessToken),
            sidebar: 'sidebarHome',
        });
    });

router.get('/home',
    fetch.isAuthenticated,
    async (req, res, next) => {
        const graphResponse = await fetch.fetch(GRAPH_ME_ENDPOINT, req.session.accessToken);
        const admin = await fetch.isAdmin(req.session.account?.username);
        res.render('index', {
            home: true,
            isAdmin: admin, 
            token: req.session.accessToken, 
            isAuthenticated: req.session.isAuthenticated,
            username: req.session.account?.username,
            profile: graphResponse,
            photo: await fetch.fetchPhoto(PHOTO, req.session.accessToken),
            sidebar: 'sidebarHome',
        });
    });

router.post('/hit',
    fetch.isAuthenticated,
    async (req, res, next) => {
        var form_data = {
            datetime: req.body.datetime,
            action: req.body.action,
            username: req.session.account?.username,
            result: req.body.result            
        }
        try {
            const rows = await dbConn.query('INSERT INTO activity_log SET ?', form_data)
        } catch (err) {
            console.error("Error save hit", err)
            res.status(500).send('Error save hit');
        }
        
    }
);

module.exports = router;
