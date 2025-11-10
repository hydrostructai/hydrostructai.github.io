
## 🛠️ Cấu Trúc Dự Án `hydrostructai.github.io`

````
¦
+-- _config.yml               # [Rất quan trọng] Cấu hình chính
+-- Gemfile                   # [Quan trọng] Khai báo plugins
¦
+-- index.md                  # Trang chủ (layout đặc biệt)
+-- apps.md                   # Trang portfolio apps
+-- about.md                  # Trang giới thiệu
¦
+-- _data/                    # Thư mục chứa dữ liệu
¦   +-- navigation.yml        # Định nghĩa thanh menu chính
¦
+-- _posts/                   # Thư mục blog
¦   +-- 2025-10-28-sheet-pile-fem-wasm-intro.md
¦
+-- assets/                   # Thư mục tài nguyên
¦   +-- images/               # (Chứa ảnh logo, avatar, ảnh bài post)
¦   ¦   +-- logo.png
¦   ¦   +-- my-avatar.png
¦   +-- css/                  # (Nếu bạn muốn tùy biến sâu hơn)
¦       +-- main.scss
¦
+-- apps/                     # Thư mục chứa các app (Jekyll bỏ qua)
    +-- sheetpilefem/
    ¦   +-- index.html
    +-- (các app khác...)
    
=====================================================
Chào bạn, đây là quy trình chính xác để tải code về máy (clone), chỉnh sửa và đẩy (push) lên lại GitHub.

