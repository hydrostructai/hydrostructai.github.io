---
layout: splash
title: "HỆ THỐNG WEB APPS CHO KỸ THUẬT XÂY DỰNG"
header:
  overlay_color: "#0d6efd"
  overlay_filter: "0.3"
  overlay_image: "/assets/images/hero-engineering.jpg"
  caption: "Công cụ chuyên nghiệp cho kỹ sư kết cấu và địa kỹ thuật"
author_profile: true
---

<div class="page__hero--overlay">
  <div class="wrapper">
    <h1 class="page__title" style="color: white; text-align: center; margin-bottom: 1rem;">Engineering Web Apps</h1>
    <p class="page__lead" style="color: white; text-align: center; font-size: 1.2rem; max-width: 800px; margin: 0 auto;">
      Các công cụ phân tích phần tử hữu hạn (FEM) tiên tiến, chạy trực tiếp trên trình duyệt dành cho kỹ sư xây dựng.
    </p>
  </div>
</div>

<div class="apps-grid-container">
  <div class="container" style="max-width: 1400px; margin: 0 auto; padding: 0 1rem;">
    
    <div class="row g-4 display-flex">
      
      <div class="col-lg-4 col-md-6">
        <div class="app-card">
          <div class="app-card-image">
            <img src="/assets/images/app-icons/pile-group2.png" alt="Lateral Pile Analysis" class="img-fluid">
          </div>
          <div class="app-card-body">
            <h3 class="app-card-title">
              <i class="bi bi-arrow-right-square-fill"></i> Cọc Chịu Tải Ngang
            </h3>
            <div class="app-card-badges">
              <span class="badge bg-primary">PTHH Phi tuyến</span>
              <span class="badge bg-danger">Đường cong p-y</span>
              <span class="badge bg-info">TCVN 10304</span>
            </div>
            <p class="app-card-description">
              Phân tích chuyên sâu cọc đơn chịu tải trọng ngang và momen. Ứng dụng sử dụng mô hình <strong>đường cong p-y phi tuyến</strong> để mô phỏng tương tác đất - kết cấu theo tiêu chuẩn TCVN 10304:2025, API RP2A và Eurocode. Kết quả bao gồm biểu đồ chuyển vị, momen uốn, lực cắt và phản lực đất.
            </p>
            <div class="app-card-features">
              <h6><i class="bi bi-check-circle-fill text-success"></i> Tính năng nổi bật:</h6>
              <ul>
                <li>Phân tích p-y phi tuyến (Đất dính/Đất rời)</li>
                <li>Hỗ trợ TCVN 10304, API RP2A, Eurocode</li>
                <li>Mô hình địa chất nhiều lớp</li>
                <li>Điều kiện đầu cọc: Tự do, Ngàm, Lò xo</li>
                <li>Kiểm tra khả năng chịu tải của vật liệu cọc</li>
                <li>Biểu đồ tương tác trực quan</li>
              </ul>
            </div>
            <div class="app-card-footer">
              <a href="/apps/lateralpile/" class="btn btn-primary btn-lg w-100">
                <i class="bi bi-play-circle-fill"></i> Chạy Ứng Dụng
              </a>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-4 col-md-6">
        <div class="app-card">
          <div class="app-card-image">
            <img src="/assets/images/app-icons/sheet pile.png" alt="Sheet Pile FEM" class="img-fluid">
          </div>
          <div class="app-card-body">
            <h3 class="app-card-title">
              <i class="bi bi-diagram-3"></i> Tính Toán Tường Cừ
            </h3>
            <div class="app-card-badges">
              <span class="badge bg-primary">Phần tử hữu hạn</span>
              <span class="badge bg-success">WebAssembly</span>
              <span class="badge bg-info">Hố đào sâu</span>
            </div>
            <p class="app-card-description">
              Công cụ PTHH mạnh mẽ để thiết kế tường cừ và tường vây. Hỗ trợ bài toán tương tác đất nền phức tạp, <strong>thi công theo giai đoạn</strong> (Multi-stage), và các hệ văng chống (strut) hoặc neo trong đất (ground anchor). Tối ưu cho các bài toán hố đào sâu.
            </p>
            <div class="app-card-features">
              <h6><i class="bi bi-check-circle-fill text-success"></i> Tính năng nổi bật:</h6>
              <ul>
                <li>Phân tích thi công theo nhiều giai đoạn</li>
                <li>Mô hình neo chi tiết (cao trình, góc nghiêng)</li>
                <li>Tương tác đất - kết cấu (Đàn hồi dẻo)</li>
                <li>Tải trọng điểm và tải trọng rải đều</li>
                <li>Tính toán áp lực nước và dòng thấm</li>
                <li>Xuất biểu đồ nội lực, chuyển vị chi tiết</li>
              </ul>
            </div>
            <div class="app-card-footer">
              <a href="/apps/sheetpilefem/" class="btn btn-primary btn-lg w-100">
                <i class="bi bi-play-circle-fill"></i> Chạy Ứng Dụng
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-lg-4 col-md-6">
        <div class="app-card">
          <div class="app-card-image">
            <img src="/assets/images/app-icons/pile-group.png" alt="Pile Group 3D" class="img-fluid">
          </div>
          <div class="app-card-body">
            <h3 class="app-card-title">
              <i class="bi bi-grid-3x3-gap-fill"></i> Nhóm Cọc 3D
            </h3>
            <div class="app-card-badges">
              <span class="badge bg-primary">Phân tích 3D</span>
              <span class="badge bg-success">WebAssembly</span>
              <span class="badge bg-warning text-dark">Zavriev-Spiro</span>
            </div>
            <p class="app-card-description">
              Ứng dụng phân tích không gian 3D cho nhóm cọc dựa trên phương pháp <strong>Zavriev-Spiro</strong>. Tính toán nội lực và chuyển vị cho móng nhà cao tầng. Cho phép bố trí cọc linh hoạt (cọc xiên/thẳng) và tối ưu hóa thiết kế đài cọc.
            </p>
            <div class="app-card-features">
              <h6><i class="bi bi-check-circle-fill text-success"></i> Tính năng nổi bật:</h6>
              <ul>
                <li>Phân tích nhóm cọc 3D (Zavriev-Spiro)</li>
                <li>Hỗ trợ cọc thẳng đứng và cọc xiên</li>
                <li>Bố trí mặt bằng cọc tùy ý (Tọa độ X, Y)</li>
                <li>Mô hình đất nền thông qua hệ số nền</li>
                <li>Tải trọng tổng hợp: Lực dọc, Cắt, Momen xoắn</li>
                <li>Trực quan hóa chuyển vị đài cọc</li>
              </ul>
            </div>
            <div class="app-card-footer">
              <a href="/apps/pilegroup/" class="btn btn-primary btn-lg w-100">
                <i class="bi bi-play-circle-fill"></i> Chạy Ứng Dụng
              </a>
            </div>
          </div>
        </div>
      </div>
      
    </div>
    
    <div class="row mt-5">
      <div class="col-12">
        <div class="info-box">
          <h4 style="color: #0d6efd; margin-bottom: 1rem;">
            <i class="bi bi-info-circle-fill"></i> Về Công Nghệ
          </h4>
          <p>
            Tất cả các ứng dụng đều sử dụng công nghệ <strong>WebAssembly</strong>, giúp biên dịch mã nguồn C++ tính toán phần tử hữu hạn để chạy trực tiếp trên trình duyệt của bạn với tốc độ cao. Điều này mang lại lợi ích:
          </p>
          <div class="row mt-3">
            <div class="col-md-4">
              <div class="info-item">
                <i class="bi bi-lightning-charge-fill text-warning" style="font-size: 2rem;"></i>
                <h6>Tốc Độ Cực Nhanh</h6>
                <p>Tính toán với tốc độ native ngay trên web.</p>
              </div>
            </div>
            <div class="col-md-4">
              <div class="info-item">
                <i class="bi bi-shield-fill-check text-success" style="font-size: 2rem;"></i>
                <h6>Bảo Mật & Riêng Tư</h6>
                <p>Dữ liệu nằm hoàn toàn trên máy của bạn.</p>
              </div>
            </div>
            <div class="col-md-4">
              <div class="info-item">
                <i class="bi bi-cloud-slash-fill text-primary" style="font-size: 2rem;"></i>
                <h6>Hoạt Động Offline</h6>
                <p>Không cần máy chủ sau khi tải trang lần đầu.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <div class="row mt-5">
      <div class="col-12">
        <h3 style="text-align: center; margin-bottom: 2rem; color: #333;">
          <i class="bi bi-tools"></i> Các Công Cụ Trực Quan Hóa Khác
        </h3>
        <div class="tools-list">
          <ul style="font-size: 1.1rem; line-height: 2;">
            <li><a href="/tools/circlearea/"><i class="bi bi-circle"></i> Tính Diện Tích Hình Tròn Tiếp Xúc (Apollonius)</a> - Bài toán hình học phẳng</li>
            <li><a href="/tools/hypocycloid/"><i class="bi bi-arrow-repeat"></i> Vẽ Đường Cong Hypocycloid</a> - Mô phỏng toán học</li>
            <li><a href="/tools/taylor-series/"><i class="bi bi-graph-up"></i> Mô Phỏng Chuỗi Taylor</a> - Giải thích xấp xỉ hàm số</li>
            <li><a href="/tools/heartdrawing/"><i class="bi bi-heart-fill"></i> Vẽ Trái Tim Tham Số</a> - Đồ thị hàm số tham số</li>
          </ul>
        </div>
      </div>
    </div>
    
  </div>
