export default {
    '*.{js,ts}': async (files) => {
        return [`npm run eslint:fix ${files.join(' ')}`]
    },
    '*.{html,json,yml,yaml,md}': async (files) => {
        return [`npm run prettier:fix ${files.join(' ')}`]
    },
}
