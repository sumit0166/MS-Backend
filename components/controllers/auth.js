const logger = require("../logger");
const { userModel } = require('../modals/users')
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const defaultUserConfig = require('../../configuration/defaultUser.json');
const secretKey = "nodeJaApp@8082forwebsite";


const getLogin = (req, res) => {
  const operation = req.query.operation;
  try {
    switch (operation) {
      case "userAuth":
        logger.info(`--Reuest info:\n   Method : POST\n   Operation : ${operation}\n   BODY: ${JSON.stringify(req.body, null, 2)}`)
        //console.log('---------- Request body ---------\n',req.body,'\n -------- END -----------')
        var username = req.body.username;
        var passwd = req.body.passwd;
        userModel.findOne({ username: username })
          .then(users => {
            if (users !== null) {
              if (users.username == username && users.passwd == passwd) {
                const token = jwt.sign({ username, passwd, roles: users.roles }, secretKey, { expiresIn: '1h' });
                // res.json({ token });
                let resp = {
                  opStatus: 200,
                  isAuthSuccesfull: true,
                  roles: users.roles,
                  token
                }
                logger.info(`Authentication sucessful \n Response sent -> ${JSON.stringify(resp, 2, null)}`)
                res.json(resp)
              } else {
                let resp = {
                  opStatus: 2001,
                  isAuthSuccesfull: false,
                }
                logger.info(`Authentication failed \n Response sent -> ${JSON.stringify(resp)}`)
                res.json(resp)
              }
            } else {
              let resp = {
                opStatus: 2002,
                isAuthSuccesfull: false,
              }
              logger.info(`>> Match not found in db \n response sent -> ${JSON.stringify(resp)} `)
              res.json(resp)
            }
          })
          .catch(err => {
            let resp = {
              opStatus: 502,
              message: `Databse Error ${err}`
            }
            logger.error(`Databse Error ${err} \n response sent -> ${JSON.stringify(resp)}`);
            res.json(resp);
          })

        break;
      case 'userAuthHash':
        getLoginHash(req, res);
        break;

      default:
        let response = {
          opStatus: 400,
          message: 'operation not found'
        }
        logger.info(`operatin not found, res  josn ${response}`);
        res.json(response)
        break;
    }
  } catch (error) {
    logger.error(error.message, error)
    res.json({
      opStatus: 500,
      message: error.message
    })
  }
}

const comparePasswords = async (password, hashedPassword) => {
  return await bcrypt.compare(hashedPassword, password);
};

const decryprtPass = (value) => {
  [extractSecret, extarctPass] = atob(value).split("_#");
  if (extractSecret !== secretKey) {
    return 
  }
  return atob(extarctPass)
}

const getLoginHash = async (req, res) => {
  const operation = req.query.operation;
  logger.info(`--Reuest info:\n   Method : POST\n   Operation : ${operation}\n   BODY: ${JSON.stringify(req.body, null, 2)}`)
  console.log('---------- Request body ---------\n',req.body,'\n -------- END -----------')
  var username = req.body.username;
  var passwd = req.body.passwd;
  try {
    userModel.findOne({ username: username })
      .then(async users => {
        if (users === null) {
          let resp = {
            opStatus: 2002,
            isAuthSuccesfull: false,
          }
          logger.info(`>> Match not found in db \n response sent -> ${JSON.stringify(resp)} `);
          res.json(resp);
          return;
        }
        const dbPass = decryprtPass(users.passwd);
        // console.log(dbPass);
        const isPasswordMatched = await comparePasswords(passwd, dbPass);
        // const isPasswordMatched = users.passwd === passwd;
        // console.log("users.passwd === passwd", users.passwd === passwd, `\n from database -  ${users.passwd}\n from login - ${passwd}`);
        // console.log("isPasswordMatched - ", isPasswordMatched);
        // console.log("users.username == username ", users.username == username);
        if (users.username === username && isPasswordMatched) {
          const token = jwt.sign({ username, passwd, roles: users.roles }, secretKey, { expiresIn: '1h' });
          // res.json({ token });
          let resp = {
            opStatus: 200,
            isAuthSuccesfull: true,
            roles: users.roles,
            token
          }
          logger.info(`Authentication sucessful \n Response sent -> ${JSON.stringify(resp, 2, null)}`)
          res.json(resp)
        } else {
          let resp = {
            opStatus: 2001,
            isAuthSuccesfull: false,
          }
          logger.info(`Authentication failed \n Response sent -> ${JSON.stringify(resp)}`)
          res.json(resp)
        }
      })
      .catch(err => {
        let resp = {
          opStatus: 502,
          message: `Databse Error ${err}`
        }
        logger.error(`Databse Error ${err} \n response sent -> ${JSON.stringify(resp)}`);
        res.json(resp);
      })

  } catch (error) {
    logger.error(error.message, error)
    res.json({
      opStatus: 500,
      message: error.message
    })
  }
}


const createDefaultUser = async () => {
  logger.info(`----- Checking existing defaultUser -----`)
  // console.log('----- Checking existing defaultUser -----')
  try {
    userModel.findOne({ username: 'admin' })
      .then(async user => {
        if (user !== null) {
          logger.info(`>> defaultUser already exists in db `);
          return;
        }
        logger.info(`----- Creating default User -----`)
        logger.info(`----- User details: ${JSON.stringify(defaultUserConfig)} -----`)
        const newUser = new userModel(defaultUserConfig);
        const savedUser = await newUser.save();
        logger.info(`>> defaultUser created successfully: ${JSON.stringify(savedUser)}`);
        return;
      })
      .catch(err => {
        let resp = {
          opStatus: 502,
          message: `Databse Error ${err}`
        }
        logger.error(`Databse Error ${err} \n response sent -> ${JSON.stringify(resp)}`);
        res.json(resp);
      })

  } catch (error) {
    logger.error(error.message, error)
    res.json({
      opStatus: 500,
      message: error.message
    })
  }
}


async function delUser(req, res) {
  try {
    // const username = req.body.username;
    const delResp = await userModel.deleteOne({username: req.body.username})
    console.log(">>> delResp",delResp)
    res.status(200).json(delResp);
  } catch (error) {
    console.error('(deluser) - '+error)
    res.status(500).json({error});
  }
}





module.exports = {
  getLogin,
  delUser,
  secretKey,
  createDefaultUser
};