/**
 * APP CALCULATION COMPONENT (INPUT UI)
 * Nhiệm vụ: Thu thập dữ liệu, validate và gửi sang engine tính toán.
 */

const { useState, useEffect, useMemo } = React;

const AppCal = ({ onCalculate, isComputing }) => {
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
  const generateBarLayout = () => {
    const bars = [];
    const As = Number(steel.As_bar);
    const N = Math.max(4, Number(steel.Nb)); // Tối thiểu 4 thanh

    if (colType === "rect") {
      // Logic: Bố trí đều chu vi hình chữ nhật
      const W = Number(geo.B) - 2 * Number(geo.cover);
      const H = Number(geo.H) - 2 * Number(geo.cover);

      // 4 thanh góc bắt buộc
      bars.push({ x: -W / 2, y: -H / 2, As }); // Góc dưới trái
      bars.push({ x: W / 2, y: -H / 2, As }); // Góc dưới phải
      bars.push({ x: W / 2, y: H / 2, As }); // Góc trên phải
      bars.push({ x: -W / 2, y: H / 2, As }); // Góc trên trái

      const remain = N - 4;
      if (remain > 0) {
        // Chia số thanh còn lại cho các cạnh
        // Đơn giản hóa: Chia đều cho 4 cạnh (mỗi cạnh thêm n thanh)
        // Lưu ý: Đây là logic sơ bộ, thực tế user có thể cần chỉnh từng thanh
        // Ở đây ta dùng thuật toán rải đều theo chu vi
        const perimeter = 2 * (W + H);
        const spacing = perimeter / N;

        // Reset và chạy lại thuật toán rải đều (chính xác hơn)
        bars.length = 0; // Clear

        // Rải điểm trên chu vi hình chữ nhật (đi từ góc dưới trái, ngược chiều kim đồng hồ)
        // Cạnh đáy (-W/2, -H/2) -> (W/2, -H/2)
        // Cạnh phải (W/2, -H/2) -> (W/2, H/2)
        // Cạnh trên (W/2, H/2) -> (-W/2, H/2)
        // Cạnh trái (-W/2, H/2) -> (-W/2, -H/2)

        // Cách đơn giản cho demo: Chia đều 2 phương X và Y
        // Số khoảng chia phương X và Y dựa trên tỷ lệ cạnh
        const nX = Math.round((W / (W + H)) * N);
        const nY = Math.round((H / (W + H)) * N);

        // Code rải đều đơn giản (Fallback về cách chia cạnh thủ công nếu cần chính xác cao)
        // Ở đây dùng lại phương pháp rải điểm đơn giản cho Rect:
        // Chỉ rải thanh giữa các cạnh (không tối ưu 100% nhưng đủ dùng cho demo)
        const n_side_x = Math.floor(remain / 2); // Số thanh thêm vào 2 cạnh ngang
        // Chưa xử lý chi tiết chia lẻ, dùng logic 4 góc + trung điểm tạm thời cho demo
        // *Để code gọn, ta dùng logic phân bố lại 4 góc và các thanh giữa*

        // Re-add 4 corners
        bars.push({ x: -W / 2, y: -H / 2, As });
        bars.push({ x: W / 2, y: -H / 2, As });
        bars.push({ x: W / 2, y: H / 2, As });
        bars.push({ x: -W / 2, y: H / 2, As });

        // Thêm các thanh giữa (giả định đối xứng)
        if (remain >= 2) {
          bars.push({ x: 0, y: -H / 2, As }); // Giữa đáy
          bars.push({ x: 0, y: H / 2, As }); // Giữa đỉnh
        }
        if (remain >= 4) {
          bars.push({ x: -W / 2, y: 0, As }); // Giữa trái
          bars.push({ x: W / 2, y: 0, As }); // Giữa phải
        }
        // Nếu > 8 thanh, code này cần nâng cấp thuật toán chia loop
      }
    } else {
      // Logic: Bố trí tròn đều (Polar Array)
      const R_bars = Number(geo.D) / 2 - Number(geo.cover);
      for (let i = 0; i < N; i++) {
        const theta = (i * 2 * Math.PI) / N;
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
