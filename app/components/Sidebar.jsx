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

import React, { useState, useEffect, useRef } from "react";
import { FiMoreHorizontal } from "react-icons/fi";
import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import "../global.css";

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dynamicWidth, setDynamicWidth] = useState(240); // Default expanded width
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const hiddenSpanRef = useRef(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (user?.id) {
        try {
          const response = await fetch(`/api/users/me/history/${user.id}`);
          if (!response.ok) throw new Error('Failed to fetch history');
          const data = await response.json();
          setHistory(data);
          
          // Calculate width after data is set
          calculateMaxWidth(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
    };

    const calculateMaxWidth = (items) => {
      if (!hiddenSpanRef.current || !items?.length) return;
      
      // Find longest title width
      const maxWidth = items.reduce((max, item) => {
        hiddenSpanRef.current.textContent = item.title;
        const width = hiddenSpanRef.current.offsetWidth;
        return Math.max(max, width);
      }, 0);

      // Set width with padding (48px = 24px margin-left * 2)
      setDynamicWidth(Math.min(Math.max(maxWidth + 48, 240), 500)); // Min 240px, Max 500px
    };

    if (expanded) {
      fetchHistory();
    }
  }, [expanded, user?.id]);

  return (
    <div
      style={{
        width: expanded ? dynamicWidth : 80,
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
      {/* Hidden span for measuring text width */}
      <span
        ref={hiddenSpanRef}
        style={{
          position: 'absolute',
          visibility: 'hidden',
          whiteSpace: 'nowrap',
          fontFamily: 'inherit',
          fontSize: '16px' // Match your history item font size
        }}
      ></span>

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
            {!pathname.startsWith("/home") && (
              <button className="new-podcast-btn" onClick={() => router.push(`/home/`)}>
                + New Podcast
              </button>
            )}
            <div style={{ color: "#8f2fff", marginBottom: 16, fontSize: 25 }}>History</div>
            
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
                  className="history-item"
                  title={item.title}
                  onClick={() => router.push(`/podcast/${item._id}`)}
                  style={{ 
                    whiteSpace: 'nowrap',
                    overflow: 'visible',
                    textOverflow: 'clip'
                  }}
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