</div>

<style>
/* Modern Font Stack */
.apps-grid-container {
  padding: 4rem 0;
  background: #f8f9fa;
  font-family: 'Inter', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.app-card {
  background: white;
  border-radius: 12px;
  border: 1px solid rgba(0,0,0,0.05);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.app-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

.app-card-image {
  width: 100%;
  height: 220px;
  overflow: hidden;
  background: linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%); /* Lighter, modern gradient */
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.app-card-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));
  transition: transform 0.3s ease;
}

.app-card:hover .app-card-image img {
  transform: scale(1.05);
}

.app-card-body {
  padding: 1.75rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}

.app-card-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.75rem;
  letter-spacing: -0.02em;
}

.app-card-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
}

.badge {
  padding: 0.5em 0.75em;
  font-weight: 600;
  border-radius: 6px;
  font-size: 0.75rem;
  letter-spacing: 0.03em;
}

.app-card-description {
  color: #555;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  font-size: 0.95rem;
  flex-grow: 1;
  text-align: justify;
}

.app-card-features {
  background: #f8f9fa;
  padding: 1.25rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  font-size: 0.9rem;
  border: 1px solid #eee;
}

.app-card-features h6 {
  margin-bottom: 0.75rem;
  font-weight: 700;
  color: #333;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 0.05em;
}

