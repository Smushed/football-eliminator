import { useState, createContext, useEffect } from 'react';
import { createLinkedList } from '../Tools/ListNode';
import axios from 'axios';

const AvatarContext = createContext();

const AvatarWrapper = ({ children }) => {
  const [playerAvatars, updatePlayerAvatars] = useState({});
  const [userAvatars, updateUserAvatars] = useState({});
  const [playerIdToPull, updatePlayerIdToPull] = useState([]);
  const [waitingToProcess, updateWaitingToProcess] = useState([]);
  const [nextNode, updateNextNode] = useState(null);

  useEffect(() => {
    if (waitingToProcess.length > 0) {
      moveFromWaitingToProcess(waitingToProcess);
    }
  }, [waitingToProcess]);

  useEffect(() => {
    if (playerIdToPull.length > 0) {
      playerAvatarProcess(playerIdToPull);
    }
  }, [playerIdToPull]);

  useEffect(() => {
    if (nextNode) {
      //Have to break it out here because as need to call the get function when state is updated
      //Otherwise it will be called with the old state (aka blank)
      getPlayerAvatars(nextNode);
    }
  }, [nextNode]);

  const moveFromWaitingToProcess = () => {
    updatePlayerIdToPull([...playerIdToPull, ...waitingToProcess]);
    updateWaitingToProcess([]);
  };

  const playerAvatarProcess = (idsToPull) => {
    createLinkedListMap(idsToPull);
  };

  const createLinkedListMap = (idsToPull) => {
    const isWorkingSlice = [...idsToPull];
    const idMap = [];
    let idMapNode = [];
    let idMapNodeCount = 0;

    for (let i = 0; i < isWorkingSlice.length; i++) {
      if (idMapNodeCount === 20) {
        idMap.push(idMapNode);
        idMapNodeCount = 0;
        idMapNode = [];
      }
      idMapNode.push(isWorkingSlice[i]);
      idMapNodeCount++;
    }

    if (idMapNode.length > 0) {
      idMap.push(idMapNode);
    }
    const idMapLinkedList = createLinkedList(idMap);

    updateNextNode(idMapLinkedList);
  };

  const getPlayerAvatars = async (playerIdLinkedList) => {
    try {
      const avatarRes = await axios.post(`/api/avatar/ids/`, {
        idArray: playerIdLinkedList.val,
        isUser: false,
      });
      updatePlayerAvatars({ ...playerAvatars, ...avatarRes.data });
      if (nextNode) {
        updateNextNode(playerIdLinkedList.next);
      } else {
        updatePlayerIdToPull([]);
      }
    } catch (err) {
      console.log(err);
    }
  };

  const getUserAvatars = async (userAvatarList) => {
    try {
      const avatarRes = await axios.post(`/api/avatar/ids/`, {
        idArray: userAvatarList,
        isUser: true,
      });
      updateUserAvatars({ ...userAvatars, ...avatarRes.data });
    } catch (err) {
      console.log(err);
    }
  };

  const checkAvatarIsAlreadyPulled = (playerIdArray) => {
    const uniqueIdArray = [];
    for (const playerId of playerIdArray) {
      if (waitingToProcess.includes(playerId)) {
        continue;
      }
      if (!playerAvatars[playerId]) {
        uniqueIdArray.push(playerId);
      }
    }
    updateWaitingToProcess([...waitingToProcess, ...uniqueIdArray]);
  };

  const addPlayerAvatarsToPull = (playerIds) => {
    const uniquePlayerIds = [];
    for (const playerId of playerIds) {
      //Adding this here in case a group of rosters comes in at once
      //This way I can filter them out here rather than having to in every component
      if (!uniquePlayerIds.includes(playerId) && playerId !== 0) {
        uniquePlayerIds.push(playerId);
      }
    }
    checkAvatarIsAlreadyPulled(uniquePlayerIds);
  };

  const addUserAvatarsToPull = (userIds) => {
    const uniqueIdArray = [];
    for (const userId of userIds) {
      if (!userAvatars[userId]) {
        uniqueIdArray.push(userId);
      }
    }
    getUserAvatars(uniqueIdArray);
  };

  const repullUserAvatars = (userIds) => {
    getUserAvatars(userIds);
  };

  return (
    <AvatarContext.Provider
      value={{
        playerAvatars,
        addPlayerAvatarsToPull,
        userAvatars,
        addUserAvatarsToPull,
        repullUserAvatars,
      }}
    >
      {children}
    </AvatarContext.Provider>
  );
};

export { AvatarContext };

export default AvatarWrapper;
