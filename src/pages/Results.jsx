import React, { useState, useEffect } from "react";
import api from '../services/api';

const imageMap = {
  KISHAN: "/images/result/r2.jpg",
  MEGARAJA: "/images/result/r3.jpg",
  RAKSHITH: "/images/result/r4.jpg",
  YUVARAJ: "/images/result/r6.jpg",
  RAKSHITHA: "/images/result/r7.jpg",
  PRAJNA: "/images/result/r8.jpg",
  PRAMILA: "/images/result/r9.jpg",
  DEEPIKA: "/images/result/r10.jpg",
  ANVITHA: "/images/result/r11.jpg",
  AISHWARYA: "/images/result/r12.jpg",
  KISHAN_SHETTY: "/images/result/r13.jpg",
  RAKSHITH_KUMAR: "/images/result/r14.jpg",
  MEGARAJA_N_MOOLYA: "/images/result/r15.jpg",
  SAMITH: "/images/result/r16.jpg",
  HARSHITH: "/images/result/r17.jpg"
};

const Results = () => {
  const [results, setResults] = useState([]);
  const [selectedName, setSelectedName] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const res = await api.get('/results');
      setResults(res.data || []);
    } catch (err) {
      console.error("Error fetching results", err);
    }
  };

  const handleNameClick = (name) => {
    if (imageMap[name]) {
      setSelectedName(name);
      setModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-cover bg-center bg-no-repeat p-8" style={{
      backgroundImage: "url('/images/bg-results.jpg')",
      backgroundColor: "rgba(15, 59, 46, 0.9)",
      backgroundBlendMode: "overlay"
    }}>
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-white" style={{
          background: "linear-gradient(45deg, #FFD700, #FFA500)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text"
        }}>
          🏆 Final Results Table
        </h1>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
              <tr>
                <th className="px-6 py-4 text-left">Sport</th>
                <th className="px-6 py-4 text-left">Players</th>
                <th className="px-6 py-4 text-left">Winner</th>
                <th className="px-6 py-4 text-left">Year</th>
                <th className="px-6 py-4 text-center">Photo</th>
              </tr>
            </thead>
            <tbody>
              {results.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                    No results available.
                  </td>
                </tr>
              )}

              {results.map((res, index) => (
                <tr key={res._id} className={`${
                  index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                } hover:bg-blue-50 transition-colors duration-200`}>
                  <td className="px-6 py-4 font-medium">{res.event}</td>
                  <td className="px-6 py-4">{res.name}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`${
                        imageMap[res.name] ? 'cursor-pointer text-blue-600 hover:text-blue-800' : ''
                      } font-semibold`}
                      onClick={() => handleNameClick(res.name)}
                    >
                      {res.name}
                    </span>
                  </td>
                  <td className="px-6 py-4">{res.year}</td>
                  <td className="px-6 py-4 text-center">
                    {imageMap[res.name] ? (
                      <button
                        onClick={() => handleNameClick(res.name)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full text-sm transition-colors duration-200"
                      >
                        👁️ View
                      </button>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Image Modal */}
      {modalOpen && selectedName && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="bg-white p-4 rounded-lg max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold mb-4 text-center">{selectedName}</h3>
            <img
              src={imageMap[selectedName]}
              alt={selectedName}
              className="w-full h-auto rounded"
            />
            <button
              onClick={() => setModalOpen(false)}
              className="mt-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded w-full"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;