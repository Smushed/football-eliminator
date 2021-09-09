require(`dotenv`).config();
const AWS = require(`aws-sdk`);
const Jimp = require(`jimp`);
const userHandler = require(`./userHandler`);

AWS.config.update({
    region: `us-east-2`,
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY
});
const s3 = new AWS.S3({ params: { Bucket: 'football-eliminator' } });

const verifyAvatar = (base64Avatar) => {
    return new Promise((res, rej) => {
        const bufferedAvatar = Buffer.from(base64Avatar.split(',')[1], 'base64');
        Jimp.read(bufferedAvatar)
            .then(async img => {
                if (img.bitmap.height !== 200 || img.bitmap.width !== 200) {
                    img.resize(200, 200);
                    let mime = await img.getBase64Async(Jimp.MIME_JPEG);
                    res(mime);
                } else {
                    res(base64Avatar);
                }
            });
    });
};

const genericAvatar = () => {
    return new Promise((res, rej) => {
        const getParams = {
            Key: `stockFootballPlayer.jpg`
        };
        s3.getObject(getParams, (err, data) => {
            if (err) {
                res(err);
            }
            Jimp.read(data.Body)
                .then(async img => {
                    let mime = await img.getBase64Async(Jimp.MIME_JPEG);
                    res(mime);
                })
        });
    });
};

module.exports = {
    uploadAvatar: async (id, base64Avatar) => {
        const verifiedAvatar = await verifyAvatar(base64Avatar);
        const buf = Buffer.from(verifiedAvatar.replace(/^data:image\/\w+;base64,/, ``), `base64`)
        const data = {
            Key: id, //This can be either userId or groupId
            Body: buf,
            ContentEncoding: `base64`,
            ContentType: `image/jpeg`
        };
        s3.putObject(data, function (err) {
            if (err) {
                return (`Error Uploading the Avatar`)
            } else {
                return (`Successfully Uploaded the Avatar`);
            }
        });
    },
    getAvatar: async (id) => {
        if (id === `undefined`) {
            return;
        }
        return new Promise((res, rej) => {
            const getParams = {
                Key: id.toString()
            };
            s3.getObject(getParams, async (err, data) => {
                if (err) {
                    const stockAvatar = await genericAvatar();
                    res(stockAvatar);
                    return;
                }
                Jimp.read(data.Body)
                    .then(async img => {
                        let mime = await img.getBase64Async(Jimp.MIME_JPEG);
                        res(mime);
                    });
            });
        });
    },
    sendEmail: async (reason, userId) => {
        const user = await userHandler.getUserByID(userId).exec();
        let subject = ``;
        if (reason === `reminder`) {
            subject = `Eliminator Reminder - Week ${'INSERT WEEK HERE'} roster`;
        } else {
            subject = `Eliminator Leaderboard`;
        }



        // var params = {
        //     Destination: { /* required */
        //         ToAddresses: [
        //             `smushedcode@gmail.com`
        //         ]
        //     },
        //     Message: { /* required */
        //         Body: { /* required */
        //             Html: {
        //                 Charset: `UTF-8`,
        //                 Data: `This is a test email`
        //             },
        //         },
        //         Subject: {
        //             Charset: `UTF-8`,
        //             Data: `TestING BABY email`
        //         }
        //     },
        //     Source: `kevin@eliminator.football`
        // };

        // const sendPromise = new AWS.SES({ apiVersion: `2010-12-01` }).sendEmail(params).promise();

        // sendPromise.then(
        //     function (data) {
        //         console.log(`Email sent to ${user}`);
        //     }).catch(
        //         function (err) {
        //             console.error(err, err.stack);
        //         });
    }
}