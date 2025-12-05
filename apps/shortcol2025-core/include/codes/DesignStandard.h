#pragma once
#include "../core/Materials.h"
#include <utility>
#include <string>

namespace ShortCol2025 {
namespace Codes {

    using namespace Core;

    class DesignStandard {
    public:
        virtual ~DesignStandard() = default;

        virtual std::string getName() const = 0;

        // --- CÁC HÀM MỚI ---
        /**
         * @brief Lấy cường độ bê tông dùng cho tính toán thiết kế
         * @param inputFc Giá trị fc người dùng nhập (f'c cho ACI, Rb cho TCVN)
         */
        virtual double getDesignConcreteStrength(double inputFc) const = 0;

        /**
         * @brief Lấy cường độ cốt thép dùng cho tính toán thiết kế
         * @param inputFy Giá trị fy người dùng nhập
         */
        virtual double getDesignSteelYield(double inputFy) const = 0;
        // -------------------

        virtual double getConcreteStress(double epsilon, const ConcreteProp& mat) const = 0;
        virtual double getSteelStress(double epsilon, const SteelProp& mat) const = 0;
        
        /**
         * @return pair<alpha, beta>: alpha là hệ số nhân cường độ, beta là hệ số chiều cao vùng nén
         */
        virtual std::pair<double, double> getStressBlockFactors(const ConcreteProp& mat) const = 0;

        virtual double getReductionFactorPhi(double netTensileStrain, double fy) const = 0;
        
        virtual bool isMaterialFactorBased() const = 0; 
    };

}
}