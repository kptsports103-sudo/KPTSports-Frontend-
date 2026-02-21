import { useEffect, useState } from "react";

const Approvals = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    // Placeholder - replace with real API call
    setItems([
      { _id: 1, type: "CONTENT", requestedBy: "coach@example.com", status: "pending", createdAt: "2023-10-01" },
      { _id: 2, type: "USER_REGISTRATION", requestedBy: "student@example.com", status: "pending", createdAt: "2023-10-02" }
    ]);
  }, []);

  return (
    <div>
      <h2>Approval Requests</h2>
      {items.map(a => (
        <div key={a._id} className="card">
          <p><strong>{a.type}</strong> requested by {a.requestedBy}</p>
          <p>Status: {a.status}</p>
          <button>Approve</button>
          <button>Reject</button>
        </div>
      ))}
    </div>
  );
};

export default Approvals;