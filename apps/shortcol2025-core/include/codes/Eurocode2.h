#pragma once
#include "DesignStandard.h"

namespace ShortCol2025 {
namespace Codes {

    class Eurocode2 : public DesignStandard {
    public:
        virtual ~Eurocode2() = default;
        std::string getName() const override { return "Eurocode 2 (EN 1992-1-1)"; }

        // EC2: Input fcd và fyd
        double getDesignConcreteStrength(double inputFc) const override { return inputFc; }
        double getDesignSteelYield(double inputFy) const override { return inputFy; }

        double getConcreteStress(double epsilon, const ConcreteProp& mat) const override;
        double getSteelStress(double epsilon, const SteelProp& mat) const override;
        std::pair<double, double> getStressBlockFactors(const ConcreteProp& mat) const override;
        
        // EC2 dùng hệ số riêng phần, không dùng Phi đầu ra
        double getReductionFactorPhi(double netTensileStrain, double fy) const override { return 1.0; }
        bool isMaterialFactorBased() const override { return true; }
    };
}
}