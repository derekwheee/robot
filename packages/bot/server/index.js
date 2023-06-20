'use strict';

const Arg = require('arg');
const Glue = require('@hapi/glue');
const Exiting = require('exiting');
const Manifest = require('./manifest');

exports.deployment = async ({ start, ...args }) => {

    const manifest = Manifest.get('/', process.env);
    const server = await Glue.compose(manifest, { relativeTo: __dirname });

    if (start) {
        await Exiting.createManager(server).start();
        server.log(['start'], `Server started at ${server.info.uri}`);
    }

    const { centralService } = server.services();

    await centralService.start(args);

    // This keeps the process from exiting
    setInterval(() => { /* no-op */ }, 5000);

    return server;
};

if (require.main === module) {

    const args = Arg({
        '--autoStart': Boolean,
        '-a': '--autoStart',
        '--giveSight': Boolean,
        '-g': '--giveSight'
    });

    exports.deployment({
        start: true,
        autoStart: !!args['--autoStart'],
        giveSight: !!args['--giveSight']
    });

    process.on('unhandledRejection', (err) => {

        throw err;
    });
}
