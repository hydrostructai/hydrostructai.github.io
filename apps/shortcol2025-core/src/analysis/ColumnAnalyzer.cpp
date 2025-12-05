#include "../../include/analysis/ColumnAnalyzer.h"
#include "../../include/math/NumericalSolver.h"
#include <cmath>
#include <algorithm>
#include <iostream>

namespace ShortCol2025 {
namespace Analysis {

    using namespace Math;

    ColumnAnalyzer::ColumnAnalyzer(ConcreteProp c, SteelProp s, SectionGeometry g, const DesignStandard* code)
        : concrete(c), steel(s), geometry(g), designCode(code) {}

    void ColumnAnalyzer::addRebar(Rebar bar) {
        rebars.push_back(bar);
    }

    void ColumnAnalyzer::clearRebars() {
        rebars.clear();
    }

    AnalysisResult ColumnAnalyzer::calculateSectionForces(double c) const {
        AnalysisResult result;
        result.c = c;
        
        // Lấy các giá trị tính toán chuẩn hóa từ tiêu chuẩn
        double fc_design = designCode->getDesignConcreteStrength(concrete.fc);
        double fy_design = designCode->getDesignSteelYield(steel.fy);

        // 1. Xử lý kéo thuần túy
        if (c <= 1e-5) {
            double P_steel = 0;
            double M_steel = 0;
            
            // Dùng cường độ tính toán của thép (fy hoặc Rs)
            double stress = -fy_design; 
            
            for (const auto& bar : rebars) {
                double force = stress * bar.area;
                P_steel += force;
                M_steel += force * bar.y; 
            }
            
            result.Pn = P_steel;
            result.Mn = M_steel;
            // Phi = 0.9 (ACI) hoặc 1.0 (TCVN - vì đã giảm vật liệu rồi)
            result.Phi = designCode->isMaterialFactorBased() ? 1.0 : 0.9;
            result.phiPn = result.Phi * result.Pn;
            result.phiMn = result.Phi * result.Mn;
            result.et = 999.0;
            return result;
        }

        // 2. Tính toán khối ứng suất
        auto factors = designCode->getStressBlockFactors(concrete);
        double alpha = factors.first; 
        double beta = factors.second;

        double a = beta * c; 
        double limit_height = (geometry.shape == SectionShape::CIRCULAR) ? geometry.width : geometry.height;
        if (a > limit_height) a = limit_height;

        double P_conc = 0;
        double M_conc = 0;

        // Tính cường độ khối nén thực tế: 
        // ACI: alpha=0.85, fc_design=f'c => 0.85*f'c
        // TCVN: alpha=1.0, fc_design=Rb => 1.0*Rb
        double fc_calc = alpha * fc_design;

        if (geometry.shape == SectionShape::RECTANGULAR) {
            double Ac = geometry.width * a;
            P_conc = fc_calc * Ac;
            double y_c = (geometry.height / 2.0) - (a / 2.0);
            M_conc = P_conc * y_c;
        } else if (geometry.shape == SectionShape::CIRCULAR) {
            auto circProps = getCircularCompressionProp(a);
            P_conc = fc_calc * circProps.first;
            M_conc = P_conc * circProps.second;
        }

        // 3. Tính cốt thép
        double P_steel = 0;
        double M_steel = 0;
        double min_strain = 100.0;
        double y_top = (geometry.shape == SectionShape::CIRCULAR) ? geometry.width / 2.0 : geometry.height / 2.0;

        for (const auto& bar : rebars) {
            double d_i = y_top - bar.y; 
            double strain = concrete.ec_max * (c - d_i) / c;
            
            // Hàm getSteelStress tự xử lý logic đàn hồi dẻo dựa trên fy_design
            // Lưu ý: Chúng ta truyền steel gốc, nhưng DesignStandard sẽ dùng logic riêng
            double stress = designCode->getSteelStress(strain, steel);
            
            double force = stress * bar.area;
            P_steel += force;
            M_steel += force * bar.y;

            if (strain < min_strain) min_strain = strain;
        }

        result.Pn = P_conc + P_steel;
        result.Mn = M_conc + M_steel;

        double et = (min_strain < 0) ? -min_strain : 0.0;
        result.et = et;
        result.Phi = designCode->getReductionFactorPhi(et, steel.fy);

        result.phiPn = result.Phi * result.Pn;
        result.phiMn = result.Phi * result.Mn;

        return result;
    }

    std::vector<AnalysisResult> ColumnAnalyzer::generateInteractionDiagram(int numPoints) {
        std::vector<AnalysisResult> points;
        double h = (geometry.shape == SectionShape::CIRCULAR) ? geometry.width : geometry.height;
        
        std::vector<double> c_values;
        c_values.push_back(h * 100.0);
        c_values.push_back(h * 2.0);
        
        for (int i = 0; i <= numPoints; ++i) {
            double t = (double)i / numPoints;
            double c = h * (1.1 - t); 
            if (c < 1.0) c = 1.0;
            c_values.push_back(c);
        }
        c_values.push_back(0.001);

        for (double c : c_values) {
            points.push_back(calculateSectionForces(c));
        }
        
        // Không sort ở đây để giữ thứ tự vẽ biểu đồ từ Nén -> Kéo
        return points;
    }
    
    // ... (Giữ nguyên các hàm solveNeutralAxisForLoad và getCircularCompressionProp)
    double ColumnAnalyzer::solveNeutralAxisForLoad(double targetPn) {
        auto objectiveFunc = [&](double c) {
            AnalysisResult res = calculateSectionForces(c);
            return res.Pn - targetPn;
        };
        double h = (geometry.shape == SectionShape::CIRCULAR) ? geometry.width : geometry.height;
        double min_c = 0.1;
        double max_c = h * 5.0;

        if (objectiveFunc(min_c) > 0) return min_c; 
        if (objectiveFunc(max_c) < 0) return max_c;

        SolverResult res = Solver::solveBrent(objectiveFunc, min_c, max_c);
        return res.converged ? res.root : h; 
    }

    std::pair<double, double> ColumnAnalyzer::getCircularCompressionProp(double a) const {
        double D = geometry.width;
        double R = D / 2.0;
        if (a >= D) return {3.14159265359 * R * R, 0.0};
        if (a <= 0) return {0.0, -R};
        
        double term1 = R - a;
        // Kẹp giá trị cho acos
        if (term1 > R) term1 = R;
        if (term1 < -R) term1 = -R;

        double theta = 2.0 * std::acos(term1 / R); 
        double Area = 0.5 * R * R * (theta - std::sin(theta));
        double MomentAboutCenter = (2.0/3.0) * std::pow(R, 3) * std::pow(std::sin(theta/2.0), 3);
        
        return {Area, MomentAboutCenter / Area};
    }

}
}