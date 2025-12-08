---
title: "Tiêu đề bài viết (Ngắn gọn & Chứa từ khóa)"
# Ví dụ: "Tự Động Hóa ETABS: Giải Mã File E2K Bằng Excel VBA"

date: 2025-12-08 10:00:00 +0700
last_modified_at: 2025-12-08 10:00:00 +0700 # Thêm dòng này nếu cập nhật bài viết

layout: single
author_profile: true
author_name: "HydroStruct AI" # Hoặc "TS. Nguyễn Hải Hà"

# Cấu hình Mục lục (TOC) - Rất quan trọng cho bài kỹ thuật dài
toc: true
toc_label: "Nội dung chính"
toc_icon: "list-ol"
toc_sticky: true # Mục lục trượt theo khi cuộn trang

categories: 
  - Engineering Automation
tags: 
  - [ETABS, VBA, Ansys, APDL, Tutorial]

# Ảnh đại diện (Hiển thị trên Grid và Facebook Share)
image: /assets/images/app-icons/etabs-vba.png

# (Tùy chọn) Ảnh Header to đẹp đầu bài viết
header:
  overlay_image: /assets/images/hero-engineering.jpg
  overlay_filter: 0.5 # Làm tối ảnh để chữ trắng dễ đọc
---


Chào bạn, tôi đã nghiên cứu kỹ toàn bộ các file `_posts`, `_includes`, và `assets` bạn cung cấp. Dựa trên cấu trúc của theme (Minimal Mistakes) và nội dung chuyên sâu về Kỹ thuật (Engineering) của bạn, tôi xin đề xuất **Quy chuẩn Định dạng (Standard Format)** để thống nhất toàn bộ website.

Mục tiêu: Hiện đại, chuyên nghiệp, dễ đọc (readability), và làm nổi bật phần Code (VBA/APDL) cũng như Công thức toán học.

-----

### 1\. Chuẩn hóa Front Matter (Phần đầu file Markdown)

Để các bài viết có giao diện thống nhất, mục lục tự động và ảnh đại diện đẹp, bạn nên dùng mẫu Front Matter chuẩn sau cho mọi bài viết mới:

```yaml
---
title: "Tiêu đề bài viết (Ngắn gọn & Chứa từ khóa)"
# Ví dụ: "Tự Động Hóa ETABS: Giải Mã File E2K Bằng Excel VBA"

date: 2025-12-08 10:00:00 +0700
last_modified_at: 2025-12-08 10:00:00 +0700 # Thêm dòng này nếu cập nhật bài viết

layout: single
author_profile: true
author_name: "HydroStruct AI" # Hoặc "TS. Nguyễn Hải Hà"

# Cấu hình Mục lục (TOC) - Rất quan trọng cho bài kỹ thuật dài
toc: true
toc_label: "Nội dung chính"
toc_icon: "list-ol"
toc_sticky: true # Mục lục trượt theo khi cuộn trang

categories: 
  - Engineering Automation
tags: 
  - [ETABS, VBA, Ansys, APDL, Tutorial]

# Ảnh đại diện (Hiển thị trên Grid và Facebook Share)
image: /assets/images/app-icons/etabs-vba.png

# (Tùy chọn) Ảnh Header to đẹp đầu bài viết
header:
  overlay_image: /assets/images/hero-engineering.jpg
  overlay_filter: 0.5 # Làm tối ảnh để chữ trắng dễ đọc
---
```

-----

### 2\. Chuẩn hóa hiển thị Code (VBA & APDL)

Đây là yêu cầu quan trọng nhất. Để code không chỉ là văn bản đen trắng mà trông giống như một **IDE (Môi trường lập trình) hiện đại**, chúng ta sẽ can thiệp vào CSS.

#### A. Cú pháp trong file Markdown (.md)

Bạn tiếp tục dùng cú pháp "3 dấu huyền" nhưng cần chính xác từ khóa ngôn ngữ:

**Đối với VBA:**

````markdown
```vba
Sub HelloWorld()
    ' Đây là comment
    MsgBox "Xin chào HydroStruct AI"
End Sub
```
````

