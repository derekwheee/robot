'use strict';

const Glue = require('@hapi/glue');
const Manifest = require('./manifest');

exports.deployment = async () => {

    const manifest = Manifest.get('/', process.env);
    const server = await Glue.compose(manifest, { relativeTo: __dirname });

    await server.initialize();

    const { centralService } = server.services();

    await centralService.start();

    // This keeps the process from exiting
    setInterval(() => { /* no-op */ }, 5000);

    return server;
};

if (require.main === module) {

    exports.deployment();

    process.on('unhandledRejection', (err) => {

        throw err;
    });
}
