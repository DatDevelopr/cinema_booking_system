import TicketList from "../components/TicketList.jsx";

export default function TicketPage() {

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-xl font-semibold">
          Vé xem phim
        </h2>

        <p className="text-gray-500 text-sm">
          Danh sách vé bạn đã đặt
        </p>
      </div>

      <TicketList />

    </div>
  );
}