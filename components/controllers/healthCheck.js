const logger = require("../logger");
const axios = require('axios');
const config = require('../../configuration/appConfig.json');
const { application } = require("express");


const apis = [
  { method : 'PUT', name : "addUser", url : '/iam', body: {username: 'test', passwd: 'test@123', roles: 'read_only'}},// bycrypt hash and salt round 10
  { method : 'POST', name : "getLogin", url : '/iam/getLogin?operation=userAuthHash', body: { username: 'test', passwd: '$2b$10$Sp7KU2Lljo3zIz2aG70d5ePodPKKPXtDSL.Gl/R5xGFR6CZtqYCVG'}},
  { method : 'GET', name : "getProducts", url : '/products/getProducts?operation=allProducts'},
  // { method : 'POST', name : "uploadProduct", url : '/products/uploadProduct', body: {}},
]
const host = 'http://'+config.host+":"+config.serverPort

async function checkHealth(req, res){
  let healthyAPIs = 0;
  const result = []

  for ( const api of apis) {
    try {
      const options = { 
        method: api.method,
        url: host+api.url,
        ...(api.body && {data : api.body})
      }

      const response = await axios(options);
      if (response.status == 200) {
        healthyAPIs++;
        result.push({api: api.name, status: 'healthy'})
      } 
      else {
        result.push({api: api.name, status: 'unhealthy'})
      }

    } catch (error) {
      console.error(error);
      results.push({ api: api.name, status: 'Unhealthy', error: error.message });
    }
  }
  
  const healthPercentage = (healthyApis / apis.length) * 100;
  res.json({ healthPercentage, results });

}

module.exports = {
    checkHealth
  };