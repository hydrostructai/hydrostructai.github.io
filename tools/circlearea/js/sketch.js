/* * ========================================================
 * js/sketch.js
 * (Cập nhật) Sử dụng p5.js để vẽ biểu đồ và kết quả
 * ========================================================
 */

// Biến toàn cục để lưu trữ kết quả
let solution; // Sẽ được định nghĩa KHI nhấn nút
let mapping; // Đối tượng để lưu các hàm ánh xạ
let calcButton; // Biến cho nút tính toán
let timerDisplay; // Biến cho bộ đếm ngược
let timerInterval; // Biến để giữ ID của setInterval

// Thời gian dự kiến để giải (tính bằng giây)
const EXPECTED_CALC_TIME = 5;

// Hàm setup() của p5.js chạy một lần khi tải trang
function setup() {
    // 1. Tạo canvas và đặt nó vào div 'canvas-container'
    let canvas = createCanvas(GRAPH_CONFIG.canvasWidth, GRAPH_CONFIG.canvasHeight);
    canvas.parent('canvas-container');

    // 2. Tạo các hàm ánh xạ tọa độ
    mapping = {
        mapX: (x) => map(x, GRAPH_CONFIG.xMin, GRAPH_CONFIG.xMax, 0, width),
        mapY: (y) => map(y, GRAPH_CONFIG.yMin, GRAPH_CONFIG.yMax, height, 0),
    };

    // 3. (SỬA) Gắn sự kiện cho nút, KHÔNG tính toán ngay
    calcButton = select('#calculateButton');
    timerDisplay = select('#timer-display'); // Lấy phần tử đếm ngược
    calcButton.mousePressed(handleCalculation);

    // 4. (XÓA) Không gọi giải và hiển thị kết quả ngay
    // solution = solveForCircle();
    // displayResults(solution);

    // 5. Ngừng lặp (chỉ vẽ biểu đồ tĩnh ban đầu)
    noLoop();
    
    // p5.js sẽ tự động gọi draw() một lần sau setup()
}

/**
 * (MỚI) Hàm này chỉ được gọi khi nhấn nút
 */
function handleCalculation() {
    // Ngừng bộ đếm cũ nếu có
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    // Cập nhật UI
    calcButton.html('Đang tính toán...');
    calcButton.attribute('disabled', true);
    select('#results').html('<h3>Kết quả Chi tiết</h3><p>Đang giải hệ phương trình... (việc này có thể mất vài giây)</p>');

    // Bắt đầu đếm ngược
    let countdown = EXPECTED_CALC_TIME;
    timerDisplay.html('Thời gian dự kiến: ' + countdown + ' giây...');
    timerDisplay.style('display', 'block');

    timerInterval = setInterval(() => {
        countdown--;
        if (countdown >= 0) {
            timerDisplay.html('Thời gian dự kiến: ' + countdown + ' giây...');
        } else {
            timerDisplay.html('Vẫn đang xử lý... (thuật toán phức tạp)');
            clearInterval(timerInterval); // Ngừng đếm nhưng vẫn chạy
        }
    }, 1000);

    // Dùng setTimeout để cho phép trình duyệt cập nhật DOM
    // trước khi chạy hàm tính toán nặng (solveForCircle)
    setTimeout(() => {
        // 3. Giải hệ phương trình (CHỈ KHI ĐƯỢC GỌI)
        solution = solveForCircle();
        
        // Ngừng bộ đếm ngay khi có kết quả
        clearInterval(timerInterval);
        timerDisplay.style('display', 'none');

        // 4. Hiển thị Kết quả lên HTML
        displayResults(solution);

        // 5. Vẽ lại canvas để thêm hình tròn
        redraw(); // Gọi lại hàm draw() một lần nữa

        // Reset nút
        calcButton.html('Tính toán Diện tích');
        calcButton.removeAttribute('disabled');
    }, 50); // Đợi 50ms để cập nhật UI
}


// Hàm draw() của p5.js
function draw() {
    background(255); // Nền trắng

    // Vẽ trục tọa độ
    drawAxes();

    // Vẽ 3 hàm số
    drawFunction(f, GRAPH_CONFIG.colors.f, 2); // Đường f (đỏ), đậm 2px
    drawFunction(g, GRAPH_CONFIG.colors.g, 2); // Đường g (tím), đậm 2px
    drawFunction(h, GRAPH_CONFIG.colors.h, 2); // Đường h (xanh), đậm 2px

    // (SỬA) Chỉ vẽ hình tròn NẾU 'solution' đã được tính
    if (solution) {
        // Vẽ đường gióng cho các điểm tiếp xúc
        drawTangencyLines(solution);
        
        // Vẽ hình tròn, tô màu, và đường gióng tâm
        drawSolutionCircle(solution);
    }
}

/**
 * Hiển thị kết quả ra các vùng HTML
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
 * Hàm trợ giúp vẽ đường nét đứt
 */
function setLineDash(list) {
    drawingContext.setLineDash(list);
}

/**
 * Vẽ các đường gióng từ điểm tiếp xúc
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
 * Vẽ hình tròn, tô màu VÀ đường gióng tâm
 */
function drawSolutionCircle(sol) {
    const { mapX, mapY } = mapping;
    
    // Ánh xạ tâm (xc, yc) sang pixel
    const px_c = mapX(sol.xc);
    const py_c = mapY(sol.yc);
    
    // Tính bán kính (R) bằng pixel
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