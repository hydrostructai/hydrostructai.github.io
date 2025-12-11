# 📋 Hướng dẫn Chi Tiết: Cải tiến Giao diện ShortCol 2D & 3D

**Ngày cập nhật:** 12/12/2025  
**Trạng thái:** ✅ Hoàn thành bước 1 (HTML chính)  
**Tiến độ:** 5/6 bước

---

## 📌 TÓM TẮT CÁC THAY ĐỔI ĐÃ THỰC HIỆN

### ✅ Bước 1: Cập nhật shortcol3D/index.html (HOÀN THÀNH)

#### 1.1 Cập nhật Phiên bản Bootstrap & Icons

```html
<!-- CŨ -->
<link
  href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
/>
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css"
/>

<!-- MỚI -->
<link
  href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
/>
<link
  href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.css"
/>
```

**Lợi ích:** Cập nhật bảo mật, sửa lỗi, và tương thích tốt hơn với shortcol2D

---

#### 1.2 Xóa Tailwind CSS

```html
<!-- XÓA -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- GIẢI THÍCH -->
<!-- Tailwind sử dụng className với syntax không tương thích -->
<!-- Bootstrap đã cung cấp đủ tính năng responsive cần thiết -->
```

---

#### 1.3 Chuẩn hóa CSS Loading Overlay

```css
/* CŨ (dùng Tailwind CSS properties) */
#loading-overlay.active {
  visibility: visible !important;
  opacity: 1 !important;
}

/* MỚI (CSS thuần + Bootstrap theme colors) */
#loading-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  transition: opacity 0.3s ease, visibility 0.3s ease;
  visibility: hidden;
  opacity: 0;
}

#loading-overlay.active {
  visibility: visible !important;
  opacity: 1 !important;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #0d6efd;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: #0d6efd;
  font-weight: 600;
  margin-top: 1rem;
  font-size: 14px;
}
```

---

#### 1.4 Chuyển Body Class từ Tailwind sang Bootstrap

```html
<!-- CŨ -->
<body class="bg-slate-50 text-slate-800">
  <!-- MỚI -->
  <body>
    <!-- CSS handle từ global.css & inline styles -->
  </body>
</body>
```

---

#### 1.5 Cấu trúc Loading Overlay đơn giản

```html
<!-- CŨ (phức tạp) -->
<div id="loading-overlay">
  <div
    class="spinner-border text-primary"
    role="status"
    style="width: 3rem; height: 3rem;"
  >
    <span class="visually-hidden">Loading...</span>
  </div>
  <div class="loading-text">Đang phân tích mặt cắt & tích phân sợi...</div>
</div>

<!-- MỚI (đơn giản, giống shortcol2D) -->
<div id="loading-overlay">
  <div class="spinner"></div>
  <div class="loading-text">
    <i class="bi bi-cpu"></i> Đang phân tích mặt cắt & tích phân sợi...
  </div>
</div>
```

---

#### 1.6 Chuyển React Layout từ Tailwind sang Bootstrap

```jsx
/* CŨ (Tailwind) */
<div className="flex flex-col min-h-screen">
    <div className="bg-white border-b px-6 py-3 shadow-sm flex justify-between items-center sticky top-0 z-40">
        ...
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-12 flex-1">
        <div className="lg:col-span-4 xl:col-span-3 border-r bg-slate-50/50 flex flex-col h-full overflow-y-auto">
        <div className="lg:col-span-8 xl:col-span-9 bg-white h-full overflow-y-auto">
    </div>
</div>

/* MỚI (Bootstrap) */
<div className="d-flex flex-column" style={{minHeight: '100vh'}}>
    <div className="bg-white border-bottom px-3 py-2 shadow-sm d-flex justify-content-between align-items-center sticky-top">
        ...
    </div>
    <div className="container-fluid flex-grow-1" style={{display: 'grid', gridTemplateColumns: '3fr 9fr'}}>
        <div className="border-end bg-light">
        <div className="bg-white">
    </div>
</div>
```

**Giải thích:**

