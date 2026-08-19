import React from "react";

function RiskReasons({ reasons = [] }) {
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
          <i className="bi bi-exclamation-triangle-fill text-warning me-2"></i>

          Security Risk Analysis
        </h5>

        {
          reasons.length === 0 ?

          <p style={{color:"#CBD5E1"}}>

            No security risks detected.

          </p>

          :

          reasons.map((reason,index)=>(

            <div
              key={index}
              className="d-flex align-items-center mb-3"
            >

              <i
                className="bi bi-shield-exclamation text-warning me-3"
                style={{
                  fontSize:"20px"
                }}
              ></i>

              <span
                style={{
                  color:"white"
                }}
              >
                {reason}
              </span>

            </div>

          ))
        }

      </div>
    </div>
  );
}

export default RiskReasons;