import { Calendar, Clock, MapPin } from "lucide-react";

export default function TicketList() {

  const tickets = [];

  if (!tickets.length) {
    return (
      <div className="text-center py-10 text-gray-500">
        Bạn chưa có vé xem phim nào
      </div>
    );
  }

  return (
    <div className="space-y-4">

      {tickets.map((ticket) => (

        <div
          key={ticket.id}
          className="border rounded-xl p-5 flex justify-between items-center hover:shadow transition"
        >

          <div className="space-y-2">

            <h3 className="font-semibold text-lg">
              {ticket.movie}
            </h3>

            <div className="flex gap-4 text-sm text-gray-500">

              <span className="flex items-center gap-1">
                <MapPin size={16} />
                {ticket.cinema}
              </span>

              <span className="flex items-center gap-1">
                <Calendar size={16} />
                {ticket.date}
              </span>

              <span className="flex items-center gap-1">
                <Clock size={16} />
                {ticket.time}
              </span>

            </div>

          </div>

          <button className="border px-4 py-2 rounded-lg hover:bg-gray-100">
            Chi tiết
          </button>

        </div>

      ))}

    </div>
  );
}