- `flex flex-col` → `d-flex flex-column`
- `min-h-screen` → `style={{minHeight: '100vh'}}`
- `bg-white border-b` → `bg-white border-bottom`
- `px-6 py-3` → `px-3 py-2` (Bootstrap spacing)
- `flex justify-between items-center` → `d-flex justify-content-between align-items-center`
- `sticky top-0` → `sticky-top`
- `grid grid-cols-1 lg:grid-cols-12` → `style={{display: 'grid', gridTemplateColumns: '3fr 9fr'}}`
- `overflow-y-auto` → `style={{overflowY: 'auto'}}`
- `bg-slate-50/50` → `bg-light`

---

## 📌 BƯỚC 2-6: HƯỚNG DẪN TIẾP THEO

### ⏳ Bước 2: Cập nhật app-cal.js Component (Input Form)

**Mục đích:** Chuyển cấu trúc form input từ React state quản lý toàn bộ sang dùng Bootstrap form classes

**Các thay đổi cần làm:**

1. **Thay đổi className từ Tailwind sang Bootstrap:**

```jsx
// CŨ
<div className="flex flex-col gap-4 p-6">
    <label className="text-sm font-bold text-slate-700">Tiêu chuẩn thiết kế</label>
    <select className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white text-slate-900">

// MỚI
<div className="p-3">
    <label className="form-label fw-bold">Tiêu chuẩn thiết kế</label>
    <select className="form-select">
```

2. **Cấu trúc form groups:**

```jsx
// CŨ
<div>
    <label className="block text-sm font-semibold mb-2">Cạnh B (mm)</label>
    <input type="number" className="w-full px-3 py-2 border rounded-lg" />
</div>

// MỚI
<div className="mb-3">
    <label className="form-label">Cạnh B (mm)</label>
    <input type="number" className="form-control" />
</div>
```

3. **Tab structure (nếu có):**

```jsx
// MỚI (Bootstrap Tabs)
<ul className="nav nav-tabs" role="tablist">
    <li className="nav-item">
        <button className="nav-link active" data-bs-toggle="tab" data-bs-target="#tab-geometry">
            1. Tiết diện & Vật liệu
        </button>
    </li>
    <li className="nav-item">
        <button className="nav-link" data-bs-toggle="tab" data-bs-target="#tab-reinforcement">
            2. Cốt thép
        </button>
    </li>
    <li className="nav-item">
        <button className="nav-link" data-bs-toggle="tab" data-bs-target="#tab-loads">
            3. Nội lực
        </button>
    </li>
</ul>

<div className="tab-content p-3 border border-top-0">
    <div className="tab-pane fade show active" id="tab-geometry">
        {/* Content */}
    </div>
    ...
</div>
```

4. **Button styling:**

```jsx
// CŨ
<button className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">

// MỚI
<button className="btn btn-primary w-100">
```

5. **Card styling:**

```jsx
// CŨ
<div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">

// MỚI
<div className="card shadow-sm">
    <div className="card-body">
        {/* Content */}
    </div>
</div>
```

---

### ⏳ Bước 3: Cập nhật app-out.js Component (Output/Results)

**Mục đích:** Chuyển kết quả hiển thị sang Bootstrap grid layout

**Các thay đổi cần làm:**

1. **Chart container:**

```jsx
// CŨ
<div className="w-full h-96 bg-white rounded-lg shadow-md p-4">

// MỚI
<div className="card shadow-sm mb-4">
    <div className="card-header bg-white">
        <h5 className="mb-0"><i className="bi bi-graph-up"></i> Biểu đồ Tương tác</h5>
    </div>
    <div className="card-body">
        <div style={{position: 'relative', height: '450px', width: '100%'}}>
            <div ref={chartRef}></div>
        </div>
    </div>
</div>
```

2. **Results table:**

