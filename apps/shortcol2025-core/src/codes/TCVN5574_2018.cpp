#include "../../include/codes/TCVN5574_2018.h"
#include <cmath>

namespace ShortCol2025 {
namespace Codes {

    double TCVN5574_2018::getConcreteStress(double epsilon, const ConcreteProp& mat) const {
        if (epsilon <= 0) return 0;
        // TCVN tính theo khối ứng suất chữ nhật tương đương với giá trị Rb
        return mat.fc; // mat.fc ở đây đã là Rb
    }

    double TCVN5574_2018::getSteelStress(double epsilon, const SteelProp& mat) const {
        // Biểu đồ hai đoạn thẳng (Elastoplastic) với Rs
        double es = std::abs(epsilon);
        double stress = es * mat.Es;
        if (stress > mat.fy) stress = mat.fy; // mat.fy ở đây đã là Rs
        return (epsilon >= 0) ? stress : -stress;
    }

    std::pair<double, double> TCVN5574_2018::getStressBlockFactors(const ConcreteProp& mat) const {
        // TCVN 5574:2018 Điều 8.1.2.3
        // Sơ đồ ứng suất chữ nhật tương đương:
        // Cường độ = Rb (alpha = 1.0 so với giá trị thiết kế)
        // Chiều cao vùng nén qui ước y = beta * x
        // beta = 0.8 với Bê tông <= B60
        // (Giả định bê tông thường)
        return {1.0, 0.8}; 
    }
}
}