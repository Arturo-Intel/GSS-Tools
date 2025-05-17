var hitResult = "OK";
var endTime;


function start_fx(){
    document.getElementById("apiCallButton").setAttribute("disabled", "disabled");
    document.getElementById("loading-text").style.display = "block";
    document.getElementById("loadingBar").style.display = "block";
    play(); //animation
}

function end_fx(){
    document.getElementById("loading-text").style.display = "none";
    document.getElementById("loadingBar").style.display = "none";
    document.getElementById("apiCallButton").removeAttribute("disabled");
    endTime = performance.now();
    pause(); //animation    
}

function clean() {
    document.getElementById("introduction-text").style.display = "none";

    document.getElementById('status').innerText = "";
    document.getElementById("ssu-path").textContent  = ""; 
    document.getElementById("ssu-path").href  = ""; 

    document.getElementById('Main-Pointers').innerHTML = '';
    document.getElementById('step-repro').innerHTML = '';
    document.getElementById('case-evidence').innerHTML = '';
    document.getElementById('case-questions').innerText = '';
    document.getElementById('SSU-system').innerText = '';
    document.getElementById('SSU-Displays').innerText = '';
    document.getElementById('ssu-summary').innerText = '';
    
    document.getElementById('ssu-logevents').innerText = '';
    document.getElementById('ssu-dxdiag').innerText = '';
    document.getElementById('case-sentiment').innerText = '';
    document.getElementById('pse-analysis').innerText = '';
}

function logMessage(message, show=false) {
    const consoleLog = document.getElementById('consoleLog');
    const logEntry = document.createElement('div');
    let now = new Date();
    let timeString = now.toLocaleTimeString(); 

    logEntry.textContent = "["+ timeString + "] " + message;
    consoleLog.appendChild(logEntry);
    if(show)
    {
        document.getElementById("status").innerText = message;
    }
}

function show_error(error) {
    
    logMessage(error, true);
    hitResult = error; 
    endTime = performance.now();
}

function validate_url(url) {
    try {
        if(!url.match(/^(https?:\/\/)?(www\.)?github\.com\/.+$/))
        {
            throw new Error("Not a Github URL\n");
        }
        if(!url.match(/(\d+)$/))
        {
            throw new Error("Incomplete Github URL\n");
        }
        return url.match(/(\d+)$/)[0];
    }catch (error) {
        show_error("[GitHub API] " + error);
        return false;
    }
}

async function api_github_call(sufix){
    const api_url = 'https://api.github.com/repos/IGCIT/Intel-GPU-Community-Issue-Tracker-IGCIT/issues/';
    const options = {
        method: 'GET', 
        headers: {
            'Authorization': "{{gt}}" ,
            'X-GitHub-Api-Version': '2022-11-28'
        }
    };
    const url = api_url + sufix;
    try {    
        res = await fetch(url, options);
        if(!res.ok){
            throw new Error(`HTTP error! status: ${res.status}`);
        } 
        logMessage("[OK] github api call: " + url)
        return res.json();
    } catch (error) {
        show_error("[GitHub API] " + error);
        return false;
    }
}

async function api_caseAnalyzer_call(url, method, headers, body){
    try { 
        res = await fetch(url, {
            method: method,
            headers: headers,
            body: body
        });
        if(!res.ok){
            throw new Error(`HTTP error! status: ${res.status}`);
        } 
        logMessage("[OK] caseAnalyzer api call: " + url)
        return res.json();
    } catch (error) {
        show_error("[caseAnalyzer API] " + error);
        return {};
    }
    
}

