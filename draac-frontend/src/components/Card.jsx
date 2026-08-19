function Card({ children }) {
    return (
        <div
            className="p-4 rounded-4 shadow"
            style={{
                background: "#1E293B",
                border: "1px solid #334155",
            }}
        >
            {children}
        </div>
    );
}

export default Card;