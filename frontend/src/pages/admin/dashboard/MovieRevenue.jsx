import { useEffect, useState, useRef } from "react";
import {
  DollarSign,
  Film,
  Ticket,
  RefreshCw,
  Calendar,
  Filter,
  Download,
  X,
  Star,
  BarChart3,
} from "lucide-react";
import movieRevenueApi from "../../../api/movieRevenue.api";
import useToast from "../../../hooks/useToastSimple";
import * as d3 from "d3";

export default function MovieRevenue() {
  const chartRef = useRef(null);
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState([]);
  const [topMovies, setTopMovies] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ from: "", to: "" });
  const [exporting, setExporting] = useState(false);

  const formatCurrency = (value) => {
    if (!value && value !== 0) return "0đ";
    return Number(value).toLocaleString("vi-VN") + "đ";
  };

  const formatNumber = (value) => {
    if (!value && value !== 0) return "0";
    return Number(value).toLocaleString("vi-VN");
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.from && filters.to) {
        params.from = filters.from;
        params.to = filters.to;
      }

      const [summaryRes, topRes, chartRes] = await Promise.all([
        movieRevenueApi.getSummary(params),
        movieRevenueApi.getTopMovies({ limit: 5, ...params }),
        movieRevenueApi.getChart({ limit: 10, ...params }), // lấy top 10 phim
      ]);

      setSummary(summaryRes.data?.data || []);
      setTopMovies(topRes.data?.data || []);
      setChartData(chartRes.data?.data || []);
    } catch (error) {
      console.error("FETCH MOVIE REVENUE ERROR:", error);
      toast.error("Không thể tải dữ liệu doanh thu phim");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.from, filters.to]);

  // D3 Chart: Grouped bar chart - Revenue + Tickets sold per movie
  useEffect(() => {
    if (!chartRef.current || !chartData.length) return;

    d3.select(chartRef.current).selectAll("*").remove();

    const containerWidth = chartRef.current.clientWidth;
    const width = containerWidth || 600;
    const isMobile = containerWidth < 640;
    const dataLength = chartData.length;

    const height = isMobile ? 400 : 500;
    const margin = {
      top: 40,
      right: isMobile ? 60 : 80, // để chỗ cho trục Y phải
      bottom: isMobile ? 100 : 80,
      left: isMobile ? 60 : 70,
    };

    // Nhóm dữ liệu: mỗi phim có revenue và tickets_sold
    const data = chartData.slice(0, 10); // tối đa 10 phim

    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", "100%")
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("overflow", "visible")
      .style("font-family", "'Inter', system-ui, sans-serif");

    // Các nhóm (categories): revenue, tickets
    const groups = ["revenue", "tickets_sold"];
    const groupColors = {
      revenue: "#8B5CF6", // tím
      tickets_sold: "#EC4899", // hồng
    };

    // Scale X: tên phim
    const x0 = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([margin.left, width - margin.right])
      .padding(0.2);

    // Scale X1: nhóm con trong mỗi phim
    const x1 = d3
      .scaleBand()
      .domain(groups)
      .range([0, x0.bandwidth()])
      .padding(0.1);

    // Trục Y trái cho revenue
    const maxRevenue = d3.max(data, (d) => d.revenue) || 0;
    const yRevenue = d3
      .scaleLinear()
      .domain([0, maxRevenue * 1.15])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Trục Y phải cho tickets_sold
    const maxTickets = d3.max(data, (d) => d.tickets_sold) || 0;
    const yTickets = d3
      .scaleLinear()
      .domain([0, maxTickets * 1.15])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // Grid lines cho trục Y trái
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(
        d3
          .axisLeft(yRevenue)
          .tickSize(-(width - margin.left - margin.right))
          .tickFormat("")
          .ticks(6),
      )
      .selectAll("line")
      .attr("stroke", "#E5E7EB")
      .attr("stroke-dasharray", "4,4")
      .attr("stroke-opacity", 0.6);

    // Trục Y trái (revenue)
    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(
        d3
          .axisLeft(yRevenue)
          .ticks(6)
          .tickFormat((d) => {
            if (d >= 1000000) return `${(d / 1000000).toFixed(1)}M`;
            if (d >= 1000) return `${(d / 1000).toFixed(0)}K`;
            return d;
          }),
      )
      .selectAll("text")
      .style("font-size", isMobile ? "10px" : "11px")
      .style("fill", "#7C3AED")
      .style("font-weight", "600");

    // Trục Y phải (tickets_sold)
    svg
      .append("g")
      .attr("transform", `translate(${width - margin.right},0)`)
      .call(d3.axisRight(yTickets).ticks(6).tickFormat(d3.format("d")))
      .selectAll("text")
      .style("font-size", isMobile ? "10px" : "11px")
      .style("fill", "#EC4899")
      .style("font-weight", "600");

    // X Axis
    const xAxis = svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(x0));

    xAxis
      .selectAll("text")
      .style("font-size", isMobile ? "8px" : "11px")
      .style("fill", "#6B7280")
      .style("font-weight", "500")
      .style("text-anchor", "end")
      .attr("transform", "rotate(-35)")
      .attr("dx", "-0.8em")
      .attr("dy", "0.3em");

    xAxis.selectAll("line").remove();
    xAxis.select(".domain").remove();

    // Vẽ cột cho từng nhóm
    const barGroups = svg
      .append("g")
      .selectAll("g")
      .data(data)
      .enter()
      .append("g")
      .attr("transform", (d) => `translate(${x0(d.label)},0)`);

    // Cột revenue (tím)
    barGroups
      .append("rect")
      .attr("x", x1("revenue"))
      .attr("y", yRevenue(0))
      .attr("width", x1.bandwidth())
      .attr("height", 0)
      .attr("fill", groupColors.revenue)
      .attr("rx", 4)
      .transition()
      .duration(800)
      .ease(d3.easeQuadOut)
      .attr("y", (d) => yRevenue(d.revenue))
      .attr("height", (d) => yRevenue(0) - yRevenue(d.revenue));

    // Cột tickets_sold (hồng)
    barGroups
      .append("rect")
      .attr("x", x1("tickets_sold"))
      .attr("y", yTickets(0))
      .attr("width", x1.bandwidth())
      .attr("height", 0)
      .attr("fill", groupColors.tickets_sold)
      .attr("rx", 4)
      .transition()
      .duration(800)
      .ease(d3.easeQuadOut)
      .attr("y", (d) => yTickets(d.tickets_sold))
      .attr("height", (d) => yTickets(0) - yTickets(d.tickets_sold));

    // Tooltip
    const tooltip = d3
      .select(chartRef.current)
      .append("div")
      .style("position", "absolute")
      .style("background", "#FFFFFF")
      .style("color", "#1F2937")
      .style("padding", "14px 18px")
      .style("border-radius", "16px")
      .style("font-size", "13px")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style(
        "box-shadow",
        "0 20px 40px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
      )
      .style("z-index", "100")
      .style("transition", "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)");

    // Hover vùng chứa cả 2 cột
    barGroups
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", x0.bandwidth())
      .attr("height", height - margin.top - margin.bottom)
      .attr("fill", "transparent")
      .style("cursor", "pointer")
      .on("mouseenter", function (event, d) {
        tooltip.style("opacity", 1).html(`
          <div style="display: flex; flex-direction: column; gap: 6px;">
            <div style="font-size: 14px; font-weight: 700; color: #1F2937;">${d.label}</div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 10px; height: 10px; background: #8B5CF6; border-radius: 3px;"></div>
              <span style="color: #6B7280;">Doanh thu:</span>
              <strong style="color: #7C3AED;">${formatCurrency(d.revenue)}</strong>
            </div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <div style="width: 10px; height: 10px; background: #EC4899; border-radius: 3px;"></div>
              <span style="color: #6B7280;">Vé bán:</span>
              <strong style="color: #EC4899;">${formatNumber(d.tickets_sold)} vé</strong>
            </div>
          </div>
        `);
      })
      .on("mousemove", function (event) {
        const tw = tooltip.node().offsetWidth;
        const th = tooltip.node().offsetHeight;
        tooltip
          .style("left", `${event.pageX - tw / 2}px`)
          .style("top", `${event.pageY - th - 16}px`);
      })
      .on("mouseleave", () => tooltip.style("opacity", 0));

    // Legend
    const legend = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top - 25})`);

    legend
      .append("rect")
      .attr("width", 12)
      .attr("height", 12)
      .attr("rx", 3)
      .attr("fill", groupColors.revenue);
    legend
      .append("text")
      .attr("x", 18)
      .attr("y", 11)
      .text("Doanh thu")
      .style("font-size", "11px")
      .style("fill", "#6B7280");

    legend
      .append("rect")
      .attr("x", 90)
      .attr("width", 12)
      .attr("height", 12)
      .attr("rx", 3)
      .attr("fill", groupColors.tickets_sold);
    legend
      .append("text")
      .attr("x", 108)
      .attr("y", 11)
      .text("Số vé")
      .style("font-size", "11px")
      .style("fill", "#6B7280");
  }, [chartData]);

  const handleExportExcel = async () => {
    try {
      setExporting(true);

      const params = {};

      // Chỉ truyền khi người dùng thực sự chọn ngày
      if (filters.from && filters.to) {
        params.from = filters.from;
        params.to = filters.to;
      }

      const response = await movieRevenueApi.exportExcel(params);

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;

      const fileName =
        params.from && params.to
          ? `Doanh_thu_phim_${params.from}_${params.to}.xlsx`
          : `Bao_cao_toan_bo_doanh_thu_phim.xlsx`;

      link.setAttribute("download", fileName);

      document.body.appendChild(link);
      link.click();
      link.remove();

      window.URL.revokeObjectURL(url);

      toast.success("Xuất báo cáo thành công!");
    } catch (error) {
      console.error("EXPORT ERROR:", error);
      toast.error("Không thể xuất báo cáo");
    } finally {
      setExporting(false);
    }
  };
  const totalRevenue = summary.reduce(
    (sum, item) => sum + Number(item.ticket_revenue || 0),
    0,
  );
  const totalTickets = summary.reduce(
    (sum, item) => sum + Number(item.tickets_sold || 0),
    0,
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-purple-50/30">
        <div className="relative flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-purple-500 border-t-transparent" />
          <p className="text-sm text-gray-500 font-medium">
            Đang tải dữ liệu...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50/30">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4 lg:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur-lg opacity-40" />
              <div className="relative w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Film size={22} className="text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                Doanh thu theo phim
              </h1>
              <p className="text-sm text-gray-500 mt-1 font-medium">
                Thống kê doanh thu bán vé theo từng phim
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Nút Xuất báo cáo */}
            <button
              onClick={handleExportExcel}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-300 text-sm font-medium disabled:opacity-50"
            >
              {exporting ? (
                <RefreshCw size={17} className="animate-spin" />
              ) : (
                <Download size={17} />
              )}
              <span className="hidden sm:inline">Xuất báo cáo</span>
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-300 ${
                showFilters
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-200"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-purple-300 hover:shadow-md"
              }`}
            >
              {showFilters ? <X size={17} /> : <Filter size={17} />}
              <span className="hidden sm:inline">
                {showFilters ? "Đóng" : "Bộ lọc"}
              </span>
            </button>

            <button
              onClick={fetchData}
              className="group flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-xl border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all duration-300 text-sm font-medium"
            >
              <RefreshCw
                size={17}
                className="group-hover:rotate-180 transition-transform duration-500"
              />
              <span className="hidden sm:inline">Làm mới</span>
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${showFilters ? "max-h-[300px] opacity-100 mb-6" : "max-h-0 opacity-0 mb-0"}`}
        >
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-5 lg:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={18} className="text-purple-600" />
              <h3 className="font-semibold text-gray-800">
                Chọn khoảng thời gian
              </h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                  Từ ngày
                </label>
                <input
                  type="date"
                  value={filters.from}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, from: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm bg-gray-50/50 transition-all"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">
                  Đến ngày
                </label>
                <input
                  type="date"
                  value={filters.to}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, to: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-sm bg-gray-50/50 transition-all"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={fetchData}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium text-sm hover:from-purple-700 hover:to-pink-700 shadow-lg shadow-purple-200 transition-all duration-300 active:scale-[0.98]"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
          {/* Giữ nguyên 3 card thống kê */}
          <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-500 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <DollarSign size={22} className="text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-500 font-medium mb-1.5">
                Tổng doanh thu
              </p>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                {formatCurrency(totalRevenue)}
              </h3>
            </div>
          </div>

          <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Ticket size={22} className="text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-500 font-medium mb-1.5">
                Tổng vé bán
              </p>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                {formatNumber(totalTickets)}
              </h3>
            </div>
          </div>

          <div className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-pink-500 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300">
                  <Film size={22} className="text-white" />
                </div>
              </div>
              <p className="text-sm text-gray-500 font-medium mb-1.5">
                Số phim
              </p>
              <h3 className="text-2xl font-bold text-gray-900 tracking-tight">
                {formatNumber(summary.length)}
              </h3>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Biểu đồ doanh thu & vé bán theo phim
              </h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Top 10 phim có doanh thu cao nhất
              </p>
            </div>
          </div>
          <div className="p-6">
            <div ref={chartRef} className="w-full min-h-[500px]" />
            {chartData.length === 0 && (
              <div className="h-[500px] flex flex-col items-center justify-center text-gray-400">
                <BarChart3 size={56} className="mb-4 opacity-40" />
                <p className="text-base font-medium">Chưa có dữ liệu</p>
              </div>
            )}
          </div>
        </div>

        {/* Top Movies & All Movies */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Movies */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">
                    Top phim doanh thu cao
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Phim có doanh thu vé cao nhất
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                  <Star size={18} className="text-purple-500" />
                </div>
              </div>
            </div>
            <div className="p-4">
              {topMovies.length === 0 ? (
                <div className="text-center py-10">
                  <Film size={44} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-sm text-gray-500 font-medium">
                    Chưa có dữ liệu
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {topMovies.map((movie, i) => (
                    <div
                      key={movie.movie_id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-purple-50 transition-colors group"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-md flex-shrink-0 ${
                            i === 0
                              ? "bg-purple-500"
                              : i === 1
                                ? "bg-gray-400"
                                : i === 2
                                  ? "bg-pink-500"
                                  : "bg-gray-300"
                          }`}
                        >
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className="text-sm font-semibold text-gray-900 truncate group-hover:text-purple-700 transition-colors"
                            title={movie.title}
                          >
                            {movie.title}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {formatNumber(movie.tickets_sold)} vé
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-purple-600 ml-3 flex-shrink-0 whitespace-nowrap">
                        {formatCurrency(movie.revenue || movie.ticket_revenue)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* All Movies Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-gray-900">
                    Danh sách doanh thu phim
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Tất cả phim đã có doanh thu
                  </p>
                </div>
                <span className="text-xs text-gray-400">
                  {summary.length} phim
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="text-left p-4 text-gray-600 font-semibold text-xs uppercase tracking-wider">
                      Phim
                    </th>
                    <th className="text-left p-4 text-gray-600 font-semibold text-xs uppercase tracking-wider">
                      Vé đã bán
                    </th>
                    <th className="text-left p-4 text-gray-600 font-semibold text-xs uppercase tracking-wider">
                      Doanh thu
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {summary.length === 0 ? (
                    <tr>
                      <td
                        colSpan="3"
                        className="text-center py-10 text-gray-500"
                      >
                        Chưa có dữ liệu
                      </td>
                    </tr>
                  ) : (
                    summary.map((movie, i) => (
                      <tr
                        key={movie.movie_id || i}
                        className="border-b border-gray-50 hover:bg-purple-50/30 transition-all duration-200"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden">
                              {movie.poster_url ? (
                                <img
                                  src={movie.poster_url}
                                  alt={movie.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span>{movie.title?.[0] || "P"}</span>
                              )}
                            </div>
                            <span
                              className="text-sm font-semibold text-gray-900 truncate max-w-[180px]"
                              title={movie.title}
                            >
                              {movie.title}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5">
                            <Ticket size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-700 font-medium">
                              {formatNumber(movie.tickets_sold)}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm font-bold text-purple-600">
                            {formatCurrency(movie.ticket_revenue)}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
