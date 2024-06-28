import { useState, createContext } from 'react';
import { getAuth } from 'firebase/auth';
import axios from 'axios';

const AxiosContext = createContext();

const AxiosHandler = ({ children }) => {
  const getMethod = async (route) => {
    try {
      return await axios.get(route, { headers: { authorization: getToken() } });
    } catch (err) {
      console.log({ err });
    }
  };

  const getToken = () => {
    const auth = getAuth();
    if (auth.currentUser) {
      return auth.currentUser.accessToken;
    } else {
      return null;
    }
  };

  const [get] = useState(getMethod);
  const [put] = useState((route, body = {}) =>
    axios.put(route, body, { headers: { authorization: getToken() } })
  );
  const [post] = useState((route, body = {}) =>
    axios.post(route, body, { headers: { authorization: getToken() } })
  );
  const [del] = useState((route, body = {}) =>
    axios.delete(route, body, { headers: { authorization: getToken() } })
  );

  return (
    <AxiosContext.Provider
      value={{ get: get, put: put, post: post, delete: del }}
    >
      {children}
    </AxiosContext.Provider>
  );
};

export default AxiosHandler;
