const express = require("express");
const config = require("../../configuration/appConfig.json");
const { registerStatusDown } = require("../controllers/registerMs");
const logger = require("../logger");

const router = express.Router()

router.get('/', (req, res) => {
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

router.get('/killServer', (req, res) => {
  logger.info('(route- /killServer): Received kill signa from remote, triggering SIGINT')
  try {
    process.kill(process.pid, "SIGINT")
    res.json({
      opStatus: 200,
      isKilled: true
    })
    
  } catch (error) {
    res.json({
      opStatus: 500,
      isKilled: false,
      error
    })
  }

}
)

module.exports = router;