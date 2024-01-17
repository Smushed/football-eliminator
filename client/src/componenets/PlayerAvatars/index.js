import { useState, createContext, useEffect } from 'react';
import { createLinkedList } from '../Tools/ListNode';
import axios from 'axios';

const PlayerAvatarContext = createContext();

const PlayerAvatarWrapper = ({ children }) => {
  const [playerAvatars, updatePlayerAvatars] = useState({});
  const [playerIdToPull, updatePlayerIdToPull] = useState([]);
  const [waitingToProcess, updateWaitingToProcess] = useState([]);
  const [nextNode, updateNextNode] = useState(null);
  const [isWorking, updateIsWorking] = useState(false);

  const axiosCancel = axios.CancelToken.source();

  useEffect(() => {
    if (waitingToProcess.length > 0 && !isWorking) {
      moveFromWaitingToProcess(waitingToProcess);
    }
  }, [waitingToProcess, isWorking]);

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
  }, [playerAvatars]);

  const moveFromWaitingToProcess = () => {
    updatePlayerIdToPull([...playerIdToPull, ...waitingToProcess]);
    updateWaitingToProcess([]);
  };

  const playerAvatarProcess = (idsToPull) => {
    updateIsWorking(true);
    createLinkedListMap(idsToPull);
  };

  const createLinkedListMap = (idsToPull) => {
    const isWorkingSlice = [...idsToPull];
    const idMap = [];
    let idMapNode = [];
    let idMapNodeCount = 0;

    for (let i = 0; i < isWorkingSlice.length; i++) {
      if (idMapNodeCount === 10) {
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

    getPlayerAvatars(idMapLinkedList);
    updateNextNode(idMapLinkedList);
  };

  const getPlayerAvatars = async (playerIdLinkedList) => {
    try {
      const avatarRes = await axios.post(
        `/api/playerAvatars/`,
        { avatars: playerIdLinkedList.val },
        {
          cancelToken: axiosCancel.token,
        }
      );
      updatePlayerAvatars({ ...playerAvatars, ...avatarRes.data });

      if (playerIdLinkedList.next) {
        updateNextNode(playerIdLinkedList.next);
      } else {
        updateIsWorking(false);
        updatePlayerIdToPull([]);
      }
    } catch (err) {
      console.log({ err });
      if (err.message !== `Unmounted`) {
        console.log(err);
      }
    }
  };

  const addPlayersToPull = (playerIdArray) => {
    updateWaitingToProcess([...waitingToProcess, ...playerIdArray]);
  };

  return (
    <PlayerAvatarContext.Provider value={{ playerAvatars, addPlayersToPull }}>
      {children}
    </PlayerAvatarContext.Provider>
  );
};

export { PlayerAvatarContext };

export default PlayerAvatarWrapper;
