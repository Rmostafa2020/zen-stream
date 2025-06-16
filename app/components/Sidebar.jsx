// import React, { useState } from "react";
// import { FiMoreHorizontal, FiSettings } from "react-icons/fi";
// import "../global.css"; // Ensure you have global styles for the sidebar
// export default function Sidebar() {
//   const [expanded, setExpanded] = useState(false);

//   return (
//     <div
//       style={{
//         width: expanded ? 240 : 80,
//         background: "#e5c6fa",
//         height: "100vh",
//         transition: "width 0.3s",
//         position: "fixed",
//         left: 0,
//         top: 0,
//         display: "flex",
//         flexDirection: "column",
//         justifyContent: "space-between",
//         zIndex: 10,
//       }}
//     >
//       <div>
//         <button
//           style={{
//             background: "none",
//             border: "none",
//             margin: "32px 0 0 24px",
//             cursor: "pointer",
//             color: "#8f2fff",
//             fontSize: 32,
//           }}
//           onClick={() => setExpanded((e) => !e)}
//         >
//           <FiMoreHorizontal />
//         </button>
//         {expanded && (
//           <div style={{ marginTop: 32, marginLeft: 24 }}>
//             <button className="new-podcast-btn">+ New Podcast</button>
//             <div style={{ marginBottom: 16, color: "#8f2fff", cursor: "pointer" }}>History</div>
//             <div style={{ marginBottom: 16, color: "#8f2fff", cursor: "pointer" }}>Motivation and...</div>
//             <div style={{ marginBottom: 16, color: "#8f2fff", cursor: "pointer" }}>Work Stress ov..</div>
//             <div style={{ marginBottom: 16, color: "#8f2fff", cursor: "pointer" }}>Feeling overwhel..</div>
//             <div style={{ marginBottom: 16, color: "#8f2fff", cursor: "pointer" }}>Show more <span style={{fontSize: 18}}>▼</span></div>
//           </div>
//         )}
//       </div>
//       {/* <div style={{ margin: "0 0 24px 24px", color: "#8f2fff", display: "flex", alignItems: "center", cursor: "pointer" }}>
//         <FiSettings style={{ marginRight: 8 }} />
//         {expanded && <span>Settings</span>}
//       </div> */}
//     </div>
//   );
// }

import React, { useState, useEffect } from "react";
import { FiMoreHorizontal, FiSettings } from "react-icons/fi";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import "../global.css";

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useUser();
  const router = useRouter();

  useEffect(() => {
    const fetchHistory = async () => {
      if (user?.id) {
        try {
          const response = await fetch(`/api/users/me/history/${user.id}`);
          if (!response.ok) throw new Error('Failed to fetch history');
          const data = await response.json();
          setHistory(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    if (expanded) {
      fetchHistory();
    }
  }, [expanded, user?.id]);

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
            <button className="new-podcast-btn">+ New Podcast</button>
            <div style={{ color: "#8f2fff", marginBottom: 16 }}>History</div>
            
            {loading ? (
              <div style={{ color: "#8f2fff" }}>Loading history...</div>
            ) : error ? (
              <div style={{ color: "#ff0000" }}>Error: {error}</div>
            ) : history.length === 0 ? (
              <div style={{ color: "#8f2fff" }}>No history found</div>
            ) : (
              history.map((item) => (
                <div 
                  key={item._id}
                  style={{ 
                    marginBottom: 16, 
                    color: "#8f2fff", 
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "200px"
                  }}
                  title={item.title}
                  onClick={() => router.push(`/podcast/${item._id}`)}
                >
                  {item.title}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
