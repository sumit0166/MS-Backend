const express = require("express");
const config = require("../../configuration/appConfig.json");
const { registerStatusDown } = require("../controllers/registerMs");
const logger = require("../logger");
const { fetchMsDetails } = require("../controllers/msDetails");

const router = express.Router()

router.get('/', (req, res) => {
    res.status(200).send("/ Not Found")
})

router.get('/fetchAll', (req, res) => {
    fetchMsDetails(req, res);
})




module.exports = router;