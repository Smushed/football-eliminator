require(`dotenv`).config();
const path = require('path');
const AWS = require(`aws-sdk`);
const Jimp = require(`jimp`);
const db = require('../models');

AWS.config.update({
  region: 'us-east-2',
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_SECRET_KEY,
});

const verifyAvatar = (base64Avatar) => {
  return new Promise((res, rej) => {
    const bufferedAvatar = Buffer.from(base64Avatar.split(',')[1], 'base64');
    Jimp.read(bufferedAvatar).then(async (img) => {
      if (img.bitmap.height !== 200 || img.bitmap.width !== 200) {
        img.resize(200, 200);
        res(await img.getBase64Async(Jimp.MIME_JPEG));
      } else {
        res(base64Avatar);
      }
    });
  });
};

const genericAvatar = () => {
  return new Promise((res, rej) => {
    const getParams = {
      Key: 'stockFootballPlayer.jpg',
    };
    s3.getObject(getParams, (err, data) => {
      if (err) {
        res(err);
      }
      Jimp.read(data.Body).then(async (img) => {
        res(await img.getBase64Async(Jimp.MIME_JPEG));
      });
    });
  });
};

const readWithJimp = (image, mimeType) => {
  return new Promise((res, rej) => {
    Jimp.read(image).then(async (img) => {
      res(await img.getBase64Async(mimeType));
    });
  });
};

module.exports = {
  uploadAvatar: async (id, base64Avatar) => {
    const verifiedAvatar = await verifyAvatar(base64Avatar);
    const buf = Buffer.from(
      verifiedAvatar.replace(/^data:image\/\w+;base64,/, ``),
      `base64`
    );
    const data = {
      Key: id, //This can be either userId or groupId
      Body: buf,
      ContentEncoding: `base64`,
      ContentType: `image/jpeg`,
    };
    const s3 = new AWS.S3({ params: { Bucket: 'football-eliminator' } });
    s3.putObject(data, function (err) {
      if (err) {
        return `Error Uploading the Avatar`;
      } else {
        return `Successfully Uploaded the Avatar`;
      }
    });
  },
  getAvatar: async (id) => {
    if (id === 'undefined') {
      throw 'Id cannot be undefined';
    }
    return new Promise((res, rej) => {
      const getParams = {
        Key: id.toString(),
      };
      const s3 = new AWS.S3({ params: { Bucket: 'football-eliminator' } });
      s3.getObject(getParams, async (err, data) => {
        if (err) {
          //If the user has no image in S3 then get the generic one
          res(
            await readWithJimp(
              path.join(
                __dirname,
                `../constants/images/stockFootballPlayer.jpg`
              ),
              Jimp.MIME_JPEG
            )
          );
          return;
        }
        res(await readWithJimp(data.Body, Jimp.MIME_JPEG));
      });
    });
  },
  updatePlayerAvatar: async (playerIdArray) => {
    for (let player of playerIdArray) {
      if (player.E && player.A) {
        Jimp.read(
          `https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/${player.E}.png&w=50&h=36&cb=1`
        )
          .then(async (img) => {
            const s3 = new AWS.S3({
              params: { Bucket: 'football-eliminator/playerAvatar' },
            });
            const mime = await img.getBase64Async(Jimp.MIME_PNG);
            const buf = Buffer.from(
              mime.replace(/^data:image\/\w+;base64,/, ``),
              `base64`
            );
            const data = {
              Key: player.M.toString(),
              Body: buf,
              ContentEncoding: `base64`,
              ContentType: `image/png`,
            };
            s3.putObject(data, function (err) {
              if (err) {
                return `Error Uploading the Avatar`;
              } else {
                return db.PlayerData.findOneAndUpdate(
                  { M: player.M },
                  { AV: true }
                )
                  .then((res) => `Successfully Uploaded the Player Avatar`)
                  .catch((err) => `Error Saving bool in avatar ${err}`);
              }
            });
          })
          .catch((err) => console.log(err));
      }
    }
  },
  getPlayerAvatar: async (id) => {
    if (id === 'undefined') {
      throw 'Id cannot be undefined';
    }
    return new Promise((res, rej) => {
      const getParams = {
        Key: id.toString(),
      };
      const s3 = new AWS.S3({
        params: { Bucket: 'football-eliminator/playerAvatar' },
      });
      s3.getObject(getParams, async (err, data) => {
        if (err) {
          //If the user has no image in S3 then get the generic one
          res(await getPlayerOutlineAvatar());
          return;
        }
        res(await readWithJimp(data.Body, Jimp.MIME_JPEG));
      });
    });
  },
  getPlayerOutlineAvatar: () => {
    return new Promise(async (res) => {
      res(
        await readWithJimp(
          path.join(__dirname, `../constants/images/playerOutline.png`),
          Jimp.MIME_JPEG
        )
      );
    });
  },
};

// https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/${ESPN ID}.png&w=50&h=36&cb=1

// Jimp.read(
//   'https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/2975674.png&w=50&h=36&cb=1'
// )
//   .then(async (img) => {
//     const s3 = new AWS.S3({
//       params: { Bucket: 'football-eliminator/playerAvatar' },
//     });
//     const mime = await img.getBase64Async(Jimp.MIME_PNG);
//     const buf = Buffer.from(
//       mime.replace(/^data:image\/\w+;base64,/, ``),
//       `base64`
//     );
//     const data = {
//       Key: '2975674',
//       Body: buf,
//       ContentEncoding: `base64`,
//       ContentType: `image/png`,
//     };
//     console.log({ data });
//     s3.putObject(data, function (err) {
//       console.log('somethign returned', { data, err });
//       if (err) {
//         return `Error Uploading the Avatar`;
//       } else {
//         return `Successfully Uploaded the Player Avatar`;
//       }
//     });
//   })
