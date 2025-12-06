Để triển khai logic hiển thị kết quả (Visualization Logic) đạt chuẩn như **D-Sheet Piling (Deltares)** và **LPile/GROUP (Ensoft)**, chúng ta cần tập trung vào các đặc thù của phần mềm địa kỹ thuật: **Biểu đồ theo chiều sâu (Depth-dependent charts)**, **Các giai đoạn thi công (Staged Construction)**, và **Mô hình tương tác đất - kết cấu 3D**.

Dưới đây là bản phân tích logic và **Prompt tiếng Anh chuyên sâu** để bạn gửi cho Cursor.

### 1\. Phân tích Logic hiển thị (Research findings)

Trước khi viết code, AI cần hiểu "tại sao" các phần mềm kia lại hiển thị như vậy:

  * **D-Sheet Piling (Deltares) Style:**

      * **Logic cốt lõi:** Quản lý theo giai đoạn (Stages). Mỗi giai đoạn đào/đắp/chống sẽ thay đổi biểu đồ nội lực.
      * **Hiển thị:** Màn hình chia 3 phần: (1) Input (bên trái), (2) Hình học mặt cắt ngang trực quan (giữa - vẽ tường, đất, thanh chống), (3) Biểu đồ kết quả (bên phải - Momen, Lực cắt, Chuyển vị).
      * **Yêu cầu đặc biệt:** Trục tung (Y) luôn là độ sâu (Depth, $z$), trục hoành (X) là giá trị. Trục Y phải đảo ngược (0 ở trên, dương xuống dưới).

  * **LPile (Ensoft) Style:**

      * **Logic cốt lõi:** Phân tích cọc chịu tải ngang đơn lẻ, phi tuyến ($p-y$ curves).
      * **Hiển thị:** Cần hiển thị đồng thời 4 biểu đồ quan trọng nhất: Chuyển vị ($y$), Momen uốn ($M$), Lực cắt ($V$), và Phản lực đất ($p$).
      * **Tính năng:** Hiển thị điểm nứt (cracking moment) trên biểu đồ Momen.

  * **GROUP (Ensoft) Style:**

      * **Logic cốt lõi:** Phân phối tải trọng lên nhóm cọc và xoay của đài cọc.
      * **Hiển thị:** Cần 3D View (đài cọc + các cọc nghiêng/thẳng) và Bảng phân phối lực (Pile Force Distribution Table) để xem cọc nào chịu nén/kéo lớn nhất.

-----

### 2\. Prompt tiếng Anh (Dành cho Cursor)

Prompt này được thiết kế để Cursor đọc `.cursorrules`, hiểu context và viết code sử dụng các thư viện đồ họa mạnh mẽ (khuyên dùng **Plotly.js** hoặc **Recharts** cho 2D và **Three.js** cho 3D).

