'use strict';

const Arg = require('arg');
const Glue = require('@hapi/glue');
const Manifest = require('./manifest');

exports.deployment = async (args) => {

    const manifest = Manifest.get('/', process.env);
    const server = await Glue.compose(manifest, { relativeTo: __dirname });

    await server.initialize();

    const { centralService } = server.services();

    await centralService.start(args);

    // This keeps the process from exiting
    setInterval(() => { /* no-op */ }, 5000);

    return server;
};

if (require.main === module) {

    const args = Arg({
        '--autoStart': Boolean,
        '-a': '--autoStart'
    });

    exports.deployment({
        autoStart: !!args['--autoStart']
    });

    process.on('unhandledRejection', (err) => {

        throw err;
    });
}
