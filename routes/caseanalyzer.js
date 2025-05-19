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
        try{
            const graphResponse = await fetch.fetch(GRAPH_ME_ENDPOINT, req.session.accessToken);
            const admin =  await fetch.isAdmin(req.session.account?.username);
            res.render('caseAnalyzer', {
                gt: process.env.GITHUB_TOKEN,
                isAdmin: admin,
                isAuthenticated: req.session.isAuthenticated,
                profile: graphResponse,
                photo: await fetch.fetchPhoto(PHOTO, req.session.accessToken), 
                sidebar: 'sidebarCaseAnalyzer',
            });
        } catch (err) {
            console.log('Error calling GRAPH API:', err);
            res.redirect('/auth/signin');
        }
    }
);

router.post('/case', 
    fetch.isAuthenticated,
    async (req, res) => {
        console.log('\n[START]');
        try {
            var analysis = ""
            const inputCase = "User: "+ req.body.caseInfo.user.login + " Title: "+ req.body.caseInfo.title + "\n" + req.body.caseInfo.body;
            const inputComments = "Case description: " + req.body.caseInfo.body + " Comments: " + JSON.stringify(req.body.commentsInfo);
            res.write('[BRAIN] from server')
            analysis = await brain(inputCase, inputComments);
            res.json(analysis);
        } catch (error) {
            console.log('Error calling API:', error);
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
            console.log("Error save hit", err)
            res.status(500).send('Error save hit');
        }
        
    }
);

async function brain(inputCase, inputComments) {
    console.log('[BRAIN]')

    try {
        let SSUraw=null;
        let SSUsections = [];
        LogEventsAnalysis = "LogEvents section not found."
        DXDiagAnalysis = " DXDiag section not found."
        
        await Promise.all([
            token = await getAccessToken(),
            personaSSU = await fetchPersona("SSU"),
            personaLogEvents = await fetchPersona("LogEvents"),
            personaDXdiag = await fetchPersona("DXDiag"),
            personaSentiment = await fetchPersona("Sentiment"),
            personaCase = await fetchPersona("case"),
            ssuPath = await findSSUpath(inputCase)
        ]);

        if (!token) {
            return {"case-error" : "[ERROR] Token timeout"}
        }
        if (!personaSSU || !personaLogEvents || !personaDXdiag) {
            return {"case-error" : "[ERROR] Persona"}
        }
        if (!personaCase) {
            return {"case-error" : "[ERROR] Persona Case"}
        }
        // SSU path was found in case Info
        if(ssuPath != "null") {
            console.log("[SSUraw] -"+ ssuPath)
            try {
                const response = await axios.get(ssuPath, { responseType: 'text' });
                SSUraw = response.data;
                SSUsections = SSUraw.split('...#SSU#...');
                console.log("[SSUraw] -fin")
                
            } catch (err) {
                console.log("[ERROR] SSUraw - " + err)
            }
            if (SSUsections.length > 1){
                SSUAnalysis = await invokeModel(token, personaSSU, SSUsections[0], "SSUAnalysis");
                if (SSUsections.length > 2) {
                    let logsEventsLimited = SSUsections[1].split('\n').slice(0, 2000).join('\n'); 
                    LogEventsAnalysis = await invokeModel(token, personaLogEvents, logsEventsLimited, "LogEventAnalysis");
                    if (SSUsections.length > 3){
                        DXDiagAnalysis = await invokeModel(token, personaDXdiag, SSUsections[2], "DXDiagAnalysis");
                    }
                }
            } else {
                SSUAnalysis = "Problem with SSU Sections.";    
            }
        } else {
            SSUAnalysis = "SSU not provided.";
        }
        sentimentAnalysis = await invokeModel(token, personaSentiment, inputComments, "sentimentAnalysis")    
        caseAnalysis = await invokeModel(token, personaCase, inputCase, "caseAnalysis")
        try {
            
            SSUAnalysisJSON = JSON.parse(SSUAnalysis.match(/\{(?:[^{}]*|\{(?:[^{}]*|\{[^{}]*\})*\})*\}/g))
            LogEventsAnalysisJSON = JSON.parse(LogEventsAnalysis.match(/\{(?:[^{}]*|\{(?:[^{}]*|\{[^{}]*\})*\})*\}/g))
            DXDiagAnalysisJSON = JSON.parse(DXDiagAnalysis.match(/\{(?:[^{}]*|\{(?:[^{}]*|\{[^{}]*\})*\})*\}/g))
            sentimentJSON = JSON.parse(sentimentAnalysis.match(/\{(?:[^{}]*|\{(?:[^{}]*|\{[^{}]*\})*\})*\}/g))
            caseJSON = JSON.parse(caseAnalysis.match(/\{(?:[^{}]*|\{(?:[^{}]*|\{[^{}]*\})*\})*\}/g))
        }catch (err) {
            console.log("JSON error", err)
        }

        console.log('[BRAIN] -fin')
        return {
            "SSU-path" : ssuPath,
            "SSU-analysis" : SSUAnalysisJSON, 
            "LogEvents-analysis" : LogEventsAnalysisJSON, 
            "DXDiag-analysis" : DXDiagAnalysisJSON,  
            "sentiment-analysis" : sentimentJSON,   
            "case-analysis": caseJSON
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
                "model": "gpt-4o",
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
            case "SSU": filePath = path.join(__dirname, '../public', 'persona', 'SSU.md'); break;
            case "LogEvents": filePath = path.join(__dirname, '../public', 'persona', 'LogEvents.md'); break;
            case "DXDiag": filePath = path.join(__dirname, '../public', 'persona', 'Dxdiag.md'); break;
            case "Sentiment": filePath = path.join(__dirname, '../public', 'persona', 'sentiment.md'); break;
        }
        
        persona = await fs.readFile(filePath, 'utf8');
        console.log('[PERSONA] '+ personaName + " -fin");
        return persona;

    } catch(err) {
        console.log("[ERROR] persona -  " + err)
    }
}
   
module.exports = router;