---
layout: splash
title: "Về HydroStructAI"
permalink: /about/
header:
  overlay_color: "#0d6efd"
  overlay_filter: "0.5"
  overlay_image: "/assets/images/hero-engineering.jpg"
  caption: "Kết nối Kỹ thuật Thủy lợi - Kết cấu & Trí tuệ nhân tạo"
---

<link rel="stylesheet" href="/assets/css/custom-home.css">

<style>
  .about-card {
    background: #ffffff;
    padding: 2.5rem;
    border-radius: 8px;
    border: 1px solid #e1e4e8;
    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  }

  .about-card h3 {
    font-size: 1.4rem;
    color: #24292e;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 10px;
    margin-top: 2rem;
    margin-bottom: 1.2rem;
    font-weight: 700;
  }
  
  .about-card h3:first-of-type { margin-top: 0; }

  .about-card p {
    font-size: 1rem;
    line-height: 1.7;
    color: #444;
    margin-bottom: 1.2rem;
    text-align: justify;
  }

  .about-card strong { color: #000; font-weight: 600; }
  
  /* Highlight chữ Hydro - Struct - AI */
  code.highlighter {
    background-color: #f6f8fa;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    font-family: SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace;
    font-size: 0.9em;
    color: #d63384;
  }

  .about-card ul, .about-card ol {
    margin-bottom: 1.5rem;
    padding-left: 1.5rem;
  }
  
  .about-card li {
    margin-bottom: 0.8rem;
    line-height: 1.6;
    color: #444;
  }

  .author-intro {
    background: #f8f9fa;
    border-left: 4px solid #0d6efd;
    padding: 1rem 1.5rem;
    margin: 1.5rem 0;
    font-style: italic;
    color: #555;
  }

  .cta-link { color: #0d6efd; text-decoration: none; font-weight: bold; }
  .cta-link:hover { text-decoration: underline; }

  /* Mobile adjustment */
  @media (max-width: 768px) {
    .about-card { padding: 1.5rem; }
  }
</style>

<div class="home-wrapper">

  {% include sidebar-left.html %}

  <div class="center-content">
    
    <div class="about-card">
      
      <h3>Sứ mệnh của Chúng tôi</h3>
      <p>
        <strong>HydroStructAI</strong> là sự kết hợp của <code class="highlighter">Hydro</code> (Thủy lực/Công trình thủy) + <code class="highlighter">Structure</code> (Kết cấu xây dựng) + <code class="highlighter">AI</code> (Trí tuệ nhân tạo).
      </p>
      <p>
        Sứ mệnh của chúng tôi là <strong>đơn giản hóa các công cụ phân tích kỹ thuật phức tạp</strong>. Chúng tôi tin rằng mọi kỹ sư, nhà nghiên cứu và sinh viên đều xứng đáng có quyền truy cập vào các phần mềm mô phỏng mạnh mẽ mà không bị rào cản bởi chi phí bản quyền đắt đỏ hay yêu cầu phần cứng nặng nề.
      </p>

      <h3>Tầm nhìn: Kỹ thuật trên nền tảng Web</h3>
      <p>
        Trong nhiều thập kỷ, các phần mềm Kỹ thuật (CAE, FEM, CFD) luôn bị "trói buộc" vào các máy trạm (workstations) cồng kềnh.
      </p>
      <p>
        Tầm nhìn của chúng tôi là một tương lai nơi các phân tích phức tạp — từ mô phỏng Phần tử Hữu hạn (FEM) cho một tường cừ ván, đến mô hình thủy lực cho một lưu vực sông — đều có thể được thực hiện <strong>ngay trên trình duyệt web</strong> của bạn.
      </p>
      <p>
        Bằng cách khai thác sức mạnh của <strong>WebAssembly (WASM)</strong>, chúng tôi có thể "gói" các lõi tính toán hiệu suất cao (thường được viết bằng C++, Fortran, hoặc Rust) và mang chúng đến bất kỳ thiết bị nào, ở bất kỳ đâu.
      </p>

      <h3>Cách tiếp cận của Chúng tôi</h3>
      <p>Chúng tôi xây dựng dự án này dựa trên triết lý "Freemium" minh bạch:</p>
      <ol>
        <li>
          <strong>Miễn phí cho Giáo dục & Cộng đồng (Free):</strong><br>
          Các công cụ cốt lõi (như <code>SheetPileFEM-WASM</code>, <code>Taylor Series Visualizer</code>) sẽ luôn có phiên bản miễn phí, đầy đủ chức năng cơ bản. Đây là tài nguyên mở hỗ trợ sinh viên học tập và kỹ sư tra cứu nhanh.
        </li>
        <li>
          <strong>Chuyên nghiệp cho Doanh nghiệp (SaaS):</strong><br>
          Các phiên bản "Pro" dành cho kỹ sư chuyên nghiệp sẽ mở khóa các tính năng nâng cao (không giới hạn lớp đất, tính toán neo phức tạp, xuất báo cáo...) để duy trì sự phát triển của dự án.
        </li>
        <li>
          <strong>Blog là Tài liệu (Blog-as-Documentation):</strong><br>
          Blog của HydroStructAI không chỉ chia sẻ tin tức, mà còn là tài liệu chuyên sâu giải thích lý thuyết "Tại sao?" và "Như thế nào?" đằng sau mỗi thuật toán chúng tôi xây dựng.
        </li>
      </ol>

      <h3>Về Tác giả</h3>
      <div class="author-intro">
        <p style="margin: 0;">
          Tôi là <strong>Nguyễn Hải Hà</strong>, Tiến sĩ Kỹ thuật xây dựng công trình thủy, Chuyên gia về Công trình Thủy lợi / Bảo vệ bờ sông bờ biển / Kết cấu công trình / Địa kỹ thuật. Tôi có niềm đam mê sâu sắc về lập trình và ứng dụng công nghệ mới để giải quyết các bài toán kỹ thuật thực tế.
        </p>
      </div>
      <p>
        HydroStructAI là nỗ lực của tôi nhằm kết nối hai thế giới: sự chính xác của Kỹ thuật và sự linh hoạt của Phát triển Web hiện đại.
      </p>

      <h3>Kết nối</h3>
      <p>
        Chúng tôi luôn tìm kiếm sự hợp tác, phản hồi và ý tưởng mới. Nếu bạn có bất kỳ câu hỏi nào, hoặc muốn đóng góp cho dự án, xin vui lòng liên hệ qua email: <a href="mailto:ha.nguyen@hydrostructai.com" class="cta-link">ha.nguyen@hydrostructai.com</a>.
      </p>
      <p style="margin-top: 2rem; text-align: center;">
        <a href="/apps/" class="btn btn--primary btn--large">
          <i class="fas fa-rocket"></i> Khám phá ngay các Ứng dụng
        </a>
      </p>

    </div>
  </div>

  {% include sidebar-right.html %}

</div>