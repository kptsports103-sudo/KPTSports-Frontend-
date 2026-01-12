const ActionButton = ({ allowed, label, onClick }) => {
  return (
    <button
      onClick={allowed ? onClick : undefined}
      disabled={!allowed}
      title={!allowed ? "Insufficient permissions" : ""}
      className={`px-2 py-1 rounded text-sm
        ${allowed
          ? "text-blue-600 hover:underline"
          : "text-gray-400 cursor-not-allowed"}`}
    >
      {label}
    </button>
  );
};

export default ActionButton;