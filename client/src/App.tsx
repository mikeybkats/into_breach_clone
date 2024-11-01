import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { initializeGame } from "./state/gameSlice";
import { GameRenderer } from "./components/GameRenderer";
import styles from "./app.module.css";

const App: React.FC = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(initializeGame());
  }, []);

  return (
    <div className={styles.appContainer}>
      <GameRenderer />
    </div>
  );
};

export default App;
