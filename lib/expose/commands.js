'use strict';

const internals = {};

module.exports = {
    value: {
        dummy(server, args) {

            console.log(`dummy called with args [${args.join(', ')}]`);
        },
        async start(server, [useMock]) {

            const { centralService } = server.services();

            await centralService.start({
                io: useMock ? require('mock-firmata').Firmata : undefined
            });

            // This keeps the process from exiting
            setInterval(() => { /* no-op */ }, 5000);

            return new Promise(() => {});
        }
    }
};

internals.options = (server) => server.registrations.robot.options;
