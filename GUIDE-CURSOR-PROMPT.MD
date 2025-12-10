Lệnh mẫu (Copy & Paste vào khung chat):

Để tạo app mới:

"@cursor_prompts.yml Hãy thực hiện task create_tool với tên là 'HydroFlowCalc', dùng công thức Manning để tính vận tốc dòng chảy trong kênh hở."

Để viết bài mới:

"@cursor_prompts.yml Thực hiện task new_post với chủ đề 'Ứng dụng AI trong dự báo lũ lụt'."

Để Debug nhanh:

"@cursor_prompts.yml Thực hiện task debug_build vì tôi đang gặp lỗi build local."

-------

Dưới đây là bảng **List English Prompt** tối ưu hóa cho Cursor (sử dụng Sonnet 4.5 hoặc Gemini 3 Pro) để thực hiện 2 nhiệm vụ: **Debug lỗi màn hình trắng** và **Viết bài đăng kỹ thuật ngày 10/12/2025**.

Các prompt được thiết kế theo nguyên tắc: **Context-Aware** (nhận diện ngữ cảnh), **Low-Token** (tiết kiệm chi phí), và **High-Precision** (độ chính xác cao).

### Bảng Prompt Lập Trình & Viết Bài (Expert Level)

| Task Name | Reference / Files | Optimized English Prompt (Copy vào Cursor Composer) | Mục tiêu & Logic |
| :--- | :--- | :--- | :--- |
| **1. Debug White Screen (Quick Check)** | `@_config.yml` <br> `@_layouts/default.html` <br> `@assets/css/` | `Analyze the project structure to diagnose the "White Screen of Death" on GitHub Pages deployment. Focus on these potential issues: 1. Check if 'baseurl' and 'url' in _config.yml match the repo name exactly. 2. Verify if the 'assets' paths in _layouts/default.html include {{ site.baseurl }}. 3. Check for any Mixed Content errors (http vs https). Propose a fix code block immediately.` | **Chi phí thấp nhất.** Kiểm tra cấu hình đường dẫn (lỗi phổ biến nhất gây trắng trang) trước khi đào sâu vào code. |
| **2. Debug White Screen (Deep Dive)** | `@assets/js/` <br> `@_includes/head.html` | `The config seems fine, but the site is still blank. Deep scan the JavaScript files and the <head> tag. Are there any blocking scripts or React hydration errors? Check if the theme requires a specific build command like 'jekyll build' vs 'bundle exec jekyll serve'. Output the corrected build workflow file for GitHub Actions (.github/workflows/jekyll.yml).` | Dùng khi bước 1 thất bại. Kiểm tra lỗi JS chặn render hoặc quy trình CI/CD sai. |
| **3. Data Parsing (Pre-processing)** | `@Tinh doc nuoc-HQD5...CSV` (All 4 files) <br> `@2.3.3 PLTT...pdf` | `Review the attached CSV files representing hydraulic calculations (Chute Spillway & Energy Dissipation) and the PDF report. Extract the key parameters: Flow velocity (V), Water depth (h), and Froude number (Fr) for both 'Design Flood' (LuTK) and 'Check Flood' (LuKT). Summarize the naming convention of the columns to prepare for a blog post. No code needed yet, just understand the data structure.` | **Chuẩn bị Context.** Giúp AI "học" dữ liệu trước khi viết, tránh hallucination (bịa số liệu). |
| **4. Write Blog Post (Core Task)** | **Inputs:** <br> - All CSVs <br> - PDF File <br> **Output:** <br> `_posts/2025-12-10-hydraulic-calculation.md` | `Act as a Senior Hydraulic Engineer. Create a new blog post file: '_posts/2025-12-10-chute-spillway-calculation.md'. <br><br> **Content Requirements:** <br> 1. **Title:** "Hydraulic Calculation of Chute Spillways and Energy Dissipation". <br> 2. **Context:** Summarize the methodology from the PDF (Section 2.3.3 Straight Chute). <br> 3. **Data Analysis:** Create a Markdown comparison table using data from the CSVs. Compare 'Velocity (V)' and 'Depth (h)' at the end of the chute (Station roughly near end) for Case 1 (LuTK) vs Case 2 (LuKT). <br> 4. **Visuals:** Add placeholders for graphs: ![Velocity Graph](/assets/images/v-graph.png). <br> 5. **Conclusion:** Evaluate if the energy dissipation is effective based on the Froude number in the CSVs. <br> **Format:** Clean Markdown, English language, professional tone.` | **Bài viết hoàn chỉnh.** Kết hợp lý thuyết (PDF) và số liệu thực tế (CSV) để tạo bài viết chuyên sâu đúng ngày yêu cầu. |
| **5. Post-Processing (Translation)** | `current_active_file` | `Translate the content of this markdown file into Vietnamese, maintaining technical terms (e.g., Froude, Cavitation, Aeration). Keep the Front Matter in English. Ensure the tone is academic and suitable for the 'hydrostructai' engineering blog.` | Chuyển ngữ sang tiếng Việt chuyên ngành sau khi đã có sườn bài chuẩn từ AI. |

