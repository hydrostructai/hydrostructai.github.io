---
title: "Giới thiệu và Hướng dẫn sử dụng phần mềm Calcpad trong Kỹ thuật Xây dựng"
author_profile: true
author_name: "HST.AI"
date: 2026-01-21 10:00:00 +0700
layout: single
mathjax: true
toc: true
toc_sticky: true
toc_label: "📑 Mục Lục"
categories:
  - Software
  - Engineering
tags:
  [
    Calcpad,
    Automation,
    Structural Engineering,
    Technical Report,
  ]
---

**[Xem chi tiết các báo cáo mẫu tại đây](https://hydrostructai.com/calcpad_engineering/calcpad.html)**

---

Calcpad là công cụ tính toán kỹ thuật mạnh mẽ cho phép bạn viết các phép tính phức tạp dưới dạng văn bản và tự động tạo báo cáo chuyên nghiệp.

**Website Calcpad:** [https://www.calcpad.eu](https://www.calcpad.eu)

---

## 📖 Giới thiệu Calcpad

### Calcpad là gì?
Calcpad cho phép bạn:
- ✅ Viết phương trình toán học dạng văn bản đơn giản
- ✅ Tự động tính toán và hiển thị kết quả
- ✅ Tạo báo cáo chuyên nghiệp (HTML + PDF)
- ✅ Giữ lịch sử tính toán rõ ràng
- ✅ Chia sẻ công việc dễ dàng qua file `.cpd`

### Tại sao dùng Calcpad?
- 📊 **Rõ ràng:** Mọi công thức và kết quả đều có thể nhìn thấy
- 🔄 **Tái sử dụng:** Thay đổi giá trị đầu vào → kết quả tự động cập nhật
- 📁 **Dễ lưu trữ:** Một file `.cpd` chứa mọi thứ
- 🌐 **Chia sẻ:** Tạo HTML/PDF để gửi cho đồng nghiệp
- ⚡ **Nhanh:** Viết công thức nhanh hơn Excel hoặc tính máy

---

## 🎯 Tính Năng Chính

| Tính Năng | Mô Tả |
|-----------|-------|
| **Biến số** | Khai báo biến và gán giá trị |
| **Công thức** | Viết phương trình toán học |
| **Đơn vị** | Tự động chuyển đổi đơn vị |
| **Dự toán** | Kiểm tra kết quả với `=?` |
| **Văn bản** | Thêm mô tả bằng dấu ngoặc kép `"..."` |
| **Đồ thị** | Vẽ sơ đồ và biểu đồ |
| **HTML/PDF** | Xuất báo cáo chuyên nghiệp |

---

## 🚀 Bắt Đầu Nhanh (5 Phút)

### Bước 1: Tạo File `.cpd`

Tạo file text tên `my_analysis.cpd` với nội dung:

```calcpad
"Báo cáo Phân tích Dầm"
'Bước 1: Nhập dữ liệu
L = 6 "Dài nhịp (m)"
P = 50 "Tải trọng (kN)"
I = 0.005 "Moment quán tính (m⁴)"

'Bước 2: Tính toán
M = P * L / 4 "Moment uốn (kNm)"
σ = M / (I / 0.3) "Ứng suất (kPa)"

'Bước 3: Kiểm tra kết quả
M = ? "Moment uốn = ?"
σ = ? "Ứng suất = ?"
```

### Bước 2: Chạy Calcpad

**Trên Windows/Mac:**
1. Mở Calcpad Editor
2. File → Open → Chọn `my_analysis.cpd`
3. Nhấn "Generate" hoặc Ctrl+G
4. Xem kết quả tạo thành file `my_analysis.html`

**Trên Linux/WSL:**
```bash
calcpad my_analysis.cpd
```

### Bước 3: Sử dụng Calcpad trên VS Code (Khuyên dùng)
Sử dụng VS Code giúp bạn viết code nhanh hơn nhờ tính năng gợi ý (Intellisense) và xem kết quả ngay lập tức.

1. **Cài đặt:** Mở VS Code, nhấn `Ctrl+Shift+X`, tìm "Calcpad" hoặc cài từ file `.vsix`.
2. **Chạy tính toán:** Nhấn **`Ctrl+Shift+B`**, báo cáo HTML sẽ hiện ra ở cửa sổ bên cạnh.
3. **Mở phần mềm gốc:** Nhấn `Ctrl+Shift+O` để mở file trong Calcpad Editor.
4. **Cấu hình trên WSL/Linux:** 
   Nếu bạn dùng Linux hoặc WSL, cần vào **Settings** (`Ctrl+,`) và chỉnh lại đường dẫn:
   - `calcpad.cliPath`: `/usr/local/bin/calcpad`
   - `calcpad.Path`: `/usr/local/bin/calcpad`
   - `calcpad.settingsPath`: `$HOME/.calcpad/Settings.xml`

### Bước 4: Xem Kết Quả
- ✅ File `my_analysis.html` được tạo
- ✅ Mở trong trình duyệt hoặc WebView của VS Code để xem báo cáo
- ✅ In hoặc lưu thành PDF bằng `wkhtmltopdf`

---

## 📝 Cú Pháp Calcpad Cơ Bản

### 1. Khai Báo Biến

```calcpad
L = 6              'Biến không có đơn vị
L = 6 "m"          'Biến có đơn vị (mét)
L = 6 "mm" = ? "m" 'Chuyển đổi đơn vị (từ mm sang m)
```

### 2. Phép Toán

```calcpad
A = 5 + 3
B = A * 2
C = 10 / 5
D = 2 ^ 3          'Lũy thừa (2³ = 8)
E = √16            'Căn bậc hai
```

### 3. Văn Bản Giải Thích

```calcpad
'Dòng bắt đầu với dấu ngoặc đơn (') là bình luận
"Dòng này sẽ hiển thị trong báo cáo"
"Bước 1: Tính diện tích"
```

### 4. Hiển Thị Kết Quả

```calcpad
M = 50 * 6 / 4    'Tính moment
M = ?             'Hiển thị kết quả: M = 75 kNm
```

### 5. Định Dạng Đầu Ra

```calcpad
M = 75
M = 75%           'Phần trăm: 75%
M = 75#2          'Làm tròn 2 chữ số thập phân
M = 75!           'Bỏ qua hiển thị (giấu kết quả)
```

---

## 💡 Ví Dụ Thực Tế

### Ví Dụ 1: Tính Diện Tích Hình Chữ Nhật

```calcpad
"Diện Tích Hình Chữ Nhật"
b = 5 "m" 'Chiều rộng
h = 3 "m" 'Chiều dài
A = b * h "m²" 'Diện tích
A = ? "Diện tích = ?"
```

### Ví Dụ 2: Tính Moment Uốn Dầm Đơn Giản

```calcpad
"Phân Tích Dầm Đơn Giản Chịu Tải Trọng Tập Trung"

'Dữ liệu đầu vào
L = 6 "m" 'Chiều dài dầm
P = 100 "kN" 'Tải trọng tập trung ở giữa nhịp
a = L / 2 "m" 'Vị trí tải trọng

'Tính toán phản lực
R_A = P * (L - a) / L "kN"
R_B = P * a / L "kN"

'Moment uốn tại giữa nhịp
M_max = P * a * (L - a) / L "kNm"

'Hiển thị kết quả
"Phản lực tại A:"
R_A = ? 

"Phản lực tại B:"
R_B = ?

"Moment uốn cực đại:"
M_max = ?
```

### Ví Dụ 3: Tính Toán Thép Cốt

```calcpad
"Thiết Kế Thép Cốt Cho Dầm Bê Tông"

'Dữ liệu
M = 75 "kNm" 'Moment tác dụng
f_y = 400 "MPa" 'Cường độ chảy thép
f_c = 30 "MPa" 'Cường độ nén bê tông
d = 0.5 "m" 'Độ sâu hiệu dụng

'Tính diện tích thép cần thiết
M_N = M * 1000 "kN"
A_s_min = M_N / (0.87 * f_y * d) "cm²"

"Diện tích thép cần thiết:"
A_s_min = ?

"Chọn thép: 4Φ20 = 12.57 cm² ✓"
```

---

## 🎨 Định Dạng Văn Bản

### Heading (Tiêu Đề)

```calcpad
"Tiêu đề Chính"           'Heading 1
"_Tiêu đề Phụ"           'Heading 2
"__Tiêu đề Phụ Phụ"      'Heading 3
```

### In Đậm, Nghiêng

```calcpad
"Văn bản **đậm**"          'In đậm
"Văn bản **_nghiêng_**"   'Nghiêng
"Văn bản ***đậm nghiêng***"
```

### Danh Sách

```calcpad
"Danh sách gạch đầu dòng:
• Mục 1
• Mục 2
• Mục 3"

"Danh sách số:
1. Mục 1
2. Mục 2
3. Mục 3"
```

---

## 🌐 Từ Calcpad Sang HTML/PDF

### Tại Sao Xuất HTML/PDF?
- 📤 **Chia sẻ:** Gửi báo cáo cho đồng nghiệp không cần Calcpad
- 🖨️ **In ấn:** In báo cáo chuyên nghiệp từ HTML
- 📎 **Lưu trữ:** Lưu bản sao lưu định kỳ
- 🌐 **Công bố:** Đăng lên website

### Cách Xuất

**Calcpad Editor:**
1. Mở file `.cpd`
2. Nhấn "Generate" (Ctrl+G)
3. Tìm file `.html` được tạo ra cùng thư mục

**Từ dòng lệnh:**
```bash
calcpad my_analysis.cpd
# Tạo file: my_analysis.html
```

**Tạo PDF:**
```bash
wkhtmltopdf my_analysis.html my_analysis.pdf
```

---

## ⚡ Mẹo & Thủ Thuật

### 1. Tái Sử Dụng Template
Lưu file `.cpd` làm template, sau đó:
```bash
cp template.cpd my_new_analysis.cpd
```
Chỉnh sửa giá trị đầu vào, kết quả tự động cập nhật!

### 2. Nhóm Biến Liên Quan
```calcpad
'Vật liệu bê tông
f_c = 30 "MPa"
E_c = 25000 "MPa"

'Vật liệu thép
f_y = 400 "MPa"
E_s = 200000 "MPa"
```

### 3. Kiểm Tra Độc Lập
```calcpad
'Tính toán chính
M = 75 "kNm"

'Kiểm tra lại bằng công thức khác
M_check = P * L / 4
M_check = ?

'Nếu kết quả bằng nhau thì ✓ đúng
```

### 4. Ẩn Các Phép Tính Trung Gian
```calcpad
temp = 5 * 10 'Ẩn không hiển thị
result = temp / 2
result = ? 'Chỉ hiển thị kết quả cuối
```

---

## 🛠 Xử Lý Sự Cố

| Vấn Đề | Giải Pháp |
|--------|---------|
| **Lỗi cú pháp** | Kiểm tra dấu ngoặc kép, dấu phẩy, toán tử |
| **Không tính toán được** | Kiểm tra đơn vị, biến chưa khai báo |
| **HTML không được tạo** | Chắc chắn file `.cpd` không có lỗi cú pháp |
| **PDF lỗi định dạng** | Kiểm tra Calcpad đã tạo HTML thành công |

---

## 👨‍💼 Hỗ Trợ

**Các câu hỏi thường gặp:**
1. Làm cách nào để viết căn bậc hai? `√` hoặc `sqrt()`
2. Làm cách nào để chuyển đơn vị? `L = 1000 "mm" = ? "m"`
3. Làm cách nào để ẩn dòng tính toán? Thêm `!` vào cuối

Xem thêm: [https://www.calcpad.eu/docs](https://www.calcpad.eu/docs)

---

## 📝 License

MIT License

---

**Cập nhật cuối:** 2026-01-22
