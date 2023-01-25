'use strict';

const useEffect = (effect, slugs) => ({ effect, slugs });

module.exports = [
    useEffect((...args) => {

        console.log('EFFECT');
        console.log(args);
    }, ['Receive.updatValues'])
];
