import React from "react";
import { useNavigate } from "react-router-dom";

function Navbar({ userId }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/");
  };

  return (
    <nav
      className="navbar navbar-expand-lg mb-4"
      style={{
        backgroundColor: "#1E293B",
        borderRadius: "16px",
        border: "1px solid #334155",
        padding: "15px 25px",
      }}
    >
      <div className="container-fluid">

        <div className="d-flex align-items-center">

          <i
            className="bi bi-shield-lock-fill me-3"
            style={{
              fontSize: "28px",
              color: "#2563EB",
            }}
          ></i>

          <div>

            <h4
              className="mb-0"
              style={{
                color: "white",
                fontWeight: "700",
              }}
            >
              DRAAC
            </h4>

            <small
              style={{
                color: "#CBD5E1",
              }}
            >
              Dynamic Risk Adaptive Access Control
            </small>

          </div>

        </div>

        <div className="d-flex align-items-center">

          <span
            className="me-4"
            style={{
              color: "#CBD5E1",
            }}
          >
            <i className="bi bi-person-circle me-2"></i>

            {userId}
          </span>

          <button
            className="btn btn-outline-light"
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-right me-2"></i>

            Logout
          </button>

        </div>

      </div>
    </nav>
  );
}

export default Navbar;