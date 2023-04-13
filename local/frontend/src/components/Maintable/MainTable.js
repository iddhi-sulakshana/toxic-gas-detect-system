import * as React from "react";
import Table from "react-bootstrap/Table";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";
import TableRow from "./TableRow";
const socket = io("http://localhost:8080");

function DarkExample() {
  const navigate = useNavigate();

  function handleClick() {
    navigate("/Miners");
  }
  const [safe, setSafe] = React.useState([]);
  const [caution, setCaution] = React.useState([]);
  const [danger, setDanger] = React.useState([]);

  React.useEffect(() => {
    // Fetch the data from the API
    socket.on("updateData", (newData) => {
      const newSafe = [];
      const newCaution = [];
      const newDanger = [];
      for (let i = 0; i < newData.length; i++) {
        if (newData[i].condition === "danger") newDanger.push(newData[i]);
        else if (newData[i].condition === "caution")
          newCaution.push(newData[i]);
        else if (newData[i].condition === "safe") newSafe.push(newData[i]);
      }

      setSafe(newSafe);
      setCaution(newCaution);
      setDanger(newDanger);
    });
  }, []);

  return (
    <Table bordered hover style={{ padding: "20px" }}>
      <thead>
        <tr>
          <th>TrenchID</th>
          <th>Helmet_id</th>
          <th>Oxygen Level (%)</th>
          <th>CO (ppm)</th>
          <th>H2S4 (ppm)</th>
          <th>CH4 (ppm)</th>
          <th>LPG (ppm)</th>
          <th>Condition</th>
          <th>Recieved</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {danger.map((value, index) => (
          <TableRow
            className="danger"
            key={`${value.trenchID}${value.helmetID}`}
            value={value}
            handleClick={handleClick}
          />
        ))}
        {caution.map((value, index) => (
          <TableRow
            className="caution"
            key={`${value.trenchID}${value.helmetID}`}
            value={value}
            handleClick={handleClick}
          />
        ))}
        {safe.map((value, index) => (
          <TableRow
            className="safe"
            key={`${value.trenchID}${value.helmetID}`}
            value={value}
            handleClick={handleClick}
          />
        ))}
      </tbody>
    </Table>
  );
}

export default DarkExample;
