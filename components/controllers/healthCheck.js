const logger = require("../logger");
const axios = require('axios');
const config = require('../../configuration/appConfig.json');
const { application } = require("express");


const apis = [
  { method : 'PUT', name : "addUser", url : '/iam', body: {username: 'test', passwd: 'test@123', roles: 'read_only'}},// bycrypt hash and salt round 10
  { method : 'POST', name : "getLogin", url : '/iam/getLogin?operation=userAuthHash', body: { username: 'test', passwd: '$2b$10$Sp7KU2Lljo3zIz2aG70d5ePodPKKPXtDSL.Gl/R5xGFR6CZtqYCVG'}},
  { method : 'DELETE', name : "delUser", url : '/iam', body: { username: 'test'}},
  { method : 'GET', name : "getProducts", url : '/products/getProducts?operation=allProducts', headers: { Authorization: 'Bearer apiTestToken' },},
  // { method : 'POST', name : "uploadProduct", url : '/products/uploadProduct', body: {}},
]
const host = 'http://'+config.host+":"+config.serverPort

async function checkHealth(req, res){
  let healthyApis = 0;
  const results = []

  for ( const api of apis) {
    try {
      const options = { 
        method: api.method,
        url: host+api.url,
        ...(api.headers && { headers: api.headers }),
        ...(api.body && {data : api.body})
      }

      const response = await axios(options);
      if (response.status == 200) {
        healthyApis++;
        results.push({api: api.name, status: 'healthy'})
      } 
      else {
        results.push({api: api.name, status: 'unhealthy'})
      }

    } catch (error) {
      console.error("axio catch "+error);
      results.push({ api: api.name, status: 'Unhealthy', error: error.message });
    }
  }
  
  const healthPercentage = (healthyApis / apis.length) * 100;
  console.log({ healthPercentage, results })
  if (healthPercentage !== 100) {
    res.status(400).json({ healthPercentage, results });
  } else {
    res.status(200).json({ healthPercentage, results });
  }

}

module.exports = {
    checkHealth
  };