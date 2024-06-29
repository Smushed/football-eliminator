import { getAuth } from 'firebase/auth';
import axios from 'axios';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import toast from 'react-hot-toast';

const Alert = withReactContent(Swal);

const getToken = () => getAuth().currentUser.accessToken;

export const axiosHandler = {
  get: (route, cancelToken, params) => {
    const options = { headers: { authorization: getToken() } };
    if (cancelToken) {
      options.cancelToken = cancelToken;
    }
    if (params) {
      options.params = params;
    }
    return axios.get(route, options);
  },
  put: async (route, body = {}, cancelToken) => {
    const options = { headers: { authorization: getToken() } };
    if (cancelToken) {
      options.cancelToken = cancelToken;
    }
    return axios.put(route, body, options);
  },
  post: async (route, body = {}, cancelToken) => {
    const options = { headers: { authorization: getToken() } };
    if (cancelToken) {
      options.cancelToken = cancelToken;
    }
    return axios.post(route, body, { headers: { authorization: getToken() } });
  },
  delete: async (route, body = {}, cancelToken) => {
    const options = { headers: { authorization: getToken() } };
    if (cancelToken) {
      options.cancelToken = cancelToken;
    }
    return axios.delete(route, body, options);
  },
};

export const axiosHandlerNoValidation = {
  get: (route, cancelToken) => {
    const options = {};
    if (cancelToken) {
      options.cancelToken = cancelToken;
    }
    return axios.get(route, options);
  },
};

export const httpErrorHandler = (error) => {
  if (error.message === 'Unmounted') {
    return;
  }
  if (!error.response) {
    //Not HTTP error, from component
    console.log('Error inside of component: ', error);
    return;
  }
  if (error.response.status === 401) {
    return Alert.fire({
      title: 'Unauthorized',
      icon: 'error',
    });
  }
  return toast.error('Connection error with the server');
};
