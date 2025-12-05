#pragma once

#include "../core/Materials.h"
#include "../codes/DesignStandard.h"
#include <vector>
#include <utility>

namespace ShortCol2025 {
namespace Analysis {

    using namespace Core;
    using namespace Codes;

    /**
     * @brief Cấu trúc chứa kết quả phân tích tại một điểm trên biểu đồ tương tác
     */
    struct AnalysisResult {
        double Pn;      // Lực dọc danh nghĩa (Nominal Axial Force) - kN
        double Mn;      // Mô men danh nghĩa (Nominal Moment) - kNm
        double Phi;     // Hệ số giảm cường độ (Strength Reduction Factor)
        double c;       // Chiều sâu trục trung hòa (Neutral Axis Depth) - mm
        double phiPn;   // Lực dọc thiết kế (Design Axial Force) = Phi * Pn
        double phiMn;   // Mô men thiết kế (Design Moment) = Phi * Mn
        double et;      // Biến dạng kéo ròng tại thớ thép ngoài cùng (Net Tensile Strain)
    };

    /**
     * @brief Lớp phân tích chính (The Main Analyzer Class)
     * Chịu trách nhiệm thực hiện tính toán Strain Compatibility (Tương thích biến dạng).
     */
    class ColumnAnalyzer {
    private:
        ConcreteProp concrete;          // Vật liệu bê tông
        SteelProp steel;                // Vật liệu cốt thép
        SectionGeometry geometry;       // Hình học tiết diện (b, h, D)
        std::vector<Rebar> rebars;      // Danh sách cốt thép
        const DesignStandard* designCode; // Con trỏ tới tiêu chuẩn thiết kế (Strategy)

    public:
        /**
         * @brief Constructor
         * @param c Thuộc tính bê tông
         * @param s Thuộc tính cốt thép
         * @param g Hình học tiết diện
         * @param code Con trỏ tới tiêu chuẩn thiết kế (ACI, Eurocode...)
         */
        ColumnAnalyzer(ConcreteProp c, SteelProp s, SectionGeometry g, const DesignStandard* code);

        /**
         * @brief Thêm một thanh thép vào tiết diện
         * @param bar Đối tượng thanh thép
         */
        void addRebar(Rebar bar);

        /**
         * @brief Xóa toàn bộ cốt thép (để reset bài toán)
         */
        void clearRebars();

        /**
         * @brief Tính toán nội lực (P, M) tại một chiều sâu trục trung hòa c giả định.
         * Đây là hàm cốt lõi thực hiện phương pháp "Strain Compatibility".
         * * @param neutralAxisDepth (c) Chiều sâu trục trung hòa từ thớ nén cực hạn (mm).
         * c = infinity: Nén thuần túy.
         * c = 0: Kéo thuần túy (lý thuyết).
         * @return AnalysisResult Kết quả Pn, Mn, Phi...
         */
        AnalysisResult calculateSectionForces(double neutralAxisDepth) const;

        /**
         * @brief Tạo toàn bộ biểu đồ tương tác (Interaction Diagram)
         * Hàm này sẽ tự động quét giá trị c từ lớn nhất (nén) đến nhỏ nhất (kéo).
         * * @param numPoints Số lượng điểm muốn vẽ trên biểu đồ (mặc định 50-100)
         * @return std::vector<AnalysisResult> Danh sách các điểm để vẽ đồ thị
         */
        std::vector<AnalysisResult> generateInteractionDiagram(int numPoints = 60);

        /**
         * @brief Tìm chiều sâu trục trung hòa c ứng với một lực dọc Pu cho trước.
         * Sử dụng thuật toán Brent-Dekker để giải phương trình ngược: P(c) - Pu = 0.
         * Hàm này thay thế tính năng GoalSeek của Excel cũ.
         * * @param targetPn Lực dọc danh nghĩa mục tiêu
         * @return double Chiều sâu trục trung hòa c tìm được
         */
        double solveNeutralAxisForLoad(double targetPn);
        
    private:
        // Các hàm tiện ích nội bộ (Helpers)
        
        /**
         * @brief Tính diện tích và trọng tâm của vùng nén hình viên phân (Circular Segment)
         * Dùng cho cột tròn.
         * @param a Chiều cao vùng nén hiệu dụng (depth of stress block)
         * @return pair<double, double> {Diện tích nén Ac, Khoảng cách từ tâm đến trọng tâm nén Yc}
         */
        std::pair<double, double> getCircularCompressionProp(double a) const;
    };

} // namespace Analysis
} // namespace ShortCol2025