.app-card-features ul {
  margin: 0;
  padding-left: 1.25rem;
}

.app-card-features li {
  margin-bottom: 0.35rem;
  color: #4a5568;
}

.app-card-footer {
  margin-top: auto;
}

.btn-lg {
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

/* Info Box Styles */
.info-box {
  background: white; 
  padding: 2.5rem; 
  border-radius: 12px; 
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  border: 1px solid rgba(0,0,0,0.05);
}

.info-item { text-align: center; padding: 1rem; }
.info-item h6 { margin-top: 1rem; font-weight: 700; color: #333; }
.info-item p { margin: 0; color: #666; font-size: 0.9rem; line-height: 1.5; }

/* Tools List Styles */
.tools-list {
  background: white; 
  padding: 2rem; 
  border-radius: 12px; 
  box-shadow: 0 4px 6px rgba(0,0,0,0.02);
  border: 1px solid rgba(0,0,0,0.05);
}
.tools-list ul { list-style: none; padding: 0; }
.tools-list li { padding: 0.75rem 0; border-bottom: 1px solid #f0f0f0; }
.tools-list li:last-child { border-bottom: none; }
.tools-list a { 
  text-decoration: none; 
  color: #0d6efd; 
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 10px;
}
.tools-list a:hover { color: #0b5ed7; transform: translateX(5px); }

@media (max-width: 768px) {
  .app-card-image { height: 200px; }
  .app-card-title { font-size: 1.25rem; }
}
</style>