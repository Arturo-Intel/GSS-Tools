/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

var express = require('express');
var router = express.Router();

var fetch = require('../fetch');

var { GRAPH_ME_ENDPOINT, PHOTO } = require('../authConfig');


router.get('/id',
    fetch.isAuthenticated, // check if user is authenticated
    async function (req, res, next) {
        res.render('id', {
            isAuthenticated: req.session.isAuthenticated,
            idTokenClaims: req.session.account.idTokenClaims
        });
    }
);

router.get('/profile',
    fetch.isAuthenticated, // check if user is authenticated
    async function (req, res, next) {
        try {
            const graphResponse = await fetch.fetch(GRAPH_ME_ENDPOINT, req.session.accessToken);
            res.render('profile', {
                isAuthenticated: req.session.isAuthenticated,
                profile: graphResponse,
                photo: await fetch.fetchPhoto(PHOTO, req.session.accessToken),
                sidebar: 'sidebarRL',
            });
        } catch (error) {
            next(error);
        }
    }
);

module.exports = router;