```jsx
// MỚI
<div className="card h-100 shadow-sm">
  <div className="card-header bg-white d-flex justify-content-between align-items-center">
    <h5 className="mb-0">
      <i className="bi bi-check2-circle"></i> Kết quả
    </h5>
    <button className="btn btn-sm btn-outline-secondary" onClick={exportCSV}>
      <i className="bi bi-download"></i> CSV
    </button>
  </div>
  <div className="card-body p-0">
    <div className="table-responsive" style={{ maxHeight: "450px" }}>
      <table className="table table-hover mb-0">
        <thead className="table-light sticky-top">
          <tr>
            <th>TH</th>
            <th className="text-end">P (kN)</th>
            <th className="text-end">Mx (kNm)</th>
            <th className="text-end">My (kNm)</th>
            <th className="text-center">Hệ số k</th>
            <th className="text-center">TT</th>
          </tr>
        </thead>
        <tbody>{/* Results rows */}</tbody>
      </table>
    </div>
  </div>
  <div className="card-footer bg-light text-muted small">
    <strong>k = Radius(Sức kháng) / Radius(Tải trọng)</strong>. Nếu k ≥ 1.0:
    ĐẠT.
  </div>
</div>
```

3. **Status badge:**

```jsx
// CŨ
<span className={`px-3 py-1 rounded-full text-sm font-bold ${k >= 1.0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>

// MỚI
<span className={`badge ${k >= 1.0 ? 'bg-success' : 'bg-danger'}`}>
    {k >= 1.0 ? 'ĐẠT' : 'KHÔNG ĐẠT'}
</span>
```

---

### ⏳ Bước 4: Thêm Nút File Operations (New/Open/Save)

**Để 3D giống 2D, cần thêm:**

**Trong app-cal.js:**

```jsx
// Thêm handler
const handleNewFile = () => window.location.reload();
const handleOpenFile = (id) => {
    document.getElementById(id).click();
};
const handleSaveFile = () => {
    const data = {
        standard, colType, geo, mat, steel, loads
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shortcol3d-${new Date().getTime()}.json`;
    a.click();
};

// Thêm vào return JSX (trong card header):
<div className="btn-group w-100 mb-3" role="group">
    <button type="button" className="btn btn-outline-primary btn-sm"
            title="Tạo mới" onClick={handleNewFile}>
        <i className="bi bi-file-earmark-plus"></i> New
    </button>
    <button type="button" className="btn btn-outline-success btn-sm"
            title="Mở file" onClick={() => handleOpenFile('hidden-file-input')}>
        <i className="bi bi-folder-open"></i> Open
    </button>
    <button type="button" className="btn btn-outline-warning btn-sm"
            title="Lưu file" onClick={handleSaveFile}>
        <i className="bi bi-save"></i> Save
    </button>
</div>
<input type="file" id="hidden-file-input" accept=".json" style={{display:'none'}}
       onChange={(e) => { /* load file logic */ }} />
```

---

### ⏳ Bước 5: Thêm Section Preview (Tiết diện SVG)

**Thêm vào app-cal.js sidebar:**

```jsx
const [showSectionPreview, setShowSectionPreview] = useState(true);

// Trong component return:
{
  showSectionPreview && (
    <div className="card border-0 bg-light">
      <div className="card-body p-2">
        <div className="d-flex justify-content-between align-items-center mb-2">
          <small className="fw-bold text-muted">MINH HỌA TIẾT DIỆN</small>
          <span className="badge bg-secondary" id="preview-badge">
            {colType === "rect" ? "Rect" : "Circle"}
          </span>
        </div>
        <div id="svg-preview-container">
          {/* SVG Section Drawing */}
          <svg width="200" height="200" viewBox="0 0 300 400">
            {colType === "rect" ? (
              <>
                {/* Rectangle section */}
                <rect
                  x="50"
                  y="0"
                  width={geo.B * 0.5}
                  height={geo.H * 0.5}
                  fill="none"
                  stroke="#0d6efd"
                  strokeWidth="2"
                />
                {/* Reinforcement bars */}
                {/* ... */}
              </>
            ) : (
              <>
                {/* Circular section */}
                <circle
                  cx="150"
                  cy="200"
                  r={geo.D * 0.25}
                  fill="none"
                  stroke="#0d6efd"
                  strokeWidth="2"
                />
                {/* Reinforcement bars */}
                {/* ... */}
              </>
            )}
          </svg>
        </div>
        <div className="text-center mt-2">
          <small className="text-muted" id="reinforcement-info">
            {steel.Nb} thanh φ{steel.d_bar} | As ={" "}
            {(steel.As_bar * steel.Nb).toFixed(0)} mm²
          </small>
        </div>
      </div>
    </div>
  );
}
```

---

### ⏳ Bước 6: Kiểm tra & Test

**Checklist:**

- [ ] HTML syntax không có lỗi (validate W3C)
- [ ] CSS loading overlay hiển thị đúng
- [ ] React component render mà không lỗi console
- [ ] Responsive design (Mobile/Tablet/Desktop)
- [ ] Giống visual shortcol2D
- [ ] File New/Open/Save hoạt động
- [ ] Section preview hiển thị
- [ ] Results table export CSV

---

## 📊 BẢNG SO SÁNH 2D vs 3D SAU CẬP NHẬT

| Tính năng         | 2D                | 3D (Before)          | 3D (After)        |
| ----------------- | ----------------- | -------------------- | ----------------- |
| Bootstrap version | 5.3.3             | 5.3.0 ❌             | 5.3.3 ✅          |
| Bootstrap Icons   | 1.11.3            | 1.10.5 ❌            | 1.11.3 ✅         |
| CSS Framework     | Bootstrap         | Tailwind ❌          | Bootstrap ✅      |
| Layout system     | Bootstrap Grid    | Tailwind Grid ❌     | Bootstrap Grid ✅ |
| Form styling      | Bootstrap classes | Tailwind ❌          | Bootstrap ✅      |
| Loading overlay   | CSS spinner       | Bootstrap spinner ❌ | CSS spinner ✅    |
| Header design     | Card-based        | Flexbox ⚠️           | Bootstrap nav ✅  |
| Sidebar           | Sticky card       | Flexbox ⚠️           | Sticky card ✅    |
| Results layout    | 7-5 cols          | Full width ❌        | 7-5 cols ✅       |
| File operations   | Yes ✅            | No ❌                | Needs impl        |
| Section preview   | Yes ✅            | No ❌                | Needs impl        |

---

## 🔗 TỀN FILE & VỊ TRÍ

```
apps/
├── shortcol2D/
│   └── index.html          ← Template chuẩn
├── shortcol3D/
│   ├── index.html          ← ✅ Đã cập nhật
│   ├── app-cal.js          ← ⏳ Cần cập nhật (Bước 2)
│   ├── app-out.js          ← ⏳ Cần cập nhật (Bước 3)
│   └── shortcol3D.js       ← (giữ nguyên)
assets/
├── css/
│   └── global.css          ← Kiểm tra & đảm bảo thống nhất
└── js/
    └── global.js           ← Kiểm tra & đảm bảo thống nhất
```

---

## 💡 LƯU Ý QUAN TRỌNG

1. **Không xóa React:** Vẫn giữ React nhưng chỉ thay className/styling
2. **Global.css:** Đảm bảo cả 2D & 3D import cùng một file
3. **Bootstrap JS:** Cần `bootstrap.bundle.min.js` để tab, modal, tooltip hoạt động
4. **Tương thích:** Test trên Chrome, Firefox, Safari, Edge

---

## 📞 CÂU HỎI THƯỜNG GẶP

**Q: Tại sao bỏ Tailwind CSS?**  
A: Bootstrap đã cung cấp class utilities đủ dùng, và 2D chỉ dùng Bootstrap. Thống nhất framework giảm bundle size.

**Q: React vẫn hoạt động không?**  
A: Có, React chỉ sinh JSX. Class name có thể là Tailwind hay Bootstrap đều được. Chúng ta chỉ thay từ `className="flex flex-col"` sang `className="d-flex flex-column"`.

**Q: Có cần cập nhật shortcol2D không?**  
A: Không, shortcol2D đã tốt rồi. Chỉ cần đảm bảo global.css & global.js thống nhất.

**Q: Có cần đổi component file (app-cal.js, app-out.js) không?**  
A: Có, để match visual & functionality với 2D. Nhưng logic tính toán giữ nguyên.

---

**Cập nhật lần cuối:** 12/12/2025 | Người cập nhật: Assistant
