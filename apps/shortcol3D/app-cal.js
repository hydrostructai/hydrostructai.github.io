/**
 * APP CALCULATION COMPONENT (INPUT UI)
 * Nhiệm vụ: Thu thập dữ liệu, validate và gửi sang engine tính toán.
 */

const { useState, useEffect, useMemo } = React;

const AppCal = ({
  onCalculate,
  isComputing,
  sidebarOnly = false,
  formOnly = false,
}) => {
  // --- 1. STATE MANAGEMENT ---

  // Tiêu chuẩn thiết kế
  const [standard, setStandard] = useState("TCVN"); // TCVN | EC2 | ACI

  // Hình học tiết diện
  const [colType, setColType] = useState("rect"); // rect | circ
  const [geo, setGeo] = useState({
    B: 300,
    H: 400,
    D: 400,
    cover: 30, // Lớp bảo vệ đến trọng tâm cốt thép
  });

  // Vật liệu
  const [mat, setMat] = useState({
    fck: 14.5, // Rb (MPa) hoặc f'c
    fyk: 280, // Rs (MPa) hoặc fy
  });

  // Cốt thép
  const [steel, setSteel] = useState({
    Nb: 8, // Tổng số thanh
    d_bar: 20, // Đường kính (mm)
    As_bar: 314, // Diện tích 1 thanh (mm2)
  });

  // Tải trọng (Danh sách các tổ hợp)
  const [loads, setLoads] = useState([
    { id: 1, P: 1000, Mx: 50, My: 20, note: "TH1: Tổ hợp tải trọng" },
  ]);

  // --- 2. EFFECT & LOGIC ---

  // Tự động tính diện tích cốt thép khi đường kính thay đổi
  useEffect(() => {
    const area = (Math.PI * Math.pow(steel.d_bar, 2)) / 4;
    setSteel((prev) => ({ ...prev, As_bar: parseFloat(area.toFixed(1)) }));
  }, [steel.d_bar]);

  // Hàm tạo tọa độ cốt thép (Logic sinh tự động)
// Hàm tạo tọa độ cốt thép (Logic rải đều theo chu vi - Perimeter Walking)
  const generateBarLayout = () => {
    const bars = [];
    const As = Number(steel.As_bar);
    const N = Math.max(4, Number(steel.Nb)); // Tối thiểu 4 thanh

    if (colType === "rect") {
      // 1. Xác định kích thước lồng thép (Core dimensions)
      // W, H là kích thước từ tâm cốt thép bên này sang tâm cốt thép bên kia
      const W = Number(geo.B) - 2 * Number(geo.cover);
      const H = Number(geo.H) - 2 * Number(geo.cover);
      
      // 2. Tính chu vi đường tim cốt thép
      const perimeter = 2 * (W + H);
      
      // 3. Khoảng cách giữa các thanh nếu rải đều tuyệt đối
      const spacing = perimeter / N;

      // 4. Thuật toán "Đi bộ dọc chu vi"
      // Bắt đầu từ góc dưới trái (-W/2, -H/2) và đi ngược chiều kim đồng hồ
      // Thứ tự đi: Đáy (Trái->Phải) -> Phải (Dưới->Trên) -> Đỉnh (Phải->Trái) -> Trái (Trên->Dưới)
      
      for (let i = 0; i < N; i++) {
        // Vị trí của thanh thứ i trên chu vi đã duỗi thẳng (từ 0 đến perimeter)
        let currentDist = i * spacing; 
        
        let x = 0, y = 0;

        // Xác định thanh nằm trên cạnh nào
        if (currentDist <= W) {
          // --- Cạnh Đáy (Bottom) ---
          x = -W/2 + currentDist;
          y = -H/2;
        } else if (currentDist <= W + H) {
          // --- Cạnh Phải (Right) ---
          x = W/2;
          y = -H/2 + (currentDist - W);
        } else if (currentDist <= 2*W + H) {
          // --- Cạnh Đỉnh (Top) --- Đi ngược từ Phải sang Trái
          x = W/2 - (currentDist - (W + H));
          y = H/2;
        } else {
          // --- Cạnh Trái (Left) --- Đi ngược từ Trên xuống Dưới
          x = -W/2;
          y = H/2 - (currentDist - (2*W + H));
        }
        
        // 5. Snap vào góc (Khử sai số số học)
        // Nếu tọa độ rất gần góc, ép nó vào đúng góc để hình vẽ đẹp hơn
        const tolerance = 0.1;
        if (Math.abs(x - -W/2) < tolerance) x = -W/2;
        if (Math.abs(x - W/2) < tolerance) x = W/2;
        if (Math.abs(y - -H/2) < tolerance) y = -H/2;
        if (Math.abs(y - H/2) < tolerance) y = H/2;

        bars.push({ x, y, As });
      }

    } else {
      // Logic cho cột Tròn: Bố trí đều (Polar Array)
      const R_bars = Number(geo.D) / 2 - Number(geo.cover);
      for (let i = 0; i < N; i++) {
        const theta = (i * 2 * Math.PI) / N;
        // Bắt đầu từ góc 0 (bên phải) và xoay đều
        bars.push({
          x: R_bars * Math.cos(theta),
          y: R_bars * Math.sin(theta),
          As: As,
        });
      }
    }
    return bars;
  };

  // Handler thêm/xóa tải trọng
  const addLoad = () => {
    const newId =
      loads.length > 0 ? Math.max(...loads.map((l) => l.id)) + 1 : 1;
    setLoads([...loads, { id: newId, P: 0, Mx: 0, My: 0, note: `TH${newId}` }]);
  };

  const removeLoad = (id) => {
    if (loads.length > 1) {
      setLoads(loads.filter((l) => l.id !== id));
    }
  };

  const updateLoad = (id, field, value) => {
    setLoads(loads.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  // --- File Operations Handlers ---
  const handleNewFile = () => {
    if (
      window.confirm("Tạo mới sẽ xóa tất cả dữ liệu hiện tại. Bạn chắc chứ?")
    ) {
      window.location.reload();
    }
  };

  const handleOpenFile = () => {
    document.getElementById("file-input-hidden")?.click();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result);
        // Restore state
        if (data.standard) setStandard(data.standard);
        if (data.type) setColType(data.type);
        if (data.B || data.H)
          setGeo({
            B: data.B || 300,
            H: data.H || 400,
            D: data.D || 400,
            cover: data.cover || 30,
          });
        if (data.fck || data.fyk)
          setMat({ fck: data.fck || 14.5, fyk: data.fyk || 280 });
        if (data.Nb || data.d_bar)
          setSteel({
            Nb: data.Nb || 4,
            d_bar: data.d_bar || 20,
            As_bar: data.As_bar || 314,
          });
        if (data.loads) setLoads(data.loads);
        alert("Tải file thành công!");
      } catch (error) {
        alert("Lỗi: File không hợp lệ!");
      }
    };
    reader.readAsText(file);
  };

  const handleSaveFile = () => {
    const data = {
      standard,
      colType,
      B: Number(geo.B),
      H: Number(geo.H),
      D: Number(geo.D),
      cover: Number(geo.cover),
      fck: Number(mat.fck),
      fyk: Number(mat.fyk),
      Nb: Number(steel.Nb),
      d_bar: Number(steel.d_bar),
      As_bar: Number(steel.As_bar),
      loads: loads.map((l) => ({
        id: l.id,
        P: Number(l.P),
        Mx: Number(l.Mx),
        My: Number(l.My),
        note: l.note,
      })),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `shortcol3d-${new Date().getTime()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // --- 3. SUBMIT HANDLER ---

  const handleRunAnalysis = () => {
    // 1. Validate sơ bộ
    if (geo.B <= 0 || geo.H <= 0 || geo.D <= 0) {
      alert("Kích thước tiết diện không hợp lệ!");
      return;
    }

    // 2. Tạo payload chuẩn hóa số học
    const payload = {
      standard: standard,
      type: colType,
      B: Number(geo.B),
      H: Number(geo.H),
      D: Number(geo.D),
      cover: Number(geo.cover),
      fck: Number(mat.fck),
      fyk: Number(mat.fyk),
      // Sinh tọa độ thép tại thời điểm tính toán
      bars: generateBarLayout(),
      // Chuẩn hóa mảng tải trọng
      loads: loads.map((l) => ({
        id: l.id,
        note: l.note,
        P: Number(l.P), // Ép kiểu số
        Mx: Number(l.Mx),
        My: Number(l.My),
      })),
    };

    // 3. Gửi sang Main App
    onCalculate(payload);
  };

  // --- 4. RENDER HELPERS ---

  // Label động theo tiêu chuẩn
  const lbl = useMemo(() => {
    if (standard === "ACI")
      return { c: "f'c (MPa)", s: "fy (MPa)", t: "Giá trị đặc trưng" };
    if (standard === "EC2")
      return { c: "fcd (MPa)", s: "fyd (MPa)", t: "Giá trị tính toán" };
    return { c: "Rb (MPa)", s: "Rs (MPa)", t: "Giá trị tính toán" };
  }, [standard]);

  // --- 5. UI RENDER ---

  // SIDEBAR ONLY MODE: Show section preview and file/standard controls
  if (sidebarOnly) {
    return (
      <div
        className="d-flex flex-column h-100"
        style={{ backgroundColor: "#f8f9fa" }}
      >
        {/* Header */}
        <div
          className="p-3 bg-white border-bottom sticky-top"
          style={{ zIndex: 10 }}
        >
          <h4 className="small fw-bold text-muted text-uppercase mb-3">
            <i className="bi bi-sliders me-1"></i> Dữ liệu & Tác vụ
          </h4>

          {/* File Operations */}
          <div className="btn-group w-100 mb-3" role="group">
            <button
              type="button"
              className="btn btn-outline-primary btn-sm"
              title="Tạo mới"
              onClick={handleNewFile}
            >
              <i className="bi bi-file-earmark-plus"></i> New
            </button>
            <button
              type="button"
              className="btn btn-outline-success btn-sm"
              title="Mở file"
              onClick={handleOpenFile}
            >
              <i className="bi bi-folder-open"></i> Open
            </button>
            <button
              type="button"
              className="btn btn-outline-warning btn-sm"
              title="Lưu file"
              onClick={handleSaveFile}
            >
              <i className="bi bi-save"></i> Save
            </button>
          </div>
          <input
            type="file"
            id="file-input-hidden"
            accept=".json"
            style={{ display: "none" }}
            onChange={handleFileSelect}
          />

          {/* Standard Selector */}
          <div className="mb-3">
            <label className="form-label small fw-bold">
              TIÊU CHUẨN TÍNH TOÁN
            </label>
            <select
              value={standard}
              onChange={(e) => setStandard(e.target.value)}
              className="form-select form-select-sm"
            >
              <option value="TCVN">TCVN 5574:2018 (Việt Nam)</option>
              <option value="EC2">EC2:2004/2015 (Châu Âu)</option>
              <option value="ACI">ACI 318-19 (Mỹ)</option>
            </select>
            <small className="form-text text-muted d-block mt-1">
              <i className="bi bi-info-circle"></i> Chọn chuẩn thiết kế để tính
              toán biểu đồ tương tác
            </small>
          </div>
        </div>

        {/* Section Preview */}
        <div className="p-3">
          <div className="card border-0 bg-light">
            <div className="card-body p-2">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <small className="fw-bold text-muted">MINH HỌA TIẾT DIỆN</small>
                <span className="badge bg-secondary">
                  {colType === "rect" ? "Rect" : "Circ"}
                </span>
              </div>
              <div id="svg-preview-container" style={{ height: "250px" }}>
                <svg
                  width="200"
                  height="200"
                  viewBox="-120 -120 240 240"
                  style={{ background: "#f9f9f9" }}
                >
                  {/* Bê tông */}
                  {colType === "rect" ? (
                    <rect
                      x={-geo.B / 2}
                      y={-geo.H / 2}
                      width={geo.B}
                      height={geo.H}
                      fill="#ddd"
                      stroke="#999"
                      strokeWidth="1"
                    />
                  ) : (
                    <circle
                      cx="0"
                      cy="0"
                      r={geo.D / 2}
                      fill="#ddd"
                      stroke="#999"
                      strokeWidth="1"
                    />
                  )}

                  {/* Lớp bảo vệ */}
                  {colType === "rect" && (
                    <>
                      <rect
                        x={-geo.B / 2 + geo.cover}
                        y={-geo.H / 2 + geo.cover}
                        width={geo.B - 2 * geo.cover}
                        height={geo.H - 2 * geo.cover}
                        fill="none"
                        stroke="#ccc"
                        strokeWidth="0.5"
                        strokeDasharray="2,2"
                      />
                    </>
                  )}

                  {/* Cốt thép */}
                  {generateBarLayout().map((bar, i) => (
                    <circle
                      key={i}
                      cx={bar.x}
                      cy={bar.y}
                      r="3"
                      fill="#c41e3a"
                      stroke="#fff"
                      strokeWidth="1.5"
                    />
                  ))}

                  {/* Axes */}
                  <line
                    x1="-100"
                    y1="0"
                    x2="100"
                    y2="0"
                    stroke="#ccc"
                    strokeWidth="0.5"
                  />
                  <line
                    x1="0"
                    y1="-100"
                    x2="0"
                    y2="100"
                    stroke="#ccc"
                    strokeWidth="0.5"
                  />
                </svg>
              </div>
              <div
                className="small text-muted mt-2"
                style={{ fontSize: "10px" }}
              >
                <i className="bi bi-info-circle me-1"></i>
                Xám nhạt: Lớp bê tông | Đường ngang: Lớp bảo vệ | Tròn đỏ: Cốt
                thép chủ
              </div>
            </div>
          </div>

          {/* Reinforcement Info */}
          <div className="text-center mt-2">
            <small className="text-muted">
              As tổng = {(Number(steel.Nb) * Number(steel.As_bar)).toFixed(0)}{" "}
              mm² (
              {(
                ((Number(steel.Nb) * Number(steel.As_bar)) /
                  (colType === "rect"
                    ? Number(geo.B) * Number(geo.H)
                    : Math.PI * Math.pow(Number(geo.D) / 2, 2))) *
                100
              ).toFixed(2)}
              %)
            </small>
          </div>
        </div>
      </div>
    );
  }

  // FORM ONLY MODE: Show form and calculate button
  if (formOnly) {
    return (
      <div
        className="d-flex flex-column h-100"
        style={{ backgroundColor: "#f8f9fa" }}
      >
        {/* Scrollable Form Content */}
        <div className="flex-grow-1 overflow-auto p-3">
          {/* 1. Geometry Section */}
          <div className="card shadow-sm mb-3">
            <div className="card-body p-2">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <label className="small fw-bold text-dark mb-0">
                  Tiết diện
                </label>
                <div className="btn-group btn-group-sm" role="group">
                  <input
                    type="radio"
                    className="btn-check"
                    name="colType"
                    id="rect-type"
                    value="rect"
                    checked={colType === "rect"}
                    onChange={() => setColType("rect")}
                  />
                  <label
                    className="btn btn-outline-primary"
                    htmlFor="rect-type"
                  >
                    <i className="bi bi-square"></i> Chữ nhật
                  </label>
                  <input
                    type="radio"
                    className="btn-check"
                    name="colType"
                    id="circ-type"
                    value="circ"
                    checked={colType === "circ"}
                    onChange={() => setColType("circ")}
                  />
                  <label
                    className="btn btn-outline-primary"
                    htmlFor="circ-type"
                  >
                    <i className="bi bi-circle"></i> Tròn
                  </label>
                </div>
              </div>

              <div className="row g-2">
                {colType === "rect" ? (
                  <>
                    <div className="col-6">
                      <label className="form-label small">Rộng B (mm)</label>
                      <input
                        type="number"
                        value={geo.B}
                        onChange={(e) => setGeo({ ...geo, B: e.target.value })}
                        className="form-control form-control-sm"
                      />
                    </div>
                    <div className="col-6">
                      <label className="form-label small">Cao H (mm)</label>
                      <input
                        type="number"
                        value={geo.H}
                        onChange={(e) => setGeo({ ...geo, H: e.target.value })}
                        className="form-control form-control-sm"
                      />
                    </div>
                  </>
                ) : (
                  <div className="col-12">
                    <label className="form-label small">
                      Đường kính D (mm)
                    </label>
                    <input
                      type="number"
                      value={geo.D}
                      onChange={(e) => setGeo({ ...geo, D: e.target.value })}
                      className="form-control form-control-sm"
                    />
                  </div>
                )}
              </div>

              <div className="row g-2 mt-1">
                <div className="col-12">
                  <label className="form-label small">
                    Lớp bảo vệ (Cover) a:
                  </label>
                  <div className="input-group input-group-sm">
                    <input
                      type="number"
                      value={geo.cover}
                      onChange={(e) =>
                        setGeo({ ...geo, cover: e.target.value })
                      }
                      className="form-control"
                    />
                    <span className="input-group-text">mm</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Material Section */}
          <div className="card shadow-sm mb-3">
            <div className="card-body p-2">
              <label className="small fw-bold text-dark d-block mb-2">
                <i className="bi bi-arrow-bar-up"></i> Vật liệu (MPa)
              </label>
              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label small">
                    /*{getStandardLabels().c}*/
					{lbl.c}  {/* <-- SỬA THÀNH lbl.c */}
                  </label>
                  <input
                    type="number"
                    value={mat.fck}
                    onChange={(e) => setMat({ ...mat, fck: e.target.value })}
                    className="form-control form-control-sm"
                    step="0.5"
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small">
                    /*{getStandardLabels().s}*/
                  </label>
                  <input
                    type="number"
                    value={mat.fyk}
                    onChange={(e) => setMat({ ...mat, fyk: e.target.value })}
                    className="form-control form-control-sm"
                    step="10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Reinforcement Section */}
          <div className="card shadow-sm mb-3">
            <div className="card-body p-2">
              <label className="small fw-bold text-dark d-block mb-2">
                <i className="bi bi-shield-check"></i> Cốt thép chủ
              </label>
              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label small">Số thanh Nb</label>
                  <input
                    type="number"
                    value={steel.Nb}
                    onChange={(e) => setSteel({ ...steel, Nb: e.target.value })}
                    className="form-control form-control-sm"
                    min="4"
                    step="1"
                  />
                </div>
                <div className="col-6">
                  <label className="form-label small">Đường kính ∅ (mm)</label>
                  <input
                    type="number"
                    value={steel.d_bar}
                    onChange={(e) =>
                      setSteel({ ...steel, d_bar: e.target.value })
                    }
                    className="form-control form-control-sm"
                    step="2"
                  />
                </div>
              </div>
              <small className="text-muted d-block mt-2">
                As/thanh: {steel.As_bar.toFixed(1)} mm² | As tổng:{" "}
                {(Number(steel.Nb) * Number(steel.As_bar)).toFixed(0)} mm²
              </small>
            </div>
          </div>

          {/* 4. Loads Section */}
          <div className="card shadow-sm mb-3">
            <div className="card-body p-2">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <label className="small fw-bold text-dark mb-0">
                  Tải trọng tính toán
                </label>
                <button
                  onClick={addLoad}
                  className="btn btn-sm btn-outline-success"
                >
                  <i className="bi bi-plus-circle"></i> Thêm
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {loads.map((l, index) => (
                  <div
                    key={l.id}
                    className="border rounded p-2"
                    style={{ backgroundColor: "#f8f9fa" }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <input
                        type="text"
                        value={l.note}
                        onChange={(e) =>
                          updateLoad(l.id, "note", e.target.value)
                        }
                        className="form-control form-control-sm fw-bold text-primary"
                        placeholder="Tên tổ hợp..."
                        style={{ flex: 1 }}
                      />
                      <button
                        onClick={() => removeLoad(l.id)}
                        className="btn btn-sm btn-link text-danger ms-2"
                        style={{ padding: "0.25rem" }}
                      >
                        <i className="bi bi-x-circle-fill"></i>
                      </button>
                    </div>

                    <div className="row g-1">
                      <div className="col-4">
                        <label className="form-label small">P (kN)</label>
                        <input
                          type="number"
                          value={l.P}
                          onChange={(e) =>
                            updateLoad(l.id, "P", e.target.value)
                          }
                          className="form-control form-control-sm text-end"
                        />
                      </div>
                      <div className="col-4">
                        <label className="form-label small">Mx (kNm)</label>
                        <input
                          type="number"
                          value={l.Mx}
                          onChange={(e) =>
                            updateLoad(l.id, "Mx", e.target.value)
                          }
                          className="form-control form-control-sm text-end"
                        />
                      </div>
                      <div className="col-4">
                        <label className="form-label small">My (kNm)</label>
                        <input
                          type="number"
                          value={l.My}
                          onChange={(e) =>
                            updateLoad(l.id, "My", e.target.value)
                          }
                          className="form-control form-control-sm text-end"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-3 bg-white border-top mt-auto">
          <button
            onClick={handleRunAnalysis}
            disabled={isComputing}
            className={`btn w-100 fw-bold ${
              isComputing ? "btn-secondary" : "btn-primary"
            }`}
            style={{ fontSize: "0.9rem" }}
          >
            {isComputing ? (
              <span>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Đang xử lý...
              </span>
            ) : (
              <span>
                <i className="bi bi-lightning-charge-fill me-2"></i> TÍNH TOÁN
              </span>
            )}
          </button>
        </div>
      </div>
    );
  }

  // FULL MODE: Original layout (if neither sidebarOnly nor formOnly)
  return (
    <div
      className="d-flex flex-column h-100"
      style={{ backgroundColor: "#f8f9fa" }}
    >
      {/* Header Input */}
      <div
        className="p-3 bg-white border-bottom sticky-top"
        style={{ zIndex: 10 }}
      >
        <h4 className="small fw-bold text-muted text-uppercase mb-3">
          <i className="bi bi-sliders me-1"></i> Thiết lập đầu vào
        </h4>

        {/* File Operations */}
        <div className="btn-group w-100 mb-3" role="group">
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            title="Tạo mới"
            onClick={handleNewFile}
          >
            <i className="bi bi-file-earmark-plus"></i> New
          </button>
          <button
            type="button"
            className="btn btn-outline-success btn-sm"
            title="Mở file"
            onClick={handleOpenFile}
          >
            <i className="bi bi-folder-open"></i> Open
          </button>
          <button
            type="button"
            className="btn btn-outline-warning btn-sm"
            title="Lưu file"
            onClick={handleSaveFile}
          >
            <i className="bi bi-save"></i> Save
          </button>
        </div>
        <input
          type="file"
          id="file-input-hidden"
          accept=".json"
          style={{ display: "none" }}
          onChange={handleFileSelect}
        />

        {/* Standard Selector */}
        <div className="mb-3">
          <label className="form-label small fw-bold">Tiêu chuẩn</label>
          <select
            value={standard}
            onChange={(e) => setStandard(e.target.value)}
            className="form-select form-select-sm fw-bold text-primary"
          >
            <option value="TCVN">TCVN 5574:2018</option>
            <option value="EC2">Eurocode 2</option>
            <option value="ACI">ACI 318-19</option>
          </select>
        </div>
      </div>

      {/* Scrollable Form Content */}
      <div className="flex-grow-1 overflow-auto p-3">
        {/* 1. Geometry Section */}
        <div className="card shadow-sm mb-3">
          <div className="card-body p-2">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="small fw-bold text-dark mb-0">Tiết diện</label>
              <div className="btn-group btn-group-sm" role="group">
                <input
                  type="radio"
                  className="btn-check"
                  name="colType"
                  id="rect-type"
                  value="rect"
                  checked={colType === "rect"}
                  onChange={() => setColType("rect")}
                />
                <label className="btn btn-outline-primary" htmlFor="rect-type">
                  <i className="bi bi-square"></i> Chữ nhật
                </label>
                <input
                  type="radio"
                  className="btn-check"
                  name="colType"
                  id="circ-type"
                  value="circ"
                  checked={colType === "circ"}
                  onChange={() => setColType("circ")}
                />
                <label className="btn btn-outline-primary" htmlFor="circ-type">
                  <i className="bi bi-circle"></i> Tròn
                </label>
              </div>
            </div>

            <div className="row g-2">
              {colType === "rect" ? (
                <>
                  <div className="col-6">
                    <label className="form-label small">Rộng B (mm)</label>
                    <input
                      type="number"
                      value={geo.B}
                      onChange={(e) => setGeo({ ...geo, B: e.target.value })}
                      className="form-control form-control-sm"
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small">Cao H (mm)</label>
                    <input
                      type="number"
                      value={geo.H}
                      onChange={(e) => setGeo({ ...geo, H: e.target.value })}
                      className="form-control form-control-sm"
                    />
                  </div>
                </>
              ) : (
                <div className="col-12">
                  <label className="form-label small">Đường kính D (mm)</label>
                  <input
                    type="number"
                    value={geo.D}
                    onChange={(e) => setGeo({ ...geo, D: e.target.value })}
                    className="form-control form-control-sm"
                  />
                </div>
              )}
              <div className="col-12">
                <label className="form-label small">
                  Lớp bảo vệ a (mm) - Tới tâm thép
                </label>
                <input
                  type="number"
                  value={geo.cover}
                  onChange={(e) => setGeo({ ...geo, cover: e.target.value })}
                  className="form-control form-control-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 2. Material Section */}
        <div className="card shadow-sm mb-3">
          <div className="card-body p-2">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <label className="small fw-bold text-dark mb-0">Vật liệu</label>
              <span className="badge bg-warning text-dark small">{lbl.t}</span>
            </div>
            <div className="row g-2">
              <div className="col-6">
                <label className="form-label small">{lbl.c}</label>
                <input
                  type="number"
                  value={mat.fck}
                  onChange={(e) => setMat({ ...mat, fck: e.target.value })}
                  className="form-control form-control-sm fw-bold"
                />
              </div>
              <div className="col-6">
                <label className="form-label small">{lbl.s}</label>
                <input
                  type="number"
                  value={mat.fyk}
                  onChange={(e) => setMat({ ...mat, fyk: e.target.value })}
                  className="form-control form-control-sm fw-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 3. Reinforcement Section */}
        <div className="card shadow-sm mb-3">
          <div className="card-body p-2">
            <label className="small fw-bold text-dark d-block mb-2">
              Cốt thép chủ (Sơ bộ)
            </label>
            <div className="row g-2">
              <div className="col-4">
                <label className="form-label small">Số thanh</label>
                <input
                  type="number"
                  value={steel.Nb}
                  onChange={(e) => setSteel({ ...steel, Nb: e.target.value })}
                  className="form-control form-control-sm"
                />
              </div>
              <div className="col-4">
                <label className="form-label small">Đkính (mm)</label>
                <select
                  value={steel.d_bar}
                  onChange={(e) =>
                    setSteel({ ...steel, d_bar: Number(e.target.value) })
                  }
                  className="form-select form-select-sm"
                >
                  {[10, 12, 14, 16, 18, 20, 22, 25, 28, 32].map((d) => (
                    <option key={d} value={d}>
                      D{d}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-4">
                <label className="form-label small">As (mm²)</label>
                <input
                  type="number"
                  value={steel.As_bar}
                  readOnly
                  className="form-control form-control-sm bg-light"
                />
              </div>
            </div>
            <div className="small text-muted mt-2">
              <i>
                Hàm lượng cốt thép:{" "}
                {(
                  ((steel.Nb * steel.As_bar) /
                    (colType === "rect"
                      ? geo.B * geo.H
                      : Math.PI * Math.pow(geo.D / 2, 2))) *
                  100
                ).toFixed(2)}
                %
              </i>
            </div>
          </div>
        </div>

        {/* 3.5. Section Preview (SVG Visualization) */}
        <div className="card shadow-sm mb-3">
          <div className="card-body p-2">
            <label className="small fw-bold text-dark d-block mb-2">
              <i className="bi bi-diagram-3 me-1"></i> Minh họa tiết diện
            </label>
            <svg
              width="100%"
              height="200"
              viewBox="-250 -250 500 500"
              style={{
                border: "1px solid #e0e0e0",
                borderRadius: "4px",
                backgroundColor: "#fafafa",
              }}
            >
              {/* Section outline */}
              {colType === "rect" ? (
                <>
                  {/* Concrete boundary */}
                  <rect
                    x={-Number(geo.B) / 2}
                    y={-Number(geo.H) / 2}
                    width={Number(geo.B)}
                    height={Number(geo.H)}
                    fill="#e8e8e8"
                    stroke="#666"
                    strokeWidth="2"
                  />

                  {/* Cover zone (lighter) */}
                  <rect
                    x={-Number(geo.B) / 2 + Number(geo.cover)}
                    y={-Number(geo.H) / 2 + Number(geo.cover)}
                    width={Number(geo.B) - 2 * Number(geo.cover)}
                    height={Number(geo.H) - 2 * Number(geo.cover)}
                    fill="#f5f5f5"
                    stroke="#999"
                    strokeWidth="1"
                    strokeDasharray="4"
                    opacity="0.6"
                  />

                  {/* Rebar circles */}
                  {generateBarLayout().map((bar, idx) => (
                    <circle
                      key={idx}
                      cx={bar.x}
                      cy={bar.y}
                      r={Math.sqrt(bar.As / Math.PI)}
                      fill="none"
                      stroke="#d32f2f"
                      strokeWidth="1.5"
                    />
                  ))}
                </>
              ) : (
                <>
                  {/* Concrete boundary (circle) */}
                  <circle
                    cx="0"
                    cy="0"
                    r={Number(geo.D) / 2}
                    fill="#e8e8e8"
                    stroke="#666"
                    strokeWidth="2"
                  />

                  {/* Cover zone (lighter) */}
                  <circle
                    cx="0"
                    cy="0"
                    r={Number(geo.D) / 2 - Number(geo.cover)}
                    fill="none"
                    stroke="#999"
                    strokeWidth="1"
                    strokeDasharray="4"
                    opacity="0.6"
                  />

                  {/* Rebar circles */}
                  {generateBarLayout().map((bar, idx) => (
                    <circle
                      key={idx}
                      cx={bar.x}
                      cy={bar.y}
                      r={Math.sqrt(bar.As / Math.PI)}
                      fill="none"
                      stroke="#d32f2f"
                      strokeWidth="1.5"
                    />
                  ))}
                </>
              )}

              {/* Axes */}
              <line
                x1="-100"
                y1="0"
                x2="100"
                y2="0"
                stroke="#ccc"
                strokeWidth="0.5"
              />
              <line
                x1="0"
                y1="-100"
                x2="0"
                y2="100"
                stroke="#ccc"
                strokeWidth="0.5"
              />
            </svg>
            <div className="small text-muted mt-2" style={{ fontSize: "10px" }}>
              <i className="bi bi-info-circle me-1"></i>
              Xám nhạt: Lớp bê tông | Đường ngang: Lớp bảo vệ | Tròn đỏ: Cốt
              thép chủ
            </div>
          </div>
        </div>

        {/* 4. Loads Section */}
        <div className="card shadow-sm mb-3">
          <div className="card-body p-2">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <label className="small fw-bold text-dark mb-0">
                Tải trọng tính toán
              </label>
              <button
                onClick={addLoad}
                className="btn btn-sm btn-outline-success"
              >
                <i className="bi bi-plus-circle"></i> Thêm
              </button>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {loads.map((l, index) => (
                <div
                  key={l.id}
                  className="border rounded p-2"
                  style={{ backgroundColor: "#f8f9fa" }}
                >
                  {/* Note Input */}
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <input
                      type="text"
                      value={l.note}
                      onChange={(e) => updateLoad(l.id, "note", e.target.value)}
                      className="form-control form-control-sm fw-bold text-primary"
                      placeholder="Tên tổ hợp..."
                      style={{ flex: 1 }}
                    />
                    <button
                      onClick={() => removeLoad(l.id)}
                      className="btn btn-sm btn-link text-danger ms-2"
                      style={{ padding: "0.25rem" }}
                    >
                      <i className="bi bi-x-circle-fill"></i>
                    </button>
                  </div>

                  {/* Values Input */}
                  <div className="row g-1">
                    <div className="col-4">
                      <label className="form-label small">P (kN)</label>
                      <input
                        type="number"
                        value={l.P}
                        onChange={(e) => updateLoad(l.id, "P", e.target.value)}
                        className="form-control form-control-sm text-end"
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label small">Mx (kNm)</label>
                      <input
                        type="number"
                        value={l.Mx}
                        onChange={(e) => updateLoad(l.id, "Mx", e.target.value)}
                        className="form-control form-control-sm text-end"
                      />
                    </div>
                    <div className="col-4">
                      <label className="form-label small">My (kNm)</label>
                      <input
                        type="number"
                        value={l.My}
                        onChange={(e) => updateLoad(l.id, "My", e.target.value)}
                        className="form-control form-control-sm text-end"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Action */}
      <div className="p-3 bg-white border-top mt-auto">
        <button
          onClick={handleRunAnalysis}
          disabled={isComputing}
          className={`btn w-100 fw-bold ${
            isComputing ? "btn-secondary" : "btn-primary"
          }`}
          style={{ fontSize: "0.9rem" }}
        >
          {isComputing ? (
            <span>
              <span
                className="spinner-border spinner-border-sm me-2"
                role="status"
                aria-hidden="true"
              ></span>
              Đang xử lý...
            </span>
          ) : (
            <span>
              <i className="bi bi-cpu me-2"></i> TÍNH TOÁN
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

// Expose to Global Scope for index.html to find
window.AppCal = AppCal;
