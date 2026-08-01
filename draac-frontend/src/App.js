import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [userId] = useState("u1");
  const [status, setStatus] = useState(null);
  const [logs, setLogs] = useState([]);

  const fetchLogs = async () => {
  try {
    const res = await axios.get(
      `http://127.0.0.1:8000/logs/${userId}`
    );

    setLogs(res.data);
  } catch (err) {
    console.log(err);
  }
};

  // Fetch backend status every 5 seconds
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get(
          `http://127.0.0.1:8000/status/${userId}`
        );

        setStatus(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    fetchStatus();
    fetchLogs();

    const interval = setInterval(() => {
      fetchStatus();
      fetchLogs();
    }, 5000);

    return () => clearInterval(interval);
  }, [userId]);

  // Simulate suspicious activity
  const simulateAttack = async () => {
    await axios.put(`http://127.0.0.1:8000/update-context/${userId}`, {
      device_id: "hackerDevice999",
      city: "Moscow",
      country: "Russia",
      ip_address: "10.0.0.1",
    });

    const res = await axios.get(`http://127.0.0.1:8000/status/${userId}`);
    setStatus(res.data);
  };

  const getColor = () => {
    if (!status) return "gray";

    if (status.access_status === "ALLOW") return "green";

    if (status.access_status === "RESTRICT") return "orange";

    return "red";
  };

  return (
    <div
      style={{
        fontFamily: "Arial",
        padding: "40px",
        background: "#f4f4f4",
        minHeight: "100vh",
      }}
    >
      <h1>Dynamic Risk Adaptive Access Control</h1>

      <div
        style={{
          background: "white",
          padding: "20px",
          borderRadius: "10px",
          width: "400px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      >
        <h2>User Dashboard</h2>

        {status ? (
          <>
            <p>
              <strong>User:</strong> {status.user_id}
            </p>

            <p>
              <strong>Location:</strong> {status.city},{" "}
              {status.country}
            </p>

            <p>
              <strong>Device:</strong> {status.device_id}
            </p>

            <p>
              <strong>Risk Score:</strong> {status.risk_score}
            </p>

            <h2>Risk Factors</h2>

              <ul>
                {status.reasons?.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>

              <h2>Audit Logs</h2>

              <ul>
                {logs.map((log) => (
                  <li key={log.id}>
                    <strong>{log.event_type}</strong> | Risk: {log.risk_score} | {log.access_status}
                  </li>
                ))}
              </ul>

            <p>
              <strong>Status:</strong>{" "}
              <span
                style={{
                  color: "white",
                  background: getColor(),
                  padding: "5px 10px",
                  borderRadius: "5px",
                }}
              >
                {status.access_status}
              </span>
            </p>

            <button
              onClick={simulateAttack}
              style={{
                marginTop: "20px",
                padding: "10px",
                background: "red",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Simulate Suspicious Activity
            </button>
          </>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
}

export default App;