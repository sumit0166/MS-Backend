const express = require("express");

const { getLogin } = require('../controllers/auth');
const { addUser } = require("../controllers/addDoc");

const router = express.Router()

router.put('/', (req, res) =>{
    addUser(req, res);
})

router.post('/getLogin', (req, res) => {
        getLogin(req, res);
    })

module.exports = router;