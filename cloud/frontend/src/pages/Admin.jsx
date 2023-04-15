import React from "react";
import jwt_decode from "jwt-decode";
import { useState } from "react";
import MineAdmin from "../components/mineAdmin";
import SuperAdmin from "../components/superAdmin";

export default function Admin() {
  const [token] = useState(localStorage.getItem("token"));
  const [decoded] = useState(jwt_decode(token));
  return (
    <React.Fragment>
      {decoded.role === "miner" ? (
        <MineAdmin token={token} decoded={decoded} />
      ) : (
        <SuperAdmin />
      )}
    </React.Fragment>
  );
}