**Yêu cầu:** Bạn cần cài đặt [Git](https://www.google.com/search?q=https://git-scm.com/downloads) trên máy tính của mình.

-----

### Quy trình 5 Bước (Làm lần đầu)

Nếu bạn **chưa từng** tải code này về máy, hãy làm theo các bước sau. Mở Terminal (macOS/Linux) hoặc Git Bash (Windows).

**Bước 1: Clone (Tải toàn bộ code về)**

```bash
git clone [https://github.com/hydrostructai/hydrostructai.github.io.git](https://github.com/hydrostructai/hydrostructai.github.io.git)
````

*Lệnh này tạo một thư mục mới tên là `hydrostructai.github.io` chứa code của bạn.*

**Bước 2: Đi vào Thư mục**

```bash
cd hydrostructai.github.io
```

**Bước 3: Chỉnh sửa Code**
Mở thư mục này bằng trình soạn thảo code (như VS Code) và thực hiện mọi chỉnh sửa bạn muốn (sửa `index.html`, `taylorseries.html`, v.v.).

**Bước 4: Lưu Thay đổi (Add & Commit)**
Sau khi sửa xong, quay lại cửa sổ Terminal (hoặc Git Bash) và gõ hai lệnh sau:

```bash
# Thêm tất cả các tệp đã sửa
git add .

# Ghi lại thay đổi với một tin nhắn
git commit -m "Cập nhật nội dung website"
```

*(Bạn có thể thay "Cập nhật nội dung website" bằng tin nhắn của riêng bạn).*

**Bước 5: Đẩy (Push) lên GitHub**

```bash
git push origin main
```

*(Nếu `main` không hoạt động, hãy thử `master` - đây là tên nhánh chính của bạn).*

-----

### Quy trình (Làm từ lần thứ hai trở đi)

Nếu bạn **đã có** thư mục code trên máy từ trước, hãy bắt đầu từ đây:

1.  **Đi vào Thư mục**
    ```bash
    cd hydrostructai.github.io
    ```
2.  **Pull (Đồng bộ code mới nhất)**
    ```bash
    git pull origin main
    ```
3.  **Chỉnh sửa, Add, Commit, Push** (Làm lại Bước 3, 4, 5 từ phần trên).
    \============================================================

B. Các Web App (Sản phẩm):

Vị trí: Toàn bộ app được đặt trong thư mục /apps/ ở thư mục gốc. Thư mục này được Jekyll **"bỏ qua"** và sao chép nguyên trạng.

Cấu trúc bên trong /apps/:

/apps/sheetpilefem/

index.html (Giao diện SheetPileFEM bạn đã gửi)

app.js (Logic "Freemium" và điều khiển UI)

sheetpilefem.js (Code "keo" do Emscripten tạo ra)

sheetpilefem.wasm (Lõi C++ FEM đã được biên dịch)

/apps/taylor-series/

index.html (Nội dung file taylorseries.html cũ của bạn)

/apps/hypocycloid/

index.html (Nội dung file hypocycloid.html cũ của bạn)

/apps/pep3/
index.html (Nội dung file PEP3 THANG DANH GIA PHAT TRIEN.html cũ)

Luồng hoàn chỉnh: Người dùng (kỹ sư, sinh viên) $\to$ Google $\to$ Tìm thấy bài viết trên blog của bạn (ví dụ: `_posts/.../sheet-pile-fem-wasm-intro.md`) $\to$ Đọc lý thuyết, thấy hấp dẫn $\to$ Nhấn vào link **"Chạy Ứng dụng"** $\to$ Được chuyển hướng đến `https://hydrostructai.github.io/apps/sheetpilefem/` $\to$ Trải nghiệm app SheetPileFEM (ở chế độ **"Trial Mode"** 2 lớp đất).

3.  Về Cấu trúc Lưu trữ Dữ liệu (Cho SheetPileFEM)
    Đây là phần quan trọng để hiểu rõ. Vì hydrostructai.github.io là một trang **Tĩnh (Static)** trên GitHub Pages, nó **không có cơ sở dữ liệu** (database) phía máy chủ.

Vậy, **"dữ liệu"** của SheetPileFEM được lưu ở đâu?

A. Dữ liệu Mẫu (2 Lớp đất)
**Lưu ở đâu:** Dữ liệu này được **"hard-code"** (mã hóa cứng) trực tiếp bên trong file **`app.js`**.

**Logic:** Khi bạn sửa file `app.js` và thay đổi biến `defaultData` để chỉ còn 2 lớp đất (như tôi đã hướng dẫn):

```javascript
const defaultData = {
    //...
    soil: [
        ['Lop 1 (Cat pha)', 1.5, 18.0, 19.0, 30, 2],
        ['Lop 2 (Set deo)', -8.0, 16.5, 17.5, 10, 15]
    ],
    anchor: []
};
```

Khi trang `.../apps/sheetpilefem/index.html` tải xong, `app.js` sẽ chạy, gọi hàm `loadDataIntoUI(defaultData)`. Hàm này đọc 2 lớp đất từ `defaultData` và tự động điền vào giao diện.

B. Dữ liệu Người dùng (Khi đang nhập liệu)
**Lưu ở đâu:** Tạm thời trong **bộ nhớ (RAM) của trình duyệt**.

**Logic:** Khi người dùng thay đổi con số (ví dụ: đổi cao độ Lớp 1 từ 1.5 thành 2.0), dữ liệu này chỉ tồn tại trên các ô `<input>` của `index.html`.

C. Dữ liệu Chuyển giao (Khi nhấn "RUN ANALYSIS")
**Lưu ở đâu:** Đây là một **chuỗi JSON** được tạo ra tức thời.

**Logic:**

1.  Người dùng nhấn "RUN ANALYSIS".
2.  Hàm `collectInputs()` trong `app.js` được gọi.
3.  Nó quét toàn bộ form, đọc 2 lớp đất và các thông số tường, tạo ra một đối tượng JavaScript.
4.  `JSON.stringify(inputs)` biến đối tượng này thành một chuỗi JSON.
5.  Chuỗi JSON này được gửi vào hàm C++ `WASM_MODULE.runAnalysis(...)`.
6.  Lõi C++ (`sheetpilecore.cpp`) dùng thư viện `nlohmann/json` để **"phân rã" (parse)** chuỗi JSON này, nạp vào các `struct` C++ (như `AnalysisInput`, `SoilLayer` đã định nghĩa trong `datastructs.h`).
7.  Lõi FEM (`femsolver.cpp`) tính toán dựa trên các `struct` này.

D. Dữ liệu "Lưu trữ" (Khi người dùng muốn lưu lại)
**Lưu ở đâu:** Lưu về **máy tính của người dùng** dưới dạng file **`.csv`**.

**Logic:**

1.  Người dùng (nếu đã có license) nhấn nút "Save as CSV".
2.  Hàm `handleSaveInputCSV()` trong `app.js` được gọi.
3.  Nó lặp lại bước `collectInputs()` để lấy dữ liệu hiện tại trên giao diện.
4.  Nó định dạng dữ liệu này thành một chuỗi văn bản theo chuẩn CSV (giống hệt file `SAMPLE.CSV` của bạn).
5.  Nó tạo một file "ảo" trong trình duyệt và kích hoạt lệnh **"Download"** (`sheetpile_input.csv`).

-----

Tôi đã hoàn tất việc sửa font tiếng Việt trong phần ghi chú, giữ nguyên các nội dung và cấu trúc code khác.

Bạn có muốn tôi giúp định dạng lại một phần nội dung nào khác hoặc tìm kiếm thông tin chi tiết về Jekyll/WebAssembly không?
