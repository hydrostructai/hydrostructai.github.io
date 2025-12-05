#pragma once
#include <vector>
#include <cmath>
#include <string>

namespace ShortCol2025 {
namespace Core {

    /**
     * @brief Các thuộc tính của Bê tông (Concrete Properties)
     */
    struct ConcreteProp {
        double fc;      // Cường độ chịu nén đặc trưng (MPa) - f'c (ACI) hoặc fck (Eurocode)
        double ec_max;  // Biến dạng nén cực hạn (ví dụ: 0.003 cho ACI, 0.0035 cho EC)
        double Ec;      // Mô đun đàn hồi của bê tông (MPa)

        // Constructor mặc định
        ConcreteProp() : fc(0), ec_max(0.003), Ec(0) {}

        // Constructor đầy đủ
        ConcreteProp(double _fc, double _ec_max, double _Ec) 
            : fc(_fc), ec_max(_ec_max), Ec(_Ec) {}
    };

    /**
     * @brief Các thuộc tính của Cốt thép (Steel Reinforcement Properties)
     */
    struct SteelProp {
        double fy;      // Cường độ chảy (Yield Strength) (MPa)
        double Es;      // Mô đun đàn hồi (Elastic Modulus) (MPa)
        double ey;      // Biến dạng chảy (Yield Strain) = fy / Es

        SteelProp() : fy(0), Es(200000), ey(0) {}

        SteelProp(double _fy, double _Es) : fy(_fy), Es(_Es) {
            updateYieldStrain();
        }

        void updateYieldStrain() {
            if (Es != 0) ey = fy / Es;
        }
    };

    /**
     * @brief Định nghĩa một thanh cốt thép đơn lẻ (Single Rebar)
     */
    struct Rebar {
        double x;       // Tọa độ X so với trọng tâm tiết diện (mm)
        double y;       // Tọa độ Y so với trọng tâm tiết diện (mm)
        double area;    // Diện tích tiết diện ngang của thanh (mm2)
        double diameter; // Đường kính thanh (mm) - dùng để hiển thị hoặc tính khoảng cách

        Rebar(double _x, double _y, double _area, double _dia)
            : x(_x), y(_y), area(_area), diameter(_dia) {}
    };

    /**
     * @brief Hình dạng tiết diện
     */
    enum class SectionShape { 
        RECTANGULAR = 0, 
        CIRCULAR = 1 
    };

    /**
     * @brief Thông số hình học của tiết diện (Section Geometry)
     */
    struct SectionGeometry {
        SectionShape shape; // RECTANGULAR hoặc CIRCULAR
        double width;       // Chiều rộng (b) hoặc Đường kính (D) nếu là tròn
        double height;      // Chiều cao (h) hoặc 0 nếu là tròn
        double cover;       // Lớp bê tông bảo vệ (clear cover) - tùy chọn dùng cho UI

        SectionGeometry(SectionShape _s, double _w, double _h, double _c = 30.0)
            : shape(_s), width(_w), height(_h), cover(_c) {}
    };

} // namespace Core
} // namespace ShortCol2025