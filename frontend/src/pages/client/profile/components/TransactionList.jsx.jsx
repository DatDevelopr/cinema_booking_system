export default function TransactionList() {

  const transactions = [];

  if (!transactions.length) {
    return (
      <div className="text-center py-10 text-gray-500">
        Chưa có giao dịch nào
      </div>
    );
  }

  return (
    <table className="w-full text-sm">

      <thead className="border-b">

        <tr className="text-left text-gray-500">

          <th className="py-3">Mã</th>
          <th>Phim</th>
          <th>Ngày</th>
          <th>Số tiền</th>
          <th>Trạng thái</th>

        </tr>

      </thead>

      <tbody>

        {transactions.map((t) => (

          <tr key={t.id} className="border-b">

            <td className="py-3">{t.id}</td>
            <td>{t.movie}</td>
            <td>{t.date}</td>
            <td>{t.price}</td>

            <td>
              <span className="text-green-600">
                Thành công
              </span>
            </td>

          </tr>

        ))}

      </tbody>

    </table>
  );
}