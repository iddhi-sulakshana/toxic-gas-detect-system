import React, { useEffect, useState } from "react";
import "./DataTable.css"; // Import the CSS file
import io from "socket.io-client";
const socket = io("http://localhost:8080"); // Change the URL to match your back-end

function DataTable() {
  const [data, setData] = useState([]);

  useEffect(() => {
    // Fetch the data from the API
    socket.on("updateData", (newData) => {
      setData(newData);
    });
  }, []);

  // Render the table rows dynamically based on the data
  const rows = data.map((row, index) => (
    <tr key={index}>
      <td>{row.trenchID}</td>
      <td>{row.helmetID}</td>
      <td>{row.O2}</td>
      <td>{row.CO}</td>
      <td>{row.H2S4}</td>
      <td>{row.LPG}</td>
      <td>{row.CH4}</td>
      <td>{row.condition}</td>
    </tr>
  ));
  return (
    <table className="data-table">
      <thead>
        <tr>
          <th>Trench ID</th>
          <th>Helmet ID</th>
          <th>O2</th>
          <th>CO</th>
          <th>H2S4</th>
          <th>LPG</th>
          <th>CH4</th>
          <th>Condition</th>
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  );
}

export default DataTable;
