var hitResult = "OK";
var githubCase = false;
var endTime;

function validate_url(url) {
    if(!url.match(/^(https?:\/\/)?(www\.)?github\.com\/.+$/))
    {
        throw new Error("Not a Github URL\n");
    }
    if(!url.match(/(\d+)$/))
    {
        throw new Error("Incomplete Github URL\n");
    }
    githubCase = true; //?
    return url.match(/(\d+)$/)[0];
}

async function github_call(url){
    
    const options = {
        method: 'GET', 
        headers: {
            'Authorization': "{{gt}}" ,
            'X-GitHub-Api-Version': '2022-11-28'
        }
    };
    
    res = await fetch(url, options);
    
    if(!call.ok){
        document.getElementById('status').innerText = "Github case ["+ num + "] doesn\'t exist.";
        hitResult = "Github case ["+ num + "] doesn\'t exist.";
        endTime = performance.now();
        return false;
    } 
    return res;
}

function start_fx(){
    document.getElementById("apiCallButton").setAttribute("disabled", "disabled");
    document.getElementById("case").style.display = "none";
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

document.getElementById('apiCallButton').addEventListener('click', async () => {
    const startTime = performance.now();
    endTime = startTime;
    clean();
    start_fx();
    
    try {
        const caseURL = document.getElementById('case-URL-input').value;
        const caseNUM = validate_url(caseURL);
        console.log(">>>> "+caseNUM);
    } catch (error) {
        document.getElementById('status').innerText = error;
        hitResult = error; 
        endTime = performance.now();
    } 
    // try {
    //     const url = 'https://api.github.com/repos/IGCIT/Intel-GPU-Community-Issue-Tracker-IGCIT/issues/';

    //     if(!githubCase) {
    //         document.getElementById('status').innerText += "Not a valid or supported URL"
    //         hitResult = "Not a valid or supported URL";
    //         endTime = performance.now();
    //     } 
        
    //     const caseRaw = github_call(url+num);
    //     const commentsRaw = github_call(url+num+"/comments"); 
    //     if(!github_call(num)){

    //     }

    //         {
    //             const caseInfo = await caseRaw.json();
    //             const commentsInfo = await commentsRaw.json();
                
    //             response = await fetch("/caseanalyzer/case", {
    //                 method: "POST",
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                 },
    //                 body: JSON.stringify ({
    //                         "caseInfo": caseInfo, 
    //                         "commentsInfo": commentsInfo 
    //                         })
    //             });
    //             const data = await response.json();

    //             if(data["case-error"]) {
    //                 document.getElementById('status').innerText = data["case-error"];
    //                 hitResult = data["case-error"];
    //                 endTime = performance.now();
    //             } else {
    //                 document.getElementById("introduction-text").style.display = "none";
    //                 document.getElementById("case").style.display = "block";
                    
    //                 clean();

    //                 document.getElementById('case-title').innerText = data["case-analysis"].case_title; 
    //                 document.getElementById("case-url").href = caseInfo.html_url
    //                 document.getElementById("case-url").textContent = caseInfo.html_url
    //                 document.getElementById('case-state').innerText = caseInfo.state; 
    //                 document.getElementById('case-username').innerText = data["case-analysis"].username; 
    //                 document.getElementById('case-summary').innerText = data["case-analysis"].case_summary; 

    //                 document.getElementById('details-AppName').innerText = data["case-analysis"].app_name; 
    //                 document.getElementById('details-Platform').innerText = data["case-analysis"].platform; 
    //                 document.getElementById('details-API').innerText = data["case-analysis"].api;

    //                 document.getElementById('details-GPU').innerText = data["case-analysis"].gpu;
    //                 document.getElementById('details-CPU').innerText = data["case-analysis"].cpu;
    //                 document.getElementById('details-Driver').innerText = data["case-analysis"].driver_version
    //                 document.getElementById('details-OS').innerText = data["case-analysis"].os_version

    //                 document.getElementById('case-sentiment').innerText   = data["sentiment-analysis"].sentiment_analysis;
    //                 document.getElementById('case-temperature').innerText = data["sentiment-analysis"].case_sentiment;
    //                 document.getElementById('case-fixed').innerText = data["sentiment-analysis"].case_fixed;
                    
    //                 data["case-analysis"].main_pointers.forEach(element => {
    //                     const li = document.createElement('li');
    //                     li.textContent = element;
    //                     document.getElementById('Main-Pointers').appendChild(li);
    //                 });

                    
    //                 data["case-analysis"].steps_reproduce.forEach(element => {
    //                     const li = document.createElement('li');
    //                     li.textContent = element;
    //                     document.getElementById('step-repro').appendChild(li);
    //                 });

    //                 if (data["case-analysis"].evidence.length > 0){
    //                     data["case-analysis"].evidence.forEach(element => {
    //                         const a = document.createElement('a');
    //                         a.href = element;
    //                         a.text = element;
    //                         a.target = "_blank";
    //                         const li = document.createElement('li');
    //                         li.appendChild(a);
    //                         document.getElementById('case-evidence').appendChild(li);
    //                     });
    //                 } else {
    //                     const li = document.createElement('li');
    //                     li.textContent = "No evidence links";
    //                     document.getElementById('case-evidence').appendChild(li);
    //                 }

    //                 data["case-analysis"].questions.forEach(element => {
    //                     const li = document.createElement('li');
    //                     li.textContent = element;
    //                     document.getElementById('case-questions').appendChild(li);
    //                 });

    //                 if(data["SSU-path"] == "null") {
    //                     document.getElementById("ssu-path").textContent = "SSU file not provided."
    //                     document.getElementById("ssu").style.display= "none";
    //                     document.getElementById("LogEvents").style.display= "none";
    //                     document.getElementById("DxDiaglog").style.display= "none";
                        
    //                 } else { 
    //                     document.getElementById("ssu").style.display= "block";
    //                     document.getElementById("LogEvents").style.display= "block";
    //                     document.getElementById("DxDiaglog").style.display= "block";
    //                     document.getElementById("ssu-path").textContent = data["SSU-path"]; 
    //                     document.getElementById("ssu-path").href  = data["SSU-path"];

    //                     ssuAnalysis = data["SSU-analysis"];
                        
    //                     for (const key in ssuAnalysis) {
    //                         if (ssuAnalysis.hasOwnProperty(key)) {
    //                             const value = ssuAnalysis[key];
    //                             if(key != "notes" && key != "recommendations" && key != "displays" && key != "summary") {
    //                                 const dt = document.createElement("dt");
    //                                 const dd = document.createElement("dd");
    //                                 dt.textContent = `${key}`;
    //                                 dd.textContent = `${value}`;
    //                                 document.getElementById('SSU-system').appendChild(dt)
    //                                 document.getElementById('SSU-system').appendChild(dd)
    //                             }
    //                         }
    //                     }

    //                     document.getElementById('ssu-summary').innerText = ssuAnalysis.summary;
    //                     document.getElementById('ssu-recommendations').innerText = ssuAnalysis.recommendations;
    //                     document.getElementById('ssu-notes').innerText = ssuAnalysis.notes;

    //                     ssuBulkDisplays = data["SSU-analysis"].displays;
    //                     for (const key in ssuBulkDisplays) {
    //                         ssuDisplays = ssuBulkDisplays[key];
    //                         for (const key in ssuDisplays) {
    //                             if (ssuDisplays.hasOwnProperty(key)) {
    //                                 const value = ssuDisplays[key];
    //                                 const dt = document.createElement("dt");
    //                                 const dd = document.createElement("dd");
    //                                 dt.textContent = `${key}`;
    //                                 dd.textContent = `${value}`;
    //                                 document.getElementById('SSU-Displays').appendChild(dt)
    //                                 document.getElementById('SSU-Displays').appendChild(dd)
    //                             }
    //                         }
    //                         document.getElementById('SSU-Displays').appendChild(document.createElement("dt"));
    //                         document.getElementById('SSU-Displays').appendChild(document.createElement("dd"));
    //                     }
    //                     if(data["LogEvents-analysis"]){
    //                         document.getElementById('ssu-logevents').innerText = data["LogEvents-analysis"].logEvents
    //                     }else {
    //                         document.getElementById('ssu-logevents').innerText = "no logs found"
    //                     }
                            
    //                         if(data["DXDiag-analysis"]){
    //                         document.getElementById('ssu-dxdiag').innerText = data["DXDiag-analysis"].WindowsErrorReporting
    //                     }else {
    //                         document.getElementById('ssu-dxdiag').innerText = "no logs found"
    //                     }
    //                 }

    //                 pseHandeling = data["sentiment-analysis"]
    //                 for (const key in pseHandeling) {
    //                     if (pseHandeling.hasOwnProperty(key)) {
    //                         if(key != "case_sentiment" && key != "sentiment_analysis" && key != "case_fixed") {
    //                             const value = pseHandeling[key];
    //                             const dt = document.createElement("dt");
    //                             const dd = document.createElement("dd");
    //                             dt.textContent = `${key}`;
    //                             dd.textContent = `${value}`;
    //                             document.getElementById('pse-analysis').appendChild(dt)
    //                             document.getElementById('pse-analysis').appendChild(dd)
    //                         }
    //                     }
    //                 }
    //             }
    //         } 
        
    // } catch (error) {
    //     document.getElementById('status').innerText = error;
    //     hitResult = error; 
    //     endTime = performance.now();
    // } 

    // document.getElementById("summary-button").click();
   
    end_fx();
    
    // const saveHit = await fetch("/caseanalyzer/hit", {
    //         method: "POST",
    //         headers: {
    //             'Content-Type': 'application/json' // Set the content type to JSON
    //         },
    //         body: JSON.stringify({
    //             "datetime": getDateTime(),
    //             "action": "Case Analyzer: URL [" + caseURL + "]",
    //             "result": hitResult,
    //             "time": millisecondsToHHMMSS(endTime - startTime)
    //         }),
    //     });
    // if (!saveHit.ok) {
    //     console.error("Could not save hit data", saveHit.status);
    // } 
});
