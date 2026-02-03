/**
 * APP OUTPUT COMPONENT (RESULT DISPLAY) - REFACTORED
 * Dual-Panel Split-View Dashboard
 * Nhiệm vụ:
 * 1. LEFT PANEL: 2D Interaction Diagram (P vs. Mn) at angle θ
 * 2. RIGHT PANEL: 3D Biaxial Surface with Wireframe Grid & Meridians
 * 3. Dynamic Synchronization: Change θ to update both panels
 * 4. Calculate safety factors and display results
 */

const { useEffect, useRef, useState, useMemo } = React;

const AppOut = ({ results, input }) => {
  const chart2DRef = useRef(null);
  const chart3DRef = useRef(null);
  const [safetyFactors, setSafetyFactors] = useState({});
  const [selectedAngle, setSelectedAngle] = useState(0); // θ in degrees
  const [slice2D, setSlice2D] = useState(null); // 2D points for current angle

  // --- 1. HELPER: Extract 2D Slice at angle θ ---
  // Extract points from 3D surface where atan2(My, Mx) ≈ θ
  // Output: Array of {P, Mn} where Mn = √(Mx² + My²)
  const extract2DSlice = (surfacePoints, angleD, tolerance = 15) => {
    const angleRad = (angleD * Math.PI) / 180;
    const toleranceRad = (tolerance * Math.PI) / 180;
    const slice = [];

    for (let pt of surfacePoints) {
      const Mx = pt.x;
      const My = pt.y;
      const P = pt.z;

      // Calculate point angle in radians
      const ptAngle = Math.atan2(My, Mx);

      // Check if angle is within tolerance (considering periodicity)
      let angleDiff = ptAngle - angleRad;
      while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
      while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

      if (Math.abs(angleDiff) <= toleranceRad) {
        const Mn = Math.sqrt(Mx * Mx + My * My);
        slice.push({ P, Mn, Mx, My, angle: ptAngle });
      }
    }

    // Sort by P descending (compression to tension)
    return slice.sort((a, b) => b.P - a.P);
  };

  // --- 2. HELPER: Generate 3D Meridian Lines ---
  // Meridians = vertical lines at specific angles (15° increments = 24 lines)
  const generate3DMeridians = (surfacePoints, selectedAngle) => {
    const meridians = [];
    const angleStep = 15; // 15° increments
    const selectedAngleRad = (selectedAngle * Math.PI) / 180;

    for (let angleD = 0; angleD < 360; angleD += angleStep) {
      const angleRad = (angleD * Math.PI) / 180;
      const meridianPoints = [];

      // Extract points along this meridian
      for (let pt of surfacePoints) {
        const ptAngle = Math.atan2(pt.y, pt.x);
        let angleDiff = ptAngle - angleRad;
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

        if (Math.abs(angleDiff) <= (7.5 * Math.PI) / 180) {
          meridianPoints.push({ x: pt.x, y: pt.y, z: pt.z });
        }
      }

      // Sort by P for proper line drawing
      meridianPoints.sort((a, b) => b.z - a.z);

      if (meridianPoints.length > 0) {
        // Highlight selected meridian
        const isSelected = Math.abs(angleD - selectedAngle) < 7.5;
        meridians.push({
          x: meridianPoints.map((p) => p.x),
          y: meridianPoints.map((p) => p.y),
          z: meridianPoints.map((p) => p.z),
          type: "scatter3d",
          mode: "lines",
          line: {
            width: isSelected ? 4 : 1.5,
            color: isSelected ? "#ef4444" : "#cbd5e1",
          },
          hoverinfo: isSelected ? "skip" : "none",
          showlegend: false,
          name: `θ=${angleD}°`,
        });
      }
    }

    return meridians;
  };

  // --- 3. HELPER: Generate 3D Parallel Lines (P contours) ---
  // Parallels = horizontal circles at different P levels
  const generate3DParallels = (surfacePoints) => {
    const parallels = [];
    const P_values = [...new Set(surfacePoints.map((p) => Math.round(p.z * 10) / 10))].sort((a, b) => b - a);

    // Take every nth P level to avoid clutter (e.g., every 5th)
    const step = Math.max(1, Math.floor(P_values.length / 8));

    for (let i = 0; i < P_values.length; i += step) {
      const P_target = P_values[i];
      const parallelPoints = [];

      for (let pt of surfacePoints) {
        if (Math.abs(pt.z - P_target) < 50) {
          parallelPoints.push({ x: pt.x, y: pt.y, z: pt.z });
        }
      }

      if (parallelPoints.length > 2) {
        // Sort by angle for proper circle drawing
        parallelPoints.sort(
          (a, b) =>
            Math.atan2(a.y, a.x) - Math.atan2(b.y, b.x)
        );

        // Close the loop
        if (
          parallelPoints[0].x !== parallelPoints[parallelPoints.length - 1].x ||
          parallelPoints[0].y !== parallelPoints[parallelPoints.length - 1].y
        ) {
          parallelPoints.push(parallelPoints[0]);
        }

        parallels.push({
          x: parallelPoints.map((p) => p.x),
          y: parallelPoints.map((p) => p.y),
          z: parallelPoints.map((p) => p.z),
          type: "scatter3d",
          mode: "lines",
          line: {
            width: 0.8,
            color: "#e5e7eb",
          },
          hoverinfo: "none",
          showlegend: false,
        });
      }
    }

    return parallels;
  };

  // --- 4. HELPER: TÍNH HỆ SỐ AN TOÀN (K) ---
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

  // --- 5. EFFECT: COMPUTE SAFETY FACTORS ---
  useEffect(() => {
    if (!results || !input) {
      console.log("Effect 5: No results or input");
      return;
    }

    const { surfacePoints } = results;
    const loads = input.loads || [];

    console.log(`Effect 5: Computing safety factors for ${loads.length} loads. Surface points: ${surfacePoints?.length || 0}`);

    const newSafetyFactors = {};
    loads.forEach((l) => {
      newSafetyFactors[l.id] = calculateSafetyFactor(l, surfacePoints);
    });
    setSafetyFactors(newSafetyFactors);
  }, [results, input]);

  // --- 6. EFFECT: UPDATE 2D SLICE when angle changes ---
  useEffect(() => {
    if (!results || !results.surfacePoints) {
      console.warn("No surface points available for 2D slice extraction");
      return;
    }

    const newSlice = extract2DSlice(results.surfacePoints, selectedAngle, 15);
    console.log(`2D slice extracted: ${newSlice.length} points at angle ${selectedAngle}°`);
    setSlice2D(newSlice);
  }, [selectedAngle, results]);

  // --- 7. EFFECT: RENDER 2D CHART (LEFT PANEL) ---
  useEffect(() => {
    if (!slice2D || !chart2DRef.current || !input) {
      console.warn("2D chart rendering blocked:", { hasSlice2D: !!slice2D, hasRef: !!chart2DRef.current, hasInput: !!input });
      return;
    }

    console.log("Rendering 2D chart with", slice2D.length, "points");

    const loads = input.loads || [];

    // Filter loads near selected angle
    const selectedAngleRad = (selectedAngle * Math.PI) / 180;
    const nearbyLoads = loads.filter((load) => {
      const loadAngle = Math.atan2(load.My, load.Mx);
      let angleDiff = loadAngle - selectedAngleRad;
      while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
      while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
      return Math.abs(angleDiff) <= (15 * Math.PI) / 180;
    });

    // 2D Slice Trace (P vs. Mn)
    const sliceTrace = {
      x: slice2D.map((p) => p.Mn),
      y: slice2D.map((p) => p.P),
      type: "scatter",
      mode: "lines",
      line: { color: "#3b82f6", width: 2.5 },
      fill: "tozeroy",
      fillcolor: "rgba(59, 130, 246, 0.1)",
      name: "Vùng chịu lực",
      hovertemplate: "<b>Mn: %{x:.1f} kNm</b><br>P: %{y:.1f} kN<extra></extra>",
    };

    // Load points trace
    const loadMn = nearbyLoads.map((l) => Math.sqrt(l.Mx * l.Mx + l.My * l.My));
    const loadP = nearbyLoads.map((l) => l.P);
    const loadSafe = nearbyLoads.map(
      (l) => safetyFactors[l.id]?.isSafe ?? false
    );

    const loadTrace = {
      x: loadMn,
      y: loadP,
      type: "scatter",
      mode: "markers",
      marker: {
        size: 8,
        color: loadSafe.map((s) => (s ? "#22c55e" : "#ef4444")),
        symbol: "circle",
        line: { color: "white", width: 1.5 },
      },
      text: nearbyLoads.map((l) => l.note),
      hovertemplate: "<b>%{text}</b><br>Mn: %{x:.1f} kNm<br>P: %{y:.1f} kN<extra></extra>",
      name: "Điểm tải",
    };

    const layout2D = {
      title: {
        text: `2D Interaction Diagram (θ = ${selectedAngle}°)`,
        font: { size: 12 },
      },
      xaxis: {
        title: "Mn (kNm)",
        gridcolor: "#e5e7eb",
        zeroline: true,
      },
      yaxis: {
        title: "P (kN)",
        gridcolor: "#e5e7eb",
        zeroline: true,
      },
      margin: { l: 50, r: 30, b: 40, t: 35 },
      hovermode: "closest",
      plot_bgcolor: "rgba(248, 250, 252, 0.5)",
      paper_bgcolor: "#fff",
    };

    const config = {
      responsive: true,
      displayModeBar: false,
    };

    Plotly.newPlot(chart2DRef.current, [sliceTrace, loadTrace], layout2D, config);
  }, [slice2D, input, safetyFactors, selectedAngle]);

  // --- 8. EFFECT: RENDER 3D CHART (RIGHT PANEL) with Wireframe Grid ---
  useEffect(() => {
    if (!results || !chart3DRef.current || !input) return;

    const { surfacePoints } = results;
    const loads = input.loads || [];

    // 1. Main Mesh Surface (Mesh3D)
    const meshTrace = {
      type: "mesh3d",
      x: surfacePoints.map((p) => p.x),
      y: surfacePoints.map((p) => p.y),
      z: surfacePoints.map((p) => p.z),
      alphahull: 0,
      opacity: 0.25,
      color: "#3b82f6",
      hoverinfo: "none",
      showlegend: false,
      name: "Vùng chịu lực",
    };

    // 2. Wireframe Grid: Meridians (vertical lines)
    const meridians = generate3DMeridians(surfacePoints, selectedAngle);

    // 3. Wireframe Grid: Parallels (horizontal circles)
    const parallels = generate3DParallels(surfacePoints);

    // 4. Load Points Trace
    const loadTrace = {
      type: "scatter3d",
      mode: "markers",
      x: loads.map((l) => l.Mx),
      y: loads.map((l) => l.My),
      z: loads.map((l) => l.P),
      marker: {
        size: 5,
        color: loads.map((l) =>
          safetyFactors[l.id]?.isSafe ? "#22c55e" : "#ef4444"
        ),
        symbol: "circle",
        line: { color: "white", width: 1 },
      },
      text: loads.map((l) => l.note),
      hovertemplate:
        "<b>%{text}</b><br>Mx: %{x:.1f}<br>My: %{y:.1f}<br>P: %{z:.1f}<extra></extra>",
      name: "Điểm tải",
    };

    // 5. Load Radii Traces (from origin to each load)
    const loadLines = loads.map((l) => ({
      type: "scatter3d",
      mode: "lines",
      x: [0, l.Mx],
      y: [0, l.My],
      z: [0, l.P],
      line: {
        width: 3,
        color: safetyFactors[l.id]?.isSafe ? "#22c55e" : "#ef4444",
      },
      hoverinfo: "none",
      showlegend: false,
    }));

    const layout3D = {
      title: {
        text: "3D Biaxial Interaction Surface",
        font: { size: 12 },
      },
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
          eye: { x: 1.5, y: 1.5, z: 1.3 },
          up: { x: 0, y: 0, z: 1 },
        },
        aspectmode: "cube",
      },
      margin: { l: 0, r: 0, b: 0, t: 30 },
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      showlegend: false,
      hovermode: "closest",
    };

    const config = {
      responsive: true,
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ["lasso2d", "select2d"],
    };

    Plotly.newPlot(
      chart3DRef.current,
      [meshTrace, ...meridians, ...parallels, loadTrace, ...loadLines],
      layout3D,
      config
    );
  }, [results, input, safetyFactors, selectedAngle]);

  // --- RENDER TRẠNG THÁI CHỜ ---
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
          <h3 className="fs-5 fw-medium text-muted">Chưa có dữ liệu tính toán</h3>
          <p className="small text-muted mt-2">
            Vui lòng nhập thông số và nhấn "Tính toán"
          </p>
        </div>
      </div>
    );
  }

  // --- RENDER SPLIT-VIEW DASHBOARD ---
  return (
    <div className="d-flex flex-column h-100 bg-white">
      {/* Header */}
      <div
        className="px-4 py-3 border-bottom d-flex justify-content-between align-items-center bg-white sticky-top"
        style={{ zIndex: 20 }}
      >
        <div className="d-flex align-items-center gap-3">
          <h4 className="mb-0 small fw-bold text-dark text-uppercase">
            <i className="bi bi-check-circle me-2 text-success"></i>Kết quả
            Kiểm Tra
          </h4>
        </div>

        {/* Angle Control */}
        <div className="d-flex align-items-center gap-2">
          <label className="small fw-bold text-dark mb-0">
            Biểu đồ tương tác tại
          </label>
          <input
            type="number"
            className="form-control form-control-sm"
            min="0"
            max="360"
            step="5"
            value={selectedAngle}
            onChange={(e) =>
              setSelectedAngle(Math.max(0, Math.min(360, parseFloat(e.target.value) || 0)))
            }
            style={{ width: "70px" }}
          />
          <span className="small text-muted">°</span>
        </div>

        <div className="d-flex gap-2">
          <span className="d-flex align-items-center small fw-bold px-2 py-1 bg-success bg-opacity-25 text-success rounded border border-success border-opacity-25">
            <span
              className="badge bg-success rounded-circle me-1"
              style={{ width: "6px", height: "6px" }}
            ></span>
            Đạt ({Object.values(safetyFactors).filter((s) => s.isSafe).length})
          </span>
          <span className="d-flex align-items-center small fw-bold px-2 py-1 bg-danger bg-opacity-25 text-danger rounded border border-danger border-opacity-25">
            <span
              className="badge bg-danger rounded-circle me-1"
              style={{ width: "6px", height: "6px" }}
            ></span>
            Không đạt (
            {Object.values(safetyFactors).filter((s) => !s.isSafe).length})
          </span>
        </div>
      </div>

      {/* Main Content: 2D and 3D Side by Side (Equal Height) */}
      <div className="flex-grow-1 d-flex" style={{ minHeight: 0, flex: 1 }}>
        {/* LEFT COLUMN: 2D Interaction Diagram (50%) */}
        <div
          className="border-end"
          style={{
            flex: "0 0 50%",
            minHeight: 0,
            borderColor: "#dee2e6",
            backgroundColor: "#fafbfc",
            position: "relative"
          }}
        >
          <div
            ref={chart2DRef}
            className="w-100 h-100"
            style={{ height: "100%" }}
          ></div>
        </div>

        {/* RIGHT COLUMN: 3D Biaxial Surface (50%) */}
        <div
          className="position-relative flex-grow-1"
          style={{ flex: "0 0 50%", minHeight: 0 }}
        >
          <div
            ref={chart3DRef}
            className="w-100 h-100"
            style={{ height: "100%" }}
          ></div>

          {/* Controls Tooltip */}
          <div
            className="position-absolute bottom-0 start-0 m-3 bg-white bg-opacity-90 px-3 py-2 rounded small text-muted"
            style={{ pointerEvents: "none", backdropFilter: "blur(4px)" }}
          >
            <i className="bi bi-mouse me-1"></i> Xoay: Trái | Zoom: Cuộn | Pan: Phải
          </div>
        </div>
      </div>

      {/* BOTTOM: Results Table (Full Width) */}
      <div
        className="border-top"
        style={{
          maxHeight: "35%",
          overflowY: "auto",
          borderColor: "#dee2e6",
          backgroundColor: "#fff"
        }}
      >
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
              <th className="fw-bold text-center" title="Hệ số an toàn">
                K
              </th>
              <th className="fw-bold text-center">Kết quả</th>
            </tr>
          </thead>
          <tbody className="small">
            {input &&
              input.loads &&
              input.loads.map((l, idx) => {
                const result = safetyFactors[l.id] || { k: 0, isSafe: false };
                const kVal = result.k === 999 ? "∞" : result.k.toFixed(2);

                return (
                  <tr
                    key={idx}
                    className={result.isSafe ? "" : "table-danger table-opacity-50"}
                  >
                    <td className="fw-bold small">{l.note}</td>
                    <td className="text-end font-monospace small">{l.P}</td>
                    <td className="text-end font-monospace small">{l.Mx}</td>
                    <td className="text-end font-monospace small">{l.My}</td>
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
  );
};

// Expose to Global
window.AppOut = AppOut;
