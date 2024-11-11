import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { initializeGame } from "./state/gameSlice";
import { GameRenderer } from "./components/GameRenderer";
import styles from "./app.module.css";

const App: React.FC = () => {
  const [gameInitialized, setGameInitialized] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeGame({ gridSize: 8 }));
    setGameInitialized(true);
  }, []);

  return (
    <div className={styles.appContainer}>
      {gameInitialized && <GameRenderer />}
    </div>
  );
};

export default App;
