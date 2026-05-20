import { useEffect, useState, useRef } from "react";
import {
  Building2,
  TrendingUp,
  Ticket,
  CreditCard,
  Popcorn,
  RefreshCw,
  Calendar,
  Search,
  Star,
  Coffee,
  MapPin,
  ChevronDown,
  FileSpreadsheet,
} from "lucide-react";
import cinemaRevenueApi from "../../../api/cinemaRevenue.api";
import cinemaApi from "../../../api/cinema.api";
import useToast from "../../../hooks/useToastSimple";
import * as d3 from "d3";

export default function CinemaRevenue() {
  const chartRef = useRef(null);
  const toast = useToast();

  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [cinemaList, setCinemaList] = useState([]);
  const [selectedCinema, setSelectedCinema] = useState("");
  const [selectedCinemaData, setSelectedCinemaData] = useState(null);
  const [filters, setFilters] = useState({ from: "", to: "" });

  const [summary, setSummary] = useState({
    total_revenue: 0,
    ticket_revenue: 0,
    service_revenue: 0,
    total_orders: 0,
    total_tickets: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [chartGroupBy, setChartGroupBy] = useState("day");
  const [topMovies, setTopMovies] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [showtimeDetails, setShowtimeDetails] = useState([]);

  const formatCurrency = (value) => {
    if (!value && value !== 0) return "0 đ";
    return Number(value).toLocaleString("vi-VN") + " đ";
  };

  const formatNumber = (value) => {
    return Number(value || 0).toLocaleString("vi-VN");
  };

  // Lấy danh sách rạp
  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const res = await cinemaApi.getAll({ limit: 100 });
        const cinemas = res?.data || [];
        setCinemaList(cinemas);
        if (cinemas.length > 0) {
          const first = cinemas[0];
          setSelectedCinema(String(first.cinema_id));
          setSelectedCinemaData(first);
        }
      } catch (error) {
        toast.error("Không thể tải danh sách rạp");
      }
    };
    fetchCinemas();
  }, []);

  // Tải dữ liệu khi rạp hoặc filter thay đổi
  useEffect(() => {
    if (!selectedCinema) {
      return;
    }

    const cinema = cinemaList.find(
      (c) => String(c.cinema_id) === selectedCinema
    );
    setSelectedCinemaData(cinema || null);

    // Kiểm tra ngày hợp lệ
    if (filters.from && filters.to && filters.from > filters.to) {
      toast.warning("Ngày bắt đầu không được lớn hơn ngày kết thúc");
      return;
    }

    fetchData();
  }, [selectedCinema, filters.from, filters.to, cinemaList]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = { cinema_id: selectedCinema };
      if (filters.from && filters.to) {
        params.from = filters.from;
        params.to = filters.to;
      }

      const [
        summaryRes,
        chartRes,
        topMoviesRes,
        topServicesRes,
        paymentMethodsRes,
        showtimeDetailsRes,
      ] = await Promise.all([
        cinemaRevenueApi.getSummary(params),
        cinemaRevenueApi.getChart(params),
        cinemaRevenueApi.getTopMovies(params),
        cinemaRevenueApi.getTopServices(params),
        cinemaRevenueApi.getPaymentMethods(params),
        cinemaRevenueApi.getShowtimeDetails(params),
      ]);

      setSummary(summaryRes.data?.data || {});
      setChartData(chartRes.data?.data || []);
      setChartGroupBy(chartRes.data?.groupBy || "day");
      setTopMovies(topMoviesRes.data?.data || []);
      setTopServices(topServicesRes.data?.data || []);
      setPaymentMethods(paymentMethodsRes.data?.data || []);
      setShowtimeDetails(showtimeDetailsRes.data?.data || []);
    } catch (error) {
      toast.error("Không thể tải dữ liệu doanh thu");
    } finally {
      setLoading(false);
    }
  };

  // Biểu đồ
  useEffect(() => {
    if (!chartRef.current || !chartData.length) {
      return;
    }

    d3.select(chartRef.current).selectAll("*").remove();
    d3.select(chartRef.current).selectAll(".chart-tooltip").remove();

    const containerWidth = chartRef.current.clientWidth;
    const width = containerWidth || 700;
    const dataLength = chartData.length;
    const needsRotation = chartGroupBy === "day" && dataLength > 12;

    const height = 380;
    const margin = { top: 30, right: 30, bottom: needsRotation ? 90 : 60, left: 70 };

    const data = chartData.map((item) => ({
      label: item.label,
      revenue: Number(item.revenue || 0),
    }));

    const svg = d3.select(chartRef.current)
      .append("svg")
      .attr("width", "100%")
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("overflow", "visible");

    const defs = svg.append("defs");
    const gradient = defs.append("linearGradient")
      .attr("id", "areaGradient")
      .attr("x1", 0).attr("y1", 0)
      .attr("x2", 0).attr("y2", 1);
    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#6366F1").attr("stop-opacity", 0.25);
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#6366F1").attr("stop-opacity", 0.02);

    const x = d3.scaleBand()
      .domain(data.map(d => d.label))
      .range([margin.left, width - margin.right])
      .padding(0.4);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.revenue) * 1.2 || 100])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Grid
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).tickSize(-(width - margin.left - margin.right)).tickFormat("").ticks(6))
      .selectAll("line")
      .attr("stroke", "#e5e7eb")
      .attr("stroke-dasharray", "4 4");

    // Y axis
    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y).ticks(6).tickFormat(d => {
        if (d >= 1e6) return (d / 1e6).toFixed(1) + "M";
        if (d >= 1e3) return (d / 1e3).toFixed(0) + "K";
        return d;
      }))
      .selectAll("text")
      .style("font-size", "12px")
      .style("fill", "#6b7280");

    // X axis
    const xAxis = svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x));

    xAxis.selectAll("text")
      .style("font-size", "11px")
      .style("fill", "#6b7280")
      .style("text-anchor", needsRotation ? "end" : "middle")
      .attr("transform", needsRotation ? "rotate(-35)" : "")
      .attr("dx", needsRotation ? "-0.5em" : "0")
      .attr("dy", needsRotation ? "0.5em" : "0.5em");

    xAxis.select(".domain").attr("stroke", "#d1d5db");
    xAxis.selectAll("line").remove();

    // Area
    svg.append("path")
      .datum(data)
      .attr("fill", "url(#areaGradient)")
      .attr("d", d3.area()
        .x(d => x(d.label) + x.bandwidth() / 2)
        .y0(height - margin.bottom)
        .y1(d => y(d.revenue))
        .curve(d3.curveMonotoneX)
      );

    // Line
    svg.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#6366F1")
      .attr("stroke-width", 2.8)
      .attr("d", d3.line()
        .x(d => x(d.label) + x.bandwidth() / 2)
        .y(d => y(d.revenue))
        .curve(d3.curveMonotoneX)
      );

    // Tooltip (khai báo trước khi dùng)
    const tooltip = d3.select(chartRef.current)
      .append("div")
      .attr("class", "chart-tooltip")
      .style("position", "absolute")
      .style("background", "#1f2937")
      .style("color", "#f9fafb")
      .style("padding", "8px 14px")
      .style("border-radius", "12px")
      .style("font-size", "13px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("z-index", "100")
      .style("box-shadow", "0 10px 25px rgba(0,0,0,0.2)")
      .style("transition", "opacity 0.2s");

    // Dots
    svg.selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", d => x(d.label) + x.bandwidth() / 2)
      .attr("cy", d => y(d.revenue))
      .attr("r", 5)
      .attr("fill", "#6366F1")
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .on("mouseenter", function(event, d) {
        d3.select(this).transition().duration(200).attr("r", 8);
        tooltip.style("opacity", 1)
          .html(`<div style="font-weight:600;margin-bottom:4px">${d.label}</div>Doanh thu: <strong>${formatCurrency(d.revenue)}</strong>`)
          .style("left", `${event.pageX}px`)
          .style("top", `${event.pageY - 40}px`);
      })
      .on("mousemove", function(event) {
        tooltip
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 30}px`);
      })
      .on("mouseleave", function() {
        d3.select(this).transition().duration(200).attr("r", 5);
        tooltip.style("opacity", 0);
      });

    console.log("[CinemaRevenue] Chart rendered successfully");
  }, [chartData, chartGroupBy]);

  const handleExport = async () => {
    if (!selectedCinema) {
      toast.warning("Vui lòng chọn rạp");
      return;
    }
    if (filters.from && filters.to && filters.from > filters.to) {
      toast.warning("Ngày bắt đầu không được lớn hơn ngày kết thúc");
      return;
    }
    try {
      setExporting(true);
      const params = { cinema_id: selectedCinema };
      if (filters.from && filters.to) {
        params.from = filters.from;
        params.to = filters.to;
      }
      console.log("[CinemaRevenue] Exporting with params:", params);
      const response = await cinemaRevenueApi.exportExcel(params);
      console.log("[CinemaRevenue] Export response:", response);
      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Bao_cao_${selectedCinemaData?.cinema_name || "rap"}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Xuất báo cáo thành công!");
    } catch (error) {
      console.error("[CinemaRevenue] Export error:", error);
      toast.error("Xuất báo cáo thất bại");
    } finally {
      setExporting(false);
    }
  };

  const getChartFormatLabel = () => {
    if (chartGroupBy === "month") return "Theo tháng";
    if (chartGroupBy === "year") return "Theo năm";
    return "Theo ngày";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/20">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
        {/* Header Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-white">Doanh thu theo rạp</h1>
                  <p className="text-indigo-100 text-sm mt-0.5">Phân tích chi tiết doanh thu từng cụm rạp</p>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="relative">
                  <select
                    value={selectedCinema}
                    onChange={(e) => {
                      setSelectedCinema(e.target.value);
                    }}
                    className="appearance-none bg-white/10 backdrop-blur border border-white/20 text-white rounded-xl py-2.5 pl-10 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 min-w-[240px] cursor-pointer"
                  >
                    {cinemaList.map((cinema) => (
                      <option key={cinema.cinema_id} value={String(cinema.cinema_id)} className="text-gray-900">
                        {cinema.cinema_name}
                      </option>
                    ))}
                  </select>
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/70" />
                </div>
              </div>
            </div>
          </div>

          {/* Thông tin rạp đã chọn */}
          {selectedCinemaData && (
            <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/50 flex flex-wrap items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-gray-700">
                <MapPin className="w-4 h-4 text-indigo-500" />
                <span>{selectedCinemaData.address || "Chưa có địa chỉ"}</span>
              </div>
            </div>
          )}

          {/* Filter & Actions */}
          <div className="px-6 py-3 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-medium text-gray-600">Thời gian:</span>
              <input
                type="date"
                value={filters.from}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, from: e.target.value }));
                }}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
              <span className="text-gray-400">đến</span>
              <input
                type="date"
                value={filters.to}
                onChange={(e) => {
                  setFilters(prev => ({ ...prev, to: e.target.value }));
                }}
                className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  fetchData();
                }}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Làm mới
              </button>
              <button
                onClick={handleExport}
                disabled={exporting}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Xuất Excel
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: "Tổng doanh thu", value: formatCurrency(summary.total_revenue), icon: TrendingUp, color: "bg-indigo-500" },
            { title: "Doanh thu vé", value: formatCurrency(summary.ticket_revenue), icon: Ticket, color: "bg-blue-500" },
            { title: "Doanh thu dịch vụ", value: formatCurrency(summary.service_revenue), icon: Popcorn, color: "bg-pink-500" },
            { title: "Tổng đơn hàng", value: formatNumber(summary.total_orders), icon: CreditCard, color: "bg-purple-500" },
          ].map((item, idx) => (
            <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500 font-medium">{item.title}</span>
                <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center`}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            </div>
          ))}
        </div>

        {/* Chart + Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold text-gray-900">Biểu đồ doanh thu</h2>
              <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
                {getChartFormatLabel()}
              </span>
            </div>
            <div ref={chartRef} className="w-full" style={{ minHeight: "380px" }} />
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Tổng quan</h2>
            <div className="space-y-4">
              <div className="bg-indigo-50 rounded-xl p-4">
                <p className="text-sm text-indigo-700 font-medium">Tổng vé đã bán</p>
                <p className="text-3xl font-bold text-indigo-900 mt-1">{formatNumber(summary.total_tickets)}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm text-gray-500 font-medium mb-2">Phương thức thanh toán</p>
                {paymentMethods.slice(0, 4).map((item, i) => (
                  <div key={i} className="flex justify-between text-sm py-1.5 border-b border-gray-100 last:border-0">
                    <span className="text-gray-600">{item.payment_method}</span>
                    <span className="font-medium text-gray-900">{formatCurrency(item.total_amount)}</span>
                  </div>
                ))}
                {paymentMethods.length === 0 && <p className="text-gray-400 text-sm">Chưa có dữ liệu</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Top Movies & Top Services */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-amber-500" />
              <h2 className="text-lg font-semibold text-gray-900">Top phim bán chạy</h2>
            </div>
            <div className="space-y-3">
              {topMovies.length === 0 && <p className="text-gray-400 text-sm">Chưa có dữ liệu</p>}
              {topMovies.map((movie, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-amber-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm ${
                      i === 0 ? "bg-amber-500" : i === 1 ? "bg-gray-400" : "bg-gray-300"
                    }`}>
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 truncate max-w-[180px]" title={movie.movie_name}>
                        {movie.movie_name}
                      </p>
                      <p className="text-xs text-gray-500">{movie.tickets_sold || 0} vé</p>
                    </div>
                  </div>
                  <span className="font-bold text-indigo-600">{formatCurrency(movie.revenue)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <Coffee className="w-5 h-5 text-indigo-500" />
              <h2 className="text-lg font-semibold text-gray-900">Top dịch vụ</h2>
            </div>
            <div className="space-y-3">
              {topServices.length === 0 && <p className="text-gray-400 text-sm">Chưa có dữ liệu</p>}
              {topServices.map((service, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm ${
                      i === 0 ? "bg-indigo-500" : i === 1 ? "bg-gray-400" : "bg-gray-300"
                    }`}>
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 truncate max-w-[180px]" title={service.service_name}>
                        {service.service_name}
                      </p>
                      <p className="text-xs text-gray-500">{service.quantity_sold || 0} sản phẩm</p>
                    </div>
                  </div>
                  <span className="font-bold text-indigo-600">{formatCurrency(service.revenue)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Showtime Details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">Lịch sử suất chiếu</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="text-left p-4 font-semibold text-gray-600">Phim</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Giờ bắt đầu</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Phòng</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Vé đã bán</th>
                  <th className="text-left p-4 font-semibold text-gray-600">Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {showtimeDetails.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center p-10 text-gray-400">Chưa có dữ liệu</td>
                  </tr>
                ) : (
                  showtimeDetails.map((item, idx) => (
                    <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 font-medium text-gray-900">{item.movie_name}</td>
                      <td className="p-4 text-gray-700">{new Date(item.start_time).toLocaleString("vi-VN")}</td>
                      <td className="p-4 text-gray-700">{item.room_name}</td>
                      <td className="p-4 text-gray-900 font-medium">{item.tickets_sold}</td>
                      <td className="p-4 font-semibold text-indigo-600">{formatCurrency(item.revenue)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {loading && (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-500 border-t-transparent" />
          </div>
        )}
      </div>
    </div>
  );
}