---
layout: single
title: "Terrain-Aware Pathfinding: Thuật toán Tối ưu Tuyến Cống ngầm trên Địa hình Phức tạp"
date: 2024-06-01 08:30:00 +0700
categories: [Algorithms, Hydraulic Engineering, Python, Revit API]
tags: [A-Star, Optimization, Computational Design, Infrastructure, Open Source]
author: "HydroStructAI Team"
image: "/assets/images/posts/pathfinding-terrain-cover.jpg"
description: "Đi sâu vào thuật toán tìm đường A* cải tiến, tích hợp biến số địa hình và thủy lực để tối ưu hóa tuyến cống ngầm, cân bằng giữa chi phí đào đắp và khả năng tự chảy."
excerpt: "Làm thế nào để tìm đường đi ngắn nhất nhưng chi phí thấp nhất trên một địa hình gồ ghề? Bài viết này chia sẻ mã nguồn và thuật toán Terrain-aware A*."
---

**Mức độ:** Chuyên gia (Expert)  
**Repository:** *Link Github - Coming Soon*

---

## 1. Đặt vấn đề: Khi đường ngắn nhất không phải đường tốt nhất

Trong bài viết trước về **Neuro-Symbolic AI**, chúng ta đã thảo luận về việc AI có thể "tư duy" để đưa ra chiến lược thiết kế. Tuy nhiên, để hiện thực hóa chiến lược đó thành bản vẽ kỹ thuật, chúng ta cần các thuật toán thực thi chính xác.

Trong thiết kế hạ tầng, bài toán vạch tuyến cống thoát nước khác hoàn toàn với bài toán tìm đường kiểu Google Maps.

- **Google Maps (2D):** Tìm đường ngắn nhất trên mặt phẳng.
- **Thoát nước (3D):** Tìm đường trong không gian 3D, có ràng buộc:
  - Độ dốc phải nằm trong `[i_min, i_max]`
  - $z_{start} > z_{end}$ đảm bảo tự chảy
  - Tránh đào sâu quá mức → chi phí lớn

Do đó cần **Terrain-Aware Pathfinding**.

---

## 2. Mô hình Toán học: Cost Function cải tiến

Thuật toán gốc vẫn là **A\*** nhưng hàm chi phí được mở rộng:

$$f(n) = g(n) + h(n) + C_{terrain}(n) + C_{hydraulic}(n)$$

Trong đó:

- **$g(n)$** – chi phí thực từ điểm đầu đến node hiện tại  
- **$h(n)$** – heuristic đến đích  
- **$C_{terrain}$** – phạt khi đào đắp lớn  
- **$C_{hydraulic}$** – phạt khi không đảm bảo điều kiện thủy lực

Ràng buộc thủy lực quan trọng:

- $i < i_{min}$ → nước không chảy → **phạt vô cực**
- $i > i_{max}$ → xói lở → **phạt lớn**
- Đi *ngược dốc* → **phạt vô cực** (trừ khi có bơm)

---

## 3. Triển khai Thuật toán (Python Prototype)

### 3.1. Định nghĩa Node & Chi phí

```python
import heapq
import math

class TerrainNode:
    def __init__(self, x, y, z):
        self.x = x
        self.y = y
        self.z = z   # Cao độ tự nhiên (DEM)
        self.g = float('inf')
        self.h = 0
        self.parent = None

def calculate_hydraulic_cost(current_node, neighbor_node, required_slope=0.005):
    dist = math.sqrt(
        (current_node.x - neighbor_node.x)**2 +
        (current_node.y - neighbor_node.y)**2
    )

    ground_slope = (current_node.z - neighbor_node.z) / dist
    cost = 0

    # 1. Nếu đi lên dốc → tăng chi phí đào đất
    if neighbor_node.z > current_node.z:
        excavation_depth = neighbor_node.z - (current_node.z - dist * required_slope)
        cost += 100 * (excavation_depth ** 2)

    # 2. Tránh đi vào sườn dốc đứng
    if abs(ground_slope) > 0.5:
        cost += 10000  # Unbuildable zone

    return cost + dist


---

3.2. Thuật toán A* có nhận thức địa hình

def terrain_astar(grid, start_node, end_node):
    open_list = []
    heapq.heappush(open_list, (0, start_node))
    start_node.g = 0
    
    while open_list:
        current_cost, current = heapq.heappop(open_list)
        
        if current == end_node:
            return reconstruct_path(end_node)
            
        for neighbor in get_neighbors(current, grid):
            movement_cost = calculate_hydraulic_cost(current, neighbor)
            tentative_g = current.g + movement_cost
            
            if tentative_g < neighbor.g:
                neighbor.parent = current
                neighbor.g = tentative_g
                neighbor.h = heuristic(neighbor, end_node)
                f_score = neighbor.g + neighbor.h
                heapq.heappush(open_list, (f_score, neighbor))
                
    return None


---

4. Tích hợp Revit API (C#)

Sau khi Python/C# tính toán ra tuyến tối ưu gồm các điểm (x, y, z_invert), bước kế tiếp là dựng ống trong Revit.

Tạo tuyến ống từ danh sách điểm:

public void CreateOptimizedPipeNetwork(
    Document doc, 
    List<XYZ> pathPoints, 
    ElementId pipeTypeId, 
    ElementId levelId)
{
    using (Transaction t = new Transaction(doc, "Create Terrain-Aware Pipes"))
    {
        t.Start();
        
        for (int i = 0; i < pathPoints.Count - 1; i++)
        {
            XYZ p1 = pathPoints[i];
            XYZ p2 = pathPoints[i + 1];
            
            // Tạo pipe
            Pipe pipe = Pipe.Create(
                doc, pipeTypeId, levelId, p1, p2
            );

            // Gán slope nếu cần
            Parameter slopeParam = pipe.get_Parameter(BuiltInParameter.RBS_PIPE_SLOPE);
            if (slopeParam != null)
            {
                slopeParam.Set(0.01); // 1%
            }
        }
        
        t.Commit();
    }
}

Lưu ý:
Revit không tạo Connector trực tiếp từ XYZ. Đoạn trên là pseudo-code; trong thực tế cần:

Tạo Pipe bằng Pipe.Create(doc, systemTypeId, pipeTypeId, levelId, p1, p2)

Raytrace địa hình bằng ReferenceIntersector để lấy cao độ chính xác từng node.



---

5. Kết luận

Thuật toán Terrain-aware A* giúp:

Tránh đào sâu không kinh tế

Đảm bảo độ dốc dòng chảy

Tránh các khu vực địa hình nguy hiểm

Tự động hóa quyết định tuyến cống tối ưu


Đây là bước nền cho hệ thống Tự động hóa hạ tầng Revit/Civil 3D sử dụng AI + thuật toán tính toán.


---

Tags:
#AStar #Pathfinding #RevitAPI #ThuyLoi #Automation #CivilEngineering
