import React from "react";

function StatusCard({ title, value, icon, color }) {
  return (
    <div className="col-md-3 mb-4">
      <div
        className="card h-100 shadow-sm"
        style={{
          backgroundColor: "#1E293B",
          border: "1px solid #334155",
          borderRadius: "16px",
          color: "white",
        }}
      >
        <div className="card-body">

          <div className="d-flex justify-content-between align-items-center">

            <div>
              <h6
                className="text-uppercase"
                style={{
                  color: "#CBD5E1",
                  fontSize: "13px",
                }}
              >
                {title}
              </h6>

              <h2
                style={{
                  color: color,
                  fontWeight: "700",
                }}
              >
                {value}
              </h2>
            </div>

            <i
              className={icon}
              style={{
                fontSize: "38px",
                color: color,
              }}
            ></i>

          </div>

        </div>
      </div>
    </div>
  );
}

export default StatusCard;