**Đối với APDL (Ansys):**

````markdown
```apdl
! Đây là comment trong APDL
/PREP7
ET,1,SOLID65
MP,EX,1,2.1e5
```
````

#### B. Nâng cấp giao diện Code (CSS Magic)

Bạn hãy thêm đoạn code SCSS sau vào cuối file `assets/css/main.scss` (hoặc `global.css`). Đoạn này sẽ tạo ra thanh tiêu đề giống MacOS cho khung code và hiển thị tên ngôn ngữ.

```scss
/* --- MODERN CODE BLOCK STYLING --- */

/* 1. Khung bao quanh code */
div.highlighter-rouge {
  background: #282c34; /* Màu nền tối giống VS Code */
  border-radius: 8px;
  margin-bottom: 1.5em;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  position: relative;
  padding-top: 30px; /* Chừa chỗ cho thanh header giả */
  overflow: hidden;
}

/* 2. Thanh Header giả lập cửa sổ (Mac Style) */
div.highlighter-rouge:before {
  content: "";
  position: absolute;
  top: 12px;
  left: 15px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #ff5f56; /* Nút đỏ */
  box-shadow: 20px 0 0 #ffbd2e, 40px 0 0 #27c93f; /* Nút vàng và xanh */
  z-index: 2;
}

/* 3. Hiển thị Label ngôn ngữ (VBA, APDL, C++) */
div.highlighter-rouge:after {
  content: attr(class); /* Fallback */
  position: absolute;
  top: 5px;
  right: 15px;
  font-family: sans-serif;
  font-size: 0.75rem;
  font-weight: bold;
  color: #abb2bf;
  text-transform: uppercase;
}

/* Định nghĩa Label cụ thể cho từng ngôn ngữ */
.language-vba.highlighter-rouge:after { content: "VBA (Excel)"; color: #207245; }
.language-apdl.highlighter-rouge:after { content: "ANSYS APDL"; color: #ffb700; }
.language-cpp.highlighter-rouge:after { content: "C++ / WASM"; color: #00599C; }
.language-js.highlighter-rouge:after { content: "JavaScript"; color: #f7df1e; }

/* 4. Tinh chỉnh nội dung code */
div.highlighter-rouge pre.highlight {
  margin: 0;
  padding: 15px;
  background: transparent; /* Để lộ màu nền của div cha */
  color: #abb2bf; /* Màu chữ chính */
  font-family: "Consolas", "Monaco", monospace;
  font-size: 0.9em;
  line-height: 1.5;
  overflow-x: auto;
}

/* 5. Highlight màu (Nếu theme chưa hỗ trợ tốt Rouge) */
/* Comment màu xám xanh */
.highlight .c, .highlight .cm, .highlight .c1 { color: #7f848e; font-style: italic; }
/* String màu xanh lá */
.highlight .s, .highlight .s1, .highlight .s2 { color: #98c379; }
/* Keyword màu tím */
.highlight .k, .highlight .kd, .highlight .kp { color: #c678dd; font-weight: bold; }
```

-----

### 3\. Chuẩn hóa Cấu trúc Nội dung (Body)

Bài viết kỹ thuật nên tuân theo cấu trúc "Vấn đề - Giải pháp - Thực thi".

#### Format chung cho bài viết:

1.  **Đoạn dẫn (Introduction):** Không dùng tiêu đề, viết 1 đoạn ngắn giới thiệu bối cảnh.
2.  **Tiêu đề H2 (`##`):** Dùng cho các mục lớn (VD: Lý thuyết, Thuật toán, Code).
      * *Lưu ý:* Luôn viết hoa chữ cái đầu: `## 1. Lý Thuyết Tính Toán`.
3.  **Tiêu đề H3 (`###`):** Dùng cho các bước chi tiết.
4.  **Hình ảnh:**
    Thay vì dùng Markdown chuẩn, hãy dùng thẻ HTML để có chú thích (caption) chuẩn đẹp:
    ```html
    <figure class="align-center">
      <img src="/assets/images/posts/hinh-minh-hoa.jpg" alt="Mô tả ảnh">
      <figcaption>Hình 1: Mô hình phần tử hữu hạn đập bê tông (Nguồn: HydroStruct).</figcaption>
    </figure>
    ```
