#NumericalSolver.cpp
#include "../../include/math/NumericalSolver.h"
#include <algorithm>
#include <cmath>
#include <limits>

namespace ShortCol2025 {
namespace Math {

    // --- Triển khai thuật toán Brent-Dekker ---
    SolverResult Solver::solveBrent(Func f, double min, double max, double tol, int maxIter) {
        double a = min;
        double b = max;
        double fa = f(a);
        double fb = f(b);

        SolverResult result;
        result.iterations = 0;
        result.converged = false;

        // Kiểm tra xem nghiệm có nằm trong khoảng phân ly không
        if (fa * fb > 0.0) {
            result.root = std::numeric_limits<double>::quiet_NaN();
            result.value = 0.0;
            result.message = "Root must be bracketed. f(min) and f(max) must have opposite signs.";
            return result;
        }

        double c = a;
        double fc = fa;
        double d = b - a; // Khoảng cách bước trước
        double e = d;     // Khoảng cách bước trước nữa

        for (int iter = 0; iter < maxIter; ++iter) {
            result.iterations = iter + 1;

            // Đổi chỗ để b luôn là điểm gần nghiệm nhất (f(b) nhỏ nhất)
            if (std::abs(fc) < std::abs(fb)) {
                a = b; b = c; c = a;
                fa = fb; fb = fc; fc = fa;
            }

            // Tính dung sai hội tụ cho vòng lặp hiện tại
            // Machine epsilon đóng vai trò quan trọng để tránh sai số số học
            double tol1 = 2.0 * std::numeric_limits<double>::epsilon() * std::abs(b) + 0.5 * tol;
            double xm = 0.5 * (c - b);

            // Điều kiện dừng: Khoảng tìm kiếm đã đủ nhỏ hoặc tìm thấy nghiệm chính xác
            if (std::abs(xm) <= tol1 || fb == 0.0) {
                result.root = b;
                result.value = fb;
                result.converged = true;
                result.message = "Converged successfully.";
                return result;
            }

            // Quyết định dùng Bisection hay Interpolation
            if (std::abs(e) >= tol1 && std::abs(fa) > std::abs(fb)) {
                double s = fb / fa;
                double p, q;

                // Inverse Quadratic Interpolation (Nội suy bậc 2 nghịch đảo)
                // Dùng khi ta có 3 điểm phân biệt a, b, c
                if (a != c) {
                    q = fa / fc;
                    double r = fb / fc;
                    p = s * (2.0 * xm * q * (q - r) - (b - a) * (r - 1.0));
                    q = (q - 1.0) * (r - 1.0) * (s - 1.0);
                } 
                // Secant Method (Phương pháp dây cung)
                // Dùng khi chỉ có 2 điểm khác biệt
                else {
                    p = 2.0 * xm * s;
                    q = 1.0 - s;
                }

                // Điều chỉnh dấu của p và q
                if (p > 0.0) q = -q;
                p = std::abs(p);

                // Kiểm tra điều kiện chấp nhận bước nội suy
                // 1. Bước nhảy phải nằm trong khoảng (3*xm*q - tol1*q) và (e*q)
                // 2. Đảm bảo tốc độ hội tụ
                double min1 = 3.0 * xm * q - std::abs(tol1 * q);
                double min2 = std::abs(e * q);

                if (2.0 * p < (min1 < min2 ? min1 : min2)) {
                    // Chấp nhận bước nội suy
                    e = d;
                    d = p / q;
                } else {
                    // Từ chối, quay về Bisection (Chia đôi) cho an toàn
                    d = xm;
                    e = d;
                }
            } else {
                // Bước trước đó quá nhỏ hoặc hàm biến đổi chậm -> Dùng Bisection
                d = xm;
                e = d;
            }

            // Cập nhật điểm a
            a = b;
            fa = fb;

            // Cập nhật điểm b (nghiệm dự đoán mới)
            if (std::abs(d) > tol1) {
                b += d;
            } else {
                // Bước nhảy tối thiểu bằng tol1 để tránh kẹt
                b += (xm > 0.0 ? std::abs(tol1) : -std::abs(tol1));
            }
            fb = f(b);
        }

        // Nếu hết vòng lặp mà chưa hội tụ
        result.root = b;
        result.value = fb;
        result.converged = false;
        result.message = "Max iterations reached without convergence.";
        return result;
    }

    // --- Triển khai thuật toán Newton-Raphson ---
    SolverResult Solver::solveNewton(Func f, Deriv df, double guess, double tol, int maxIter) {
        double x = guess;
        SolverResult result;
        
        for (int i = 0; i < maxIter; ++i) {
            result.iterations = i + 1;
            double fx = f(x);
            double dfx = df(x);

            // Kiểm tra hội tụ theo giá trị hàm
            if (std::abs(fx) < tol) {
                result.root = x;
                result.value = fx;
                result.converged = true;
                result.message = "Converged.";
                return result;
            }

            // Tránh chia cho số 0 hoặc số quá nhỏ (đạo hàm = 0)
            if (std::abs(dfx) < 1e-9) {
                result.root = x;
                result.value = fx;
                result.converged = false;
                result.message = "Derivative too close to zero (flat region).";
                return result;
            }

            double dx = fx / dfx;
            x -= dx;

            // Kiểm tra hội tụ theo bước nhảy
            if (std::abs(dx) < tol) {
                result.root = x;
                result.value = f(x); // Tính lại giá trị cuối
                result.converged = true;
                result.message = "Converged.";
                return result;
            }
        }

        result.root = x;
        result.value = f(x);
        result.converged = false;
        result.message = "Max iterations reached.";
        return result;
    }

} // namespace Math
} // namespace ShortCol2025