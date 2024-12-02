const logger = require("../logger");
const { registerStatusDown } = require("./registerMs");

function handleKillSignal(){

    
    process.on('SIGINT', async () => {
        logger.error('(handleKillSignal): Received SIGINT. Shutting down gracefully...');
        
        await  registerStatusDown().then(
            updatedDoc => {
                logger.info('(handleKillSignal): Updated MSDetails '+ JSON.stringify(updatedDoc))
              })
        
        logger.error('(handleKillSignal): Exiting...');
        process.exit(0);  // Exit the process with success code
    });
    
    process.on('SIGTERM', async () => {
        logger.error('(handleKillSignal): Received SIGTERM. Shutting down gracefully...');
        
        await  registerStatusDown().then(
            updatedDoc => {
                logger.info('(handleKillSignal): Updated MSDetails '+ JSON.stringify(updatedDoc))
              })
        
        logger.error('(handleKillSignal): Exiting...');
        process.exit(0);  // Exit the process with success code
    });
} 

process.on('uncaughtException', async (error) => {
    logger.error('Uncaught exception:', error);
    logger.info('Performing cleanup before shutdown...');

    await  registerStatusDown().then(
        updatedDoc => {
            logger.info('(handleKillSignal): Updated MSDetails '+ JSON.stringify(updatedDoc))
          })
    
    logger.error('(handleKillSignal): Exiting...');
    
    console.log('Cleanup complete. Exiting due to uncaught exception...');
    process.exit(1);  // Exit with error code
});


process.on('unhandledRejection', async (reason, promise) => {
    console.error('Unhandled rejection at:', promise, 'reason:', reason);
    console.log('Performing cleanup before shutdown...');

    // Perform cleanup tasks here
    await cleanupTasks();
    
    console.log('Cleanup complete. Exiting due to unhandled rejection...');
    process.exit(1);  // Exit with error code
});


module.exports = {
    handleKillSignal,
}