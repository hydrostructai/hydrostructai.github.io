---
layout: single
title: "Quy hoạch Tuyến công trình Dựa trên Địa hình (Terrain-Aware Path Planning)"
author_profile: true
author_name: "HST.AI"
date: 2025-12-09 08:30:00 +0700
categories: [Algorithms, Hydraulic Engineering, Python, Revit API]
tags: [A-Star, Hybrid-A-Star, Path Planning, Computational Design, Infrastructure, Digital Elevation Model]
author: "HydroStructAI Team"
image: "/assets/images/posts/terrain-aware-pathfinding/terrain-planning-cover.jpg"
description: "Ứng dụng thuật toán Hybrid A* với hàm chi phí tích hợp địa hình (DEM) và ràng buộc thủy lực để tối ưu hóa tuyến cống thoát nước, cân bằng giữa chi phí đào đắp và khả năng tự chảy."
excerpt: "Làm thế nào để quy hoạch tuyến tối ưu trên địa hình phức tạp? Bài viết này chia sẻ phương pháp Terrain-Aware Path Planning dựa trên mô hình số độ cao (DEM)."
---

**Mức độ:** Chuyên gia (Expert)

---

## 1. Đặt vấn đề: Khi đường ngắn nhất không phải đường tốt nhất

Trong thiết kế hạ tầng, bài toán **Quy hoạch tuyến (Alignment Planning)** cống thoát nước khác hoàn toàn với bài toán tìm đường ngắn nhất thường thấy trên đồ thị phẳng.

- **Mạng lưới truyền thống (2D):** Tìm đường ngắn nhất trên mặt phẳng tọa độ.
- **Quy hoạch hạ tầng (3D):** Tìm đường trong không gian 3D với các ràng buộc hình học (Geometric Constraints) và thủy lực:
  - Độ dốc (Slope) phải nằm trong dải cho phép `[i_min, i_max]`.
  - Hướng dòng chảy đảm bảo tự chảy ($$z_{upstream} > z_{downstream}$$).
  - Tối ưu hóa cao độ đặt ống để giảm thiểu khối lượng đào đắp (Cut & Fill).

Do đó chúng ta cần một giải pháp quy hoạch tuyến công trình có khả năng điều chỉnh theo cao độ tự nhiên từ dữ liệu khảo sát địa hình hay bản đồ số.

---

## 2. Mô hình Toán học: Hàm chi phí mở rộng (Augmented Cost Function)

Dựa trên nền tảng thuật toán **Hybrid A\***, chúng ta định nghĩa hàm chi phí linh hoạt giúp AI cân nhắc giữa chiều dài tuyến và độ sâu đào đất:

$$f(n) = g(n) + h(n) + C_{terrain}(n) + C_{hydraulic}(n)$$

Trong đó:
- **$$g(n)$$**: Chi phí tích lũy từ điểm gốc.
- **$$h(n)$$**: Hàm Heuristic ước lượng khoảng cách tới đích.
- **$$C_{terrain}$$**: Chi phí đào đắp, tỉ lệ thuận với hiệu số giữa cao độ đáy ống ($$z_{invert}$$) và cao độ tự nhiên ($$z_{ground}$$).
- **$$C_{hydraulic}$$**: Chi phí ràng buộc thủy lực.

### Ràng buộc và Xử lý Vi phạm (Constraint Satisfaction):
Thay vì sử dụng các mức phạt cảm tính, thuật toán áp dụng:
1. **Loại bỏ nút (Node Pruning)**: Nếu độ dốc vượt quá giới hạn vật lý hoặc đi ngược dòng chảy, nút đó sẽ bị loại bỏ khỏi không gian tìm kiếm (tương đương chi phí vô hạn).
2. **Phạt phi tuyến (Non-linear Penalty)**: Đối với các khu vực đào sâu hoặc cần hố ga trung chuyển, chi phí sẽ tăng theo hàm bậc hai để định hướng thuật toán tìm các tuyến nông hơn.

---

## 3. Triển khai Thuật toán 

### 3.1. Hàm tính toán chi phí thủy lực

```python
def calculate_transition_cost(curr_node, next_node, i_min=0.003, i_max=0.10):
    dist = calculate_dist(curr_node, next_node)
    ground_slope = (curr_node.z - next_node.z) / dist
    
    # Ràng buộc thủy lực: Loại bỏ bước nhảy nếu đi ngược dốc
    if next_node.z > curr_node.z:
        return float('inf') # Node Pruning
        
    # Phạt nếu độ dốc thấp hơn mức tự chảy tối thiểu
    cost = dist
    if ground_slope < i_min:
        cost += (i_min - ground_slope) * 1000 # Augmented cost
        
    return cost
```

---

## 4. Tích hợp BIM & Revit API

Sau khi tìm được đường đi tối ưu dưới dạng danh sách các tọa độ $$(x, y, z)$$, chúng ta sử dụng Revit API để tự động hóa việc tạo dựng mô hình:

```csharp
// Pseudo-code tạo Pipe từ kết quả Pathfinding
public void GeneratePipes(List<XYZ> points) {
    for (int i = 0; i < points.Count - 1; i++) {
        Pipe.Create(doc, systemTypeId, pipeTypeId, levelId, points[i], points[i+1]);
    }
}
```

Việc này giúp rút ngắn thời gian từ bước quy hoạch ý tưởng đến khi có mô hình kỹ thuật chính xác.

---

## 5. Kết luận

Quy hoạch tuyến dựa trên địa hình là sự kết hợp giữa thuật toán tìm đường cổ điển và các tri thức chuyên ngành kỹ thuật hạ tầng. Việc áp dụng **Hybrid A\*** với hàm chi phí tùy biến cho phép kỹ sư tạo ra các phương án thiết kế không chỉ "ngắn nhất" mà còn "kinh tế và bền vững nhất".

---
**HST.AI Team**
#PathPlanning #HybridAStar #ComputationalDesign #HydroStruct #RevitAPI
```
