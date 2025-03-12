var express = require('express');
var router = express.Router();
var fetch = require('../fetch');
var { GRAPH_ME_ENDPOINT, PHOTO } = require('../authConfig');

/* GET case analyzer page. */
router.get('/',
    fetch.isAuthenticated,
    async (req, res, next) => {
        res.render('caseanalyzer', {});
    });

module.exports = router;