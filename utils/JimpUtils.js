import Jimp from 'jimp';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const getPlayerOutline = () =>
  readWithJimp(
    path.join(__dirname, '../constants/images/playerOutline.png'),
    Jimp.MIME_PNG
  );

export const getUserGenericAvatar = () =>
  readWithJimp(
    path.join(__dirname, '../constants/images/stockFootballPlayer.jpg'),
    Jimp.MIME_JPEG
  );

export const readWithJimp = (image, mimeType) =>
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
