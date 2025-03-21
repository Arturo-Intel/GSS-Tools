var express = require('express');
var router = express.Router();
var fetch = require('../fetch');
var { GRAPH_ME_ENDPOINT, PHOTO } = require('../authConfig');

/* GET WIP page. */
router.get('/',
    fetch.isAuthenticated,
    async (req, res, next) => {
        const graphResponse = await fetch.fetch(GRAPH_ME_ENDPOINT, req.session.accessToken);
        res.render('wip', {
                isAuthenticated: req.session.isAuthenticated,
                profile: graphResponse,
                photo: await fetch.fetchPhoto(PHOTO, req.session.accessToken), 
                sidebar: 'sidebarHome',
            });
    });

module.exports = router;