import { useState, createContext } from 'react';

const CurrentUserContext = createContext();

const CurrentUserWrapper = ({ children }) => {
  const [currentUser, setCurrentUser] = useState({});
  const [userHasGroup, setUserHasGroup] = useState(false);

  return (
    <CurrentUserContext.Provider
      value={{ currentUser, setCurrentUser, userHasGroup, setUserHasGroup }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
};

export { CurrentUserContext };

export default CurrentUserWrapper;
