var express = require('express');
var router = express.Router();
var fetch = require('../fetch');
var axios = require('axios');
const path = require('path');
const fs = require('fs').promises;
const HttpsProxyAgent = require('https-proxy-agent');

var { GRAPH_ME_ENDPOINT, PHOTO } = require('../authConfig');


/* GET case analyzer page. */
router.get('/',
    fetch.isAuthenticated,
    async (req, res, next) => {
        res.render('caseAnalyzer', {
        });
    });

router.post('/case', 
    fetch.isAuthenticated,
    async (req, res) => {
        try {
            var analysis = ""
            analysis = await brains(req.body.body);
            token =  await getAccessToken();
            res.json(analysis);
        } catch (error) {
            console.error('Error calling API:', error);
            res.status(500).send('Error calling API');
        }
    });

async function brains(caseInfo) {
    try {
        persona = await fetchPersona(1);
        ssuPath = await findSSU(caseInfo);
        return {
            "SSU-path" : ssuPath,
            "SSU-analysis" : "??", 
            "case-analysis": "??"
        }
    } catch (err) {
        console.log("[ERROR] brains - " + err)
    }
}


async function getAccessToken(){
    try {
        const url = "https://apis-internal.intel.com/v1/auth/token";
        data = {
            "grant_type": "client_credentials",
            "client_id": process.env.CLIENT_ID_AI,
            "client_secret": process.env.CLIENT_SECRET_AI
        };
        headers = {
            "Content-Type": "application/x-www-form-urlencoded"
        };
        response = await axios.post(url, data, { headers: headers});
        console.log("[TOKEN] "+ response)
    }catch (err) {
        console.log("[ERROR] token -  " + err)
    }
}

async function findSSU(body) {
    try {
        const regex = /https:\/\/github\.com\/user-attachments\/files\/\d+\/[^)]+/;
        result = body.match(regex)[0];
        console.log(result)
        return result;
    } catch (err) {
        console.log("[WARNING] SSU not found! ")
        return "No SSU file provided"
    }
}

async function fetchPersona(persona) {
    try {
        var filePath = "";

        switch (persona){
            case 1: filePath = path.join(__dirname, '../public', 'persona', 'IntelGithubIssuesAnalyzer.md'); break;
            case 2: filePath = path.join(__dirname, '../public', 'persona', 'IntelSSUAnalyzer.md'); break;
        }
        
        data = await fs.readFile(filePath, 'utf8');
        return data;
    } catch(err) {
        console.log("[ERROR] persona -  " + err)
    }
}
   
module.exports = router;