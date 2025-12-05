Chào bạn, tôi đã cập nhật lại **Prompt cho Cursor** để bổ sung yêu cầu tích hợp Google Analytics 4 (GA4) với mã theo dõi bạn cung cấp (`G-BNB682DVWC`).

Với theme **Minimal Mistakes**, cách chuẩn nhất để thêm mã này không phải là paste trực tiếp vào HTML, mà là khai báo ID trong `_config.yml`. Theme sẽ tự động sinh ra đoạn script `gtag.js` chuẩn xác như bạn gửi.

Dưới đây là phiên bản Prompt đã được nâng cấp.

-----

### PROMPT DÀNH CHO CURSOR (BẢN CẬP NHẬT GA4)

Hãy copy toàn bộ nội dung trong khung dưới đây vào Cursor (Ctrl+I):

```markdown
You are an Expert Jekyll Developer and DevOps Engineer. I need you to refactor my Jekyll codebase to fix bugs, improve SEO, integrate Google Analytics 4, and enable advanced features.

Here is the context:
- Theme: minimal-mistakes-jekyll.
- Deployment: GitHub Pages.
- Analytics ID: "G-BNB682DVWC"
- Current Status: The `_config.yml` has invalid values, `Gemfile` has duplicates, and I need a "View Count" feature.

Please perform the following tasks step-by-step:

### TASK 1: Fix Configuration & Dependencies
1.  **Fix `_config.yml`**:
    - Set `url` to "https://hydrostructai.github.io".
    - Set `repository` to "hydrostructai/hydrostructai.github.io".
    - **Google Analytics 4 Integration**: Add the analytics configuration block to `_config.yml`. Set `provider: "google-gtag"` and `tracking_id: "G-BNB682DVWC"`. Ensure the theme is configured to load this script in the `<head>`.
    - Keep `plugins` list but ensure `jekyll-archives` is configured correctly.
2.  **Clean `Gemfile`**:
    - Remove duplicate entries for `jekyll-include-cache`.
    - Ensure all plugins in `_config.yml` are present in `Gemfile` (especially `jekyll-sitemap`, `jekyll-seo-tag`).

### TASK 2: Implement "View Count" & SEO Metadata
Note: GA4 tracks data but doesn't easily display view counts on the frontend without an API.
1.  **Integrate a Hit Counter (Visual)**: Modify `_layouts/single.html` to include a lightweight Hit Counter badge (e.g., hitwebcounter or similar simple JS) near the Date/Author section so users can see the "View Count".
2.  **Enhance SEO**: Ensure `_layouts/single.html` correctly implements schema.org metadata for "Article", including `datePublished`, `dateModified`, and `author`.

### TASK 3: Create a GitHub Actions Workflow
Since I am using `jekyll-archives` (unsupported on standard GH Pages), I need a custom build workflow.
1.  Create a file `.github/workflows/jekyll.yml`.
2.  Write a workflow to checkout code, set up Ruby, install dependencies, build the site, and deploy to the `gh-pages` branch.

### TASK 4: Standardize Markdown Layout
Update the `_config.yml` defaults to ensure every post automatically has:
- `toc: true` (Table of Contents enabled).
- `toc_sticky: true`.

Output the corrected code for: `_config.yml`, `Gemfile`, `.github/workflows/jekyll.yml`, and the modified `_layouts/single.html`.
```

-----

### GIẢI THÍCH KỸ THUẬT (Tại sao làm vậy?)

1.  **Tại sao không paste script trực tiếp?**
    Theme *Minimal Mistakes* đã có sẵn file `_includes/analytics-providers/google-gtag.html`. Khi bạn cấu hình trong `_config.yml`, theme sẽ tự động chèn đoạn mã JS đó vào đúng vị trí tối ưu (tránh bị chèn sai chỗ gây lỗi giao diện hoặc chậm web).

