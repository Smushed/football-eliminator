import { useState, createContext } from 'react';
import { getAuth } from 'firebase/auth';
import { axiosHandler, httpErrorHandler } from '../../utils/axiosHandler';

const CurrentUserContext = createContext();

const CurrentUserWrapper = ({ children }) => {
  const [currentUser, setCurrentUser] = useState({});
  const [currentGroup, setCurrentGroup] = useState({});

  const pullUserData = async () => {
    try {
      const authUser = getAuth().currentUser;
      const { data } = await axiosHandler.get(
        `/api/user/email/${authUser.email}`
      );
      updateCurrentUser(data.userInfo, data.emailSettings);

      if (data.userInfo.grouplist.length > 0) {
        initGroup(data.userInfo);
      }
    } catch (err) {
      httpErrorHandler(err);
    }
  };

  const updateCurrentUser = (user, emailSettings) => {
    const currentUser = {
      username: user.username,
      userId: user._id,
      isAdmin: user.admin,
      email: user.email,
      grouplist: user.grouplist,
      mainGroup: user.mainGroup || null,
      emailSettings: {
        reminderEmail: emailSettings.reminderEmail,
        leaderboardEmail: emailSettings.leaderboardEmail,
      },
    };
    setCurrentUser(currentUser);
  };

  const initGroup = async (user) => {
    try {
      if (user.mainGroup) {
        pullGroupData(user.mainGroup);
      } else if (user.grouplist.length > 0) {
        await axiosHandler.put(
          `/api/user/group/main/${user.grouplist[0]._id}/${user._id}`
        );
        pullGroupData(user.grouplist[0]._id);
      }
    } catch (err) {
      httpErrorHandler(err);
    }
  };

  const pullGroupData = async (groupId) => {
    try {
      const { data } = await axiosHandler.get(`/api/group/details/${groupId}`);
      setCurrentGroup({
        name: data.name,
        _id: data._id,
        hidePlayersUntilLocked: data.hidePlayersUntilLocked,
      });
    } catch (err) {
      httpErrorHandler(err);
    }
  };

  return (
    <CurrentUserContext.Provider
      value={{
        currentUser,
        currentGroup,
        pullUserData,
        pullGroupData,
      }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
};

export { CurrentUserContext };

export default CurrentUserWrapper;
