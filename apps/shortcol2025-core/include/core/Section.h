#pragma once

namespace ShortCol2025 {
namespace Core {

    enum class SectionShape { 
        RECTANGULAR = 0, 
        CIRCULAR = 1 
    };

    struct SectionGeometry {
        SectionShape shape;
        double width;       // b hoặc D
        double height;      // h (0 nếu tròn)
        double cover;       // Lớp bảo vệ

        SectionGeometry(SectionShape _s, double _w, double _h, double _c = 30.0)
            : shape(_s), width(_w), height(_h), cover(_c) {}
    };
}
}