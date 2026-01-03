import { useState } from 'react';
export default function usePagination(initial = { page:1, limit:10 }) {
  const [page, setPage] = useState(initial.page);
  const [limit, setLimit] = useState(initial.limit);
  return { page, setPage, limit, setLimit };
}