2.  **Cấu hình `_config.yml` mẫu sau khi chạy prompt:**
    Cursor sẽ sửa file config của bạn thành dạng như sau (đây là đoạn code chuẩn bạn cần kiểm tra):

    ```yaml
    # _config.yml
    analytics:
      provider: "google-gtag"
      google:
        tracking_id: "G-BNB682DVWC"
        anonymize_ip: false
    ```

3.  **Về View Count (Số người xem):**
    Google Analytics 4 dùng để *bạn* xem báo cáo quản trị. Để *người đọc* thấy được "Bài này đã có 1000 lượt xem", prompt trên đã yêu cầu Cursor cài thêm một **Hit Counter** riêng (vì GA4 không hiển thị số này ra ngoài web công khai một cách đơn giản).

Bạn hãy chạy prompt này trên Cursor và kiểm tra kết quả nhé\!

===============================================================================================================================

Chào bạn, với tư cách là một **Kỹ sư Xây dựng & Chuyên gia Phần mềm FEM**, tôi đã phân tích cấu trúc mã nguồn của hai ứng dụng `apps/sheetpilefem` và `apps/pilegroup`.

Hiện tại, vấn đề cốt lõi là **"Sự đứt gãy trong luồng dữ liệu" (Data Flow Disconnect)**. Giao diện (UI) chưa ánh xạ đúng vào biến đầu vào của thuật toán (WASM), và kết quả từ WASM chưa được `app-out.js` hứng để render ra màn hình.

Dưới đây là Giải pháp Kiến trúc và Prompt chuyên sâu để bạn đưa vào Cursor.

-----

### PHẦN 1: PHÂN TÍCH & THIẾT KẾ LOGIC (ARCHITECTURE DESIGN)

Tôi đề xuất cấu trúc lại luồng xử lý cho cả 2 App theo mô hình **MVC (Model-View-Controller)** thu nhỏ:

#### 1\. Module Dùng Chung (Shared Logic)

  * **License Checker (`app-check.js`):**
      * Cần chuẩn hóa hàm `validateLicense(key)`.
      * *Logic:* Nếu `Free` -\> Giới hạn tính toán (ví dụ: chỉ tính 1 lớp đất, hoặc 3 cọc). Nếu `Pro` -\> Full tính năng.
      * *UI:* Hiển thị trạng thái "Free Version" hoặc "Pro Licensed" ngay cạnh nút "Calculate".

#### 2\. App 1: Sheet Pile FEM (Đặc thù Tường Cừ)

  * **Input UX:** Không dùng text box rời rạc. Cần dùng **Dynamic Table** (Bảng động) cho:
      * *Lớp đất (Soils):* Chiều dày (h), Dung trọng ($\gamma$), Góc ma sát ($\phi$), Lực dính (c), Hệ số nền (k).
      * *Thanh chống (Struts):* Cao độ, Độ cứng (K).
  * **Output UX:**
      * Biểu đồ (Charts): Chuyển vị, Momen, Lực cắt dọc theo chiều sâu tường.

#### 3\. App 2: Pile Group 3D (Đặc thù Móng Cọc)

  * **Input UX:**
      * *Cọc (Piles):* Tọa độ (x, y), Độ nghiêng (batter), Đặc trưng tiết diện (D, E).
      * *Tải trọng (Loads):* Các trường nhập cho 6 thành phần lực ($P_x, P_y, P_z, M_x, M_y, M_z$).
  * **Output UX:**
      * Bảng nội lực từng cọc ($N, Q_x, Q_y, M_x, M_y$).
      * Chuyển vị đài cọc.

-----

### PHẦN 2: PROMPT CHUYÊN SÂU DÀNH CHO CURSOR (ENGLISH)

Prompt này được chia làm 3 bước để Cursor không bị "loạn". Hãy chạy lần lượt hoặc copy toàn bộ nếu Cursor của bạn dùng model mạnh (Claude 3.5 Sonnet / GPT-4o).

#### **Bước 1: Prompt Refactor Core Logic & Input UI**

