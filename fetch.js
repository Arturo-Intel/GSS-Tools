/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

var axios = require('axios');




/**
 * Attaches a given access token to a MS Graph API call
 * @param endpoint: REST API endpoint to call
 * @param accessToken: raw access token string
 */
async function fetch(endpoint, accessToken) {
    const options = {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    };

    console.log(`request made to ${endpoint} at: ` + new Date().toString());

    try {
        const response = await axios.get(endpoint, options);
        return await response.data;
    } catch (error) {
        throw new Error(error);
    }
}

async function fetchPhoto(endpoint, accessToken) {
    const options = {
        headers: {
             Authorization: `Bearer ${accessToken}`             
        },
        responseType: 'arraybuffer'
    };

    console.log(`[PHOTO] request made to ${endpoint} at: ` + new Date().toString());

    try {
        const response = await axios.get(endpoint, options);
        
        return await {
            data : response,
            url: 'data:image/jpeg;base64,' + Buffer.from(response.data, 'binary').toString('base64')
        }
    } catch (error) {
        throw new Error(error);
    }
}



// custom middleware to check auth state
function isAuthenticated(req, res, next) {
    console.log(">>>>>>>>>" + process.env.NODE_ENV)
    
    if (!req.session.isAuthenticated) {
        return res.redirect('/auth/signin'); // redirect to sign-in route
    }

    next();
};

module.exports = {
    fetch,
    fetchPhoto,
    isAuthenticated
};