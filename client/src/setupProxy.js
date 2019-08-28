const proxy = require('http-proxy-middleware')

module.exports = function (app) {
    app.use(proxy('/api', {
        target: 'http://35.238.194.245:3001/',
        changeOrigin: true
    }))
}