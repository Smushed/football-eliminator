import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import Firebase, { FirebaseContext } from './contexts/Firebase';
import 'bootstrap/dist/css/bootstrap.css';
import CurrentUserWrapper from './contexts/CurrentUser';
import NFLScheduleWrapper from './contexts/NFLSchedule';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <FirebaseContext.Provider value={new Firebase()}>
    <CurrentUserWrapper>
      <NFLScheduleWrapper>
        <App />
      </NFLScheduleWrapper>
    </CurrentUserWrapper>
  </FirebaseContext.Provider>
);
