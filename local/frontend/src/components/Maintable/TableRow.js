import React from "react";
import "./TableRow.css";

export default function TableRow(props) {
  const { value, className } = props;
  return (
    <tr id={className}>
      <td>{value.trenchID}</td>
      <td>{value.helmetID}</td>
      <td>{value.O2}</td>
      <td>{value.CO}</td>
      <td>{value.H2S4}</td>
      <td>{value.LPG}</td>
      <td>{value.CH4}</td>
      <td>{value.condition}</td>
      <td>{value.recievedAt}</td>
    </tr>
  );
}
