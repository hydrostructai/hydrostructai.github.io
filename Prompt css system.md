nghiên cứu chuyên sâu 2 file html đính kèm của web app : apps/pilegroup và apps/pilegroup trong https://github.com/hydrostructai/hydrostructai.github.io, bạn diễn giải cấu trúc và triển khai xây dựng style.css chung cho các web app sao cho thống nhất, đẹp và hiện đại, song song đó mỗi web app lại có những file xxx.css đi kèm để bổ sung cho nền tảng đep hơn, sau đó tách style khỏi các file html sao cho chuyên nghiệp dễ quản lý

/assets
  /css
    ├── global.css        # CSS dùng chung cho toàn bộ hệ thống (Layout, Reset, Components)
  /js
    ├── global.js         # Các hàm xử lý UI chung (Loading, Toast, v.v.)
/apps
  /sheetpilefem
    ├── index.html        # HTML đã tách style
    ├── app.css           # CSS riêng cho Sheet Pile (nếu có override đặc thù)
  /pilegroup
    ├── index.html        # HTML đã tách style
    ├── app.css           # CSS riêng cho Pile Group
	
	