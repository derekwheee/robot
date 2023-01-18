'use strict';

const useEffect = (effect, slugs) => ({ effect, slugs });

module.exports = [
    useEffect((action) => {

        console.log(action);
    }, ['Receive.updatValues'])
];