```markdown
@Codebase Refactor the "Results & Visualization" modules for the three web apps: **Sheet Pile FEM**, **Lateral Pile**, and **Pile Group**.

**Objective:** Upgrade the output visualization to match industry-standard software (D-Sheet Piling by Deltares and LPile/GROUP by Ensoft). Use **Plotly.js** (recommended for scientific plotting) or Recharts for 2D charts, and **Three.js** for 3D visualization.

---

### PART 1: SHEET PILE FEM (Reference: D-Sheet Piling)

**1. Layout Logic (Dashboard):**
- Create a specific **"Analysis Results"** tab or split-view.
- **Left Panel (Geometry):** Render the physical wall, soil layers (with distinctive hatching/colors), excavation levels, and structural elements (anchors, struts) at their exact elevations.
- **Right Panel (Graphs):** Display linked graphs where the Y-axis (Depth) is aligned with the Geometry panel.
    - **Y-Axis:** Depth ($z$) in meters, **Inverted** (0 at top, positive downwards).
    - **X-Axis:** Variable values ($M$, $Q$, $u$).

**2. Required Charts (Multi-Stage Support):**
- Implement a **"Construction Stage Selector"** (Slider or Dropdown). When changed, all graphs must update instantly.
- **Graph 1: Deflection ($u$):** Show horizontal displacement. Highlight the maximum displacement point.
- **Graph 2: Bending Moment ($M$):** Show the moment curve. **Critical:** Shade the area between the curve and the axis. Mark the structural capacity ($M_{design}$) as a dashed red line (Envelope).
- **Graph 3: Shear Force ($Q$):** Standard shear diagram.
- **Graph 4: Soil Pressure:** Plot Active ($K_a$), Passive ($K_p$), and Net pressures.

---

### PART 2: LATERAL PILE (Reference: LPile Ensoft)

**1. Combined Output Report:**
- Display a 2x2 Grid of Charts for the single pile analysis:
    - **Top-Left:** Deflection vs. Depth ($y$ - $z$).
    - **Top-Right:** Bending Moment vs. Depth ($M$ - $z$).
    - **Bottom-Left:** Shear Force vs. Depth ($V$ - $z$).
    - **Bottom-Right:** Soil Reaction vs. Depth ($p$ - $z$).

**2. Advanced Visualization Logic:**
- **Boundary Conditions:** Visually indicate the pile head condition (Free, Fixed, or Spring) with an icon at $z=0$.
- **p-y Curves:** Add a button "Show p-y Curves" that opens a modal plotting Soil Resistance ($p$) vs. Deflection ($y$) at specific depths.

---

### PART 3: PILE GROUP (Reference: GROUP Ensoft)

**1. 3D Visualization (Three.js):**
- Render the **Pile Cap** (Footing) and all **Piles** in 3D space.
- **Color Coding:** Color the piles based on their axial load (e.g., Red = High Compression, Blue = Tension).
- **Interactivity:** Allow orbit, zoom, and pan. Hovering over a pile should show its ID and Force ($N, M_x, M_y$).

**2. Result Tables (Summary):**
- Generate a "Pile Force Distribution Table" containing:
    - Pile ID, Coordinate ($x,y$), Batter Angle.
    - Axial Force ($P$), Shear Forces ($V_x, V_y$), Moments ($M_x, M_y, T$).
- Highlight the **Max Compression** and **Max Tension** rows automatically.

---

### GENERAL UX/UI REQUIREMENTS
- **Export Feature:** Add a "Print Calculation Report" button that generates a clean PDF including the Project Info, Input Parameters, and these high-quality Charts (using `window.print()` with `@media print` CSS or `jspdf`).
- **Responsive:** Ensure charts resize correctly on window resize.
- **Styling:** Use a scientific/engineering theme (clean white background, grid lines, distinct legends).

**Implementation Note:** Utilize the `@Codebase` logic to fetch data from the existing calculation engines (WASM or JS logic) and map them to these new visualization components.
```

-----

### 3\. Giải thích kỹ thuật (Để bạn nắm rõ khi kiểm tra kết quả)

Khi Cursor thực hiện xong, bạn cần kiểm tra các điểm sau để đảm bảo độ "chuyên sâu":

1.  **Trục Y đảo ngược (Inverted Y-Axis):**

      * Trong xây dựng, độ sâu $z$ tăng dần khi đi xuống lòng đất. Biểu đồ phải có số 0 ở trên cùng và số lớn (ví dụ 20m) ở dưới đáy. Nếu biểu đồ chạy từ dưới lên là sai logic địa kỹ thuật.

2.  **Đồng bộ tỷ lệ (Aligned Scale):**

      * Ở phần **Sheet Pile**, biểu đồ Momen bên phải và hình vẽ tường cừ bên trái nên có cùng tỷ lệ chiều cao (pixel/mét) để kỹ sư có thể gióng sang ngang: *"À, chỗ này momen lớn nhất tương ứng với đúng vị trí thanh chống này"*.

3.  **Envelope (Đường bao):**

      * Với tường cừ, quan trọng nhất là **Đường bao nội lực (Envelope)** của tất cả các giai đoạn thi công. Bạn cần nhắc AI rằng ngoài vẽ từng giai đoạn, cần có chế độ "Show Envelope" (vẽ đường Max/Min của tất cả các bước gộp lại).

4.  **Hiệu suất (Performance):**

      * Với **Pile Group 3D**, nếu số lượng cọc lớn (\>100 cọc), Three.js cần được tối ưu (dùng InstancedMesh). Tuy nhiên với bài toán móng cọc thông thường (\<50 cọc), Mesh thường là đủ.

Bạn có muốn tôi viết mẫu một đoạn code cấu hình **Plotly.js** cụ thể cho biểu đồ "Moment vs Depth" để bạn test thử không?