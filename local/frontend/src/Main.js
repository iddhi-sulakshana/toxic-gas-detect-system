import React, { useState } from "react";
import MainTable from "./components/Maintable/MainTable";
import { Navbar1 } from "./components/Navbar";

export const Main = () => {
  const [isConnected, setIsConnected] = useState(false);
  return (
    <>
      <Navbar1 isConnected={isConnected} />
      <div>
        <MainTable setIsConnected={setIsConnected} />
      </div>
    </>
  );
};
