/**
 * APP INPUT & CONTROLLER MODULE (app-inp.js)
 * Responsibility: Handle ALL user interface interactions
 * - Read values from HTML inputs
 * - Handle button/form events
 * - Draw section illustration (SVG)
 * - Coordinate data flow between app-cal.js (calculation) and app-out.js (display)
 */

document.addEventListener("DOMContentLoaded", () => {
  // --- 1. STATE ---
  const state = {
    colType: "rect",
    standard: "TCVN", // Tiêu chuẩn tính toán
    geometry: { B: 300, H: 400, D: 400, Cover: 30 },
    material: { fck: 14.5, fyk: 280 },
    reinforcement: { Nb: 4, d_bar: 18, As_bar: 254.5 },
  };

  // --- 2. ELEMENTS ---
  const dom = {
    radioRect: document.getElementById("type-rect"),
    radioCirc: document.getElementById("type-circ"),

    divRectInputs: document.getElementById("rect-inputs"),
    divCircInputs: document.getElementById("circ-inputs"),

    selectStandard: document.getElementById("select-standard"),
    inpB: document.getElementById("input-B"),
    inpH: document.getElementById("input-H"),
    inpD: document.getElementById("input-D"),
    inpCover: document.getElementById("input-Cover"),
    inpRb: document.getElementById("input-Rb"),
    inpRs: document.getElementById("input-Rs"),

    inpNb: document.getElementById("input-Nb"),
    inpdBar: document.getElementById("input-dbar"),
    inpAs: document.getElementById("input-As"),
    spanReinfoInfo: document.getElementById("reinforcement-info"),

    tableLoads: document.querySelector("#load-table tbody"),
    btnAddLoad: document.getElementById("btn-add-load"),

    btnCalc: document.getElementById("btn-calculate"),
    outputSection: document.getElementById("output-section"),
  };

  // --- 3. LOGIC ---

  function updateStateFromDOM() {
    state.colType = dom.radioRect.checked ? "rect" : "circ";
    state.standard = dom.selectStandard
      ? dom.selectStandard.value || "TCVN"
      : "TCVN";
    state.geometry.B = parseFloat(dom.inpB.value) || 300;
    state.geometry.H = parseFloat(dom.inpH.value) || 400;
    state.geometry.D = parseFloat(dom.inpD.value) || 400;
    state.geometry.Cover = parseFloat(dom.inpCover.value) || 30;

    state.material.fck = parseFloat(dom.inpRb.value) || 14.5;
    state.material.fyk = parseFloat(dom.inpRs.value) || 280;

    state.reinforcement.Nb = parseInt(dom.inpNb.value) || 4;
    state.reinforcement.d_bar = parseFloat(dom.inpdBar.value) || 18;

    // Tính As thanh
    const as = ShortColCal.calcBarArea(state.reinforcement.d_bar);
    state.reinforcement.As_bar = as;
    dom.inpAs.value = as.toFixed(1);

    renderPreviewOnly();
  }

  function generateBars() {
    if (state.colType === "rect") {
      return ShortColCal.generateRectLayout(
        state.geometry.B,
        state.geometry.H,
        state.geometry.Cover,
        state.reinforcement.Nb,
        state.reinforcement.As_bar
      );
    } else {
      return ShortColCal.generateCircLayout(
        state.geometry.D,
        state.geometry.Cover,
        state.reinforcement.Nb,
        state.reinforcement.As_bar
      );
    }
  }

  // Chỉ vẽ hình minh họa (Real-time)
  function renderPreviewOnly() {
    const bars = generateBars();
    ShortColOut.drawCrossSection(
      "svg-preview-container",
      state.colType,
      state.geometry,
      bars,
      state.reinforcement.d_bar
    );

    // Update Info text
    const totalAs = bars.length * state.reinforcement.As_bar;
    const ag =
      state.colType === "rect"
        ? state.geometry.B * state.geometry.H
        : (Math.PI * state.geometry.D ** 2) / 4;
    const ratio = (totalAs / ag) * 100;
    dom.spanReinfoInfo.innerHTML = `As tổng = <b>${totalAs.toFixed(
      0
    )}</b> mm² (${ratio.toFixed(2)}%)`;
  }

  // Helper for table
  function getLoads() {
    const loads = [];
    const rows = dom.tableLoads.querySelectorAll("tr");
    rows.forEach((tr, index) => {
      const inputs = tr.querySelectorAll("input");
      const name = inputs[0].value || `TH${index + 1}`;
      const mu = parseFloat(inputs[1].value) || 0;
      const pu = parseFloat(inputs[2].value) || 0;
      loads.push({ name, Mu: mu, Pu: pu });
    });
    return loads;
  }

  // --- 4. EVENTS ---

  // Toggle Type
  [dom.radioRect, dom.radioCirc].forEach((r) => {
    r.addEventListener("change", () => {
      if (dom.radioRect.checked) {
        dom.divRectInputs.style.display = "block";
        dom.divCircInputs.style.display = "none";
      } else {
        dom.divRectInputs.style.display = "none";
        dom.divCircInputs.style.display = "block";
      }
      updateStateFromDOM();
    });
  });

  // Inputs Change
  const inputs = [
    dom.inpB,
    dom.inpH,
    dom.inpD,
    dom.inpCover,
    dom.inpRb,
    dom.inpRs,
    dom.inpNb,
    dom.inpdBar,
  ];
  inputs.forEach((el) => el.addEventListener("input", updateStateFromDOM));

  // Standard selector change
  if (dom.selectStandard) {
    dom.selectStandard.addEventListener("change", updateStateFromDOM);
  }

  // Add Load Row
  dom.btnAddLoad.addEventListener("click", () => {
    const idx = dom.tableLoads.rows.length + 1;
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td class="text-center">${idx}</td>
            <td><input type="text" class="form-control form-control-sm" value="TH${idx}"></td>
            <td><input type="number" class="form-control form-control-sm text-end" value="0"></td>
            <td><input type="number" class="form-control form-control-sm text-end" value="0"></td>
            <td class="text-center"><button class="btn btn-sm btn-outline-danger border-0" onclick="AppUI.table.removeRow(this)"><i class="bi bi-trash"></i></button></td>
        `;
    dom.tableLoads.appendChild(tr);
  });

  // CALCULATION (Chỉ chạy khi bấm nút)
  dom.btnCalc.addEventListener("click", () => {
    // 1. UI Loading
    AppUI.button.setLoading("btn-calculate", true, " Đang tính...");
    AppUI.overlay.show("Đang xây dựng biểu đồ tương tác...");

    // Ẩn kết quả cũ nếu có để tạo cảm giác refresh
    dom.outputSection.style.opacity = "0.5";

    setTimeout(() => {
      try {
        // 2. Lấy dữ liệu mới nhất
        updateStateFromDOM();
        const loads = getLoads();
        const bars = generateBars();

        if (!loads || loads.length === 0)
          throw new Error("Vui lòng nhập ít nhất 1 tổ hợp tải trọng.");
        if (!bars || bars.length === 0)
          throw new Error(
            "Lỗi: Không thể sinh bố trí cốt thép. Kiểm tra số thanh và kích thước tiết diện."
          );

        // 3. Tính toán Curve với đúng signature: (standard, type, B, H, D, fck, fyk, bars)
        const curvePoints = ShortColCal.calculateInteractionCurve(
          state.standard,
          state.colType,
          state.geometry.B,
          state.geometry.H,
          state.geometry.D,
          state.material.fck,
          state.material.fyk,
          bars
        );

        // 4. Tính hệ số an toàn
        const safetyFactors = loads.map((l) =>
          ShortColCal.calculateSafetyFactor(l.Pu, l.Mu, curvePoints)
        );

        // 5. Hiển thị kết quả
        dom.outputSection.style.display = "flex";
        dom.outputSection.style.opacity = "1";

        ShortColOut.renderChart(
          "interactionChart",
          curvePoints,
          loads,
          safetyFactors
        );
        ShortColOut.renderResultsTable("result-body", loads, safetyFactors);

        // Scroll xuống
        dom.outputSection.scrollIntoView({ behavior: "smooth" });
        AppUI.toast.show("Tính toán thành công!", "success");
      } catch (e) {
        console.error(e);
        AppUI.toast.show(e.message, "danger");
      } finally {
        AppUI.button.setLoading("btn-calculate", false, "TÍNH TOÁN");
        AppUI.overlay.hide();
      }
    }, 100);
  });

  // --- INIT ---
  // Thêm 1 dòng tải trọng mẫu
  const tr = document.createElement("tr");
  tr.innerHTML = `
        <td class="text-center">1</td>
        <td><input type="text" class="form-control form-control-sm" value="Tổ hợp tải trọng"></td>
        <td><input type="number" class="form-control form-control-sm text-end" value="50"></td>
        <td><input type="number" class="form-control form-control-sm text-end" value="1000"></td>
        <td class="text-center"><button class="btn btn-sm btn-outline-danger border-0" onclick="AppUI.table.removeRow(this)"><i class="bi bi-trash"></i></button></td>
    `;
  dom.tableLoads.appendChild(tr);

  // Render lần đầu
  updateStateFromDOM();
});
