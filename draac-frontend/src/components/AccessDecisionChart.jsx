import React from "react";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

function AccessDecisionChart({ logs }) {

    const allow = logs.filter(
        log => log.access_status === "ALLOW"
    ).length;

    const restrict = logs.filter(
        log => log.access_status === "RESTRICT"
    ).length;

    const revoke = logs.filter(
        log => log.access_status === "REVOKE"
    ).length;

    const data = [
        { name: "ALLOW", value: allow },
        { name: "RESTRICT", value: restrict },
        { name: "REVOKE", value: revoke }
    ];

    const COLORS = ["#22C55E", "#F59E0B", "#EF4444"];

    return (
        <div
            className="card mt-4"
            style={{
                background: "#1E293B",
                border: "1px solid #334155",
                borderRadius: "16px"
            }}
        >

            <div className="card-body">

                <h4
                    className="mb-4"
                    style={{ color: "#F8FAFC" }}
                >
                    <i className="bi bi-pie-chart me-2"></i>
                    Access Decision Distribution
                </h4>

                <div style={{ width: "100%", height: "320px" }}>

                    <ResponsiveContainer>

                        <PieChart>

                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                outerRadius={100}
                                dataKey="value"
                                label
                            >

                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={COLORS[index]}
                                    />
                                ))}

                            </Pie>

                            <Tooltip />

                            <Legend />

                        </PieChart>

                    </ResponsiveContainer>

                </div>

            </div>

        </div>
    );
}

export default AccessDecisionChart;