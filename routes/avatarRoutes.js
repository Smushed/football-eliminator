import cacheHandler from '../handlers/cacheHandler.js';
import s3Handler from '../handlers/s3Handler.js';
import { returnError } from '../utils/ExpressUtils.js';

export default (app) => {
  app.put('/api/avatar/:id', (req, res) => {
    const { id } = req.params;
    const { image } = req.body;
    try {
      s3Handler.uploadAvatar(id, image);
      res.status(200).send('success');
    } catch (err) {
      console.log('Error saving avatar: ', { id, err });
      returnError(res, err, 'Error saving avatar');
    }
  });

  app.get('/api/avatar/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const avatar = await s3Handler.getSingleAvatar(id);
      res.status(200).send(avatar);
    } catch (err) {
      console.log('Error getting avatar: ', { id, err });
      returnError(res, err, 'Error getting avatar');
    }
  });

  app.post('/api/avatar/ids', async (req, res) => {
    const { idArray, isUser } = req.body;
    try {
      const response = await cacheHandler.pullManyFromCache(idArray, isUser);
      res.status(200).send(response);
    } catch (err) {
      console.log('Error getting many avatars: ', { idArray, isUser, err });
      returnError(res, err, 'Error getting avatars');
    }
  });
};
