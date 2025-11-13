/* * ========================================================
 * js/sketch.js
 * Sử dụng p5.js để vẽ biểu đồ và kết quả
 * ========================================================
 */

// Biến toàn cục để lưu trữ kết quả
let solution;
let mapping; // Đối tượng để lưu các hàm ánh xạ

// Hàm setup() của p5.js chạy một lần khi tải trang
function setup() {
    // 1. Tạo canvas và đặt nó vào div 'canvas-container'
    let canvas = createCanvas(GRAPH_CONFIG.canvasWidth, GRAPH_CONFIG.canvasHeight);
canvas.parent('canvas-container');

    // 2. Tạo các hàm ánh xạ tọa độ
    // mapX: Chuyển tọa độ X toán học sang pixel X của canvas
    // mapY: Chuyển tọa độ Y toán học sang pixel Y của canvas (lưu ý Y bị đảo ngược)
    mapping = {
        mapX: (x) => map(x, GRAPH_CONFIG.xMin, GRAPH_CONFIG.xMax, 0, width),
        mapY: (y) => map(y, GRAPH_CONFIG.yMin, GRAPH_CONFIG.yMax, height, 0),
    };
// 3. Giải hệ phương trình (chỉ chạy một lần)
    solution = solveForCircle();
// 4. Hiển thị kết quả lên HTML
    displayResults(solution);
// 5. Ngừng lặp (vì đây là biểu đồ tĩnh)
    noLoop();
}

// Hàm draw() của p5.js chạy sau setup()
function draw() {
    background(255);
// Nền trắng

    // Vẽ trục tọa độ
    drawAxes();
// Vẽ 3 hàm số
    drawFunction(f, GRAPH_CONFIG.colors.f, 2);
// Đường f (đỏ), đậm 2px
    drawFunction(g, GRAPH_CONFIG.colors.g, 2);
// Đường g (tím), đậm 2px
    drawFunction(h, GRAPH_CONFIG.colors.h, 2);
// Đường h (xanh), đậm 2px

    // Vẽ hình tròn kết quả
    if (solution) {
        drawSolutionCircle(solution);
}
}

/**
 * Hiển thị kết quả (tâm, bán kính, diện tích) ra vùng HTML #results
 */
function displayResults(sol) {
    const resultsDiv = select('#results');
// Xóa thông báo "Đang tính toán..."
    resultsDiv.html('<h3>Kết quả Tính toán</h3>');
// Định dạng số (làm tròn 4 chữ số thập phân)
    const format = (num) => num.toFixed(4);
resultsDiv.html(
        `<h3>Kết quả Tính toán</h3>
         <p>Tâm (xc, yc): <br><span>(${format(sol.xc)}, ${format(sol.yc)})</span></p>
         <p>Bán kính (R): <br><span>(${format(sol.R)}</span></p>
         <p>Diện tích (πR²): <br><span>(${format(sol.area)})</span></p>
         <hr>
         <p>Tiếp điểm f(x): <br><span>(${format(sol.touchPoints.f.x)}, ${format(sol.touchPoints.f.y)})</span></p>
         <p>Tiếp điểm g(x): <br><span>(${format(sol.touchPoints.g.x)}, ${format(sol.touchPoints.g.y)})</span></p>
         <p>Tiếp điểm h(x): <br><span>(${format(sol.touchPoints.h.x)}, ${format(sol.touchPoints.h.y)})</span></p>
    
    `,
        true // Cho phép chèn HTML
    );
}

/**
 * Vẽ trục X và Y
 */
function drawAxes() {
    const { mapX, mapY } = mapping;
stroke(GRAPH_CONFIG.colors.axis);
    strokeWeight(1.5);

    // Trục X (tại y=0)
    line(mapX(GRAPH_CONFIG.xMin), mapY(0), mapX(GRAPH_CONFIG.xMax), mapY(0));
// Trục Y (tại x=0)
    line(mapX(0), mapY(GRAPH_CONFIG.yMin), mapX(0), mapY(GRAPH_CONFIG.yMax));
// Thêm các vạch chia
    strokeWeight(1);
    textAlign(CENTER, CENTER);
    fill(GRAPH_CONFIG.colors.axis);
for (let x = Math.ceil(GRAPH_CONFIG.xMin); x < GRAPH_CONFIG.xMax; x++) {
        if (x === 0) continue;
line(mapX(x), mapY(0.1), mapX(x), mapY(-0.1));
        text(x, mapX(x), mapY(-0.3));
    }
    for (let y = Math.ceil(GRAPH_CONFIG.yMin); y < GRAPH_CONFIG.yMax; y++) {
        if (y === 0) continue;
line(mapX(0.1), mapY(y), mapX(-0.1), mapY(y));
        text(y, mapX(-0.2), mapY(y));
    }
}

/**
 * Hàm trợ giúp để vẽ một hàm số y = func(x)
 * @param {function} func Hàm toán học (ví dụ: f, g, h)
 * @param {string} color Màu (hex)
 * @param {number} weight Độ dày nét vẽ
 */
function drawFunction(func, color, weight) {
    const { mapX, mapY } = mapping;
noFill();
    stroke(color);
    strokeWeight(weight);
    
    beginShape();
    // Vẽ với độ phân giải cao (nhiều điểm ảnh)
    for (let px = 0; px <= width; px += 1) {
        // Chuyển đổi pixel X ngược lại tọa độ toán học x
        let x = map(px, 0, width, GRAPH_CONFIG.xMin, GRAPH_CONFIG.xMax);
let y = func(x);

        // Chuyển (x, y) toán học sang (px, py)
        vertex(px, mapY(y));
}
    endShape();
}

/**
 * Vẽ hình tròn giải pháp
 */
function drawSolutionCircle(sol) {
    const { mapX, mapY } = mapping;
// Ánh xạ tâm (xc, yc) sang pixel
    const px_c = mapX(sol.xc);
    const py_c = mapY(sol.yc);
// Tính bán kính (R) bằng pixel
    // Chúng ta phải tính toán dựa trên tỷ lệ pixel/đơn vị
    // (Giả sử tỷ lệ x và y là như nhau, nếu không vòng tròn sẽ là hình elip)
    const pixelPerUnitX = width / (GRAPH_CONFIG.xMax - GRAPH_CONFIG.xMin);
const R_pixel = sol.R * pixelPerUnitX;
    
    // Vẽ hình tròn
    fill(GRAPH_CONFIG.colors.circle + 'AA');
// Màu vàng với độ trong 80% (AA)
    strokeWeight(2);
    stroke(0);
// Viền đen
    
    circle(px_c, py_c, R_pixel * 2);
// p5.js dùng đường kính
    
    // Thêm dấu '?'
ở tâm
    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(32);
    text('?', px_c, py_c);
}