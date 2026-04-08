const StatCard = ({ title, value, color }) => {
  return (
    <div
      className={`bg-white p-5 rounded-lg shadow border-l-4 ${color}`}
    >
      <p className="text-gray-500 text-sm">{title}</p>
      <h3 className="text-2xl font-bold mt-2">{value}</h3>
    </div>
  );
};

export default StatCard;