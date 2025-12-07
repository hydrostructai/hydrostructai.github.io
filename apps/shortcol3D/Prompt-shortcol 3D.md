
**PROMPT:**

Bạn là **chuyên gia kết cấu bê tông cốt thép**, chuyên mô phỏng **UTC – P–M–Mx–My** và phát triển **phần mềm phân tích mặt tương tác 3D** cho cột bê tông cốt thép chịu **nén lệch tâm xiên** theo các tiêu chuẩn (TCVN 5574:2018, EC2, ACI 318).


Tôi cung cấp cho bạn mã nguồn HTML + React + Plotly dưới đây.
**Yêu cầu của bạn là sửa lại toàn bộ logic, công thức và mô phỏng**, đảm bảo tạo ra **biểu đồ bao tương tác 3D Mx–My–N** đúng như lý thuyết thiết kế cột bê tông cốt thép **chịu nén lệch tâm xiên**.

---

## 🎯 **MỤC TIÊU ĐÚNG KỸ THUẬT**

Hãy sửa toàn bộ code để đảm bảo:

1. **Phân tích toàn bộ cấu trúc code, flow tính toán, thư viện, UI/UX, logic nhập xuất dữ liệu,  đặc biệt:

   * cấu trúc HTML templates
   * tổ chức CSS/JS
   * thư viện tính toán (JS hoặc wasm)
   * kiến trúc module
   * mô hình tính toán (input → xử lý → output → vẽ biểu đồ)

2. **Kế thừa hoàn toàn giao diện và stylesheet** từ:

   * `assets/css/global.css`
   * `assets/js/global.js`
   * layout, spacing, typography, màu sắc, UI component style của web app sheetpilefem.
   

### **1. ĐÚNG MÔ HÌNH VẬT LIỆU**

* Bê tông dùng **khối ứng suất phi tuyến/Whitney** nhưng phải áp dụng đúng theo tiêu chuẩn (TCVN, EC2, ACI).
* Thép dùng **mô hình song tuyến (bilinear)** hoặc **đàn hồi–dẻo lý tưởng** theo tiêu chuẩn.
* Giới hạn ứng suất và biến dạng:

  * TCVN: εcu = 0.0035
  * EC2: εcu2 = 0.0035 hoặc εcu3 = 0.0038 tùy cấp bền
  * ACI: εcu = 0.003
  * Thép: εy = fy/Es, εs ≥ ±0.01

### **2. ĐÚNG HÌNH HỌC – MẶT CẮT**

* Cải thiện thuật toán chia lưới sợi (fiber mesh) để đảm bảo độ chính xác cao.
* Hỗ trợ:

  * mặt cắt chữ nhật
  * mặt cắt tròn
* Bố trí thép theo hình học thực.

### **3. ĐÚNG ĐỊNH NGHĨA MẶT PHẲNG BIẾN DẠNG**

Mặt phẳng biến dạng tổng quát 3D:
[
\varepsilon(x, y) = \varepsilon_0 + \kappa_x \cdot y - \kappa_y \cdot x
]

Không sử dụng cách xoay trục đơn giản thiếu độ chính xác.
Không được dùng cách “k = d/c” đơn hướng.

### **4. TÍNH TẢI TRỌNG TỪ BIẾN DẠNG**

Tính lực – mô men theo tích phân sợi:

[
N = \sum \sigma_i dA_i
]
[
M_x = \sum \sigma_i \cdot y_i dA_i
]
[
M_y = \sum \sigma_i \cdot x_i dA_i
]

### **5. TẠO FULL HÌNH DẠNG TƯƠNG TÁC 3D**

* Bao tương tác 3D phải **liên tục**, không bị thủng, không bị lỗ.
* Không sử dụng các điểm ước lượng sai như Po kéo/nén thuần túy chưa tính đúng vật liệu.
* Sử dụng grid tham số:

  * ε₀ từ –0.01 → +0.0035
  * κx và κy cho phép quay mặt phẳng biến dạng trong toàn bộ không gian.

### **6. SỬA LỖI TRONG CODE GỐC**

* Logic xoay trục NA theo theta đang sai → phải thay bằng hệ **ε₀, κx, κy**.
* Stress block bê tông đang dùng nhầm điều kiện.
* Biến dạng của thanh thép sai dấu và sai reference NA.
* Tính d_fib và d_bar phải dùng phương trình biến dạng 3D, không dùng phép chiếu cosθ/sinθ.
* Tọa độ NA đang sai → cần định nghĩa lại mặt phẳng neutral axis đúng trong không gian.

### **7. KẾT QUẢ TRẢ RA**

Hãy trả lại cho tôi:

1. **Toàn bộ code đã sửa sạch**, chạy được ngay.
2. **Mô tả các thay đổi trọng yếu** để tôi kiểm tra.
3. **Cấu trúc function mới rõ ràng**, gồm:

   * computeStrain3D
   * computeStressConcrete
   * computeStressSteel
   * integrateSection
   * generatePMMSurface

### **8. KHÔNG ĐƯỢC:**

* Không được viết lại UI.
* Không được thay đổi phần nhập liệu.
* Không được dùng thuật toán xấp xỉ đơn giản.
* Không được dùng lại logic quay theta như mã cũ.
* Không được tạo bao tương tác từ mesh3d thiếu dữ liệu.

---

# ✅ **KẾT QUẢ MONG MUỐN**
cấu trúc các file code gồm:
index.html
app-cal.js
app-out.js
shortcol3D.js

Bạn phải sửa xong để:

* Bao tương tác 3D trơn tru, đúng hình, không rách.
* Không sai mô men ở 4 góc và 8 trục.
* Đúng với lý thuyết cột lệch tâm xiên trong **TCVN — EC2 — ACI**.
+ File index.html Fix lỗi Overlay Thêm style="visibility: hidden; opacity: 0;" vào thẻ #loading-overlay để mặc định nó không hiện ra che khuất form.
* Sai số lực < 1%.

Dưới đây là mã nguồn cần sửa:
