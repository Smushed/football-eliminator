import axios from 'axios';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

const Alert = withReactContent(Swal);

const Unsubscribe = ({ match }) => {
  const [successfulUnsubscribe, updateSuccessfulUnsubscribe] = useState(false);

  useEffect(() => {
    if (match.params.userId) {
      unsubscribe(match.params.userId);
    }
    console.log({ match });
  }, [match.params.userId]);

  const unsubscribe = async (id) => {
    axios
      .put(`/api/user/email/unsubscribe/${id}`)
      .then(() => {
        updateSuccessfulUnsubscribe(true);
      })
      .catch(() => {
        Alert.fire({
          title: 'Error Unsubscribing',
          text: 'Contact Kevin - smushedcode@gmail.com',
          showConfirmButton: false,
          showCancelButton: true,
          icon: 'warning',
        });
      });
  };
  return (
    <div className='container'>
      <div className='row mt-5'>
        <div className='col-12 text-center'>
          <h1>
            {successfulUnsubscribe ? 'Unsubscribed' : 'Error Unsubscribing'}
          </h1>
        </div>
        <div className='row'>
          <div className='col-12 text-center'>
            {successfulUnsubscribe ? (
              <p>
                You have been successfully unsubscribed from our email list.
              </p>
            ) : (
              <p>Error Unsubscribing Contact Kevin - smushedcode@gmail.com</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unsubscribe;
