
const { response } = require('express');
const config = require('../../configuration/appConfig.json');
const logger = require('../logger');
const { msDetailsModel } = require('../modals/msDetails');
const { query } = require('winston');

const host = config.host;
const port = config.serverPort;
const uid = `http://${host}_${port}`;


async function fetchMsDetails(req, res) {
    logger.info('(fetchMsDetails): Fetching data: ')

    const query = [{
        $facet: {
            msWIseCount: [
                {
                    $match: {
                        status: { $in: ["up", "down"] }
                    }
                },
                {
                    $group: {
                        _id: {
                            name: "$name",
                            status: "$status"
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $group: {
                        _id: "$_id.name",
                        counts: {
                            $push: {
                                status: "$_id.status",
                                count: "$count"
                            }
                        }
                    }
                }
            ],
            allData: [
                { $replaceRoot: { newRoot: "$$ROOT" } }
            ]
        }
    }
    ]


    msDetailsModel.aggregate(query)
        .then(details => {
            if (details !== null) {
                response.data = details;
                console.log(details)

                res.status(200).json({
                    opStatus: "success",
                    details
                })
            } else {

                res.status(401).json({
                    opStatus: "Failed",
                    message: "empty data"
                })
            }
        })
}


module.exports = {
    fetchMsDetails
}