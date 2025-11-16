const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const { exit } = require('process');


const logger = require('./components/logger');
const config = require('./configuration/appConfig.json');


const productRouter  = require('./components/routers/products');
const loginRouter  = require('./components/routers/iam');
const healthRouter  = require('./components/routers/health');
const handleMsDetails = require('./components/routers/handleMsDetails');

const secretKey = "nodeJaApp@8082forwebsite";
const { logRequest, corsOptions } = require('./components/middleware/trafficAuth');
const { registerStatusUp } = require('./components/controllers/registerMs');
const { handleKillSignal } = require('./components/controllers/handleKillSignal');
const { createDefaultUser } = require('./components/controllers/auth');

const app = express();

// const originalLog = console.log;

// console.log = function (...args) {
//   const err = new Error();
//   const stack = err.stack.split('\n').slice(2).join('\n'); // Get the stack trace
//   originalLog.apply(console, args);
//   originalLog("Stack trace:\n", stack);
// };

// app.use(cors());
//app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  logRequest(req, res, next);
});

app.use(cors(corsOptions));
app.use(express.json());
app.use('/images', express.static('/imgs'));


app.use("/products", productRouter);
app.use("/iam", loginRouter);
app.use("/health", healthRouter);
app.use("/msDetail", handleMsDetails);

handleKillSignal()

// app.post('/upload', upload.array('image'), async (req, res) => {
//   uploadProduct(req,res);
// });

// app.get('/getProducts', (req, res) => {
//   manageProductRequest(req, res);
// });


// app.post('/getLogin', (req, res) => {
//     getLogin(req, res);
// })


app.listen(config.serverPort, () => {
  dbUser = process.env.DB_USER || config.dbUser;
  dbPassword = process.env.DB_PASSWD || config.dbPassword;
  dbHost = process.env.DB_HOST || config.dbHost;

  logger.info(`server is running on port > ${config.serverPort}`);
  DB_URL = 'mongodb://'+ dbUser + ':' + dbPassword +'@'+ dbHost + ':' + config.port + '/' + config.dbName + '?authSource=admin'
  logger.info(DB_URL);
  mongoose.connect(DB_URL)
  .then(() => {
    logger.info('Connected to MongoDB');
    try{
      createDefaultUser();
    } catch(err){
      logger.error(`Error in creating default user: ${err}`)
    }
    registerStatusUp();
  })
  .catch((error) => {
    logger.error(`Database connection error: ${error.message}`);
    process.kill(process.pid, "SIGINT")
  });
})

