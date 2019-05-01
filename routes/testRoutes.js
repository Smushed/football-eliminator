const testHandler = require(`../handlers/testHandler`);
require(`dotenv`).config();


module.exports = app => {
    app.get(`/api/testroster`, async (req, res) => {
        res.status(200).send('Working!')
    });
}