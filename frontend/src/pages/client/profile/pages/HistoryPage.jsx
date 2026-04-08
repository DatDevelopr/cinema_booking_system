import TransactionList from "../components/TransactionList.jsx";

export default function HistoryPage() {

  return (
    <div className="space-y-6">

      <div>
        <h2 className="text-xl font-semibold">
          Lịch sử giao dịch
        </h2>

        <p className="text-gray-500 text-sm">
          Các giao dịch bạn đã thực hiện
        </p>
      </div>

      <TransactionList />

    </div>
  );
}