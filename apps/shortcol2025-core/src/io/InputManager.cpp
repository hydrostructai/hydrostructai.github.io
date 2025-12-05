#include "../../include/io/InputManager.h"
#include <iostream>
#include <fstream>
#include <cmath>
#include <iomanip>

namespace ShortCol2025 {
namespace IO {

    std::string InputManager::promptInputFilename() {
        std::string filename;
        std::cout << ">> Nhap ten file input (mac dinh: input1.txt): ";
        std::getline(std::cin, filename);
        if (filename.empty()) filename = "input1.txt";
        return filename;
    }

    // Cập nhật hàm sinh file mẫu theo format đẹp
    void InputManager::generateAndSaveToFile(const std::string& filename) {
        // Data mẫu
        double D = 500.0;
        double cover = 40.0;
        int numBars = 10;
        double db = 16.0;
        double barArea = 201.0;
        
        // Tính toán tọa độ tròn
        double Rs = (D / 2.0) - cover - (db / 2.0);
        std::vector<Rebar> bars;
        for (int i = 0; i < numBars; ++i) {
            double theta = 2.0 * 3.14159 * i / numBars;
            // Xoay góc để thanh đầu tiên nằm ngang (như mẫu của bạn) hoặc dọc tùy ý
            // Ở đây giữ nguyên cos/sin cơ bản, thanh đầu tiên tại góc 0 (phải)
            double x = Rs * std::cos(theta);
            double y = Rs * std::sin(theta);
            bars.emplace_back(x, y, barArea, db);
        }

        std::ofstream file(filename);
        if (!file.is_open()) return;

        file << std::fixed << std::setprecision(1);

        file << "# VAT LIEU (Materials)\n";
        file << "# f'c (MPa)   fy (MPa)   Ec (MPa)   Es (MPa)   eps_max\n";
        file << std::left << std::setw(14) << "30.0" 
             << std::setw(11) << "420.0" 
             << std::setw(11) << "25742.0" 
             << std::setw(11) << "200000.0" 
             << "0.003\n\n";

        file << "# TIET DIEN (Section Geometry)\n";
        file << "# Shape (0:Rect, 1:Circ)   Width/Dia (mm)   Height (mm)\n";
        file << std::left << std::setw(27) << "1" 
             << std::setw(17) << D 
             << "0.0\n\n";

        file << "# COT THEP (Rebars)\n";
        file << "# So luong thanh (Number of bars)\n";
        file << numBars << "\n";
        file << "# Danh sach toa do: x (mm)   y (mm)   Area (mm2)   Dia (mm)\n";
        
        file << std::setprecision(1);
        for (const auto& b : bars) {
            file << std::left 
                 << std::setw(13) << b.x 
                 << std::setw(13) << b.y 
                 << std::setw(13) << b.area 
                 << b.diameter << "\n";
        }
        file << "\n";

        file << "# TIEU CHUAN (Design Code)\n";
        file << "# 0: ACI 318-25, 1: TCVN 5574, 2: Eurocode\n";
        file << "0\n\n";

        file << "# TO HOP NOI LUC (Load Combinations)\n";
        file << "# So luong to hop\n3\n";
        file << "# Pu (kN)     Mu (kNm)     Label\n";
        file << std::left << std::setw(14) << "3500.0" << std::setw(13) << "50.0" << "Combo1_NenLon\n";
        file << std::left << std::setw(14) << "1500.0" << std::setw(13) << "300.0" << "Combo2_UonLon\n";
        file << std::left << std::setw(14) << "200.0" << std::setw(13) << "100.0" << "Combo3_NenIt\n";

        file.close();
        std::cout << "-> Da tao file mau: " << filename << std::endl;
    }

    bool InputManager::readInputFile(const std::string& filename, 
                                     ConcreteProp& conc, SteelProp& steel, 
                                     SectionGeometry& geo, std::vector<Rebar>& rebars,
                                     int& standardCode,
                                     std::vector<LoadCase>& loads) {
        std::ifstream file(filename);
        if (!file.is_open()) {
            std::cerr << "Loi: Khong tim thay file " << filename << std::endl;
            return false;
        }

        std::string line;
        auto skipComments = [&](std::ifstream& f) {
            while (f.peek() == '#' || f.peek() == '\n' || f.peek() == ' ' || f.peek() == '\r') {
                std::getline(f, line);
            }
        };

        try {
            // 1. Vật liệu
            skipComments(file);
            file >> conc.fc >> steel.fy >> conc.Ec >> steel.Es >> conc.ec_max;
            steel.updateYieldStrain();

            // 2. Tiết diện
            skipComments(file);
            int shapeInt;
            file >> shapeInt >> geo.width >> geo.height;
            geo.shape = (shapeInt == 1) ? SectionShape::CIRCULAR : SectionShape::RECTANGULAR;

            // 3. Cốt thép (Thứ tự mới: Đọc cốt thép trước)
            skipComments(file);
            int numBars;
            file >> numBars;
            rebars.clear();
            skipComments(file);
            for (int i = 0; i < numBars; ++i) {
                double x, y, area, dia;
                file >> x >> y >> area >> dia;
                rebars.emplace_back(x, y, area, dia);
            }

            // 4. Tiêu chuẩn (Thứ tự mới: Đọc sau cốt thép)
            skipComments(file);
            file >> standardCode;

            // 5. Tổ hợp tải trọng
            skipComments(file);
            int numLoads;
            file >> numLoads;
            loads.clear();
            skipComments(file);
            for (int i = 0; i < numLoads; ++i) {
                LoadCase lc;
                file >> lc.Pu >> lc.Mu >> lc.label;
                loads.push_back(lc);
            }

        } catch (...) {
            std::cerr << "Loi: Dinh dang file input khong hop le!" << std::endl;
            return false;
        }

        file.close();
        return true;
    }

}
}