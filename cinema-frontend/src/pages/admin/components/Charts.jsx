import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  LineChart, Line, CartesianGrid, ResponsiveContainer
} from "recharts";

const barData = [
  { name: "Điểm mặt", views: 25 },
  { name: "Chị Em", views: 15 },
  { name: "Top 10", views: 12 },
];

const lineData = [
  { month: "1/2024", revenue: 2000000 },
  { month: "2/2024", revenue: 4000000 },
  { month: "3/2024", revenue: 8000000 },
  { month: "4/2024", revenue: 3000000 },
];

const Charts = () => {
  return (
    <div className="grid grid-cols-2 gap-6 mt-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-4">Top phim</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="views" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="font-semibold mb-4">Doanh thu theo tháng</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={lineData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <CartesianGrid stroke="#eee" />
            <Line type="monotone" dataKey="revenue" stroke="#ef4444" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Charts;