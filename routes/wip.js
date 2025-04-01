var express = require('express');
var router = express.Router();
var fetch = require('../fetch');
var { GRAPH_ME_ENDPOINT, PHOTO } = require('../authConfig');

/* GET WIP page. */
router.get('/',
    fetch.isAuthenticated,
    async (req, res, next) => {
        const graphResponse = await fetch.fetch(GRAPH_ME_ENDPOINT, req.session.accessToken);
        const admin =  await fetch.isAdmin(req.session.account?.username);
        res.render('wip', {
                isAdmin: admin, 
                isAuthenticated: req.session.isAuthenticated,
                profile: graphResponse,
                photo: await fetch.fetchPhoto(PHOTO, req.session.accessToken), 
                sidebar: 'sidebarHome',
            });
    });

module.exports = router;