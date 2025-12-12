/**
 * APP INPUT & INTERACTION MODULE (app-inp.js)
 * Responsibility: Handle ALL user interface interactions
 * - Read values from HTML inputs
 * - Handle button/form events
 * - Draw section illustration (SVG)
 * - Pass validated data to app-cal.js for calculation
 * - Trigger display updates via app-out.js
 */

const { useState, useEffect, useMemo, useRef } = React;

const AppInp = ({
  onCalculate,
  isComputing,
  sidebarOnly = false,
  formOnly = false,
}) => {
  // --- STATE MANAGEMENT ---
  const [standard, setStandard] = useState("TCVN");
  const [colType, setColType] = useState("rect");

  // Geometry
  const [geo, setGeo] = useState({
    B: 300,
    H: 400,
    D: 400,
    cover: 30,
  });

  // Materials
  const [mat, setMat] = useState({
    fck: 14.5,
    fyk: 280,
  });

  // Reinforcement
  const [steel, setSteel] = useState({
    Nb: 8,
    d_bar: 20,
    As_bar: 314,
  });

  // Loads
  const [loads, setLoads] = useState([
    { id: 1, P: 1000, Mx: 50, My: 20, note: "TH1" },
  ]);

  // SVG Preview Reference
  const svgRef = useRef(null);

  // --- EFFECTS ---

  // Auto-calculate bar area
  useEffect(() => {
    const area = Math.PI * Math.pow(steel.d_bar / 2, 2);
    setSteel((prev) => ({ ...prev, As_bar: Math.round(area * 100) / 100 }));
  }, [steel.d_bar]);

  // Redraw section when geometry changes
  useEffect(() => {
    if (svgRef.current) {
      drawSectionIllustration();
    }
  }, [geo, colType, steel]);

  // --- DRAWING FUNCTION: Section Illustration (SVG) ---
  const drawSectionIllustration = () => {
    if (!svgRef.current) return;

    const container = svgRef.current;
    container.innerHTML = ""; // Clear previous

    const viewBoxSize = 300;
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", `0 0 ${viewBoxSize} ${viewBoxSize}`);
    svg.setAttribute("style", "width: 100%; height: 100%;");

    if (colType === "rect") {
      // Draw rectangular section
      const padding = 30;
      const w = geo.B || 300;
      const h = geo.H || 400;
      const scale = (viewBoxSize - 2 * padding) / Math.max(w, h);

      const x = (viewBoxSize - w * scale) / 2;
      const y = (viewBoxSize - h * scale) / 2;
      const width = w * scale;
      const height = h * scale;

      // Concrete outline
      const rect = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "rect"
      );
      rect.setAttribute("x", x);
      rect.setAttribute("y", y);
      rect.setAttribute("width", width);
      rect.setAttribute("height", height);
      rect.setAttribute("fill", "#e8f4f8");
      rect.setAttribute("stroke", "#0073e6");
      rect.setAttribute("stroke-width", "2");
      svg.appendChild(rect);

      // Draw reinforcement bars
      const Nb = steel.Nb || 8;
      const d_bar = steel.d_bar || 20;
      const barRadius = (d_bar * scale) / (2 * w);

      // Generate bar positions (perimeter layout)
      const barPositions = generateBarPositions(Nb, w, h, geo.cover);

      barPositions.forEach((pos) => {
        const bx = x + (pos.bx * scale) / (w / 2 + geo.cover);
        const by = y + (pos.by * scale) / (h / 2 + geo.cover);

        const circle = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle"
        );
        circle.setAttribute("cx", bx);
        circle.setAttribute("cy", by);
        circle.setAttribute("r", barRadius);
        circle.setAttribute("fill", "none");
        circle.setAttribute("stroke", "#d32f2f");
        circle.setAttribute("stroke-width", "1.5");
        svg.appendChild(circle);

        // Small cross in center
        const lineH = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "line"
        );
        lineH.setAttribute("x1", bx - barRadius * 0.5);
        lineH.setAttribute("y1", by);
        lineH.setAttribute("x2", bx + barRadius * 0.5);
        lineH.setAttribute("y2", by);
        lineH.setAttribute("stroke", "#d32f2f");
        lineH.setAttribute("stroke-width", "1");
        svg.appendChild(lineH);
      });

      // Labels
      const labelB = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      labelB.setAttribute("x", viewBoxSize / 2);
      labelB.setAttribute("y", y + height + 25);
      labelB.setAttribute("text-anchor", "middle");
      labelB.setAttribute("font-size", "12");
      labelB.setAttribute("fill", "#333");
      labelB.textContent = `B = ${geo.B} mm`;
      svg.appendChild(labelB);

      const labelH = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      labelH.setAttribute("x", x - 20);
      labelH.setAttribute("y", viewBoxSize / 2);
      labelH.setAttribute("text-anchor", "end");
      labelH.setAttribute("font-size", "12");
      labelH.setAttribute("fill", "#333");
      labelH.setAttribute(
        "transform",
        `rotate(-90 ${x - 20} ${viewBoxSize / 2})`
      );
      labelH.textContent = `H = ${geo.H} mm`;
      svg.appendChild(labelH);
    } else if (colType === "circ") {
      // Draw circular section
      const padding = 30;
      const d = geo.D || 400;
      const scale = (viewBoxSize - 2 * padding) / d;

      const cx = viewBoxSize / 2;
      const cy = viewBoxSize / 2;
      const radius = (d * scale) / 2;

      // Concrete circle
      const circle = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "circle"
      );
      circle.setAttribute("cx", cx);
      circle.setAttribute("cy", cy);
      circle.setAttribute("r", radius);
      circle.setAttribute("fill", "#e8f4f8");
      circle.setAttribute("stroke", "#0073e6");
      circle.setAttribute("stroke-width", "2");
      svg.appendChild(circle);

      // Draw reinforcement bars arranged in circle
      const Nb = steel.Nb || 8;
      const d_bar = steel.d_bar || 20;
      const barRadius = (d_bar * scale) / (2 * d);
      const barsRadius = radius - (geo.cover * scale) / d;

      for (let i = 0; i < Nb; i++) {
        const angle = (2 * Math.PI * i) / Nb;
        const bx = cx + barsRadius * Math.cos(angle);
        const by = cy + barsRadius * Math.sin(angle);

        const barCircle = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle"
        );
        barCircle.setAttribute("cx", bx);
        barCircle.setAttribute("cy", by);
        barCircle.setAttribute("r", barRadius);
        barCircle.setAttribute("fill", "none");
        barCircle.setAttribute("stroke", "#d32f2f");
        barCircle.setAttribute("stroke-width", "1.5");
        svg.appendChild(barCircle);
      }

      // Label
      const labelD = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "text"
      );
      labelD.setAttribute("x", viewBoxSize / 2);
      labelD.setAttribute("y", cy + radius + 25);
      labelD.setAttribute("text-anchor", "middle");
      labelD.setAttribute("font-size", "12");
      labelD.setAttribute("fill", "#333");
      labelD.textContent = `D = ${geo.D} mm`;
      svg.appendChild(labelD);
    }

    container.appendChild(svg);
  };

  // Helper: Generate bar positions for rectangular section
  const generateBarPositions = (Nb, B, H, cover) => {
    if (Nb <= 0) return [];
    if (Nb === 4) {
      // 4 corner bars
      const x = B / 2 - cover;
      const y = H / 2 - cover;
      return [
        { bx: -x, by: -y },
        { bx: x, by: -y },
        { bx: x, by: y },
        { bx: -x, by: y },
      ];
    }

    // Generic perimeter distribution
    const positions = [];
    const perimeter = 2 * (B + H);
    const spacing = perimeter / Nb;
    let dist = 0;

    for (let i = 0; i < Nb; i++) {
      let bx, by;
      let currentDist = dist % perimeter;

      if (currentDist < B / 2) {
        // Bottom edge
        bx = -B / 2 + currentDist;
        by = -H / 2 + cover;
      } else if (currentDist < B / 2 + H) {
        // Right edge
        bx = B / 2 - cover;
        by = -H / 2 + (currentDist - B / 2);
      } else if (currentDist < B + H + B / 2) {
        // Top edge
        bx = B / 2 - (currentDist - B / 2 - H);
        by = H / 2 - cover;
      } else {
        // Left edge
        bx = -B / 2 + cover;
        by = H / 2 - (currentDist - B - H - B / 2);
      }

      positions.push({ bx, by });
      dist += spacing;
    }

    return positions;
  };

  // --- EVENT HANDLERS ---

  const handleGeoChange = (field, value) => {
    setGeo((prev) => ({ ...prev, [field]: parseFloat(value) }));
  };

  const handleMatChange = (field, value) => {
    setMat((prev) => ({ ...prev, [field]: parseFloat(value) }));
  };

  const handleSteelChange = (field, value) => {
    setSteel((prev) => ({ ...prev, [field]: parseFloat(value) }));
  };

  const addLoad = () => {
    const newId = Math.max(...loads.map((l) => l.id), 0) + 1;
    setLoads([...loads, { id: newId, P: 0, Mx: 0, My: 0, note: `TH${newId}` }]);
  };

  const removeLoad = (id) => {
    if (loads.length > 1) {
      setLoads(loads.filter((l) => l.id !== id));
    }
  };

  const updateLoad = (id, field, value) => {
    setLoads(
      loads.map((l) =>
        l.id === id ? { ...l, [field]: parseFloat(value) || 0 } : l
      )
    );
  };

  const handleRunAnalysis = () => {
    // Validate inputs
    if (!geo.B || !geo.H || !mat.fck || !mat.fyk) {
      alert("Vui lòng nhập đầy đủ thông số tiết diện và vật liệu");
      return;
    }

    if (loads.some((l) => isNaN(l.P) || isNaN(l.Mx) || isNaN(l.My))) {
      alert("Vui lòng nhập đầy đủ tải trọng");
      return;
    }

    // Prepare data object
    const inputData = {
      standard,
      colType,
      geo,
      mat,
      steel,
      loads,
    };

    // Call parent callback
    onCalculate(inputData);
  };

  // --- RENDER: SIDEBAR ONLY ---
  if (sidebarOnly) {
    return (
      <div className="p-3">
        <h5 className="mb-3">
          <i className="bi bi-gear"></i> Dữ liệu & Tác vụ
        </h5>

        <div className="btn-group w-100 mb-3" role="group">
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            title="Tạo mới"
            onClick={() => window.location.reload()}
          >
            <i className="bi bi-file-earmark-plus"></i> New
          </button>
          <button
            type="button"
            className="btn btn-outline-success btn-sm"
            title="Mở file"
          >
            <i className="bi bi-folder-open"></i> Open
          </button>
          <button
            type="button"
            className="btn btn-outline-warning btn-sm"
            title="Lưu file"
          >
            <i className="bi bi-save"></i> Save
          </button>
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold small text-muted">
            TIÊU CHUẨN TÍNH TOÁN
          </label>
          <select
            className="form-select form-select-sm"
            value={standard}
            onChange={(e) => setStandard(e.target.value)}
          >
            <option value="TCVN">TCVN 5574:2018</option>
            <option value="EC2">EC2:2004/2015</option>
            <option value="ACI">ACI 318-19</option>
          </select>
        </div>

        <button
          className="btn btn-lg btn-primary w-100 mb-3 shadow-sm"
          onClick={handleRunAnalysis}
          disabled={isComputing}
        >
          <i className="bi bi-lightning-charge-fill"></i> TÍNH TOÁN
        </button>

        <div className="card border-0 bg-light">
          <div className="card-body p-2">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <small className="fw-bold text-muted">MINH HỌA TIẾT DIỆN</small>
              <span className="badge bg-secondary">
                {colType === "rect" ? "Rect" : "Circ"}
              </span>
            </div>
            <div
              ref={svgRef}
              style={{
                height: "200px",
                background: "#fff",
                border: "1px dashed #ced4da",
                borderRadius: "4px",
              }}
            ></div>
            <div className="text-center mt-2">
              <small className="text-muted">
                {steel.Nb} cốt ∅{steel.d_bar} mm (As = {steel.As_bar} mm²)
              </small>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- RENDER: FORM ONLY ---
  if (formOnly) {
    return (
      <div className="p-3">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4>Cột Chịu Nén Lệch Tâm (ShortCol 3D)</h4>
          <div className="btn-group btn-group-sm" role="group">
            <input
              type="radio"
              className="btn-check"
              name="colType"
              id="type-rect"
              value="rect"
              checked={colType === "rect"}
              onChange={(e) => setColType(e.target.value)}
            />
            <label className="btn btn-outline-primary" htmlFor="type-rect">
              <i className="bi bi-square"></i> Chữ nhật
            </label>

            <input
              type="radio"
              className="btn-check"
              name="colType"
              id="type-circ"
              value="circ"
              checked={colType === "circ"}
              onChange={(e) => setColType(e.target.value)}
            />
            <label className="btn btn-outline-primary" htmlFor="type-circ">
              <i className="bi bi-circle"></i> Tròn
            </label>
          </div>
        </div>

        {/* Tabs */}
        <ul className="nav nav-tabs" role="tablist">
          <li className="nav-item">
            <button
              className="nav-link active"
              data-bs-toggle="tab"
              data-bs-target="#tab-geometry"
            >
              1. Tiết diện & Vật liệu
            </button>
          </li>
          <li className="nav-item">
            <button
              className="nav-link"
              data-bs-toggle="tab"
              data-bs-target="#tab-reinforcement"
            >
              2. Cốt thép
            </button>
          </li>
          <li className="nav-item">
            <button
              className="nav-link"
              data-bs-toggle="tab"
              data-bs-target="#tab-loads"
            >
              3. Tải trọng
            </button>
          </li>
        </ul>

        <div className="tab-content p-3 border border-top-0">
          {/* Tab 1: Geometry & Material */}
          <div className="tab-pane fade show active" id="tab-geometry">
            <div className="row g-3">
              <div className="col-md-6">
                <h6 className="text-secondary border-bottom pb-2">
                  <i className="bi bi-arrows-fullscreen"></i> Kích thước (mm)
                </h6>

                {colType === "rect" ? (
                  <>
                    <div className="mb-2">
                      <label className="form-label small">Cạnh B:</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={geo.B}
                        onChange={(e) => handleGeoChange("B", e.target.value)}
                        step="50"
                      />
                    </div>
                    <div className="mb-2">
                      <label className="form-label small">Cạnh H:</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={geo.H}
                        onChange={(e) => handleGeoChange("H", e.target.value)}
                        step="50"
                      />
                    </div>
                  </>
                ) : (
                  <div className="mb-2">
                    <label className="form-label small">Đường kính D:</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={geo.D}
                      onChange={(e) => handleGeoChange("D", e.target.value)}
                      step="50"
                    />
                  </div>
                )}

                <div className="mb-2">
                  <label className="form-label small">Cover (mm):</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={geo.cover}
                    onChange={(e) => handleGeoChange("cover", e.target.value)}
                    step="5"
                  />
                </div>
              </div>

              <div className="col-md-6">
                <h6 className="text-secondary border-bottom pb-2">
                  <i className="bi bi-bricks"></i> Vật liệu (MPa)
                </h6>
                <div className="mb-2">
                  <label className="form-label small">
                    Cường độ Bê tông (Rb):
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={mat.fck}
                    onChange={(e) => handleMatChange("fck", e.target.value)}
                    step="0.5"
                  />
                </div>
                <div className="mb-2">
                  <label className="form-label small">
                    Cường độ Thép (Rs):
                  </label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={mat.fyk}
                    onChange={(e) => handleMatChange("fyk", e.target.value)}
                    step="10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tab 2: Reinforcement */}
          <div className="tab-pane fade" id="tab-reinforcement">
            <h6 className="text-secondary border-bottom pb-2">
              <i className="bi bi-link"></i> Cốt thép dọc
            </h6>
            <div className="row g-2 mb-3">
              <div className="col-md-4">
                <label className="form-label small">Số thanh thép (Nb):</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={steel.Nb}
                  onChange={(e) => handleSteelChange("Nb", e.target.value)}
                  min="4"
                  max="32"
                  step="1"
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small">Đường kính (mm):</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={steel.d_bar}
                  onChange={(e) => handleSteelChange("d_bar", e.target.value)}
                  step="2"
                />
              </div>
              <div className="col-md-4">
                <label className="form-label small">As (mm²):</label>
                <input
                  type="number"
                  className="form-control form-control-sm"
                  value={steel.As_bar}
                  disabled
                />
              </div>
            </div>
          </div>

          {/* Tab 3: Loads */}
          <div className="tab-pane fade" id="tab-loads">
            <h6 className="text-secondary border-bottom pb-2 mb-3">
              <i className="bi bi-arrow-down-up"></i> Tổ hợp tải trọng
            </h6>

            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {loads.map((load, idx) => (
                <div key={load.id} className="card mb-2 shadow-sm">
                  <div className="card-body p-2">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <strong className="small">TH {load.id}:</strong>
                      {loads.length > 1 && (
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => removeLoad(load.id)}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      )}
                    </div>
                    <div className="row g-1">
                      <div className="col-4">
                        <small>P (kN):</small>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={load.P}
                          onChange={(e) =>
                            updateLoad(load.id, "P", e.target.value)
                          }
                        />
                      </div>
                      <div className="col-4">
                        <small>Mx (kNm):</small>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={load.Mx}
                          onChange={(e) =>
                            updateLoad(load.id, "Mx", e.target.value)
                          }
                        />
                      </div>
                      <div className="col-4">
                        <small>My (kNm):</small>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          value={load.My}
                          onChange={(e) =>
                            updateLoad(load.id, "My", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              className="btn btn-outline-success btn-sm w-100 mt-2"
              onClick={addLoad}
            >
              <i className="bi bi-plus-circle"></i> Thêm tổ hợp
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Default: return null (handled by parent layout)
  return null;
};

// Expose to global scope
window.AppInp = AppInp;
