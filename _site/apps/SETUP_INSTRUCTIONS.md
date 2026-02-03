# Hướng dẫn Thiết lập Google Apps Script

## Bước 1: Tạo Apps Script Project

1. Truy cập: https://script.google.com/
2. Nhấn **New Project**
3. Copy toàn bộ code từ `google-apps-script.js` và paste vào
4. Đổi tên project: **HydrostructAI Form Handler**
5. Save (Ctrl+S)

## Bước 2: Cấp quyền truy cập Google Sheet

1. Nhấn **Run** (▶️) trên function `testFunction`
2. Popup "Authorization required" → Nhấn **Review permissions**
3. Chọn tài khoản Google của bạn
4. Nhấn **Advanced** → **Go to HydrostructAI Form Handler (unsafe)**
5. Nhấn **Allow**

## Bước 3: Deploy Web App

1. Nhấn **Deploy** → **New deployment**
2. Nhấn icon bánh răng → Chọn **Web app**
3. Điền thông tin:
   - **Description**: v1.0 - Initial deployment
   - **Execute as**: Me (email của bạn)
   - **Who has access**: Anyone (Quan trọng!)
4. Nhấn **Deploy**
5. **Copy URL** (dạng: `https://script.google.com/macros/s/.../exec`)

## Bước 4: Cập nhật Landing Page

Mở file `landing.html`, tìm dòng:
```html
<form id="registrationForm" action="https://formsubmit.co/el/pazeho" method="POST">
```

Thay thế bằng URL vừa copy:
```html
<form id="registrationForm" action="URL_VUA_COPY" method="POST">
```

## Bước 5: Kiểm tra

1. Mở `landing.html` trên trình duyệt
2. Điền form và nhấn Submit
3. Kiểm tra Google Sheet: https://docs.google.com/spreadsheets/d/1gko2bPuKFBp4wvoYv1lVAhdixoty5bIHMHS0dYeLLss
4. Kiểm tra email notification

## Cấu trúc Cột trong Google Sheet

| Timestamp | Họ và Tên | Email | Số điện thoại | Nghề nghiệp | ShortCol 2D | ShortCol 3D | Pile Group | Lateral Pile | Sheet Pile FEM | Hydraulic Spillway | Nhận thông báo Free | Quan tâm bản Pro |

---

**Lưu ý:** Nếu cần update script sau này, chỉ cần Deploy → **Manage deployments** → Chọn deployment → **Edit** → Chọn **New version**
