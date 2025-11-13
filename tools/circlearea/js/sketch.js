/* * ========================================================
 * js/sketch.js
 * (Cập nhật) Sử dụng p5.js để vẽ biểu đồ và kết quả
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
    background(255); // Nền trắng

    // Vẽ trục tọa độ
    drawAxes();

    // Vẽ 3 hàm số
    drawFunction(f, GRAPH_CONFIG.colors.f, 2); // Đường f (đỏ), đậm 2px
    drawFunction(g, GRAPH_CONFIG.colors.g, 2); // Đường g (tím), đậm 2px
    drawFunction(h, GRAPH_CONFIG.colors.h, 2); // Đường h (xanh), đậm 2px

    // Vẽ hình tròn và các đường gióng
    if (solution) {
        // Vẽ đường gióng cho các điểm tiếp xúc
        drawTangencyLines(solution);
        
        // Vẽ hình tròn, tô màu, và đường gióng tâm
        drawSolutionCircle(solution);
    }
}

/**
 * (CẬP NHẬT) Hiển thị kết quả ra các vùng HTML
 */
function displayResults(sol) {
    const format = (num) => num.toFixed(4);
    
    // 1. Hiển thị Diện tích (dưới biểu đồ)
    const areaDiv = select('#area-display');
    areaDiv.html(`<h3>Diện tích (πR²): <span>${format(sol.area)}</span></h3>`, false); // false = không chèn HTML

    // 2. Hiển thị Kết quả Chi tiết (bên cạnh)
    const resultsDiv = select('#results');
    resultsDiv.html(
        `<h3>Kết quả Chi tiết</h3>
         <p>Tâm (xc, yc): <br><span>(${format(sol.xc)}, ${format(sol.yc)})</span></p>
         <p>Bán kính (R): <br><span>${format(sol.R)}</span></p>
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
 * (MỚI) Hàm trợ giúp vẽ đường nét đứt
 */
function setLineDash(list) {
    drawingContext.setLineDash(list);
}

/**
 * (MỚI) Vẽ các đường gióng từ điểm tiếp xúc
 */
function drawTangencyLines(sol) {
    const { mapX, mapY } = mapping;
    const { f, g, h } = sol.touchPoints;
    const points = [
        { p: f, color: GRAPH_CONFIG.colors.f },
        { p: g, color: GRAPH_CONFIG.colors.g },
        { p: h, color: GRAPH_CONFIG.colors.h },
    ];
    
    const axisY = mapY(0); // Pixel Y của trục X
    const axisX = mapX(0); // Pixel X của trục Y

    for (let item of points) {
        let px = mapX(item.p.x);
        let py = mapY(item.p.y);
        
        stroke(item.color);
        strokeWeight(1);
        setLineDash([3, 3]); // Nét đứt

        line(px, py, px, axisY); // Gióng xuống trục X
        line(px, py, axisX, py); // Gióng sang trục Y
    }
}


/**
 * (CẬP NHẬT) Vẽ hình tròn, tô màu VÀ đường gióng tâm
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
    
    // --- Vẽ đường gióng tâm (TRƯỚC) ---
    stroke(GRAPH_CONFIG.colors.axis);
    strokeWeight(1);
    setLineDash([5, 5]); // Nét đứt
    
    line(px_c, py_c, px_c, mapY(0)); // Gióng tâm xuống trục X
    line(px_c, py_c, mapX(0), py_c); // Gióng tâm sang trục Y
    
    // --- Vẽ hình tròn (SAU) ---
    setLineDash([]); // Reset về nét liền
    fill(GRAPH_CONFIG.colors.circle + 'AA'); // Tô màu vàng trong
    strokeWeight(2);
    stroke(0); // Viền đen
    
    circle(px_c, py_c, R_pixel * 2); // p5.js dùng đường kính
    
    // Thêm dấu '?' ở tâm
    fill(0);
    noStroke();
    textAlign(CENTER, CENTER);
    textSize(32);
    text('?', px_c, py_c);
}