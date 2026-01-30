import { useEffect, useState } from "react";
import axios from "axios";

const VisitorCounter = () => {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Increment visitor count on page load
    axios.get("https://kpt-sports-backend.vercel.app/api/visitor/visit")
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
