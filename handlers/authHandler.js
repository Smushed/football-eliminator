import 'dotenv/config.js';
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import db from '../models/index.js';

initializeApp({
  credential: cert({
    type: process.env.FIREBASE_type,
    project_id: process.env.FIREBASE_project_id,
    private_key_id: process.env.FIREBASE_private_key_id,
    private_key: process.env.FIREBASE_private_key.replace(/\\n/g, '\n'),
    client_email: process.env.FIREBASE_client_email,
    client_id: process.env.FIREBASE_client_id,
    auth_uri: process.env.FIREBASE_auth_uri,
    token_uri: process.env.FIREBASE_token_uri,
    auth_provider_x509_cert_url:
      process.env.FIREBASE_auth_provider_x509_cert_url,
    client_x509_cert_url: process.env.FIREBASE_client_x509_cert_url,
    universe_domain: process.env.FIREBASE_universe_domain,
  }),
});

const notAuthorizedError = { message: 'Unauthorized', status: 401 };
const notAuthorizedToChangeField = {
  message: 'Not Authorized to change field',
  status: 401,
};

const authMiddleware = (req, res, next) => {
  if (!req.headers.authorization) {
    next();
  } else {
    getAuth()
      .verifyIdToken(req.headers.authorization)
      .then((decodedToken) => {
        req.currentUser = decodedToken.email;
        next();
      });
  }
};

const verifyGroupAdminByEmail = async (userEmail, groupId) => {
  const group = await db.Group.findById(groupId, { userlist: 1 }).lean().exec();
  const userIdList = group.userlist.map((user) => user.userId.toString());
  const userlist = await db.User.find(
    { _id: { $in: userIdList } },
    { email: 1 }
  )
    .lean()
    .exec();
  const foundUser = userlist.find((user) => user.email === userEmail);
  if (!foundUser) {
    throw notAuthorizedError;
  }
};

const verifyUserIsSameEmailUserId = async (userEmail, userId) => {
  await verifyUserLoggedIn(userEmail);
  const foundUser = await db.User.findOne({ email: userEmail }, { _id: 1 })
    .lean()
    .exec();
  if (foundUser._id.toString() !== userId) {
    throw notAuthorizedToChangeField;
  }
};

const verifyUserLoggedIn = async (userEmail) => {
  if (userEmail === null || userEmail === undefined || userEmail === '') {
    throw notAuthorizedError;
  }
};

export {
  verifyGroupAdminByEmail,
  verifyUserLoggedIn,
  verifyUserIsSameEmailUserId,
  authMiddleware,
};
