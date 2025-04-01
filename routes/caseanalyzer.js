var express = require('express');
var router = express.Router();
var fetch = require('../fetch');
var dbConn = require('../lib/db');
var axios = require('axios');
const path = require('path');
const fs = require('fs').promises;
var { GRAPH_ME_ENDPOINT, PHOTO } = require('../authConfig');


/* GET case analyzer page. */
router.get('/',
    fetch.isAuthenticated,
    async (req, res, next) => {
        const graphResponse = await fetch.fetch(GRAPH_ME_ENDPOINT, req.session.accessToken);
        const admin =  await fetch.isAdmin(req.session.account?.username);
        res.render('caseAnalyzer', {
            isAdmin: admin,
            isAuthenticated: req.session.isAuthenticated,
            profile: graphResponse,
            photo: await fetch.fetchPhoto(PHOTO, req.session.accessToken), 
            sidebar: 'sidebarCaseAnalyzer',
        });
    }
);

router.post('/case', 
    fetch.isAuthenticated,
    async (req, res) => {
        console.log('\n[START]');
        try {
            var analysis = ""
            const inputCase = "User: "+ req.body.user.login + "Title: "+ req.body.title + "\n" + req.body.body;
            analysis = await brain(inputCase);
            res.json(analysis);
        } catch (error) {
            console.error('Error calling API:', error);
            res.status(500).send('Error calling API');
        }
    }
);

router.post('/hit',
    fetch.isAuthenticated,
    async (req, res, next) => {
        var form_data = {
            datetime: req.body.datetime,
            action: req.body.action,
            username: req.session.account?.username,
            result: req.body.result,
            response_time: req.body.time
        }
        try {
            const rows = await dbConn.query('INSERT INTO activity_log SET ?', form_data)
        } catch (err) {
            console.error("Error save hit", err)
            res.status(500).send('Error save hit');
        }
        
    }
);

async function brain(inputCase) {
    console.log('[BRAIN]')
    try {


        await Promise.all([
            token = await getAccessToken(),
            personaSSU = await fetchPersona("SSU"),
            personaCase = await fetchPersona("case"),
            ssuPath = await findSSUpath(inputCase)
        ]);

        if (!token) {
            return {"case-error" : "[ERROR] Token timeout"}
        }
        if (!personaSSU) {
            return {"case-error" : "[ERROR] Persona SSU"}
        }
        if (!personaCase) {
            return {"case-error" : "[ERROR] Persona Case"}
        }
        // SSU path was found in case Info
        if(ssuPath != "null") {
            console.log("[SSUINFO] -"+ ssuPath)
            try {
                SSUInfo = await axios.get(ssuPath, { responseType: 'text' });
                console.log("[SSUINFO] -fin")
            } catch (err) {
                console.log("[ERROR] ssuinfo - " + err)
            }
            SSUAnalysis = await invokeModel(token, personaSSU, SSUInfo.data, "SSUAnalysis");
        } else {
            SSUAnalysis = "SSU not provided.";
        }
            
        caseAnalysis = await invokeModel(token, personaCase, inputCase, "caseAnalysis")
        console.log('[BRAIN] -fin')
        return {
            "SSU-path" : ssuPath,
            "SSU-analysis" : SSUAnalysis, 
            "case-analysis": JSON.parse(caseAnalysis.match(/\{([^}]*)\}/g))
        }
        
    } catch (err) {
        return {
            "case-error" : "[ERROR] brains - " + err
        }
    }
}

async function invokeModel(accessToken, systemPrompt, content, fromWhere){
    console.log('[INVOKEMODEL] ' + fromWhere);
   
    try {
        const url = "https://apis-internal.intel.com/generativeaiinference/v1";
        headers = {
            "Authorization": "Bearer " + accessToken,
            "Content-Type": "application/json"
        };
        data = {
            "correlationId": "string",
            "options": {
                "temperature": 0.2,
                "top_P": 0.40,
                "frequency_Penalty": 0,
                "presence_Penalty": 0,
                "max_Tokens": 4000,
                "stop": null,
                "model": "gpt-4-turbo",
                "allowModelFallback": true 
            },
            "conversation": [
                {
                    "role": "system",
                    "content": systemPrompt
                },
                {
                    "role": "user",
                    "content": content
                }
            ]
        };

        response = await axios.post(url, data, { headers: headers});
        console.log('[INVOKEMODEL] -fin');
        return response.data.conversation[2].content;

    }catch (err) {
        console.log("[ERROR] invokeModel > " + fromWhere + " - "+err);
        return "[ERROR] " + fromWhere + " - " + err;
    }
}


async function getAccessToken(){
    console.log('[TOKEN]')
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
        const response = await axios.post(url, data, { headers: headers, timeout: 3000});
        console.log('[TOKEN] -fin');
        return response.data.access_token;
    }catch (err) {
        console.log("[ERROR] token -  " + err)
    }
}

async function findSSUpath(context) {
    console.log('[FINDSSU]')
    try {
        const regex = /https:\/\/github\.com\/user-attachments\/files\/\d+\/[^)]+/;
        result = context.match(regex)[0];
        console.log('[FINDSSU] '+ result); 
        console.log('[FINDSSU] -fin')
        return result;
    } catch (err) {
        console.log("[WARNING] SSU not found! ")
        return "null"
    }
}

async function fetchPersona(personaName) {
    console.log('[PERSONA] '+ personaName)
    try {
        var filePath = "";

        switch (personaName){
            case "case": filePath = path.join(__dirname, '../public', 'persona', 'IntelGithubIssuesAnalyzer.md'); break;
            case "SSU": filePath = path.join(__dirname, '../public', 'persona', 'IntelSSUAnalyzer.md'); break;
        }
        
        persona = await fs.readFile(filePath, 'utf8');
        console.log('[PERSONA] '+ personaName + " -fin");
        return persona;

    } catch(err) {
        console.log("[ERROR] persona -  " + err)
    }
}
   
module.exports = router;