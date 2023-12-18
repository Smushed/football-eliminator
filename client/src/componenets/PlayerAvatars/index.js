import { useState, createContext, useEffect } from 'react';
import { createLinkedList, findLastNode } from '../Tools/ListNode';
import axios from 'axios';

const PlayerAvatarContext = createContext();

const PlayerAvatarWrapper = ({ children }) => {
  const [playerAvatars, updatePlayerAvatars] = useState({});
  const [playerIdToPull, updatePlayerIdToPull] = useState([]);
  const [waitingToProcess, updateWaitingToProcess] = useState([]);
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

  // useEffect(() => {
  //   if (!isWorking && waitingToProcess.length > 0) {
  //     playerAvatarProcess();
  //   }
  // }, [isWorking]);

  const moveFromWaitingToProcess = () => {
    updatePlayerIdToPull([...playerIdToPull, ...waitingToProcess]);
    updateWaitingToProcess([]);
  };

  const playerAvatarProcess = (idsToPull) => {
    updateIsWorking(true);
    createLinkedListMap(idsToPull);
  };

  const createLinkedListMap = (idsToPull) => {
    //Divide waitingToProcess into subarrays of 5
    //Make a linked list of the subarrays
    //Call getPlayerAvatars on the first node of the linked list

    const isWorkingSlice = [...idsToPull];
    const idMap = [];
    let idMapNode = [];
    let idMapNodeCount = 0;

    for (let i = 0; i < isWorkingSlice.length; i++) {
      if (idMapNodeCount === 5) {
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
    getPlayerAvatars(createLinkedList(idMap));
    //When it's complete then set the isWorking to false
    //Also clear out the playerIdToPull array
  };

  const getPlayerAvatars = (playerIdLinkedList) => {
    const playerAvatarCopy = { ...playerAvatars };
    axios
      .post(
        `/api/playerAvatars/`,
        { avatars: playerIdLinkedList.val },
        {
          cancelToken: axiosCancel.token,
        }
      )
      .then((res) => {
        console.log({ res });
        console.log({ playerAvatars });
        // updatePlayerAvatars({ ...playerAvatarCopy, ...res.data });
        updateAvatarList(res.data);
        if (playerIdLinkedList.next) {
          getPlayerAvatars(playerIdLinkedList.next);
        } else {
          updateIsWorking(false);
          updatePlayerIdToPull([]);
        }
      })
      .catch((err) => {
        console.log({ err });
        if (err.message !== `Unmounted`) {
          console.log(err);
        }
      });
  };

  const updateAvatarList = (newPlayerAvatars) => {
    updatePlayerAvatars({ ...playerAvatars, ...newPlayerAvatars });
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
