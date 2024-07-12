import s3Handler from './s3Handler.js';
import NodeCache from 'node-cache';
import db from '../models/index.js';
import { getPlayerOutline, getUserGenericAvatar } from '../utils/JimpUtils.js';

//86400 = 24hr
const cache = new NodeCache({ stdTTL: 86400 });

const userAvatar = await getUserGenericAvatar();
const playerAvatar = await getPlayerOutline();

export default {
  initCache: async () => {
    console.log('Flushing Avatar Cache');
    console.log('Player Avatar Cache in process');
    try {
      const playerAvatars = await db.PlayerData.find(
        { avatar: 1, active: 1 },
        { mySportsId: 1, _id: 0 }
      )
        .lean()
        .exec();
      let idArray = playerAvatars.map((player) => player.mySportsId);
      let avatars = await s3Handler.getMultiplePlayerAvatars(idArray);
      let cacheList = [];
      for (const mySportsId in avatars) {
        cacheList.push({ key: mySportsId, val: avatars[mySportsId] });
      }
      cache.mset(cacheList);
      console.log('Player Avatar Cache populated');

      console.log('User Avatar Cache in process');
      const userlist = await db.User.find({}, { _id: 1 }).lean().exec();
      idArray = userlist.map((user) => user._id.toString());
      avatars = await s3Handler.getMultipleUserAvatars(idArray);
      for (const userId in avatars) {
        cacheList.push({ key: userId, val: avatars[userId] });
      }
      cache.mset(cacheList);
      console.log('User Avatar Cache populated');
    } catch (err) {
      console.log('Error initializing cache: ', { err });
    }
  },
  addToCache: (id, avatar) => {
    cache.set({ key: id, val: avatar });
  },
  pullFromCache: async (id, isUser) => {
    const pulledValue = cache.get(id);
    if (pulledValue === undefined) {
      if (isUser) {
        return userAvatar;
      } else {
        return playerAvatar;
      }
    }
    return pulledValue;
  },
  pullManyFromCache: (idArray, isUser) => {
    const response = cache.mget(idArray);
    for (const id of idArray) {
      if (!response[id]) {
        if (isUser) {
          response[id] = userAvatar;
        } else {
          response[id] = playerAvatar;
        }
      }
    }
    return response;
  },
};
