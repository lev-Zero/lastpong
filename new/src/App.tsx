import React from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import { Main } from "./pages/Main";
import { SetUserID } from "./pages/UserSetting/EnterID";
import { SetAvatar } from "./pages/UserSetting/UploadAvatar";
import { Test } from "./pages/Test";
function App() {
  return (
    <div className="Main">
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/auth/basic/ID" element={<SetUserID />} />
        <Route path="/auth/basic/Avatar" element={<SetAvatar />} />
        <Route path="/Test" element={<Test />} />
      </Routes>
    </div>
  );
}

export default App;
