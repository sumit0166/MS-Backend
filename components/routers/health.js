const express = require("express");
const config = require("../../configuration/appConfig.json");

const router = express.Router()

router.get('/', (req, res) =>{
    res.json({
        opStatus: 200,
        message: "100%"
      })
})

router.get('/getVersion', (req, res) => {
    res.json({
        version: config.version
      })
    })

module.exports = router;