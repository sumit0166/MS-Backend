const logger = require("../logger");
const { productModel } = require('../modals/products')
const fs = require('fs');

function getAllProducts(req, res) {
  const query = [
    {
      $facet: {
        uniqueVariants: [
          {
            $group: {
              _id: "$variant",
              count: { $sum: 1 }
            }
          },
          {
            $project: {
              _id: 0,
              variant: "$_id",
              count: 1
            }
          }
        ],
        uniqueType: [
          {
            $group: {
              _id: "$type",
              count: { $sum: 1 }
            }
          },
          {
            $project: {
              _id: 0,
              type: "$_id",
              count: 1
            }
          }
        ],
        uniqueProductType: [
          {
            $group: {
              _id: "$prdoductType",
              count: { $sum: 1 }
            }
          },
          {
            $project: {
              _id: 0,
              variant: "$_id",
              count: 1
            }
          }
        ],
        allData: [
          { $replaceRoot: { newRoot: "$$ROOT" } }
        ]
      }
    }
  ]

    productModel.aggregate(query)    
    // productModel.find() 
    .then(products => {
      if(products){
        let respJson = {
          opStatus: 200,
          data: products
        }
        res.json(respJson);
        logger.info(`Response sent -> Data length:${products.length}`);
      } else {
        let respJson = {
          opStatus: 404,
          message: "Data not found"
        }
        res.json(respJson);
        logger.info(`Reponse sent -> ${respJson}`);
      }
    })
    .catch( error => {
      logger.error(`Error while fetching data from table ${error}`)
      res.json({
        opStatus: 4004,
        message:error
      })
    })
}

function manageProductRequest(req,res) {
  if (req.query.operation) {
    switch (req.query.operation) {
      case 'allProducts':
        getAllProducts(req,res);
        break;
      default:
        let resp = {
          opStatus: 504,
          error: "Operation NOT FOUND"
        }
        logger.error(`${req.query.operation} - Operation not found \n Response sent -> ${JSON.stringify(resp)}`)
        res.json(resp)
        break;
    }
  } else {
    let resp = {
      opStatus: 500,
      error: "No operation provided"
    }
    logger.error(`Operation not provided \n Response sent -> ${JSON.stringify(resp)}`)
    res.json(resp)
  }
}


// ---- Upload Product data call

async function processFile(filePath, originalname, productName, filedest) {
  logger.info(`Received file -> ${originalname} upload path -> ${filePath}`);
  try {
    const destinationPath = `imgs/${productName}/${originalname}`;
    const destinationDirectory = `imgs/${productName}`;
    if (!fs.existsSync(destinationDirectory)) {
      logger.error(`Destination dorectory Not Found ${destinationDirectory}`)
      fs.mkdirSync(destinationDirectory, { recursive: true });
      logger.info(`Destination dir created sucessfully`);
    }
    fs.renameSync(filePath, destinationPath);
    logger.info(`File moved to -> ${destinationPath}`);
    filedest.push(destinationPath);
  } catch (error) {
    logger.error(error);
  }
  }


async function uploadProduct (req, res) {
  var filedest = []
  try {
    const files = req.files;
    const productName = req.body.productname;

    if (files && files.length > 0) {
      await Promise.all(files.map(async (file) => {
        const { path: filePath, originalname } = file;
        await processFile(filePath, originalname, productName, filedest);
        logger.info(`files -> ${filedest}`);
      }));

      res.json({ opStatus: 200 ,message: 'Files processed successfully' });
    } else {
      res.json({ opStatus: 400, message: 'No files received' });
    }

  } catch (error) {
    res.status(500).json({opStatus:500})
  }
}






module.exports = {
    manageProductRequest,
    uploadProduct,
}