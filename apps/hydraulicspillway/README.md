# Hydraulic Spillway Calculator
## Tính Toán Thủy Lực Dốc Nước & Tiêu Năng

### Mô tả
Ứng dụng web tính toán thủy lực cho dốc nước và bể tiêu năng, dựa trên lý thuyết nước nhảy thủy lực (Hydraulic Jump Theory). 

### Tính năng
- ✅ Tính toán độ sâu và vận tốc tại chân dốc
- ✅ Xác định số Froude và loại nước nhảy
- ✅ Thiết kế bể tiêu năng (chiều sâu và chiều dài)
- ✅ Kiểm tra hệ số ngập an toàn
- ✅ Giao diện thân thiện, responsive

### Công thức chính

#### 1. Phương trình năng lượng
```
E₀ = h + φ²·V²/(2g) = h + φ²·q²/(2g·h²)
```

#### 2. Số Froude
```
Fr = V / √(g·h)
```

#### 3. Độ sâu liên hiệp (Conjugate Depth)
```
h₂ = 0.5·h₁·(√(1 + 8·Fr₁²) - 1)
```

#### 4. Chiều dài bể tiêu năng
```
L_b = β · L_n
L_n = 4.5 · h₂
β = 0.7 - 0.8 (hệ số an toàn)
```

### Tham khảo
- Phương pháp tính toán dựa trên: "2.3.3 PLTT doc nuoc va be tieu nang PA tran thang.pdf"
- Lý thuyết nước nhảy thủy lực cổ điển
- Công thức Chertousov cho chiều dài bể tiêu năng

### Ứng dụng
- Thiết kế đập tràn xả lũ
- Thiết kế dốc nước trong công trình thủy lợi
- Thiết kế bể tiêu năng cho công trình thủy điện
- Kiểm toán các công trình hiện hữu

### Lưu ý
- Kết quả tính toán nhằm mục đích nghiên cứu
- Cần kiểm tra và điều chỉnh theo điều kiện thực tế
- Nên tham khảo thêm các tiêu chuẩn thiết kế hiện hành

---
**Phát triển bởi:** HydroStruct AI  
**Ngày:** December 2025  
**Version:** 1.0