-----

### Phân tích chiến lược & Lựa chọn API (Dựa trên hình ảnh bạn cung cấp)

Để thực hiện nhiệm vụ này hiệu quả và tiết kiệm nhất, tôi đề xuất chiến lược lựa chọn Model như sau:

#### 1\. Nhiệm vụ Debug (Sửa lỗi GitHub Pages trắng trang)

  * **Model khuyên dùng:** **Gemini 3 Pro** (hoặc GPT-5.1 nếu Gemini chưa giải quyết được).
  * **Lý do:** Lỗi "trắng trang" thường liên quan đến cấu hình hệ thống rộng hoặc xung đột thư viện. Gemini có cửa sổ ngữ cảnh (Context Window) lớn và khả năng suy luận logic hệ thống tốt, nó có thể đọc toàn bộ cấu trúc repo để tìm ra chỗ cấu hình sai `baseurl` nhanh hơn Sonnet.
  * **Chi phí:** Thấp/Trung bình.

#### 2\. Nhiệm vụ Viết bài & Xử lý dữ liệu (CSVs + PDF)

  * **Model khuyên dùng:** **Sonnet 4.5** (như trong hình).
  * **Lý do:**
      * **Khả năng đọc file:** Sonnet xử lý file đính kèm (PDF/CSV) cực tốt, ít khi bịa số liệu (hallucination) so với các model khác.
      * **Coding Markdown:** Sonnet tạo bảng Markdown từ CSV rất sạch, căn lề chuẩn.
      * **Technical Writing:** Văn phong của Sonnet (Claude) tự nhiên và mang tính chuyên gia hơn GPT (thường hơi máy móc).
  * **Chi phí:** Tối ưu cho output chất lượng cao.

### Hướng dẫn thực hiện trên Cursor

1.  **Bước 1 (Debug):** Mở project, chọn **Gemini 3 Pro**. Copy prompt số 1 vào. Nếu nó tìm ra lỗi `baseurl`, hãy bảo nó tự sửa file `_config.yml`.
2.  **Bước 2 (Nạp dữ liệu):** Chuyển sang **Sonnet 4.5**. Kéo thả 4 file CSV và file PDF vào khung chat. Chạy prompt số 3.
3.  **Bước 3 (Viết bài):** Giữ nguyên context đó, chạy prompt số 4.
4.  **Bước 4 (Dịch & Polish):** Sau khi file `.md` được tạo, chạy prompt số 5 để có bài viết tiếng Việt hoàn chỉnh cho ngày 10/12/2025.

Bạn có muốn tôi mô phỏng trước cấu trúc bài viết (Outline) dựa trên file PDF "PLTT doc nuoc..." để bạn xem trước không?

----------
***Cách 1: Tạo server phục vụ tệp tĩnh (Nhanh nhất)*
Mở Terminal (macOS/Linux) hoặc Command Prompt/PowerShell (Windows).
Chuyển đến thư mục chứa các tệp HTML, CSS, JS bạn muốn phục vụ.
Chạy lệnh:
bash
**python -m http.server 8000**

Truy cập: Mở trình duyệt và vào http://localhost:8088 hoặc http://127.0.0.1:8088. 

**Cách 2: Viết code tùy chỉnh với http.server**
Tạo file server.py:
python
from http.server import BaseHTTPRequestHandler, HTTPServer
import time

HOST_NAME = 'localhost'
PORT_NUMBER = 8088

class MyHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200) # Mã trạng thái OK
        self.send_header('Content-type', 'text/html; charset=utf-8')
        self.end_headers()
        self.wfile.write(b"Hello from Python Server on Port 8088!") # Gửi nội dung

    def do_POST(self):
        content_length = int(self.headers['Content-Length'])
        post_data = self.rfile.read(content_length)
        print(f"Received POST data: {post_data.decode('utf-8')}")
        self.send_response(200)
        self.send_header('Content-type', 'text/plain; charset=utf-8')
        self.end_headers()
        self.wfile.write(b"POST request received successfully!")

if __name__ == '__main__':
    server_class = HTTPServer
    httpd = server_class((HOST_NAME, PORT_NUMBER), MyHandler)
    print(f"Server started at {HOST_NAME}:{PORT_NUMBER}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("Server stopped.")
        httpd.server_close()
Chạy file:
bash
python server.py
Tru cập: Mở trình duyệt và vào http://localhost:8088. 
Lưu ý: Cổng 8080 thường được dùng mặc định, nhưng bạn hoàn toàn có thể chỉ định cổng khác như 8088. 