import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import API from "../services/api";

import StatusCard from "../components/StatusCard";
import Navbar from "../components/Navbar";
import RiskReasons from "../components/RiskReasons";
import LogsTable from "../components/LogsTable";
import ProtectedResource from "../components/ProtectedResource";
import RiskTrendChart from "../components/RiskTrendChart";
import AccessDecisionChart from "../components/AccessDecisionChart";

import "../styles/dashboard.css";

function Dashboard() {

    const { state } = useLocation();

    const userId = state?.user_id;

    const [status, setStatus] = useState(state || {});
    const [logs, setLogs] = useState([]);

    // Fetch current user status
    const fetchStatus = useCallback(async () => {

        if (!userId) {
            return;
        }

        try {

            const response = await API.get(`/status/${userId}`);

            setStatus(response.data);

        } catch (err) {

            console.error("Failed to fetch user status:", err);

        }

    }, [userId]);


    // Fetch audit logs
    const fetchLogs = useCallback(async () => {

        if (!userId) {
            return;
        }

        try {

            const response = await API.get(`/logs/${userId}`);

            setLogs(response.data);

        } catch (err) {

            console.error("Failed to fetch audit logs:", err);

        }

    }, [userId]);


    // Automatically refresh status and logs every 5 seconds
    useEffect(() => {

        if (!userId) {
            return;
        }

        fetchStatus();
        fetchLogs();

        const interval = setInterval(() => {

            fetchStatus();
            fetchLogs();

        }, 5000);

        return () => clearInterval(interval);

    }, [userId, fetchStatus, fetchLogs]);


    // Security metrics
    const totalEvents = logs.length;

    const averageRisk =
        logs.length > 0
            ? Math.round(
                logs.reduce(
                    (sum, log) =>
                        sum + Number(log.risk_score || 0),
                    0
                ) / logs.length
            )
            : 0;

    const highestRisk =
        logs.length > 0
            ? Math.max(
                ...logs.map(
                    (log) => Number(log.risk_score || 0)
                )
            )
            : 0;

    const revokedEvents = logs.filter(
        (log) => log.access_status === "REVOKE"
    ).length;


    return (

        <div className="dashboard-page">

            <Navbar
                userId={userId}
            />


            {/* Main Status Cards */}

            <div className="row mt-4">

                <StatusCard
                    title="Risk Score"
                    value={status?.risk_score ?? 0}
                    icon="bi bi-speedometer2"
                    color="#F59E0B"
                />

                <StatusCard
                    title="Access Status"
                    value={status?.access_status ?? "UNKNOWN"}
                    icon="bi bi-shield-lock-fill"
                    color="#2563EB"
                />

                <StatusCard
                    title="User ID"
                    value={userId ?? "--"}
                    icon="bi bi-person-fill"
                    color="#22C55E"
                />

                <StatusCard
                    title="AI Confidence"
                    value={`${status?.ai_confidence ?? 0}%`}
                    icon="bi bi-cpu-fill"
                    color="#EF4444"
                />

            </div>


            {/* Current Risk Factors */}

            <RiskReasons
                reasons={status?.reasons || []}
            />


            {/* Security Metrics */}

            <div className="row mt-4">

                <StatusCard
                    title="Total Events"
                    value={totalEvents}
                    icon="bi bi-activity"
                    color="#8B5CF6"
                />

                <StatusCard
                    title="Average Risk"
                    value={averageRisk}
                    icon="bi bi-bar-chart-fill"
                    color={
                        averageRisk >= 70
                            ? "#EF4444"
                            : averageRisk >= 30
                                ? "#F59E0B"
                                : "#22C55E"
                    }
                />

                <StatusCard
                    title="Highest Risk"
                    value={highestRisk}
                    icon="bi bi-exclamation-triangle-fill"
                    color={
                        highestRisk >= 70
                            ? "#EF4444"
                            : highestRisk >= 30
                                ? "#F59E0B"
                                : "#22C55E"
                    }
                />

                <StatusCard
                    title="Revoked Events"
                    value={revokedEvents}
                    icon="bi bi-shield-x"
                    color={
                        revokedEvents > 0
                            ? "#EF4444"
                            : "#22C55E"
                    }
                />

            </div>


            {/* Risk Analytics */}

            <RiskTrendChart
                logs={logs}
            />

            <AccessDecisionChart
                logs={logs}
            />


            {/* Protected Resource */}

            <ProtectedResource
                status={status?.access_status}
                userId={userId}
                onVerify={fetchStatus}
            />


            {/* Audit Logs */}

            <LogsTable
                logs={logs}
            />

        </div>

    );
}

export default Dashboard;