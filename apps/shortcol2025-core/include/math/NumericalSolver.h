#pragma once

#include <functional>
#include <cmath>
#include <limits>
#include <string>

namespace ShortCol2025 {
namespace Math {

    /**
     * @brief Cấu trúc lưu trữ kết quả của quá trình tìm nghiệm
     */
    struct SolverResult {
        double root;        // Nghiệm tìm được (x)
        double value;       // Giá trị f(x) tại nghiệm (lý tưởng là 0)
        int iterations;     // Số vòng lặp đã thực hiện
        bool converged;     // True nếu thuật toán hội tụ thành công
        std::string message; // Thông báo trạng thái hoặc lỗi (nếu có)
    };

    /**
     * @brief Định nghĩa kiểu hàm số
     * Func: Hàm mục tiêu f(x)
     * Deriv: Hàm đạo hàm f'(x)
     */
    using Func = std::function<double(double)>;
    using Deriv = std::function<double(double)>;

    class Solver {
    public:
        /**
         * @brief Phương pháp Brent-Dekker (Brent's Method)
         * * Đây là thuật toán chính cho bài toán cột bê tông cốt thép.
         * Nó kết hợp độ an toàn của phương pháp Chia đôi (Bisection) và tốc độ của phương pháp Secant/Inverse Quadratic Interpolation.
         * * Ưu điểm: Đảm bảo luôn hội tụ miễn là nghiệm nằm trong khoảng [min, max].
         * Rất phù hợp cho hàm ứng suất không trơn (do nứt bê tông hoặc cốt thép chảy dẻo).
         * * @param f Hàm mục tiêu f(x) cần tìm nghiệm sao cho f(x) = 0
         * @param min Cận dưới của khoảng tìm kiếm
         * @param max Cận trên của khoảng tìm kiếm
         * @param tol Sai số cho phép (mặc định 1e-7)
         * @param maxIter Số vòng lặp tối đa (mặc định 100)
         * @return SolverResult
         */
        static SolverResult solveBrent(Func f, double min, double max, double tol = 1e-7, int maxIter = 100);

        /**
         * @brief Phương pháp Newton-Raphson
         * * Sử dụng đạo hàm để tìm nghiệm nhanh hơn (hội tụ bậc 2).
         * Chỉ nên sử dụng khi hàm số trơn (smooth) và tính được đạo hàm chính xác.
         * Trong bài toán cột, có thể dùng cho tiết diện tròn đàn hồi hoặc kiểm tra độ cong.
         * * @param f Hàm mục tiêu f(x)
         * @param df Hàm đạo hàm f'(x)
         * @param guess Giá trị dự đoán ban đầu
         * @param tol Sai số cho phép
         * @param maxIter Số vòng lặp tối đa
         * @return SolverResult
         */
        static SolverResult solveNewton(Func f, Deriv df, double guess, double tol = 1e-7, int maxIter = 50);
    };

} // namespace Math
} // namespace ShortCol2025
