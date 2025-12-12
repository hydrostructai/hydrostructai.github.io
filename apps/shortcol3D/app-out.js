/**
 * APP OUTPUT COMPONENT (RESULT DISPLAY)
 * Nhiệm vụ:
 * 1. Vẽ biểu đồ tương tác 3D (Mesh + Points).
 * 2. Tính toán hệ số an toàn dựa trên mặt tương tác đã sinh ra.
 * 3. Hiển thị bảng kết quả chi tiết.
 */

const { useEffect, useRef, useState, useMemo } = React;

const AppOut = ({ results, input }) => {
  const chartRef = useRef(null);
  const [safetyFactors, setSafetyFactors] = useState({});

  // --- 1. HELPER: TÍNH HỆ SỐ AN TOÀN (K) ---
  // Thuật toán: Tìm giao điểm của vector tải trọng với mặt tương tác
  // K = |Vector Sức kháng| / |Vector Tải trọng|
  const calculateSafetyFactor = (load, surfacePoints) => {
    const { P, Mx, My } = load;
    const distLoad = Math.sqrt(P * P + Mx * Mx + My * My);

    // Nếu tải trọng = 0, an toàn tuyệt đối
    if (distLoad < 0.01) return { k: 999, isSafe: true };

    // Vector đơn vị của tải trọng
    const uLx = Mx / distLoad;
    const uLy = My / distLoad;
    const uLz = P / distLoad;

    // Tìm điểm trên mặt tương tác có hướng gần nhất với vector tải trọng
    // (Sử dụng tích vô hướng để tìm Cosine góc nhỏ nhất)
    let maxDot = -1;
    let bestPoint = null;

    for (let pt of surfacePoints) {
      const distPt = Math.sqrt(pt.x * pt.x + pt.y * pt.y + pt.z * pt.z);
      if (distPt < 0.01) continue;

      // Dot product của vector đơn vị
      const dot = (pt.x * uLx + pt.y * uLy + pt.z * uLz) / distPt;

      if (dot > maxDot) {
        maxDot = dot;
        bestPoint = pt;
      }
    }

    // Nếu tìm thấy điểm tương đồng hướng (ngưỡng cos > 0.98 ~ góc lệch < 11 độ)
    // Lưu ý: Do lưới điểm rời rạc, ta chấp nhận sai số góc nhỏ
    if (bestPoint && maxDot > 0.95) {
      const distCap = Math.sqrt(
        bestPoint.x ** 2 + bestPoint.y ** 2 + bestPoint.z ** 2
      );
      const k = distCap / distLoad;
      return { k: k, isSafe: k >= 1.0 };
    }

    return { k: 0, isSafe: false }; // Không tìm thấy (ngoài vùng bao phủ hoặc lỗi)
  };

  // --- 2. EFFECT: TÍNH TOÁN & VẼ BIỂU ĐỒ ---
  useEffect(() => {
    if (!results || !chartRef.current || !input) return;

    const { surfacePoints } = results;
    const loads = input.loads || [];

    // A. Tính toán lại hệ số an toàn cho tất cả các tổ hợp
    const newSafetyFactors = {};
    loads.forEach((l) => {
      newSafetyFactors[l.id] = calculateSafetyFactor(l, surfacePoints);
    });
    setSafetyFactors(newSafetyFactors);

    // B. Chuẩn bị dữ liệu vẽ Plotly

    // 1. Trace: Mặt tương tác (Mesh3D)
    const meshTrace = {
      type: "mesh3d",
      x: surfacePoints.map((p) => p.x), // Mx
      y: surfacePoints.map((p) => p.y), // My
      z: surfacePoints.map((p) => p.z), // P
      alphahull: 0, // Convex hull tạo khối kín
      opacity: 0.35, // Trong suốt để nhìn thấy điểm bên trong
      color: "#3b82f6", // Blue-500
      hoverinfo: "none", // Tắt hover trên mặt để đỡ rối
      name: "Vùng chịu lực",
    };

    // 2. Trace: Các điểm tải trọng (Scatter3D)
    const loadTrace = {
      type: "scatter3d",
      mode: "markers",
      x: loads.map((l) => l.Mx),
      y: loads.map((l) => l.My),
      z: loads.map((l) => l.P),
      marker: {
        size: 5,
        color: loads.map((l) =>
          newSafetyFactors[l.id]?.isSafe ? "#22c55e" : "#ef4444"
        ), // Green/Red
        symbol: "circle",
        line: { color: "white", width: 1 },
      },
      text: loads.map((l) => l.note),
      hovertemplate:
        "<b>%{text}</b><br>Mx: %{x:.1f}<br>My: %{y:.1f}<br>P: %{z:.1f}<extra></extra>",
      name: "Điểm tải trọng",
    };

    // 3. Trace: Các đường gióng từ gốc 0,0,0 đến điểm tải (Lines)
    // Giúp nhìn không gian 3D dễ hơn
    const lineTraces = loads.map((l) => {
      const isSafe = newSafetyFactors[l.id]?.isSafe;
      return {
        type: "scatter3d",
        mode: "lines",
        x: [0, l.Mx],
        y: [0, l.My],
        z: [0, l.P],
        line: {
          width: 4,
          color: isSafe ? "#22c55e" : "#ef4444", // Green/Red
        },
        hoverinfo: "none",
        showlegend: false,
      };
    });

    // 4. Trace: Trục tọa độ giả (để hiển thị rõ trục 0)
    const axesTrace = {
      type: "scatter3d",
      mode: "lines",
      x: [0, 0, 0, 0, 0, 0],
      y: [0, 0, 0, 0, 0, 0],
      z: [
        Math.min(...surfacePoints.map((p) => p.z)),
        Math.max(...surfacePoints.map((p) => p.z)),
        0,
        0,
        0,
        0,
      ],
      line: { color: "black", width: 1 },
      hoverinfo: "none",
      showlegend: false,
    };

    // C. Cấu hình Layout Plotly
    const layout = {
      title: { text: "Biểu đồ tương tác không gian", font: { size: 14 } },
      scene: {
        xaxis: {
          title: "Mx (kNm)",
          backgroundcolor: "#f8fafc",
          gridcolor: "#e2e8f0",
        },
        yaxis: {
          title: "My (kNm)",
          backgroundcolor: "#f8fafc",
          gridcolor: "#e2e8f0",
        },
        zaxis: {
          title: "P (kN)",
          backgroundcolor: "#f1f5f9",
          gridcolor: "#cbd5e1",
        },
        camera: {
          eye: { x: 1.6, y: 1.6, z: 1.6 }, // Góc nhìn xa một chút
          up: { x: 0, y: 0, z: 1 }, // Trục Z hướng lên
        },
        aspectmode: "cube", // Tỉ lệ 1:1:1
      },
      margin: { l: 0, r: 0, b: 0, t: 30 },
      height: 500, // Chiều cao cố định
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      showlegend: true,
      legend: { x: 0, y: 1 },
    };

    const config = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ["lasso2d", "select2d"],
    };

    // Vẽ biểu đồ (New Plot để reset hoàn toàn khi dữ liệu đổi)
    Plotly.newPlot(
      chartRef.current,
      [meshTrace, loadTrace, ...lineTraces],
      layout,
      config
    );
  }, [results, input]); // Chạy lại khi input hoặc results thay đổi

  // --- 3. RENDER TRẠNG THÁI CHỜ ---
  if (!results) {
    return (
      <div
        className="d-flex flex-column h-100 align-items-center justify-content-center bg-light border-start"
        style={{ borderColor: "#dee2e6" }}
      >
        <div className="text-center p-5" style={{ opacity: 0.5 }}>
          <i
            className="bi bi-bar-chart-steps d-block mb-3 text-secondary"
            style={{ fontSize: "3rem" }}
          ></i>
          <h3 className="fs-5 fw-medium text-muted">
            Chưa có dữ liệu tính toán
          </h3>
          <p className="small text-muted mt-2">
            Vui lòng nhập thông số và nhấn "Tính toán"
          </p>
        </div>
      </div>
    );
  }

  // --- 4. RENDER GIAO DIỆN KẾT QUẢ (2-Column Grid) ---
  return (
    <div className="d-flex flex-column h-100 bg-white">
      {/* Header */}
      <div
        className="px-4 py-3 border-bottom d-flex justify-content-between align-items-center bg-white sticky-top"
        style={{ zIndex: 20 }}
      >
        <h4 className="small fw-bold text-dark text-uppercase mb-0">
          <i className="bi bi-check-circle me-2 text-success"></i>Kết quả Kiểm
          tra
        </h4>

        <div className="d-flex gap-2">
          <span className="d-flex align-items-center small fw-bold px-2 py-1 bg-success bg-opacity-25 text-success rounded border border-success border-opacity-25">
            <span
              className="badge bg-success rounded-circle me-1"
              style={{ width: "6px", height: "6px" }}
            ></span>{" "}
            Đạt ({Object.values(safetyFactors).filter((s) => s.isSafe).length})
          </span>
          <span className="d-flex align-items-center small fw-bold px-2 py-1 bg-danger bg-opacity-25 text-danger rounded border border-danger border-opacity-25">
            <span
              className="badge bg-danger rounded-circle me-1"
              style={{ width: "6px", height: "6px" }}
            ></span>{" "}
            Không đạt (
            {Object.values(safetyFactors).filter((s) => !s.isSafe).length})
          </span>
        </div>
      </div>

      {/* 2-Column Layout: Table (Left) | Chart (Right) */}
      <div className="flex-grow-1 d-flex" style={{ minHeight: 0 }}>
        {/* LEFT COLUMN: Results Table */}
        <div
          className="border-end"
          style={{
            width: "35%",
            overflowY: "auto",
            borderColor: "#dee2e6",
          }}
        >
          <div className="table-responsive">
            <table className="table table-hover table-sm mb-0">
              <thead
                className="table-light small text-muted text-uppercase"
                style={{ position: "sticky", top: 0 }}
              >
                <tr>
                  <th className="fw-bold">Tổ hợp</th>
                  <th className="fw-bold text-end">P (kN)</th>
                  <th className="fw-bold text-end">Mx (kNm)</th>
                  <th className="fw-bold text-end">My (kNm)</th>
                  <th
                    className="fw-bold text-center"
                    title="Hệ số an toàn K = R/S"
                  >
                    K
                  </th>
                  <th className="fw-bold text-center">Kết quả</th>
                </tr>
              </thead>
              <tbody className="small">
                {input &&
                  input.loads &&
                  input.loads.map((l, idx) => {
                    const result = safetyFactors[l.id] || {
                      k: 0,
                      isSafe: false,
                    };
                    const kVal = result.k === 999 ? "∞" : result.k.toFixed(2);

                    return (
                      <tr
                        key={idx}
                        className={
                          result.isSafe ? "" : "table-danger table-opacity-50"
                        }
                      >
                        <td className="fw-bold small">{l.note}</td>
                        <td className="text-end font-monospace small">{l.P}</td>
                        <td className="text-end font-monospace small">
                          {l.Mx}
                        </td>
                        <td className="text-end font-monospace small">
                          {l.My}
                        </td>
                        <td className="text-center">
                          <span
                            className={`fw-bold small ${
                              result.isSafe ? "text-success" : "text-danger"
                            }`}
                          >
                            {kVal}
                          </span>
                        </td>
                        <td className="text-center">
                          {result.isSafe ? (
                            <span className="badge bg-success small">
                              <i className="bi bi-check-circle-fill"></i> OK
                            </span>
                          ) : (
                            <span className="badge bg-danger small">
                              <i className="bi bi-x-circle-fill"></i> NG
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT COLUMN: 3D Chart */}
        <div
          className="flex-grow-1 overflow-auto position-relative"
          style={{ width: "65%" }}
        >
          {/* Plotly Chart */}
          <div
            ref={chartRef}
            className="w-100"
            style={{ height: "100%" }}
          ></div>

          {/* Controls Tooltip */}
          <div
            className="position-absolute bottom-0 start-0 m-3 bg-white bg-opacity-90 px-3 py-2 rounded small text-muted"
            style={{ pointerEvents: "none", backdropFilter: "blur(4px)" }}
          >
            <i className="bi bi-mouse me-1"></i> Xoay: Chuột trái | Zoom: Cuộn |
            Pan: Phải
          </div>
        </div>
      </div>
    </div>
  );
};

// Expose to Global
window.AppOut = AppOut;
