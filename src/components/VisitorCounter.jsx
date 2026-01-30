import { useEffect, useState } from "react";
import axios from "axios";

export default function VisitorCounter() {
  const [today, setToday] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get visitor count (increments today's count)
    axios.get("https://kpt-sports-backend.vercel.app/api/visitor/count")
      .then(res => {
        setToday(res.data.today);
        setTotal(res.data.total);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error getting visitor count:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <span>Visitors: Loading...</span>;
  }

  return (
    <>
      <span>Today: {today}</span>
      <span>Total: {total}</span>
    </>
  );
}
