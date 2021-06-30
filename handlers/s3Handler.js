const AWS = require(`aws-sdk`);
require(`dotenv`).config();
const Jimp = require(`jimp`);

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
                Key: id
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
    }
}