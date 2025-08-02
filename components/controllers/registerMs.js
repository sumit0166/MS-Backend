
const config = require('../../configuration/appConfig.json');
const logger = require('../logger');
const { msDetailsModel } = require('../modals/msDetails')

const host = config.host;
const port = config.serverPort;
const uid = `http://${host}_${port}`;


async function registerStatusDown() {
    logger.info('(registerStatusDown): Marking service down: ')
    const status = 'down';
    const statusCode = 0;
    const query = (
        { uid },
        {
            $set: {
                status,
                statusCode,
                lastDownTime: new Date
            }
        }
    )
    try {
    logger.info(`(registerStatusDown): Query --> msDetailsModel.findOneAndUpdate(${JSON.stringify(query)})`);
        const updateDoc = await msDetailsModel.updateOne(query)
        logger.info('(registerStatusDown): Document updated - '+ JSON.stringify(updateDoc));
        return updateDoc;
        
    } catch (error) {
        logger.error('(registerStatusDown): Error updating record:', error);
    }
}

function registerStatusUp() {
    const status = 'up';
    const statusCode = 1;
    logger.info('(registerStatusUp): Marking service up in DB ')
    logger.info(`(registerStatusUp): --- host: ${host}, port: ${port} ----`);
    logger.info(`(registerStatusUp): Checking for existing details of uid: ${uid}`);

    try {
        msDetailsModel.findOne({ uid: uid })
            .then(async existDoc => {
                if (existDoc) {
                    existDoc.status = status;
                    existDoc.statusCode = statusCode;
                    existDoc.lastUpTime = new Date();

                    const updatedDocument = await existDoc.save();
                    logger.info('(registerStatusUp): Document updated:'+ updatedDocument);
                } else {
                    const newData = {
                        uid: uid,
                        name: 'backend',
                        host: host,
                        port: port,
                        url: url,
                        status: status,
                        statusCode: statusCode,
                        lastUpTime: new Date,
                    }

                    logger.info('(registerStatusUp): document not exist');
                    const newDocument = new msDetailsModel(newData);
                    const savedDocument = await newDocument.save();
                    logger.info('(registerStatusUp): New document added:'+ savedDocument);
                }
            })

    } catch (error) {
        logger.error('(registerStatusUp): Error fetching record:', error);
    }

}

module.exports = {
    registerStatusUp,
    registerStatusDown
}