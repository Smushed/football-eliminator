import { useState, createContext } from 'react';

const CurrentUserContext = createContext();

const CurrentUserWrapper = ({ children }) => {
  const [currentUser, setCurrentUser] = useState({});

  return (
    <CurrentUserContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </CurrentUserContext.Provider>
  );
};

export { CurrentUserContext };

export default CurrentUserWrapper;
