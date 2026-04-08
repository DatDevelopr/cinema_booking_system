const data = [
  { name: "Monkey Man", sold: 5, revenue: 1066000 },
  { name: "Cái Giá Hạnh Phúc", sold: 4, revenue: 760000 },
];

const RevenueTable = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow mt-6">
      <h3 className="font-semibold mb-4">Doanh thu theo phim</h3>

      <table className="w-full text-left">
        <thead>
          <tr className="border-b">
            <th className="py-2">Tên phim</th>
            <th>Tổng vé</th>
            <th>Doanh thu</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item, index) => (
            <tr key={index} className="border-b hover:bg-gray-50">
              <td className="py-2">{item.name}</td>
              <td>{item.sold}</td>
              <td>{item.revenue.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RevenueTable;