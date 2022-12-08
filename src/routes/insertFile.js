const express = require('express');
const axios = require('axios');

const getSecrets = require('../services/getSecrets');

const axiosInstance = axios.create({
  baseURL: 'https://communitykitchens.my.salesforce.com/services',
});

const SF_API_PREFIX = '/data/v56.0/sobjects/Document/';

const insertFile = async () => {
  const secrets = await getSecrets(['AWS_ACCESS_KEY', 'AWS_SECRET']);
  const tokenResult = await getToken(secrets);
  if (!tokenResult.success) {
    return console.log(
      'Attempt to get Salesforce token failed: ' + JSON.stringify(tokenResult)
    );
  }

  const fs = require('fs');
  fs.readFile('./logo.jpeg', async (err, data) => {
    if (err) {
      console.log(err);
    }
    const postBody = `
    --boundary_string
    Content-Disposition: form-data; name="entity_document";
    Content-Type: application/json

    {  
        "Description" : "Marketing brochure for Q1 2011",
        "Name" : "Andy's File",
        "Type" : "jpg"
    }

    --boundary_string
    Content-Type: image/jpg
    Content-Disposition: form-data; name="Body"; filename="file.jpg"

    ${data}

    --boundary_string--`;
    try {
      const res = await axiosInstance.post(SF_API_PREFIX, postBody, {
        'Content-Type': 'multipart/form-data; boundary="boundary_string',
      });
      console.log(res.data);
    } catch (err) {
      console.log(err.response.data);
    }
  });
};

const getToken = async (secrets) => {
  const SALESFORCE_AUTH_CREDENTIALS = {
    client_id: secrets.SF_CLIENT_ID,
    client_secret: secrets.SF_CLIENT_SECRET,
    grant_type: 'client_credentials',
  };

  const SFAuthPost = new URLSearchParams();
  for (field in SALESFORCE_AUTH_CREDENTIALS) {
    SFAuthPost.append(field, SALESFORCE_AUTH_CREDENTIALS[field]);
  }

  let token;
  const SF_AUTH_URI = '/oauth2/token';
  try {
    const SFResponse = await axiosInstance.post(SF_AUTH_URI, SFAuthPost, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    token = SFResponse.data.access_token;
  } catch (err) {
    return err.response.data;
  }
};

insertFile();