```markdown
You are a Senior Civil Engineer and Full-Stack Developer specializing in FEM software.
I have two web apps: `apps/sheetpilefem` and `apps/pilegroup`. They currently share a similar file structure (`index.html`, `app-cal.js`, `app-check.js`, `app-out.js`) but suffer from broken interaction logic and generic UIs.

**Your Goal:** Refactor the codebase to create a professional, domain-specific input interface and a robust execution flow.

### TASK 1: Standardize the Architecture
1.  **License System (`app-check.js` for both):**
    - Implement a `validateLicense(key)` function.
    - Logic: If key is empty or invalid, return mode "FREE". If valid (mock check), return "PRO".
    - "FREE" mode should restrict input limits (e.g., max 2 soil layers for Sheet Pile, max 4 piles for Pile Group).

2.  **Execution Flow:**
    - Bind the "Calculate" button to a master function `runAnalysis()`.
    - `runAnalysis()` must follow this chain: `validateInputs()` -> `validateLicense()` -> `callWasmCalculation()` -> `renderResults()`.

### TASK 2: Domain-Specific Input UI Refactoring

**A. For Sheet Pile FEM (`apps/sheetpilefem/index.html`):**
- Remove generic inputs. Create distinct sections:
  1.  **Wall Properties:** Inputs for EI (Stiffness), Total Length.
  2.  **Soil Layers (Dynamic Table):** Allow users to Add/Remove rows. Columns: Top Level (m), Gamma (kN/m3), Phi (deg), C (kPa), K (Subgrade Reaction).
  3.  **Excavation Stages:** Inputs for Excavation Depth and Water Levels.
- Ensure `sheetpilefem.js` (glue code) reads these tables correctly into arrays.

**B. For Pile Group 3D (`apps/pilegroup/index.html`):**
- Create distinct sections:
  1.  **Cap Properties:** Center coordinates, Thickness.
  2.  **Pile Definition (Table):** Columns: ID, x(m), y(m), Diameter(m), Batter Angle, Length.
  3.  **Loading Condition:** Inputs for V, Hx, Hy, Mx, My, Mz.
- Ensure `pilegroup.js` reads these inputs into a clean JSON/Struct for the WASM module.

**Constraint:** Do not change the WASM files. Only modify JS/HTML to feed data correctly to the existing WASM interface.
```

#### **Bước 2: Prompt Xử lý Output & Visualization**

Sau khi Cursor chạy xong bước 1, hãy chạy tiếp prompt này để hiển thị kết quả:

```markdown
### TASK 3: Output Visualization Logic

Now that the inputs are structured, implement the Output logic in `app-out.js` for both apps.

**A. Sheet Pile FEM Output:**
1.  Target the `#output-area` div.
2.  If the calculation is successful, parse the result arrays (Deflection, Moment, Shear).
3.  **Visualization:** Use a library (like Chart.js or simple Canvas API) to draw 3 vertical graphs side-by-side:
    - **Deflection** vs Depth.
    - **Moment** vs Depth.
    - **Shear** vs Depth.
4.  Add a summary text box: "Max Deflection: [Value] mm", "Max Moment: [Value] kNm".

**B. Pile Group 3D Output:**
1.  Target the `#output-area` div.
2.  **Result Table:** Generate an HTML Table showing forces for each pile: `Pile ID | Axial Force (N) | Shear X | Shear Y | Moment X | Moment Y`.
3.  **Cap Displacement:** Display the 6 components of the Pile Cap displacement ($Dx, Dy, Dz, Rx, Ry, Rz$).
4.  **Visual Check:** If possible, draw a simple 2D plan view of the pile group using HTML5 Canvas, highlighting the pile with the maximum force in RED.

