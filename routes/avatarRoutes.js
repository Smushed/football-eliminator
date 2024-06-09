import cacheHandler from '../handlers/cacheHandler.js';
import s3Handler from '../handlers/s3Handler.js';

export default (app) => {
  app.put('/api/avatar/:id', (req, res) => {
    const { id } = req.params;
    const { image } = req.body;
    try {
      s3Handler.uploadAvatar(id, image);
      res.status(200).send('success');
    } catch (err) {
      res.status(500).send('Error Saving the Avatar');
    }
  });

  app.get('/api/avatar/:id', async (req, res) => {
    const { id } = req.params;
    const avatar = await s3Handler.getUserAvatar(id);
    res.status(200).send(avatar);
  });

  app.post('/api/avatar/ids', async (req, res) => {
    const { idArray, isUser } = req.body;
    const response = await cacheHandler.pullManyFromCache(idArray, isUser);
    res.status(200).send(response);
  });
};
