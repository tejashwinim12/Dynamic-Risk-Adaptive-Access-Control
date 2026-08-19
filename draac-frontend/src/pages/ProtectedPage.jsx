import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

function ProtectedPage() {

    const navigate = useNavigate();
    const { state } = useLocation();

    useEffect(() => {

        if (!state?.access_status) {
            navigate("/");
            return;
        }

        if (state.access_status !== "ALLOW") {
            navigate("/dashboard", {
                state
            });
        }

    }, [state, navigate]);

    // Don't render the protected resource unless access is allowed
    if (state?.access_status !== "ALLOW") {
        return null;
    }

    return (

        <div
            style={{
                background: "#0F172A",
                minHeight: "100vh",
                color: "white",
                padding: "40px"
            }}
        >

            <h1>
                <i className="bi bi-shield-lock-fill me-2"></i>
                Protected Resource
            </h1>

            <p>
                This page is accessible only after successful Zero Trust verification.
            </p>

            <div
                className="card mt-4"
                style={{
                    background: "#1E293B",
                    color: "white",
                    border: "1px solid #334155",
                    borderRadius: "16px"
                }}
            >

                <div className="card-body">

                    <h3>
                        <i className="bi bi-file-earmark-lock-fill me-2"></i>
                        Confidential Reports
                    </h3>

                    <ul className="mt-3">

                        <li>Financial Report.pdf</li>

                        <li>Employee Records.xlsx</li>

                        <li>Security Policies.docx</li>

                        <li>Incident Response Plan.pdf</li>

                        <li>AI Risk Analytics Report</li>

                    </ul>

                </div>

            </div>

            <button
                className="btn btn-primary mt-4"
                onClick={() =>
                    navigate("/dashboard", {
                        state
                    })
                }
            >

                <i className="bi bi-arrow-left me-2"></i>
                Back to Dashboard

            </button>

        </div>

    );
}

export default ProtectedPage;