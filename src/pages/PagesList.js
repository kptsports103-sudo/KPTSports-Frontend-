import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../api/axios';
import Layout from '../components/Layout';
import usePagination from '../hooks/usePagination';

const fetchPages = async ({ queryKey }) => {
  const [_key, { page, limit }] = queryKey;
  const res = await api.get(`/pages?page=${page}&limit=${limit}`);
  return res.data;
};

export default function PagesList() {
  const { page, setPage, limit } = usePagination({ page: 1, limit: 10 });
  const { data, isLoading, error } = useQuery(['pages', { page, limit }], fetchPages, { keepPreviousData: true });

  return (
    <Layout>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl">Pages</h2>
        <button className="px-3 py-1 bg-blue-600 text-white rounded">New Page</button>
      </div>

      {isLoading ? <div>Loading...</div> :
        error ? <div className="text-red-600">Error loading pages</div> :
        <>
          <div className="space-y-2">
            {data.items.map(p => (
              <div key={p._id} className="p-4 bg-white rounded shadow">
                <div className="flex justify-between">
                  <div>
                    <div className="font-semibold">{p.title}</div>
                    <div className="text-sm text-gray-600">{p.excerpt}</div>
                  </div>
                  <div className="text-sm">{new Date(p.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between mt-4">
            <div>Page {data.page} of {Math.ceil(data.total / data.limit)}</div>
            <div>
              <button onClick={() => setPage(Math.max(1, page-1))} className="px-3 py-1 mr-2 bg-gray-200 rounded">Prev</button>
              <button onClick={() => setPage(page+1)} className="px-3 py-1 bg-gray-200 rounded">Next</button>
            </div>
          </div>
        </>
      }
    </Layout>
  );
}