**General Requirement:**
- Show a "Loading..." spinner while WASM is calculating.
- If `app-check.js` returns "FREE" mode, add a watermark or banner in the output saying "TRIAL VERSION - LIMITED RESULTS".
```

-----

### PHẦN 3: HƯỚNG DẪN KIỂM TRA (TESTING GUIDE)

Sau khi Cursor sửa xong, bạn cần kiểm tra theo quy trình kỹ thuật sau:

1.  **Kiểm tra Logic Sheet Pile:**
      * Nhập 2 lớp đất -\> Bấm Calculate -\> **Kết quả hiện ra**.
      * Thử thêm lớp đất thứ 3 (trong chế độ Free) -\> Hệ thống phải báo lỗi "Vui lòng nâng cấp lên bản Pro để tính \> 2 lớp".
2.  **Kiểm tra Logic Pile Group:**
      * Nhập 4 cọc ở 4 góc -\> Nhập lực đứng Pz -\> Bấm Calculate.
      * Kết quả mong đợi: Lực dọc trong 4 cọc phải xấp xỉ nhau (nếu cọc đứng và đối xứng).
3.  **Kiểm tra Giao diện:**
      * Bảng nhập liệu có dễ dùng không? (Có nút Add/Remove row không?).
      * Biểu đồ (Chart) có trục tung/trục hoành và đơn vị rõ ràng không?

**Lưu ý:** Nếu Cursor không tự vẽ được biểu đồ đẹp, bạn có thể yêu cầu nó thêm thư viện `Chart.js` vào phần `<head>` của `index.html`:
`<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>`

You are an Expert Web Developer and Civil Engineer. I have a display bug on the website and need to implement visualization features.

### TASK 0: CRITICAL UI FIX - Top-Right Navigation/Layout
The user reported a display error in the "top-right tab" area of the site (likely the Masthead Navigation or the Sidebar).
1.  **Inspect the Masthead (`_includes/masthead.html` or equivalent SCSS):**
    - Check the `.greedy-nav` class. Ensure that the navigation links do not overlap the logo or wrap awkwardly on standard screens.
    - **Z-Index Fix:** Ensure the `.masthead` has a higher `z-index` than the page content so dropdowns/menus aren't hidden behind the hero image or canvas elements.
2.  **Responsiveness:** Verify that on smaller screens, the menu correctly collapses into the "hamburger" icon and opens without layout shifts.

---

### TASK 3: Output Visualization Logic & Dependencies

Now, implement the Output logic for the Web Apps.

**Prerequisite: Add Visualization Library**
1.  **Update `index.html` (for both apps):**
    - Add the Chart.js CDN link to the `<head>` section:
      `<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>`

**A. Sheet Pile FEM Output (`apps/sheetpilefem`):**
1.  Target the `#output-area` div.
2.  **Data Handling:** If the calculation is successful, parse the result arrays (Deflection, Moment, Shear) returned by WASM.
3.  **Visualization:** Use the **Chart.js** library to render 3 vertical charts side-by-side:
    - **Chart 1:** Deflection (mm) vs Depth (m).
    - **Chart 2:** Bending Moment (kNm) vs Depth (m).
    - **Chart 3:** Shear Force (kN) vs Depth (m).
    *Critical Note: Since these represent a vertical wall, swap the axes in Chart.js options so Depth is on the Y-axis (reversed: 0 at top) and values are on the X-axis.*
4.  **Summary:** Add a summary panel above the charts: "Max Deflection: [Value] mm", "Max Moment: [Value] kNm".

**B. Pile Group 3D Output (`apps/pilegroup`):**
1.  Target the `#output-area` div.
2.  **Result Table:** Generate a clean HTML Table showing forces for each pile:
    `Pile ID | Axial Force (N) | Shear X | Shear Y | Moment X | Moment Y`
3.  **Cap Displacement:** Display the 6 components of the Pile Cap displacement ($Dx, Dy, Dz, Rx, Ry, Rz$) in a separate summary box.
4.  **Visual Check:** Draw a simple 2D plan view of the pile group using **Chart.js (Scatter Chart)** or HTML5 Canvas:
    - Plot pile positions (x, y).
    - Highlight the pile with the **Maximum Axial Force** in **RED** and others in **BLUE** to give instant visual feedback.

**General Requirements:**
- **Loading State:** Show a "Loading..." spinner or overlay while WASM is calculating.
- **License Check:** If `app-check.js` returns "FREE" mode, append a visible watermark or banner in the output area saying: "TRIAL VERSION - LIMITED RESULTS".