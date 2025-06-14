import React, { useState } from "react";
import { FiMoreHorizontal, FiSettings } from "react-icons/fi";

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        width: expanded ? 240 : 80,
        background: "#e5c6fa",
        height: "100vh",
        transition: "width 0.3s",
        position: "fixed",
        left: 0,
        top: 0,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        zIndex: 10,
      }}
    >
      <div>
        <button
          style={{
            background: "none",
            border: "none",
            margin: "32px 0 0 24px",
            cursor: "pointer",
            color: "#8f2fff",
            fontSize: 32,
          }}
          onClick={() => setExpanded((e) => !e)}
        >
          <FiMoreHorizontal />
        </button>
        {expanded && (
          <div style={{ marginTop: 32, marginLeft: 24 }}>
            <div style={{ marginBottom: 16, color: "#8f2fff", fontWeight: 500, cursor: "pointer" }}>+ New Podcast</div>
            <div style={{ marginBottom: 16, color: "#8f2fff", cursor: "pointer" }}>History</div>
            <div style={{ marginBottom: 16, color: "#8f2fff", cursor: "pointer" }}>Motivation and...</div>
            <div style={{ marginBottom: 16, color: "#8f2fff", cursor: "pointer" }}>Work Stress ov..</div>
            <div style={{ marginBottom: 16, color: "#8f2fff", cursor: "pointer" }}>Feeling overwhel..</div>
            <div style={{ marginBottom: 16, color: "#8f2fff", cursor: "pointer" }}>Show more <span style={{fontSize: 18}}>▼</span></div>
          </div>
        )}
      </div>
      <div style={{ margin: "0 0 24px 24px", color: "#8f2fff", display: "flex", alignItems: "center", cursor: "pointer" }}>
        <FiSettings style={{ marginRight: 8 }} />
        {expanded && <span>Settings</span>}
      </div>
    </div>
  );
}
