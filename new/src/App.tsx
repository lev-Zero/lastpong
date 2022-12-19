import React from "react";
import "./App.css";
import { Button, Text, Flex } from "@chakra-ui/react";
import { Route, Routes } from "react-router-dom";
import { ThemaButton } from "./UI/atoms/ThemaButton";
import { Main } from "./pages/Main";
import { SetUserID } from "./pages/UserSetting/SetUserID";
import { SetAvatar } from "./pages/UserSetting/SetAvatar";
import create from "zustand/react";

const useStore = create(() => ({
  count: 0,
  imgUrl: 0,
}));

function App() {
  return (
    <div className="Main">
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/auth/basic/ID" element={<SetUserID />} /> */
        <Route path="/auth/basic/Avatar" element={<SetAvatar />} /> */
      </Routes>
    </div>
  );
}

export default App;
