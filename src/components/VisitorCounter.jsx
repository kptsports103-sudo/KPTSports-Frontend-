import { useEffect, useState } from "react";
import api from "../../services/api";

const VisitorCounter = () => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Increment visitor count on page load
    api.get("/visitor/visit")
      .then(res => {
        setCount(res.data.count);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error updating visitor count:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <span>Visitors Counter: Loading...</span>;
  }

  return <span>Visitors Counter: {count}</span>;
};

export default VisitorCounter;
