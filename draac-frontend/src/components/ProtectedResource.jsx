import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

function ProtectedResource({ status, userId, onVerify }) {

    const navigate = useNavigate();
    const [code, setCode] = useState("");
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [loading, setLoading] = useState(false);

    const handleVerify = async () => {

        if (!/^\d{6}$/.test(code)) {

            setMessage("Please enter a valid 6-digit verification code.");
            setMessageType("danger");

            return;
        }

        setLoading(true);

        try {

            await API.post(`/verify/${userId}`, {
                verification_code: code
            });
            
            setMessage("Identity verified successfully!");
            setMessageType("success");

            if (onVerify) {
                onVerify();
            }

        } catch (err) {

            setMessage(
                err.response?.data?.detail || "Verification Failed"
            );

            setMessageType("danger");

        } finally {

            setLoading(false);

        }

    };

    return (

        <div
            className="card mt-4"
            style={{
                background:"#1E293B",
                border:"1px solid #334155",
                borderRadius:"16px"
            }}
        >

            <div className="card-body">

                <h4 className="mb-4">

                    <i className="bi bi-lock-fill me-2"></i>

                    Protected Resource

                </h4>

                {
                    status === "ALLOW" && (

                        <div className="alert alert-success">

                            <h5>

                                <i className="bi bi-check-circle-fill me-2"></i>

                                Access Granted

                            </h5>

                            <p>

                                You have permission to access this protected resource.

                            </p>

                            <button
                                className="btn btn-success"
                                onClick={() =>
                                    navigate("/protected", {
                                        state: {
                                            access_status: status,
                                            user_id: userId
                                        }
                                    })
                                }
                            >
                                Open Resource
                            </button>

                        </div>

                    )
                }

                {
                    status === "RESTRICT" && (

                        <div className="alert alert-warning">

                            <h5>

                                <i className="bi bi-shield-lock-fill me-2"></i>

                                Verification Required

                            </h5>
                            <p>
                                Additional verification is required before access.
                            </p>

                            <input
                                type="text"
                                className="form-control mb-3"
                                placeholder="Enter 6-digit verification code"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                maxLength={6}
                            />

                            <button
                                className="btn btn-warning"
                                onClick={handleVerify}
                                disabled={loading}
                            >
                                {loading ? "Verifying..." : "Verify Identity"}
                            </button>

                            {message && (
                                <div className={`alert alert-${messageType} mt-3`}>
                                    {message}
                                </div>
                            )}
                        </div>

                    )
                }

                {
                    status === "REVOKE" && (

                        <div className="alert alert-danger">

                            <h5>

                                <i className="bi bi-x-circle-fill me-2"></i>

                                Access Denied

                            </h5>

                            <p>

                                High-risk activity detected.

                            </p>

                            <button className="btn btn-danger">

                                Contact Administrator

                            </button>

                        </div>

                    )
                }

            </div>

        </div>

    );

}

export default ProtectedResource;