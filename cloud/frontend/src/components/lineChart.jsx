import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function CustomChart() {
  const [data, setData] = useState({});
  useEffect(() => {
    fetch("http://localhost:4001/analyze")
      .then((response) => response.json())
      .then((apiData) => {
        Object.keys(apiData).map((key) => {
          for (let i = 0; i < apiData[key].length; i++) {
            const newDate = new Date(apiData[key][i].recievedAt);
            apiData[key][i].recievedAt = newDate
              .toLocaleString("en-US", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                hour12: false,
              })
              .replace(/[\s:]/g, "-");
            console.log(apiData[key][i].recievedAt);
            apiData[key][i].O2 = apiData[key][i].O2.split("%")[0];
            apiData[key][i].CO = apiData[key][i].CO.split("PPM")[0];
            apiData[key][i].H2S4 = apiData[key][i].H2S4.split("PPM")[0];
            apiData[key][i].LPG = apiData[key][i].LPG.split("PPM")[0];
            apiData[key][i].CH4 = apiData[key][i].CH4.split("PPM")[0];
          }
          return null;
        });
        setData(apiData);
      })
      .catch((error) => console.log(error));
  }, []);
  return (
    <div className="container">
      <div className="row">
        {Object.keys(data).map((key) => {
          return (
            <div className="col-lg-12" key={key}>
              <h2 className="text-center">{key}</h2>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data[key]}>
                  <XAxis dataKey="recievedAt" />
                  <YAxis />
                  <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                  <Line type="monotone" dataKey="O2" stroke="#8884d8" />
                  <Line type="monotone" dataKey="CO" stroke="#ff0000" />
                  <Line type="monotone" dataKey="H2S4" stroke="#77fc03" />
                  <Line type="monotone" dataKey="LPG" stroke="#0380fc" />
                  <Line type="monotone" dataKey="CH4" stroke="#ebe710" />
                  <Tooltip />
                  <Legend />
                </LineChart>
              </ResponsiveContainer>
            </div>
          );
        })}
      </div>
    </div>
  );
}
