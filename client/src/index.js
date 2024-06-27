import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Firebase, { FirebaseContext } from './componenets/Firebase';
import 'bootstrap/dist/css/bootstrap.css';
import CurrentUserWrapper from './contexts/CurrentUser';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <FirebaseContext.Provider value={new Firebase()}>
    <CurrentUserWrapper>
      <App />
    </CurrentUserWrapper>
  </FirebaseContext.Provider>
);
