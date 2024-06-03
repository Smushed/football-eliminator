import 'dotenv/config.js';
import { join } from 'path';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { fileURLToPath } from 'url';
import * as path from 'path';
import Jimp from 'jimp';
import db from '../models/index.js';
import { createLinkedList } from '../utils/LinkedList.js';

const client = new S3Client({
  region: 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
  },
});

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const verifyAvatar = (base64Avatar) => {
  return new Promise((res, rej) => {
    const bufferedAvatar = Buffer.from(base64Avatar.split(',')[1], 'base64');
    Jimp.read(bufferedAvatar)
      .then(async (img) => {
        if (img.bitmap.height !== 200 || img.bitmap.width !== 200) {
          console.log({ img });
          img.resize(200, 200);
          res(await img.getBase64Async(Jimp.MIME_JPEG));
        } else {
          res(base64Avatar);
        }
      })
      .catch((err) => {
        console.log({ err });
      });
  });
};

const genericUserAvatar = async () => {
  const command = new GetObjectCommand({
    Bucket: 'football-eliminator',
    Key: 'stockFootballPlayer.jpg',
  });
  const genAvatar = await getAvatarFromAWS(command, true);
  res(genAvatar);
};

const readWithJimp = (image, mimeType) =>
  new Promise((res, rej) => {
    Jimp.read(image)
      .then(async (img) => {
        res(await img.getBase64Async(mimeType));
      })
      .catch((err) => {
        console.log({ err });
        res();
      });
  });

const getAvatarFromAWS = async (getCommand, isUser) =>
  new Promise(async (res, rej) => {
    try {
      const userAvatar = await client.send(getCommand);
      const avatarByteArray = await userAvatar.Body.transformToString('base64');
      res(`data:image/jpeg;base64,${avatarByteArray}`);
    } catch (err) {
      if (err.Code !== 'NoSuchKey') {
        console.log({ err });
      }
      let avatarPath = '../constants/images/playerOutline.png';
      if (isUser) {
        avatarPath = '../constants/images/stockFootballPlayer.jpg';
      }
      res(await readWithJimp(join(__dirname, avatarPath), Jimp.MIME_JPEG));
    }
  });

const updatePlayerAvatarFromLinkedList = (node) => {
  if (node.val.E === 0) {
    if (node.next) {
      updatePlayerAvatarFromLinkedList(node.next);
    }
    return;
  }
  Jimp.read(
    `https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/${node.val.E}.png&w=50&h=36&cb=1`
  )
    .then(async (img) => {
      const command = new PutObjectCommand({
        Bucket: 'football-eliminator/playerAvatar',
        Key: node.val.M.toString(),
        Body: buf,
        ContentEncoding: `base64`,
        ContentType: `image/png`,
      });
      const mime = await img.getBase64Async(Jimp.MIME_PNG);
      const buf = Buffer.from(
        mime.replace(/^data:image\/\w+;base64,/, ``),
        `base64`
      );
      client.send(command).then(
        () => {
          db.PlayerData.findOneAndUpdate({ M: node.val.M }, { AV: true }).then(
            () => {
              if (node.next) {
                updatePlayerAvatarFromLinkedList(node.next);
              } else {
                console.log('Finished updating player avatars');
              }
            }
          );
          return;
        },
        (err) => {
          console.log(`Error Uploading the Avatar`, err);
          return `Error Uploading the Avatar`;
        }
      );
    })
    .catch((err) =>
      console.log('Error Jimp Reading image from ESPN. ID: ', node.val.E, err)
    );
};

export default {
  uploadAvatar: async (id, base64Avatar) => {
    const verifiedAvatar = await verifyAvatar(base64Avatar);
    const buf = Buffer.from(
      verifiedAvatar.replace(/^data:image\/\w+;base64,/, ``),
      `base64`
    );
    const command = new PutObjectCommand({
      Bucket: 'football-eliminator',
      Key: id, //This can be either userId or groupId
      Body: buf,
      ContentEncoding: `base64`,
      ContentType: `image/jpeg`,
    });
    try {
      await client.send(command);
    } catch (err) {
      console.log(`Error Uploading Avatar for ${id}   err: `, err);
    }
  },
  getUserAvatar: async (id) => {
    if (id === 'undefined') {
      throw 'Id cannot be undefined';
    }
    const command = new GetObjectCommand({
      Bucket: 'football-eliminator',
      Key: id.toString(),
    });
    return await getAvatarFromAWS(command, true);
  },
  getMultipleUserAvatars: async function (idArray) {
    const userAvatars = {};
    for (let id of idArray) {
      userAvatars[id] = await this.getUserAvatar(id);
    }
    return userAvatars;
  },
  updatePlayerAvatars: (playerIdArray) => {
    const linkedListHead = createLinkedList(playerIdArray);
    updatePlayerAvatarFromLinkedList(linkedListHead);
  },
  getPlayerAvatar: async (id) => {
    if (id === 'undefined') {
      throw 'Id cannot be undefined';
    }
    const command = new GetObjectCommand({
      Bucket: 'football-eliminator',
      Key: id.toString(),
    });
    return await getAvatarFromAWS(command, false);
  },
  getPlayerOutlineAvatar: () => {
    return new Promise(async (res) => {
      res(
        await readWithJimp(
          join(__dirname, '../constants/images/playerOutline.png'),
          Jimp.MIME_JPEG
        )
      );
    });
  },
  getMultiplePlayerAvatars: async function (idArray) {
    const avatarsById = {};
    const playerAvatars = await db.PlayerData.find(
      { mySportsArray: { $in: idArray } },
      { mySportsId: 1, avatar: 1, _id: 0 }
    ).exec();
    for (const id of playerAvatars) {
      let avatar;
      if (id.avatar) {
        const command = new GetObjectCommand({
          Bucket: 'football-eliminator',
          Key: `playerAvatar/${id.mySportsId.toString()}`,
        });
        avatar = await getAvatarFromAWS(command, false);
      } else {
        avatar = await this.getPlayerOutlineAvatar();
      }
      avatarsById[id.mySportsId] = avatar;
    }
    return avatarsById;
  },
};

// https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/${ESPN ID}.png&w=50&h=36&cb=1