function fill_HTML(data, caseInfo) {
    document.getElementById("case").style.display = "block";
    document.getElementById('case-title').innerText = data["case-analysis"].case_title; 
    document.getElementById("case-url").href = caseInfo.html_url
    document.getElementById("case-url").textContent = caseInfo.html_url
    document.getElementById('case-state').innerText = caseInfo.state; 
    document.getElementById('case-username').innerText = data["case-analysis"].username; 
    document.getElementById('case-summary').innerText = data["case-analysis"].case_summary; 

    document.getElementById('details-AppName').innerText = data["case-analysis"].app_name; 
    document.getElementById('details-Platform').innerText = data["case-analysis"].platform; 
    document.getElementById('details-API').innerText = data["case-analysis"].api;

    document.getElementById('details-GPU').innerText = data["case-analysis"].gpu;
    document.getElementById('details-CPU').innerText = data["case-analysis"].cpu;
    document.getElementById('details-Driver').innerText = data["case-analysis"].driver_version
    document.getElementById('details-OS').innerText = data["case-analysis"].os_version

    document.getElementById('case-sentiment').innerText   = data["sentiment-analysis"].sentiment_analysis;
    document.getElementById('case-temperature').innerText = data["sentiment-analysis"].case_sentiment;
    document.getElementById('case-fixed').innerText = data["sentiment-analysis"].case_fixed;
    
    data["case-analysis"].main_pointers.forEach(element => {
        const li = document.createElement('li');
        li.textContent = element;
        document.getElementById('Main-Pointers').appendChild(li);
    });

    
    data["case-analysis"].steps_reproduce.forEach(element => {
        const li = document.createElement('li');
        li.textContent = element;
        document.getElementById('step-repro').appendChild(li);
    });

    if (data["case-analysis"].evidence.length > 0){
        data["case-analysis"].evidence.forEach(element => {
            const a = document.createElement('a');
            a.href = element;
            a.text = element;
            a.target = "_blank";
            const li = document.createElement('li');
            li.appendChild(a);
            document.getElementById('case-evidence').appendChild(li);
        });
    } else {
        const li = document.createElement('li');
        li.textContent = "No evidence links";
        document.getElementById('case-evidence').appendChild(li);
    }

    data["case-analysis"].questions.forEach(element => {
        const li = document.createElement('li');
        li.textContent = element;
        document.getElementById('case-questions').appendChild(li);
    });

    if(data["SSU-path"] == "null") {
        document.getElementById("ssu-path").textContent = "SSU file not provided."
        document.getElementById("ssu").style.display= "none";
        document.getElementById("LogEvents").style.display= "none";
        document.getElementById("DxDiaglog").style.display= "none";
        
    } else { 
        document.getElementById("ssu").style.display= "block";
        document.getElementById("LogEvents").style.display= "block";
        document.getElementById("DxDiaglog").style.display= "block";
        document.getElementById("ssu-path").textContent = data["SSU-path"]; 
        document.getElementById("ssu-path").href  = data["SSU-path"];

        ssuAnalysis = data["SSU-analysis"];
        
        for (const key in ssuAnalysis) {
            if (ssuAnalysis.hasOwnProperty(key)) {
                const value = ssuAnalysis[key];
                if(key != "notes" && key != "recommendations" && key != "displays" && key != "summary") {
                    const dt = document.createElement("dt");
                    const dd = document.createElement("dd");
                    dt.textContent = `${key}`;
                    dd.textContent = `${value}`;
                    document.getElementById('SSU-system').appendChild(dt)
                    document.getElementById('SSU-system').appendChild(dd)
                }
            }
        }

        document.getElementById('ssu-summary').innerText = ssuAnalysis.summary;
        document.getElementById('ssu-recommendations').innerText = ssuAnalysis.recommendations;
        document.getElementById('ssu-notes').innerText = ssuAnalysis.notes;

        ssuBulkDisplays = data["SSU-analysis"].displays;
        for (const key in ssuBulkDisplays) {
            ssuDisplays = ssuBulkDisplays[key];
            for (const key in ssuDisplays) {
                if (ssuDisplays.hasOwnProperty(key)) {
                    const value = ssuDisplays[key];
                    const dt = document.createElement("dt");
                    const dd = document.createElement("dd");
                    dt.textContent = `${key}`;
                    dd.textContent = `${value}`;
                    document.getElementById('SSU-Displays').appendChild(dt)
                    document.getElementById('SSU-Displays').appendChild(dd)
                }
            }
            document.getElementById('SSU-Displays').appendChild(document.createElement("dt"));
            document.getElementById('SSU-Displays').appendChild(document.createElement("dd"));
        }
        if(data["LogEvents-analysis"]){
            document.getElementById('ssu-logevents').innerText = data["LogEvents-analysis"].logEvents
        }else {
            document.getElementById('ssu-logevents').innerText = "no logs found"
        }
            
            if(data["DXDiag-analysis"]){
            document.getElementById('ssu-dxdiag').innerText = data["DXDiag-analysis"].WindowsErrorReporting
        }else {
            document.getElementById('ssu-dxdiag').innerText = "no logs found"
        }
    }

    pseHandeling = data["sentiment-analysis"]
    for (const key in pseHandeling) {
        if (pseHandeling.hasOwnProperty(key)) {
            if(key != "case_sentiment" && key != "sentiment_analysis" && key != "case_fixed") {
                const value = pseHandeling[key];
                const dt = document.createElement("dt");
                const dd = document.createElement("dd");
                dt.textContent = `${key}`;
                dd.textContent = `${value}`;
                document.getElementById('pse-analysis').appendChild(dt)
                document.getElementById('pse-analysis').appendChild(dd)
            }
        }
    }
}

document.getElementById('apiCallButton').addEventListener('click', async () => {
    const startTime = performance.now();
    endTime = startTime;
    clean();
    start_fx();
    
    try {
        // Get and validate URL
        const caseURL = document.getElementById('case-URL-input').value;
        const caseNUM = validate_url(caseURL);
        if(!caseNUM){
            throw new Error("validate_url(caseURL)");
        }

        // Call Github and get case info and comments
        const caseInfo = await api_github_call(caseNUM);
        if (!caseInfo) {
            throw new Error("[api_github_call]");
        }
        const commentsInfo = await api_github_call(caseNUM+"/comments"); 
        
        // Send Github data to iGPT
        const data = await api_caseAnalyzer_call("/caseanalyzer/case", 
            "POST", 
            {"Content-Type": "application/json"}, 
            JSON.stringify ({
                "caseInfo": caseInfo, 
                "commentsInfo": commentsInfo 
            })
        );
        
        // No data pulled from iGPT
        if(!data) { 
            throw new Error("[data] Error pulling data from iGPT");
        }

        // Error from iGPT
        if(data["case-error"]) {
           throw new Error("[data[\"case-error\"]]" + data["case-error"]);
        }

        // fill all HTML structure with data info
        fill_HTML(data, caseInfo);
        
        // "click" the summary tab
        document.getElementById("summary-button").click();    
        
        // save data of "hit" of this analysis on database
        api_caseAnalyzer_call("/caseanalyzer/hit", 
            "POST", 
            {"Content-Type": "application/json"}, 
            JSON.stringify ({
                "datetime": getDateTime(),
                "action": "Case Analyzer: URL [" + caseURL + "]",
                "result": hitResult,
                "time": millisecondsToHHMMSS(endTime - startTime)
            })
        );
        logMessage("[Ok]", true);

    } catch (error) {
        logMessage(error);
    } 
    end_fx();

});
