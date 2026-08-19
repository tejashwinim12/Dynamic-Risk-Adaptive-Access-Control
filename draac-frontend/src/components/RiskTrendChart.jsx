import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

function RiskTrendChart({ logs }) {

    const chartData = [...logs]
        .reverse()
        .map((log, index) => ({
            name: `Event ${index + 1}`,
            risk: log.risk_score ?? 0
        }));

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

                    <i className="bi bi-graph-up me-2"></i>

                    Risk Trend

                </h4>

                <div style={{ width: "100%", height: "300px" }}>

                    <ResponsiveContainer>

                        <LineChart data={chartData}>

                            <CartesianGrid strokeDasharray="3 3" />

                            <XAxis dataKey="name" />

                            <YAxis domain={[0, 100]} />

                            <Tooltip />

                            <Line
                                type="monotone"
                                dataKey="risk"
                                stroke="#EF4444"
                                strokeWidth={3}
                                dot={{ r: 4 }}
                            />

                        </LineChart>

                    </ResponsiveContainer>

                </div>

            </div>

        </div>

    );

}

export default RiskTrendChart;