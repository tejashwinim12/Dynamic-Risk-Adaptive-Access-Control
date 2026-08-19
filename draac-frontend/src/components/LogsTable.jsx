import React from "react";

function LogsTable({ logs = [] }) {
  const getBadge = (status) => {
    switch (status) {
      case "ALLOW":
        return "success";
      case "RESTRICT":
        return "warning";
      case "REVOKE":
        return "danger";
      default:
        return "secondary";
    }
  };

  return (
    <div
      className="card mt-4"
      style={{
        background: "#1E293B",
        border: "1px solid #334155",
        borderRadius: "16px",
      }}
    >
      <div className="card-body">

        <h5
          className="mb-4"
          style={{
            color: "white",
            fontWeight: "600",
          }}
        >
          <i className="bi bi-clock-history me-2"></i>

          Audit Logs

        </h5>

        <div className="table-responsive">

          <table className="table table-dark table-hover align-middle">

            <thead>

              <tr>

                <th>Time</th>

                <th>Event</th>

                <th>Risk</th>

                <th>Status</th>

              </tr>

            </thead>

            <tbody>

              {
                logs.length === 0 ?

                <tr>

                  <td
                    colSpan="4"
                    className="text-center"
                  >

                    No Logs Available

                  </td>

                </tr>

                :

                logs.map((log)=>(
                  <tr key={log.id}>

                    <td>

                      {log.created_at
                        ? new Date(log.created_at).toLocaleString()
                        : "--"}
                        
                    </td>

                    <td>

                      {log.event_type}

                    </td>

                    <td>

                      {log.risk_score}

                    </td>

                    <td>

                      <span
                        className={`badge bg-${getBadge(log.access_status)}`}
                      >

                        {log.access_status}

                      </span>

                    </td>

                  </tr>
                ))
              }

            </tbody>

          </table>

        </div>

      </div>
    </div>
  );
}

export default LogsTable;