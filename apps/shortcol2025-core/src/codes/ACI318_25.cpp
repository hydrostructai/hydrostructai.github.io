#include "../../include/codes/ACI318_25.h"
#include <algorithm>
#include <cmath>

namespace ShortCol2025 {
namespace Codes {

    std::string ACI318_25::getName() const {
        return "ACI 318-25 (USA)";
    }

    double ACI318_25::getConcreteStress(double epsilon, const ConcreteProp& mat) const {
        // ACI 318 sử dụng khối ứng suất chữ nhật tương đương (Whitney Stress Block) cho thiết kế.
        // Khi phân tích tích phân (Fiber model), ta thường dùng 0.85*f'c cho vùng nén
        // và giới hạn chiều cao vùng nén a = beta1 * c bên trong Solver.
        // Hàm này trả về ứng suất tại một điểm biến dạng cụ thể.
        
        // Giả sử quy ước: Biến dạng dương (>0) là Nén, âm (<0) là Kéo.
        if (epsilon <= 0) return 0.0; // Bê tông bỏ qua chịu kéo

        // Với thiết kế theo ACI, ứng suất tính toán lớn nhất là 0.85 * f'c
        return 0.85 * mat.fc;
    }

    double ACI318_25::getSteelStress(double epsilon, const SteelProp& mat) const {
        // Mô hình Elastoplastic (Đàn hồi - Dẻo lý tưởng)
        // fs = Es * epsilon, giới hạn bởi fy
        
        double es = std::abs(epsilon);
        double stress = es * mat.Es;

        if (stress > mat.fy) {
            stress = mat.fy;
        }

        // Giữ nguyên dấu của biến dạng (Dương nén, Âm kéo)
        return (epsilon >= 0) ? stress : -stress;
    }

    std::pair<double, double> ACI318_25::getStressBlockFactors(const ConcreteProp& mat) const {
        // Theo ACI 318-19/25, Table 22.2.2.4.3:
        
        // 1. Hệ số cường độ khối nén (alpha): Luôn là 0.85
        double alpha = 0.85;

        // 2. Hệ số chiều cao vùng nén (beta1):
        // - 0.85 nếu f'c <= 28 MPa (4000 psi)
        // - Giảm 0.05 cho mỗi 7 MPa (1000 psi) tăng thêm
        // - Giá trị nhỏ nhất là 0.65
        
        double beta1 = 0.85;
        
        if (mat.fc > 28.0) {
            // Công thức: 0.85 - 0.05 * (f'c - 28) / 7
            beta1 = 0.85 - 0.05 * (mat.fc - 28.0) / 7.0;
        }

        if (beta1 < 0.65) {
            beta1 = 0.65;
        }

        return {alpha, beta1};
    }

    double ACI318_25::getReductionFactorPhi(double netTensileStrain, double fy) const {
        // Theo ACI 318-19/25, Table 21.2.2:
        // netTensileStrain (et) là biến dạng kéo ròng tại thớ thép ngoài cùng.
        // Lưu ý: Hàm này nhận đầu vào et là giá trị DƯƠNG (độ lớn biến dạng kéo).
        // Nếu et <= 0 (đang bị nén), nó rơi vào vùng kiểm soát nén.

        double et = netTensileStrain;
        
        // Định nghĩa giới hạn biến dạng chảy (ty)
        // ACI cho phép thép cường độ cao, nên ty tính theo fy thực tế.
        // Es mặc định 200,000 MPa (29,000 ksi)
        double Es = 200000.0; 
        double ty = fy / Es; 

        // 1. Vùng kiểm soát nén (Compression-controlled)
        // Điều kiện: et <= ty
        // Phi = 0.65 cho cột đai thường (Other/Tied)
        // (Phi = 0.75 cho cột đai xoắn - Spiral, nhưng ở đây ta mặc định là Tied cho tổng quát)
        if (et <= ty) {
            return 0.65;
        }

        // 2. Vùng kiểm soát kéo (Tension-controlled)
        // Điều kiện: et >= ty + 0.003
        // Phi = 0.90
        double limit_tension = ty + 0.003;
        if (et >= limit_tension) {
            return 0.90;
        }

        // 3. Vùng chuyển tiếp (Transition zone)
        // Nội suy tuyến tính giữa 0.65 và 0.90
        // Phi = 0.65 + 0.25 * (et - ty) / ((ty + 0.003) - ty)
        //     = 0.65 + 0.25 * (et - ty) / 0.003
        
        return 0.65 + 0.25 * (et - ty) / 0.003;
    }

} // namespace Codes
} // namespace ShortCol2025