/* * ========================================================
 * js/solver.js
 * Định nghĩa và giải hệ phương trình phi tuyến
 * ========================================================
 */

/**
 * Hàm mục tiêu (Objective Function) cho thuật toán tối ưu hóa.
 * numeric.js sẽ cố gắng tìm vector X để hàm này trả về giá trị nhỏ nhất (gần 0).
 *
 * @param {Array} X Vector 6 ẩn số: [xc, yc, R, xf, xg, xh]
 * @returns {number} Tổng bình phương của 6 hàm lỗi (Sum of Squared Errors)
 */
function objectiveFunction(X) {
    // Giải nén vector 6 ẩn số
    const [xc, yc, R, xf, xg, xh] = X;

    // --- Tính 6 giá trị lỗi (Errors) ---
    // Mục tiêu là làm cho cả 6 lỗi này = 0

    // Lỗi 1, 2, 3: Khoảng cách từ tâm (xc, yc) đến điểm tiếp xúc
    // phải bằng bán kính R.
    // Lỗi = (Khoảng cách tính được) - R
    const e1 = Math.sqrt(Math.pow(xc - xf, 2) + Math.pow(yc - f(xf), 2)) - R;
    const e2 = Math.sqrt(Math.pow(xc - xg, 2) + Math.pow(yc - g(xg), 2)) - R;
    const e3 = Math.sqrt(Math.pow(xc - xh, 2) + Math.pow(yc - h(xh), 2)) - R;

    // Lỗi 4, 5, 6: Điều kiện pháp tuyến (Normal condition)
    // Pháp tuyến của đường cong tại điểm tiếp xúc phải đi qua tâm (xc, yc).
    // Phương trình pháp tuyến: (Y - y) = (-1 / m) * (X - x)
    // Sắp xếp lại: (Y - y) * m + (X - x) = 0
    // (trong đó m là đạo hàm f'(x), g'(x), h'(x))
    
    // Xử lý trường hợp f_prime(xf) = 0 (pháp tuyến thẳng đứng)
    const e4 = (yc - f(xf)) * f_prime(xf) + (xc - xf);
    
    // Xử lý trường hợp g_prime(xg) = 0 (mặc dù e^x không bao giờ bằng 0)
    const e5 = (yc - g(xg)) * g_prime(xg) + (xc - xg);

    // Xử lý trường hợp h_prime(xh) = 0 (khi cos(x) = 0)
    const e6 = (yc - h(xh)) * h_prime(xh) + (xc - xh);

    // Trả về tổng bình phương của các lỗi.
    // Thuật toán sẽ cố gắng tối thiểu hóa giá trị này về 0.
    return (
        Math.pow(e1, 2) +
        Math.pow(e2, 2) +
        Math.pow(e3, 2) +
        Math.pow(e4, 2) +
        Math.pow(e5, 2) +
        Math.pow(e6, 2)
    );
}

/**
 * Hàm chính để chạy thuật toán giải
 * @returns {object|null} Đối tượng kết quả hoặc null nếu thất bại
 */
function solveForCircle() {
    console.log("Bắt đầu giải hệ phương trình...");
    console.log("Giá trị ước lượng ban đầu:", INITIAL_GUESS);

    try {
        // Gọi hàm `uncmin` (Unconstrained Minimization) của numeric.js
        const solution = numeric.uncmin(objectiveFunction, INITIAL_GUESS, 1e-10, null, 2000);

        // Validate solution
        if (!solution || !solution.solution) {
            throw new Error("Thuật toán không trả về kết quả.");
        }

        const [xc, yc, R, xf, xg, xh] = solution.solution;

        // Check for NaN values
        if (isNaN(xc) || isNaN(yc) || isNaN(R) || isNaN(xf) || isNaN(xg) || isNaN(xh)) {
            throw new Error("Kết quả chứa giá trị không hợp lệ (NaN). Thuật toán không hội tụ.");
        }

        // Check for invalid radius
        if (R <= 0 || R > 100) {
            throw new Error(`Bán kính không hợp lệ: R = ${R.toFixed(4)}. Có thể không tồn tại nghiệm.`);
        }

        // Check convergence (error function should be very small)
        const finalError = solution.f;
        console.log("Đã tìm thấy nghiệm:", solution.solution);
        console.log("Giá trị hàm lỗi cuối cùng:", finalError);

        if (finalError > 1e-6) {
            console.warn("⚠️ Cảnh báo: Sai số còn lớn (", finalError.toFixed(8), "). Nghiệm có thể không chính xác.");
        }

        // Calculate area
        const area = Math.PI * Math.pow(R, 2);
        
        // Validate area
        if (isNaN(area) || area <= 0) {
            throw new Error("Diện tích tính được không hợp lệ.");
        }

        // Return validated result
        return {
            xc: xc,
            yc: yc,
            R: R,
            area: area,
            error: finalError,
            converged: finalError < 1e-6,
            touchPoints: {
                f: { x: xf, y: f(xf) },
                g: { x: xg, y: g(xg) },
                h: { x: xh, y: h(xh) },
            },
        };

    } catch (error) {
        console.error("❌ Lỗi khi giải hệ phương trình:", error);
        return {
            error: true,
            message: error.message || "Thuật toán thất bại. Vui lòng thử lại hoặc điều chỉnh đường cong."
        };
    }
}