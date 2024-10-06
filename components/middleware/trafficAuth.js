const logger = require("../logger");
const config = require("../../configuration/appConfig.json");
const jwt = require('jsonwebtoken');

const incomingTraffic = config.corsPolicy.incomingTraffic;
const allowedOrigins = config.corsPolicy.allowedOrigins;

const corsOptions = {
    origin: (origin, callback) => {
        switch (incomingTraffic) {
            case "allowedOnly":
                if (typeof origin === 'undefined') {
                    callback("Origin not provided in request", false); // Reject the request directly
                } else if (allowedOrigins.includes(origin)) {
                    callback(null, true);
                } else {
                    callback("Not allowed by CORS", false);
                }
                break;
            case "all":
                callback(null, true);
                break;
            default:
                callback("wrong POLICY - Restricting all trafffic ", false);
                break;
        }
        //   if (incomingTraffic === "allowedOnly" && typeof origin === 'undefined') {
        //     callback("Origin not provided in request", false); // Reject the request directly
        //   } else if (incomingTraffic === "allowedOnly" && allowedOrigins.includes(origin)) {
        //     callback(null, true);
        //   } else if (incomingTraffic === "all"){
        //     callback(null, true);
        //   }else {
        //     callback("Not allowed by CORS", false);
        //   }
    },
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
};



function logRequest(req, res, next) {
    const origin = req.get('Origin');
    logger.info(`Request:, {
        ${origin},
        method: ${req.method},
        url: ${req.url}, 
      }`);
    next();
    // if (incomingTraffic === "allowedOnly" && allowedOrigins.includes(origin)) {
    //     next();
    //   } else {
    //     logger.info(`response sent -> Forbidden`);
    //     return res.status(403).send('Forbidden');
    //   }

}



const verifyToken = (secretKey) => (req, res, next) => {
    const auth = req.get('authorization');
    const token = auth?.split(' ')[1]; // Extract token from Authorization header

    if (token) {
        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    logger.error(`resp -> 403 Token expired`);
                    return res.json({ 
                        opStatus: 440,
                        message: 'Token expired' 
                    });
                  } else {
                    logger.error(`resp -> 403 Failed to authenticate token`);
                    return res.json({
                        opStatus: 403,
                        message: 'Failed to authenticate token' });
                  }
            } else {
                logger.info(`Authentication sucessfull`);
                req.decoded = decoded; // Save decoded token payload for later use
                next();
            }
        });
    } else {
        return res.status(401).json({ message: 'No token provided' });
    }
};


module.exports = {
    logRequest,
    corsOptions,
    verifyToken
}