5.  **Công thức toán:** Dùng dấu `$` kẹp giữa (MathJax).
      * Inline: `$\sigma = E \cdot \epsilon$`
      * Block:
        ```latex
        $$ P_{cr} = \frac{\pi^2 EI}{(KL)^2} $$
        ```

-----

### 4\. Chuẩn hóa Nút bấm (Call-to-Action)

Trong các file markdown cũ, nút bấm chưa thống nhất. Hãy tạo một class chuẩn trong CSS và dùng HTML thống nhất ở cuối bài.

**CSS (Thêm vào `custom-home.css` hoặc `global.css`):**

```css
/* Nút CTA chuẩn hiện đại */
.btn-cta-primary {
  display: inline-block;
  padding: 12px 24px;
  background: linear-gradient(135deg, #0d6efd 0%, #0056b3 100%);
  color: white !important;
  font-weight: 600;
  text-decoration: none;
  border-radius: 50px; /* Bo tròn hoàn toàn */
  box-shadow: 0 4px 15px rgba(13, 110, 253, 0.3);
  transition: transform 0.2s, box-shadow 0.2s;
  text-align: center;
  margin-top: 20px;
}

.btn-cta-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(13, 110, 253, 0.4);
}

.btn-cta-primary i {
  margin-right: 8px;
}
```

**Sử dụng trong bài viết Markdown:**

```html
<div style="text-align: center; margin: 40px 0;">
    <a href="/apps/shortcol3d/" class="btn-cta-primary">
        <i class="fas fa-play-circle"></i> Trải Nghiệm Ứng Dụng Ngay
    </a>
</div>
```

-----

### 5\. Ví dụ áp dụng (File: `2025-12-08-etabs-vba.md`)

Sau khi áp dụng format mới, bài viết VBA của bạn sẽ trông như sau:

````markdown
---
title: "Tự Động Hóa ETABS: Giải Mã File E2K Bằng Excel VBA"
date: 2025-12-08 10:00:00 +0700
layout: single
author_profile: true
toc: true
toc_sticky: true
categories: [Automation]
tags: [ETABS, VBA, Excel]
image: /assets/images/app-icons/etabs-vba.png
---

Việc trích xuất dữ liệu từ ETABS thông qua API thường chậm chạp. Bài viết này giới thiệu kỹ thuật đọc trực tiếp file `.e2k`...

## 1. Cấu trúc File E2K

File `.e2k` là dạng text-base. Dưới đây là ví dụ cấu trúc:

```text
$ STORIES
  "Story1" 3.2  0  0
````

## 2\. Code VBA Xử Lý

Dưới đây là hàm `ReadE2K` được tối ưu hóa tốc độ:

```vba
Function ReadE2K(filePath As String) As Collection
    ' Khởi tạo Collection để lưu dữ liệu bộ nhớ
    Dim data As Collection
    Set data = New Collection
    
    Dim fso As Object
    Set fso = CreateObject("Scripting.FileSystemObject")
    
    ' ... Code xử lý ...
End Function
```

\<div style="text-align: center; margin: 40px 0;"\>
\<a href="/downloads/etabs-tool.xlsm" class="btn-cta-primary"\>
\<i class="fas fa-download"\>\</i\> Tải Tool Mẫu (Excel)
\</a\>
\</div\>

````

### Tổng kết hành động

1.  **Copy CSS:** Đưa đoạn CSS Code Block vào `main.scss`.
2.  **Sửa Front Matter:** Cập nhật lại các file markdown cũ thêm `toc: true` và `toc_sticky: true`.
3.  **Refactor Code Block:** Sửa lại các chỗ khai báo code thành ` ```vba ` hoặc ` ```apdl `.
4.  **Dùng HTML Figure:** Cho các ảnh cần chú thích chuyên nghiệp.
````