import StatCard from "../components/StatCard";
import Charts from "../components/Charts";
import RevenueTable from "../components/RevenueTable";

const Dashboard = () => {
  return (
    <>
      <div className="grid grid-cols-4 gap-6">
        <StatCard
          title="Doanh thu hôm nay"
          value="760,000"
          color="border-blue-500"
        />
        <StatCard
          title="Khách hàng mới"
          value="0"
          color="border-green-500"
        />
        <StatCard
          title="Tổng vé bán"
          value="9"
          color="border-yellow-500"
        />
        <StatCard
          title="Tổng doanh thu"
          value="1,826,000"
          color="border-red-500"
        />
      </div>

      <Charts />
      <RevenueTable />
    </>
  );
};

export default Dashboard;