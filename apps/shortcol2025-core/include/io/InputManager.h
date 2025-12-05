#pragma once
#include <string>
#include <vector>
#include "../core/Materials.h"

namespace ShortCol2025 {
namespace IO {

    using namespace Core;

    // Cấu trúc lưu trữ một tổ hợp tải trọng
    struct LoadCase {
        double Pu;          // Lực dọc (kN)
        double Mu;          // Mô men (kNm)
        std::string label;  // Tên tổ hợp (VD: TT1, HT1...)
    };

    class InputManager {
    public:
        static std::string promptInputFilename();
        static void generateAndSaveToFile(const std::string& filename);

        // Hàm đọc file cập nhật: Thêm biến standardCode và danh sách loads
        static bool readInputFile(const std::string& filename, 
                                  ConcreteProp& conc, 
                                  SteelProp& steel, 
                                  SectionGeometry& geo, 
                                  std::vector<Rebar>& rebars,
                                  int& standardCode,            // Output: Mã tiêu chuẩn
                                  std::vector<LoadCase>& loads  // Output: Danh sách tải
                                  );
    };

}
}