import { useEffect, useState, useRef } from "react";
import {
  DollarSign,
  Ticket,
  ShoppingCart,
  TrendingUp,
  CreditCard,
  RefreshCw,
  Star,
  Popcorn,
  BarChart3,
  Film,
  Coffee,
  SlidersHorizontal,
  X,
  Download,
  Home,
  BarChart2,
  Calendar,
  Filter,
  Users,
  ChevronRight,
} from "lucide-react";
import revenueApi from "../../../api/revenue.api";
import useToast from "../../../hooks/useToastSimple";
import * as d3 from "d3";

export default function Dashboard() {
  const chartRef = useRef(null);
  const toast = useToast();

  const [selectedPeriod, setSelectedPeriod] = useState("day");
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    ticketRevenue: 0,
    serviceRevenue: 0,
    totalOrders: 0,
    totalTickets: 0,
    averageOrderValue: 0,
  });

  const [filters, setFilters] = useState({ from: "", to: "" });
  const [recentOrders, setRecentOrders] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [chartGroupBy, setChartGroupBy] = useState("day");
  const [topMovies, setTopMovies] = useState([]);
  const [topServices, setTopServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [exporting, setExporting] = useState(false);

  const formatCurrency = (value) => {
    if (!value && value !== 0) return "0đ";
    return Number(value).toLocaleString("vi-VN") + "đ";
  };

  const formatNumber = (value) => {
    if (!value && value !== 0) return "0";
    return Number(value).toLocaleString("vi-VN");
  };

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filters.from && filters.to) {
        params.from = filters.from;
        params.to = filters.to;
      } else {
        params.type = selectedPeriod;
      }

      const [summaryRes, recentRes, chartRes, topMoviesRes, topServicesRes] =
        await Promise.all([
          revenueApi.getSummary(params),
          revenueApi.getRecentOrders({ limit: 8, ...params }),
          revenueApi.getChart(params),
          revenueApi.getTopMovies({ limit: 5, ...params }),
          revenueApi.getTopServices({ limit: 5, ...params }),
        ]);

      setSummary(summaryRes.data?.data || {});
      setRecentOrders(recentRes.data?.data || []);
      setChartData(chartRes.data?.data || []);
      setChartGroupBy(chartRes.data?.groupBy || "day");
      setTopMovies(topMoviesRes.data?.data || []);
      setTopServices(topServicesRes.data?.data || []);
    } catch (error) {
      console.error("FETCH DASHBOARD ERROR:", error);
      toast.error("Không thể tải dữ liệu dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [filters.from, filters.to, selectedPeriod]);

  // D3 Chart - Thiết kế chuyên nghiệp
  useEffect(() => {
    if (!chartRef.current || !chartData.length) return;

    d3.select(chartRef.current).selectAll("*").remove();

    const containerWidth = chartRef.current.clientWidth;
    const width = containerWidth || 600;
    const isMobile = containerWidth < 640;
    const dataLength = chartData.length;
    const needsRotation = chartGroupBy === "day" && dataLength > 15;

    const height = isMobile ? 320 : 400;
    const margin = {
      top: 40,
      right: isMobile ? 20 : 30,
      bottom: needsRotation ? 90 : 65,
      left: isMobile ? 55 : 70,
    };

    const data = chartData.map((item) => ({
      label: item.label,
      revenue: Number(item.revenue || 0),
    }));

    const svg = d3
      .select(chartRef.current)
      .append("svg")
      .attr("width", "100%")
      .attr("height", height)
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("overflow", "visible")
      .style("font-family", "'Inter', system-ui, -apple-system, sans-serif");

    // ============ DEFS ============
    const defs = svg.append("defs");

    // Gradient cho vùng dưới đường line
    const areaGradient = defs
      .append("linearGradient")
      .attr("id", "areaGradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", 0)
      .attr("x2", 0).attr("y2", 1);
    
    areaGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#3B82F6")
      .attr("stop-opacity", 0.35);
    
    areaGradient.append("stop")
      .attr("offset", "50%")
      .attr("stop-color", "#3B82F6")
      .attr("stop-opacity", 0.08);
    
    areaGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#3B82F6")
      .attr("stop-opacity", 0.01);

    // Gradient cho đường line
    const lineGradient = defs
      .append("linearGradient")
      .attr("id", "lineGradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", 0)
      .attr("x2", 1).attr("y2", 0);
    
    lineGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "#2563EB");
    
    lineGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "#06B6D4");

    // Glow filter cho dots
    const glowFilter = defs
      .append("filter")
      .attr("id", "glow")
      .attr("x", "-50%")
      .attr("y", "-50%")
      .attr("width", "200%")
      .attr("height", "200%");
    
    glowFilter.append("feGaussianBlur")
      .attr("stdDeviation", "3")
      .attr("result", "coloredBlur");
    
    const feMerge = glowFilter.append("feMerge");
    feMerge.append("feMergeNode").attr("in", "coloredBlur");
    feMerge.append("feMergeNode").attr("in", "SourceGraphic");

    // Drop shadow cho card tooltip
    const shadowFilter = defs
      .append("filter")
      .attr("id", "shadow")
      .attr("x", "-20%")
      .attr("y", "-20%")
      .attr("width", "140%")
      .attr("height", "140%");
    
    shadowFilter.append("feDropShadow")
      .attr("dx", 0)
      .attr("dy", 8)
      .attr("stdDeviation", 16)
      .attr("flood-color", "#000")
      .attr("flood-opacity", 0.12);

    // ============ SCALES ============
    const x = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([margin.left, width - margin.right])
      .padding(0.3);

    const maxRevenue = d3.max(data, (d) => d.revenue) || 0;
    const y = d3
      .scaleLinear()
      .domain([0, maxRevenue * 1.12])
      .nice()
      .range([height - margin.bottom, margin.top]);

    // ============ GRID ============
    const gridGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`);

    // Grid lines
    gridGroup
      .call(
        d3.axisLeft(y)
          .tickSize(-(width - margin.left - margin.right))
          .tickFormat("")
          .ticks(isMobile ? 5 : 7)
      )
      .selectAll("line")
      .attr("stroke", "#E5E7EB")
      .attr("stroke-dasharray", "5,5")
      .attr("stroke-opacity", 0.5);

    gridGroup.select(".domain").remove();

    // ============ Y AXIS ============
    const yAxisGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`);

    const yAxis = d3.axisLeft(y)
      .ticks(isMobile ? 5 : 7)
      .tickFormat((d) => {
        if (d >= 1000000) return `${(d / 1000000).toFixed(1)}M`;
        if (d >= 1000) return `${(d / 1000).toFixed(0)}K`;
        return d;
      });

    yAxisGroup
      .call(yAxis)
      .selectAll("text")
      .style("font-size", isMobile ? "10px" : "12px")
      .style("fill", "#6B7280")
      .style("font-weight", "500")
      .style("letter-spacing", "-0.01em");

    yAxisGroup.selectAll("line").attr("stroke", "#E5E7EB").attr("stroke-opacity", 0.4);
    yAxisGroup.select(".domain").remove();

    // ============ X AXIS ============
    const xAxisGroup = svg
      .append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`);

    const xAxis = d3.axisBottom(x);

    xAxisGroup
      .call(xAxis)
      .selectAll("text")
      .style("font-size", isMobile ? "9px" : "11px")
      .style("fill", "#6B7280")
      .style("font-weight", "500")
      .style("text-anchor", needsRotation ? "end" : "middle")
      .attr("transform", needsRotation ? "rotate(-45)" : "")
      .attr("dx", needsRotation ? "-0.8em" : "0")
      .attr("dy", needsRotation ? "0.5em" : "0.3em");

    xAxisGroup.selectAll("line").remove();
    xAxisGroup.select(".domain").attr("stroke", "#E5E7EB").attr("stroke-width", 1);

    // ============ AREA ============
    const areaGenerator = d3.area()
      .x((d) => x(d.label) + x.bandwidth() / 2)
      .y0(height - margin.bottom)
      .y1((d) => y(d.revenue))
      .curve(d3.curveMonotoneX);

    svg
      .append("path")
      .datum(data)
      .attr("fill", "url(#areaGradient)")
      .attr("d", areaGenerator)
      .attr("opacity", 0)
      .transition()
      .duration(1200)
      .ease(d3.easeCubicOut)
      .attr("opacity", 1);

    // ============ LINE ============
    const lineGenerator = d3.line()
      .x((d) => x(d.label) + x.bandwidth() / 2)
      .y((d) => y(d.revenue))
      .curve(d3.curveMonotoneX);

    const path = svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "url(#lineGradient)")
      .attr("stroke-width", 2.5)
      .attr("stroke-linecap", "round")
      .attr("stroke-linejoin", "round")
      .attr("d", lineGenerator);

    // Animate line
    const totalLength = path.node().getTotalLength();
    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(1500)
      .ease(d3.easeCubicInOut)
      .attr("stroke-dashoffset", 0);

    // ============ DOTS ============
    const dotsGroup = svg.append("g").attr("class", "dots-group");

    dotsGroup
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.label) + x.bandwidth() / 2)
      .attr("cy", (d) => y(d.revenue))
      .attr("r", 0)
      .attr("fill", "#fff")
      .attr("stroke", "#3B82F6")
      .attr("stroke-width", 2.5)
      .style("cursor", "pointer")
      .style("transition", "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)")
      .transition()
      .delay((d, i) => i * (dataLength > 30 ? 20 : 50))
      .duration(600)
      .ease(d3.easeBackOut.overshoot(2))
      .attr("r", dataLength > 30 ? 3.5 : 5);

    // ============ TOOLTIP ============
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
      .style("box-shadow", "0 20px 40px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)")
      .style("z-index", "100")
      .style("transition", "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)")
      .style("filter", "url(#shadow)");

    // ============ HOVER INTERACTIONS ============
    // Invisible hover areas on each band
    svg
      .selectAll(".hover-area")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => x(d.label))
      .attr("y", margin.top)
      .attr("width", x.bandwidth())
      .attr("height", height - margin.top - margin.bottom)
      .attr("fill", "transparent")
      .style("cursor", "pointer")
      .on("mouseenter", function (event, d) {
        // Highlight dot
        dotsGroup
          .selectAll("circle")
          .filter((circleData) => circleData.label === d.label)
          .transition()
          .duration(200)
          .attr("r", dataLength > 30 ? 6.5 : 8)
          .attr("stroke-width", 3.5)
          .attr("filter", "url(#glow)")
          .attr("stroke", "#2563EB");

        // Dim other dots
        dotsGroup
          .selectAll("circle")
          .filter((circleData) => circleData.label !== d.label)
          .transition()
          .duration(200)
          .attr("opacity", 0.3);

        // Show tooltip
        tooltip
          .style("opacity", 1)
          .html(`
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <div style="font-size: 11px; color: #6B7280; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">
                Doanh thu
              </div>
              <div style="font-size: 20px; font-weight: 700; color: #2563EB; line-height: 1;">
                ${Number(d.revenue).toLocaleString("vi-VN")}đ
              </div>
              <div style="font-size: 12px; color: #9CA3AF; font-weight: 500; margin-top: 2px;">
                ${d.label}
              </div>
            </div>
          `);
      })
      .on("mousemove", function (event) {
        const tooltipNode = tooltip.node();
        const tooltipWidth = tooltipNode ? tooltipNode.offsetWidth : 160;
        const tooltipHeight = tooltipNode ? tooltipNode.offsetHeight : 90;
        
        const left = event.pageX - tooltipWidth / 2;
        const top = event.pageY - tooltipHeight - 16;
        
        tooltip
          .style("left", `${left}px`)
          .style("top", `${top}px`);
      })
      .on("mouseleave", function () {
        // Reset all dots
        dotsGroup
          .selectAll("circle")
          .transition()
          .duration(300)
          .attr("r", dataLength > 30 ? 3.5 : 5)
          .attr("stroke-width", 2.5)
          .attr("filter", null)
          .attr("stroke", "#3B82F6")
          .attr("opacity", 1);

        // Hide tooltip
        tooltip.style("opacity", 0);
      });

    // ============ HORIZONTAL HOVER LINE ============
    const hoverLineGroup = svg
      .append("g")
      .attr("class", "hover-line-group")
      .style("opacity", 0);

    // Vertical dashed line
    const hoverLine = hoverLineGroup
      .append("line")
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "#3B82F6")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "4,4")
      .attr("stroke-opacity", 0.6);

    // Hover dot on line
    const hoverDot = hoverLineGroup
      .append("circle")
      .attr("r", 6)
      .attr("fill", "#fff")
      .attr("stroke", "#2563EB")
      .attr("stroke-width", 3)
      .attr("filter", "url(#glow)");

    // Large transparent overlay for smooth hover
    svg
      .append("rect")
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom)
      .attr("transform", `translate(${margin.left}, ${margin.top})`)
      .attr("fill", "transparent")
      .style("cursor", "crosshair")
      .on("mousemove", function (event) {
        const [mouseX] = d3.pointer(event, this);
        const xPos = mouseX + margin.left;

        // Find closest data point
        let closest = null;
        let minDist = Infinity;

        data.forEach((d) => {
          const barCenter = x(d.label) + x.bandwidth() / 2;
          const dist = Math.abs(xPos - barCenter);
          if (dist < minDist) {
            minDist = dist;
            closest = d;
          }
        });

        if (closest) {
          const cx = x(closest.label) + x.bandwidth() / 2;
          const cy = y(closest.revenue);

          hoverLineGroup.style("opacity", 1);
          hoverLine.attr("x1", cx).attr("x2", cx);
          hoverDot.attr("cx", cx).attr("cy", cy);

          // Update tooltip
          const tooltipNode = tooltip.node();
          const tooltipWidth = tooltipNode ? tooltipNode.offsetWidth : 160;
          const tooltipHeight = tooltipNode ? tooltipNode.offsetHeight : 90;
          
          const left = event.pageX - tooltipWidth / 2;
          const top = event.pageY - tooltipHeight - 16;
          
          tooltip
            .style("opacity", 1)
            .html(`
              <div style="display: flex; flex-direction: column; gap: 6px;">
                <div style="font-size: 11px; color: #6B7280; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em;">
                  Doanh thu
                </div>
                <div style="font-size: 20px; font-weight: 700; color: #2563EB; line-height: 1;">
                  ${Number(closest.revenue).toLocaleString("vi-VN")}đ
                </div>
                <div style="font-size: 12px; color: #9CA3AF; font-weight: 500; margin-top: 2px;">
                  ${closest.label}
                </div>
              </div>
            `)
            .style("left", `${left}px`)
            .style("top", `${top}px`);
        }
      })
      .on("mouseleave", function () {
        hoverLineGroup.style("opacity", 0);
        tooltip.style("opacity", 0);

        // Reset all dots
        dotsGroup
          .selectAll("circle")
          .transition()
          .duration(300)
          .attr("r", dataLength > 30 ? 3.5 : 5)
          .attr("stroke-width", 2.5)
          .attr("filter", null)
          .attr("stroke", "#3B82F6")
          .attr("opacity", 1);
      });

  }, [chartData, chartGroupBy]);

  const getChartFormatLabel = () => {
    switch (chartGroupBy) {
      case "month": return "Theo tháng";
      case "year": return "Theo năm";
      default: return "Theo ngày";
    }
  };
  
  const handleExportExcel = async () => {
  try {
    setExporting(true);

    let params = {};

    // Chỉ truyền from + to khi user thực sự chọn
    if (filters.from && filters.to) {
      params = {
        from: filters.from,
        to: filters.to,
      };
    }

    const response = await revenueApi.exportExcel(params);

    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;

    const fileName =
      filters.from && filters.to
        ? `Bao_cao_doanh_thu_${filters.from}_${filters.to}.xlsx`
        : `Bao_cao_toan_bo_he_thong.xlsx`;

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

  const stats = [
    { title: "Tổng doanh thu", value: formatCurrency(summary.totalRevenue), icon: DollarSign, iconBg: "bg-blue-500", gradient: "from-blue-500 to-blue-600" },
    { title: "Doanh thu vé", value: formatCurrency(summary.ticketRevenue), icon: Ticket, iconBg: "bg-indigo-500", gradient: "from-indigo-500 to-indigo-600" },
    { title: "Doanh thu dịch vụ", value: formatCurrency(summary.serviceRevenue), icon: ShoppingCart, iconBg: "bg-sky-500", gradient: "from-sky-500 to-sky-600" },
    { title: "TB / đơn", value: formatCurrency(summary.averageOrderValue), icon: TrendingUp, iconBg: "bg-teal-500", gradient: "from-teal-500 to-teal-600" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50/50">
        <div className="relative flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-500 border-t-transparent" />
          <p className="text-sm text-gray-500 font-medium">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/30">
      {/* Mobile Bottom Nav */}
      <div
        className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-gray-200 z-50 shadow-lg"
        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        <div className="flex items-center justify-around py-2.5">
          {[
            { tab: "overview", icon: Home, label: "Tổng quan" },
            { tab: "chart", icon: BarChart2, label: "Biểu đồ" },
            { tab: "ranking", icon: Star, label: "Xếp hạng" },
            { tab: "orders", icon: ShoppingCart, label: "Đơn hàng" },
          ].map(({ tab, icon: Icon, label }) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all duration-200 ${
                activeTab === tab ? "text-blue-600 scale-105" : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <Icon size={20} strokeWidth={activeTab === tab ? 2.5 : 2} />
              <span className="text-[10px] font-semibold">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 lg:px-6 py-4 lg:py-8 pb-20 lg:pb-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
              Tổng quan doanh thu
            </h1>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Theo dõi và phân tích hiệu suất kinh doanh
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Nút Xuất báo cáo */}
            <button
              onClick={handleExportExcel}
              disabled={exporting}
              className="flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 text-sm font-medium disabled:opacity-50"
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
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "bg-white text-gray-700 border border-gray-200 hover:border-blue-300 hover:shadow-md"
              }`}
            >
              {showFilters ? (
                <>
                  <X size={17} className="group-hover:rotate-90 transition-transform duration-300" />
                  <span className="hidden sm:inline">Đóng</span>
                </>
              ) : (
                <>
                  <Filter size={17} />
                  <span className="hidden sm:inline">Bộ lọc</span>
                </>
              )}
            </button>

            <button
              onClick={fetchDashboard}
              className="group flex items-center gap-2 px-4 py-2.5 bg-white text-gray-700 rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-300 text-sm font-medium"
            >
              <RefreshCw size={17} className="group-hover:rotate-180 transition-transform duration-500" />
              <span className="hidden sm:inline">Làm mới</span>
            </button>
          </div>
        </div>

        {/* Filter Panel */}
        <div
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            showFilters ? "max-h-[300px] opacity-100 mb-6" : "max-h-0 opacity-0 mb-0"
          }`}
        >
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-5 lg:p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={18} className="text-blue-600" />
              <h3 className="font-semibold text-gray-800">Chọn khoảng thời gian</h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Từ ngày</label>
                <input
                  type="date"
                  value={filters.from}
                  onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-gray-50/50 transition-all"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Đến ngày</label>
                <input
                  type="date"
                  value={filters.to}
                  onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-gray-50/50 transition-all"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={fetchDashboard}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium text-sm hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200 transition-all duration-300 active:scale-[0.98]"
                >
                  Áp dụng
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile View */}
        <div className="lg:hidden">
          {/* Stats */}
          <div className={`${activeTab === "overview" ? "block" : "hidden"}`}>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {stats.map((item, index) => {
                const Icon = item.icon;
                return (
                  <div key={index} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className={`w-9 h-9 ${item.iconBg} rounded-xl flex items-center justify-center shadow-md`}>
                        <Icon size={15} className="text-white" />
                      </div>
                      <span className="text-xs text-gray-500 font-semibold truncate">{item.title}</span>
                    </div>
                    <p className="text-lg font-bold text-gray-900 truncate">{item.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { icon: ShoppingCart, color: "text-blue-600", bg: "bg-blue-50", value: formatNumber(summary.totalOrders), label: "Đơn hàng" },
                { icon: Ticket, color: "text-indigo-600", bg: "bg-indigo-50", value: formatNumber(summary.totalTickets), label: "Vé đã bán" },
                { icon: TrendingUp, color: "text-sky-600", bg: "bg-sky-50", value: formatCurrency(summary.averageOrderValue), label: "TB/đơn" },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl p-3 border border-gray-100 shadow-sm text-center">
                  <div className={`w-9 h-9 ${item.bg} rounded-xl flex items-center justify-center mx-auto mb-1.5`}>
                    <item.icon size={16} className={item.color} />
                  </div>
                  <p className="text-sm font-bold text-gray-900">{item.value}</p>
                  <p className="text-[10px] text-gray-500 font-medium">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Chart */}
          <div className={`${activeTab === "chart" ? "block" : "hidden"}`}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-900">Biểu đồ doanh thu</h3>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                  {getChartFormatLabel()}
                </span>
              </div>
              <div ref={chartRef} className="w-full min-h-[320px]" />
            </div>
          </div>

          {/* Rankings */}
          <div className={`${activeTab === "ranking" ? "block" : "hidden"}`}>
            <div className="space-y-4">
              {[
                {
                  title: "Top phim bán chạy", icon: Star, color: "text-amber-500", bg: "bg-amber-50",
                  data: topMovies, key: "movie_id", name: "title", extra: "ticketsSold",
                  bgColors: ["bg-amber-500", "bg-gray-400", "bg-orange-500"],
                  textColor: "text-amber-600", emptyIcon: Film,
                },
                {
                  title: "Top dịch vụ", icon: Popcorn, color: "text-indigo-500", bg: "bg-indigo-50",
                  data: topServices, key: "service_id", name: "service_name", extra: "quantity",
                  bgColors: ["bg-indigo-500", "bg-gray-400", "bg-sky-500"],
                  textColor: "text-indigo-600", emptyIcon: Coffee,
                },
              ].map((section, idx) => (
                <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                  <div className="flex items-center gap-2.5 mb-4">
                    <div className={`w-8 h-8 ${section.bg} rounded-xl flex items-center justify-center`}>
                      <section.icon size={16} className={section.color} />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">{section.title}</h3>
                  </div>
                  <div className="space-y-2.5">
                    {section.data.length === 0 ? (
                      <div className="text-center py-6">
                        <section.emptyIcon size={36} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-xs text-gray-500">Chưa có dữ liệu</p>
                      </div>
                    ) : (
                      section.data.slice(0, 3).map((item, i) => (
                        <div key={item[section.key]} className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${section.bgColors[i] || "bg-gray-300"}`}>
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-gray-800 truncate" title={item[section.name]}>
                                {item[section.name]}
                              </p>
                              <p className="text-[10px] text-gray-500">
                                {formatNumber(item[section.extra])} {section.extra === "ticketsSold" ? "vé" : "sản phẩm"}
                              </p>
                            </div>
                          </div>
                          <span className={`text-xs font-bold flex-shrink-0 ml-2 ${section.textColor}`}>
                            {formatCurrency(item.revenue)}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Orders */}
          <div className={`${activeTab === "orders" ? "block" : "hidden"}`}>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900">Đơn hàng gần đây</h3>
              </div>
              <div className="divide-y divide-gray-50">
                {recentOrders.length === 0 ? (
                  <div className="text-center py-10">
                    <ShoppingCart size={40} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500 font-medium">Không có đơn hàng</p>
                  </div>
                ) : (
                  recentOrders.slice(0, 6).map((order) => (
                    <div key={order.order_id} className="p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                          #{order.order_id}
                        </span>
                        <span className="text-sm font-bold text-gray-900">{formatCurrency(order.total_amount)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Users size={12} />
                        <span className="font-medium">{order.User?.full_name || "N/A"}</span>
                        <span className="text-gray-300">|</span>
                        <CreditCard size={12} />
                        <span>{order.Payment?.payment_method || "N/A"}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden lg:block">
          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-5 mb-6">
            {stats.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`w-12 h-12 ${item.iconBg} rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-300`}>
                        <Icon size={22} className="text-white" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 font-medium mb-1.5">{item.title}</p>
                    <h3 className="text-2xl font-bold text-gray-900 tracking-tight">{item.value}</h3>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-6">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Biểu đồ doanh thu</h2>
                <p className="text-sm text-gray-500 mt-0.5">{getChartFormatLabel()} - Phân tích chi tiết</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-600 to-cyan-500" />
                  <span className="text-xs text-gray-500 font-medium">Doanh thu</span>
                </div>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full">
                  {getChartFormatLabel()}
                </span>
              </div>
            </div>
            <div className="p-6">
              <div ref={chartRef} className="w-full min-h-[400px]" />
              {chartData.length === 0 && (
                <div className="h-[400px] flex flex-col items-center justify-center text-gray-400">
                  <BarChart3 size={56} className="mb-4 opacity-40" />
                  <p className="text-base font-medium">Chưa có dữ liệu</p>
                  <p className="text-sm mt-1">Vui lòng chọn khoảng thời gian khác</p>
                </div>
              )}
            </div>
          </div>

          {/* Summary + Rankings */}
          <div className="grid grid-cols-3 gap-5 mb-6">
            {/* Summary */}
            <div className="space-y-4">
              {[
                { icon: ShoppingCart, color: "bg-blue-500", value: formatNumber(summary.totalOrders), label: "Tổng đơn hàng", sub: "Đã hoàn thành" },
                { icon: Ticket, color: "bg-indigo-500", value: formatNumber(summary.totalTickets), label: "Tổng vé đã bán", sub: "Vé đã được đặt" },
                { icon: TrendingUp, color: "bg-sky-500", value: formatCurrency(summary.averageOrderValue), label: "Doanh thu TB/đơn", sub: "Giá trị trung bình" },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 ${item.color} rounded-xl flex items-center justify-center shadow-md`}>
                      <item.icon size={20} className="text-white" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-sm">{item.label}</h3>
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{item.value}</p>
                  <p className="text-xs text-gray-500 mt-1.5">{item.sub}</p>
                </div>
              ))}
            </div>

            {/* Top Movies */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-900">Top phim bán chạy</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Doanh thu vé cao nhất</p>
                  </div>
                  <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                    <Star size={18} className="text-amber-500" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                {topMovies.length === 0 ? (
                  <div className="text-center py-10">
                    <Film size={44} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500 font-medium">Chưa có dữ liệu</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {topMovies.map((movie, i) => (
                      <div key={movie.movie_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-amber-50 transition-colors group">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-md flex-shrink-0 ${
                            i === 0 ? "bg-amber-500" : i === 1 ? "bg-gray-400" : i === 2 ? "bg-orange-500" : "bg-gray-300"
                          }`}>
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-amber-700 transition-colors" title={movie.title}>
                              {movie.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">{formatNumber(movie.ticketsSold)} vé</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-amber-600 ml-3 flex-shrink-0 whitespace-nowrap">
                          {formatCurrency(movie.revenue)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Top Services */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold text-gray-900">Top dịch vụ bán chạy</h2>
                    <p className="text-xs text-gray-500 mt-0.5">Doanh thu cao nhất</p>
                  </div>
                  <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                    <Popcorn size={18} className="text-indigo-500" />
                  </div>
                </div>
              </div>
              <div className="p-4">
                {topServices.length === 0 ? (
                  <div className="text-center py-10">
                    <Coffee size={44} className="mx-auto text-gray-300 mb-3" />
                    <p className="text-sm text-gray-500 font-medium">Chưa có dữ liệu</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {topServices.map((service, i) => (
                      <div key={service.service_id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-colors group">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-md flex-shrink-0 ${
                            i === 0 ? "bg-indigo-500" : i === 1 ? "bg-gray-400" : i === 2 ? "bg-sky-500" : "bg-gray-300"
                          }`}>
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate group-hover:text-indigo-700 transition-colors" title={service.service_name}>
                              {service.service_name}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">{formatNumber(service.quantity)} sản phẩm</p>
                          </div>
                        </div>
                        <span className="text-sm font-bold text-indigo-600 ml-3 flex-shrink-0 whitespace-nowrap">
                          {formatCurrency(service.revenue)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">Đơn hàng gần đây</h2>
                <p className="text-xs text-gray-500 mt-0.5">Giao dịch mới nhất</p>
              </div>
              <button className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                Xem tất cả <ChevronRight size={16} />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="text-left p-4 text-gray-600 font-semibold text-xs uppercase tracking-wider">Mã đơn</th>
                    <th className="text-left p-4 text-gray-600 font-semibold text-xs uppercase tracking-wider">Khách hàng</th>
                    <th className="text-left p-4 text-gray-600 font-semibold text-xs uppercase tracking-wider">Email</th>
                    <th className="text-left p-4 text-gray-600 font-semibold text-xs uppercase tracking-wider">Thanh toán</th>
                    <th className="text-left p-4 text-gray-600 font-semibold text-xs uppercase tracking-wider">Số tiền</th>
                    <th className="text-left p-4 text-gray-600 font-semibold text-xs uppercase tracking-wider">Mã GD</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-16">
                        <ShoppingCart size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-base text-gray-500 font-medium">Không có đơn hàng nào</p>
                        <p className="text-sm text-gray-400 mt-1">Đơn hàng mới sẽ xuất hiện ở đây</p>
                      </td>
                    </tr>
                  ) : (
                    recentOrders.map((order) => (
                      <tr key={order.order_id} className="border-b border-gray-50 hover:bg-blue-50/30 transition-all duration-200">
                        <td className="p-4">
                          <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
                            #{order.order_id}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold">
                              {(order.User?.full_name || "N")[0]}
                            </div>
                            <span className="text-sm font-semibold text-gray-900">{order.User?.full_name || "N/A"}</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-gray-600">{order.User?.email || "N/A"}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <CreditCard size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-700 font-medium">{order.Payment?.payment_method || "N/A"}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-sm font-bold text-gray-900">{formatCurrency(order.total_amount)}</span>
                        </td>
                        <td className="p-4">
                          <code className="text-xs bg-gray-100 px-2.5 py-1 rounded-lg text-gray-600 font-mono">
                            {order.Payment?.transaction_code || "---"}
                          </code>
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