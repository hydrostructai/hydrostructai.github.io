/* * ========================================================
 * js/constants.js
 * Định nghĩa các hàm toán học và hằng số
 * ========================================================
 */

// 1. Định nghĩa các hàm số
// f(x) = -x^3 + x (Đường Đỏ)
function f(x) {
    return -Math.pow(x, 3) + x;
}

// g(x) = e^x (Đường Tím)
function g(x) {
    return Math.exp(x);
}

// h(x) = -sin(x) + 3 (Đường Xanh lá)
function h(x) {
    return -Math.sin(x) + 3;
}

// 2. Định nghĩa các đạo hàm (cần cho pháp tuyến)
// f'(x) = -3x^2 + 1
function f_prime(x) {
    return -3 * Math.pow(x, 2) + 1;
}

// g'(x) = e^x
function g_prime(x) {
    return Math.exp(x);
}

// h'(x) = -cos(x)
function h_prime(x) {
    return -Math.cos(x);
}

// 3. Hằng số cho biểu đồ (sẽ được dùng bởi p5.js trong sketch.js)
const GRAPH_CONFIG = {
    // Phạm vi trục X (toán học)
    xMin: -3.0,
    xMax: 2.0,
    
    // Phạm vi trục Y (toán học)
    yMin: -2.0,
    yMax: 5.0,
    
    // Kích thước Canvas (pixel)
    canvasWidth: 600,
    canvasHeight: 500,
    
    // Màu sắc
    colors: {
        f: '#e74c3c', // Đỏ
        g: '#8e44ad', // Tím
        h: '#27ae60', // Xanh lá
        circle: '#f1c40f', // Vàng
        axis: '#34495e'  // Xám đậm (trục)
    }
};

// 4. Ước lượng ban đầu cho thuật toán (Rất quan trọng!)
// X = [xc, yc, R, xf, xg, xh]
const INITIAL_GUESS = [
    -1.0, // xc (Tâm x)
    2.5,  // yc (Tâm y)
    1.5,  // R (Bán kính)
    -1.5, // xf (Tiếp điểm trên f)
    -0.5, // xg (Tiếp điểm trên g)
    0.0   // xh (Tiếp điểm trên h)
];