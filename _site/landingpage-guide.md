prompt master: Hệ thống Landing Page thu thập khách hàng (HydrostructAI)

## 1. Logic & Mã nguồn Gốc (Baseline)
Dưới đây là cấu trúc logic tạo một tệp `landing.html` tại `/apps/` với mã nguồn mẫu dự kiến (cần nghiên cứu thiết kế chuyên nghiệp marketing, chuẩn seo):

```html
<form action="https://formsubmit.co/el/pazeho" method="POST">
    <!-- Tự động ẩn captcha để user trải nghiệm nhanh -->
    <input type="hidden" name="_captcha" value="false">
    <!-- Sau khi gửi, chuyển thẳng user vào App -->
    <input type="hidden" name="_next" value="https://hydrostructai.github.io/apps/shortcol2D/index.html">
    
    <h3>Đăng ký trải nghiệm ShortCol 2D</h3>
    <input type="text" name="name" placeholder="Họ và Tên" required>
    <input type="email" name="email" placeholder="Email" required>
    <input type="tel" name="phone" placeholder="Số điện thoại / Zalo" required>
    
    <select name="tier_interest">
        <option value="free">Quan tâm bản Free</option>
        <option value="pro">Muốn đăng ký bản Pro sớm</option>
    </select>
    
    <button type="submit">Nhận quyền truy cập & Đăng ký</button>
</form>
```

---

## 2. Prompt Kỹ thuật Hoàn chỉnh (Dùng cho AI Generation)

**Vai trò:** Bạn là một chuyên gia UI/UX Designer và Marketing Engineer chuyên sâu về tối ưu hóa tỷ lệ chuyển đổi (CRO) và SEO.

**Bối cảnh:** Tôi có một website kỹ thuật chạy trên GitHub Pages (Jekyll). Tôi cần tạo một "Cổng đăng ký" (Registration Gate) chuyên nghiệp. Khi người dùng nhấn vào nút hành động trên trang chủ, họ sẽ được dẫn đến một Landing Page để để lại thông tin trước khi truy cập vào các ứng dụng tính toán kỹ thuật.

**Yêu cầu chi tiết:**

**A. Chỉnh sửa trang chủ (`index.html` tại gốc /hydrostructai.github.io):**
- Cập nhật phần cấu hình Header (YAML front matter): Thay đổi `cta_label` từ các giá trị hiện có thành **"Xem chi tiết"**.
- Cập nhật `cta_url` dẫn đến đường dẫn: `/apps/landing.html`.

**B. Xây dựng Landing Page (`/apps/landing.html`):**
- **Kiến trúc:** Một tệp HTML độc lập, sử dụng Bootstrap 5 để đảm bảo tính gọn nhẹ (Cdn) và Responsive hoàn hảo trên Mobile/Desktop.
- **Thiết kế (Marketing & UI/UX):**
    - Phong cách: Hiện đại, tin cậy, đặc thù ngành kỹ thuật xây dựng (sử dụng tông màu chuyên nghiệp như Dark Blue, Clean White, Slate Gray).
    - Nội dung: Có phần Hero section ngắn gọn nêu bật giá trị, tạo danh sách dạng list các web app trong /apps/ có ô chọn tương ứng với mỗi web app, người dùng có thể chọn nhiều web app (Ví dụ với shortcol2D thì ghi: "Công cụ kiểm tra cột chịu nén lệch tâm một phương theo TCVN/ACI/EC - Nâng cao hiệu suất thiết kế", bạn ghi đầy đủ cho các web app khác).
    - SEO: Tối ưu các thẻ Meta Title, Description, Open Graph để hiển thị tốt khi chia sẻ trên Zalo/Facebook.
- **Tích hợp Backend (FormSubmit.co):**
    - Sử dụng mã ID: `https://formsubmit.co/el/pazeho`.
    - Cấu hình ẩn: `_captcha` = `false` (tăng trải nghiệm), `_next` = redirect về trang chủ `/` sau khi gửi thành công.
- **Cấu trúc Form (Lead Form):**
    - Trường nhập: Họ và Tên, Email, Số điện thoại (Bắt buộc).
    - Lựa chọn Nhu cầu: (Dropdown) Kỹ sư thiết kế / Sinh viên / Quản lý / Khác.
    - Đăng ký tương lai: (Checkbox) "Tôi muốn nhận thông báo bản Free" và "Tôi quan tâm đăng ký sử dụng bản Pro".
- **Tính năng bổ sung:** Sử dụng Vanilla JS để hiển thị hiệu ứng thông báo "Đang xử lý..." khi người dùng nhấn nút Gửi nhằm tăng sự chuyên nghiệp.

---

## Kết luận & Khuyến nghị của Chuyên gia

1. **Phương án (HTML/JS + FormSubmit)**: Vì nó giữ cho toàn bộ trải nghiệm người dùng nằm trên một domain duy nhất của GitHub, tăng độ tin cậy và không tốn chi phí host thêm server.
2. **Chiến lược "Unlock"**: Hãy thiết kế trang landing đẹp mắt với hình ảnh minh họa App (Screeshot), sau đó dùng tham số `_next` của FormSubmit để đưa người dùng vào ứng dụng thật ngay sau khi họ nhấn Gửi.
3. **Cập nhật nhanh**: Khi cần thay đổi nội dung Form, bạn chỉ cần sửa tệp HTML và `git push`, GitHub Pages sẽ cập nhật trong 1-2 phút.
