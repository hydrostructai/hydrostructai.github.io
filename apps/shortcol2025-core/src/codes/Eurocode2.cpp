#include "../../include/codes/Eurocode2.h"
#include <cmath>

namespace ShortCol2025 {
namespace Codes {

    double Eurocode2::getConcreteStress(double epsilon, const ConcreteProp& mat) const {
        // Simplified rectangular stress block for design
        // Stress = eta * fcd
        // Ở đây giả sử DesignStandard interface trả về giá trị cơ bản, 
        // việc nhân eta sẽ nằm ở getStressBlockFactors hoặc tại đây.
        // Để nhất quán với TCVN/ACI, ta trả về fcd
        if (epsilon <= 0) return 0;
        return mat.fc; 
    }

    double Eurocode2::getSteelStress(double epsilon, const SteelProp& mat) const {
        double es = std::abs(epsilon);
        double stress = es * mat.Es;
        if (stress > mat.fy) stress = mat.fy; // fyd
        return (epsilon >= 0) ? stress : -stress;
    }

    std::pair<double, double> Eurocode2::getStressBlockFactors(const ConcreteProp& mat) const {
        // EC2 Cl 3.1.7: Rectangular stress distribution
        // factor lambda (cho chiều cao) và eta (cho cường độ)
        // fck <= 50MPa: lambda = 0.8, eta = 1.0
        // fck > 50MPa: có công thức giảm
        
        // Giả sử chuyển đổi từ fcd ngược lại fck là khó, 
        // ta dùng giá trị mặc định cho bê tông thường (< C50/60)
        double lambda = 0.8;
        double eta = 1.0; 
        
        return {eta, lambda}; 
    }
}
}