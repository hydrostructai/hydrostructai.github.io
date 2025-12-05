
    /**
     * @brief Triển khai tiêu chuẩn ACI 318-25 (Building Code Requirements for Structural Concrete)
     * * Cập nhật các thay đổi mới nhất từ ACI 318-19 về bê tông cường độ cao và thép cường độ cao.
     * * Sử dụng khối ứng suất chữ nhật tương đương Whitney (Whitney Stress Block).
     * * Hệ số giảm cường độ (Phi) dựa trên biến dạng kéo ròng (Net Tensile Strain).
     */


        /**
         * @brief Tên hiển thị: "ACI 318-25 (USA)"
         */
        //std::string getName() const override;

        /**
         * @brief Mô hình ứng suất nén bê tông
         * Trong tính toán thiết kế (Design Strength), ACI cho phép dùng khối chữ nhật tương đương.
         * Tuy nhiên, hàm này trả về 0.85*fc để tương thích với việc tích phân số nếu cần.
         */
        double getConcreteStress(double epsilon, const ConcreteProp& mat) const override;

        /**
         * @brief Mô hình ứng suất cốt thép
         * Elastoplastic (Đàn hồi - Dẻo lý tưởng).
         * ACI 318-19/25 cho phép thép cường độ cao (Grade 80, 100) lên tới fy = 690 MPa.
         */
        //double getSteelStress(double epsilon, const SteelProp& mat) const override;

        /**
         * @brief Tính các hệ số khối ứng suất Whitney (alpha, beta)
         * - alpha (hệ số cường độ): Luôn là 0.85
         * - beta (hệ số chiều cao vùng nén beta1): 
         * 0.85 với fc <= 28 MPa (4000 psi).
         * Giảm 0.05 cho mỗi 7 MPa (1000 psi) tăng thêm.
         * Giới hạn thấp nhất là 0.65.
         */
        //std::pair<double, double> getStressBlockFactors(const ConcreteProp& mat) const override;

        /**
         * @brief Hệ số giảm cường độ (Strength Reduction Factor - Phi)
         * Dựa trên biến dạng kéo ròng (epsilon_t) tại thớ thép ngoài cùng:
         * - Vùng kiểm soát nén (Compression-controlled): Phi = 0.65 (hoặc 0.75 cho cột đai xoắn)
         * - Vùng kiểm soát kéo (Tension-controlled): Phi = 0.90
         * - Vùng chuyển tiếp (Transition): Nội suy tuyến tính.
         * 
         */
        //double getReductionFactorPhi(double netTensileStrain, double fy) const override;

        /**
         * @brief ACI sử dụng hệ số Phi giảm nội lực cuối cùng (Capacity reduction), 
         * không phải giảm cường độ vật liệu đầu vào.
         * @return false
         */
#pragma once
#include "DesignStandard.h"

namespace ShortCol2025 {
namespace Codes {

    class ACI318_25 : public DesignStandard {
    public:
        virtual ~ACI318_25() = default;
        std::string getName() const override { return "ACI 318-25 (USA)"; }

        // ACI dùng trực tiếp f'c và fy, không giảm ở bước nhập liệu
        double getDesignConcreteStrength(double inputFc) const override { return inputFc; }
        double getDesignSteelYield(double inputFy) const override { return inputFy; }

        double getConcreteStress(double epsilon, const ConcreteProp& mat) const override;
        double getSteelStress(double epsilon, const SteelProp& mat) const override;
        std::pair<double, double> getStressBlockFactors(const ConcreteProp& mat) const override;
        double getReductionFactorPhi(double netTensileStrain, double fy) const override;
        bool isMaterialFactorBased() const override { return false; }
    };
}
}

} // namespace Codes
} // namespace ShortCol2025