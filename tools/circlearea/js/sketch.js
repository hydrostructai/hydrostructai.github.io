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
    setTimeout(() => {
        try {
            // 3. Giải hệ phương trình (CHỈ KHI ĐƯỢC GỌI)
            const result = solveForCircle();
            
            // Ngừng bộ đếm ngay khi có kết quả
            clearInterval(timerInterval);
            timerDisplay.style('display', 'none');

            // 4. Kiểm tra xem có lỗi không
            if (result && result.error) {
                // Hiển thị thông báo lỗi
                select('#results').html(
                    `<h3>Tính toán Thất bại</h3>
                     <div class="alert alert-danger">
                        <i class="bi bi-exclamation-triangle-fill"></i>
                        <p><strong>Lỗi:</strong> ${result.message}</p>
                        <p>Thuật toán không tìm được nghiệm hợp lệ. Vui lòng:</p>
                        <ul>
                            <li>Kiểm tra lại các đường cong có giao nhau không</li>
                            <li>Thử điều chỉnh phạm vi vẽ</li>
                            <li>Tải lại trang và thử lại</li>
                        </ul>
                     </div>`
                );
                
                select('#area-display').html('<h3>Diện tích: <span class="text-danger">Không tính được</span></h3>');
                
                // Không vẽ hình tròn
                solution = null;
                
                // Hiển thị alert cho người dùng
                alert("⚠️ Tính toán thất bại!\n\n" + result.message + "\n\nVui lòng thử lại hoặc điều chỉnh đường cong.");
                
            } else if (result) {
                // Gán solution cho biến toàn cục
                solution = result;
                
                // 5. Hiển thị Kết quả lên HTML (nếu thành công)
                displayResults(solution);

                // 6. Vẽ lại canvas để thêm hình tròn
                redraw(); // Gọi lại hàm draw() một lần nữa
                
                // Hiển thị cảnh báo nếu sai số lớn
                if (!solution.converged) {
                    console.warn("⚠️ Cảnh báo: Sai số lớn. Kết quả có thể không chính xác.");
                    alert("⚠️ Cảnh báo: Thuật toán hội tụ nhưng sai số còn lớn.\n\nKết quả có thể không chính xác. Vui lòng kiểm tra kỹ.");
                }
            }

        } catch (error) {
            // Xử lý lỗi không mong muốn
            console.error("❌ Lỗi nghiêm trọng:", error);
            
            clearInterval(timerInterval);
            timerDisplay.style('display', 'none');
            
            select('#results').html(
                `<h3>Lỗi Nghiêm trọng</h3>
                 <div class="alert alert-danger">
                    <p><strong>Lỗi:</strong> ${error.message}</p>
                    <p>Vui lòng tải lại trang và thử lại.</p>
                 </div>`
            );
            
            alert("❌ Lỗi nghiêm trọng!\n\n" + error.message + "\n\nVui lòng tải lại trang.");
        } finally {
            // Reset nút trong mọi trường hợp
            calcButton.html('Tính toán Diện tích');
            calcButton.removeAttribute('disabled');
        }
    }, 50); 
}


// Hàm draw() của p5.js
function draw() {
    background(255); // Nền trắng

    // Vẽ trục tọa độ
    drawAxes();

    // Vẽ 3 hàm số
    drawFunction(f, GRAPH_CONFIG.colors.f, 2); // Đường f (đỏ)
    drawFunction(g, GRAPH_CONFIG.colors.g, 2); // Đường g (tím)
    drawFunction(h, GRAPH_CONFIG.colors.h, 2); // Đường h (xanh)

    // === BỔ SUNG: Vẽ các phương trình ===
    drawEquations();
    // === KẾT THÚC BỔ SUNG ===

    // Chỉ vẽ hình tròn NẾU 'solution' đã được tính
    if (solution) {
        // Vẽ đường gióng cho các điểm tiếp xúc
        drawTangencyLines(solution);
        
        // Vẽ hình tròn, tô màu, và đường gióng tâm
        drawSolutionCircle(solution);
    }
}

/**
 * Hiển thị kết quả ra các vùng HTML
 * @param {object} sol - Solution object
 */
function displayResults(sol) {
    // Validate solution
    if (!sol || sol.error) {
        console.error("Cannot display invalid solution");
        return;
    }

    const format = (num) => {
        if (isNaN(num)) return "N/A";
        return num.toFixed(4);
    };
    
    // Validate all values before displaying
    const values = [sol.xc, sol.yc, sol.R, sol.area];
    const hasInvalidValues = values.some(v => isNaN(v) || v === undefined || v === null);
    
    if (hasInvalidValues) {
        console.error("❌ Solution contains invalid values");
        alert("❌ Kết quả chứa giá trị không hợp lệ (NaN).\n\nThuật toán không hội tụ. Vui lòng thử lại.");
        return;
    }
    
    // 1. Hiển thị Diện tích (dưới biểu đồ)
    const areaDiv = select('#area-display');
    const convergenceIcon = sol.converged ? 
        '<i class="bi bi-check-circle-fill text-success"></i>' : 
        '<i class="bi bi-exclamation-triangle-fill text-warning"></i>';
    
    areaDiv.html(
        `<h3>Diện tích (πR²): ${convergenceIcon} <span class="${sol.converged ? 'text-success' : 'text-warning'}">${format(sol.area)}</span></h3>`, 
        false
    ); 

    // 2. Hiển thị Kết quả Chi tiết (bên cạnh)
    const resultsDiv = select('#results');
    const errorInfo = sol.converged ? 
        `<p class="text-success"><i class="bi bi-check-circle"></i> <strong>Thuật toán hội tụ thành công</strong></p>` :
        `<p class="text-warning"><i class="bi bi-exclamation-triangle"></i> <strong>Cảnh báo:</strong> Sai số lớn (${format(sol.error)})</p>`;
    
    resultsDiv.html(
        `<h3>Kết quả Chi tiết</h3>
         ${errorInfo}
         <hr>
         <p><strong>Tâm hình tròn (xc, yc):</strong> <br><span class="result-value">(${format(sol.xc)}, ${format(sol.yc)})</span></p>
         <p><strong>Bán kính (R):</strong> <br><span class="result-value">${format(sol.R)}</span></p>
         <p><strong>Diện tích (πR²):</strong> <br><span class="result-value">${format(sol.area)}</span></p>
         <hr>
         <h4>Các điểm tiếp xúc:</h4>
         <p>• Tiếp điểm f(x): <br><span class="result-value">(${format(sol.touchPoints.f.x)}, ${format(sol.touchPoints.f.y)})</span></p>
         <p>• Tiếp điểm g(x): <br><span class="result-value">(${format(sol.touchPoints.g.x)}, ${format(sol.touchPoints.g.y)})</span></p>
         <p>• Tiếp điểm h(x): <br><span class="result-value">(${format(sol.touchPoints.h.x)}, ${format(sol.touchPoints.h.y)})</span></p>
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
    line(mapX(GRAPH_CONFIG.xMin), mapY(0), mapX(GRAPH_CONFIG.xMax), mapY(0));
    line(mapX(0), mapY(GRAPH_CONFIG.yMin), mapX(0), mapY(GRAPH_CONFIG.yMax));
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
    for (let px = 0; px <= width; px += 1) {
        let x = map(px, 0, width, GRAPH_CONFIG.xMin, GRAPH_CONFIG.xMax);
        let y = func(x);
        vertex(px, mapY(y));
    }
    endShape();
}

/**
 * (MỚI) Hàm trợ giúp vẽ mũi tên
 * (Sử dụng tọa độ pixel đã được ánh xạ)
 */
function drawArrow(x1, y1, x2, y2, color) {
    push();
    stroke(color);
    strokeWeight(1.5);
    fill(color);
    line(x1, y1, x2, y2); // Vẽ đường thẳng
    
    // Vẽ đầu mũi tên
    let angle = atan2(y2 - y1, x2 - x1);
    translate(x2, y2);
    rotate(angle);
    triangle(0, 0, -6, -3, -6, 3);
    pop();
}

/**
 * (MỚI) Vẽ các phương trình lên biểu đồ
 */
function drawEquations() {
    const { mapX, mapY } = mapping;

    // 1. Phương trình y = -sin(x) + 3 (Xanh lá)
    let h_color = GRAPH_CONFIG.colors.h;
    let h_label_x = 1.1;
    let h_label_y = 3.5;
    let h_point_x = 0.5;
    let h_point_y = h(h_point_x); // y = -sin(0.5) + 3 ≈ 2.52
    
    push();
    fill(h_color);
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(14);
    text('y = -sin(x) + 3', mapX(h_label_x), mapY(h_label_y));
    pop();
    drawArrow(mapX(h_label_x - 0.05), mapY(h_label_y - 0.05), mapX(h_point_x), mapY(h_point_y + 0.05), h_color);
    
    // 2. Phương trình y = e^x (Tím)
    let g_color = GRAPH_CONFIG.colors.g;
    let g_label_x = -2.8;
    let g_label_y = 0.5;
    let g_point_x = -1;
    let g_point_y = g(g_point_x); // y = e^-1 ≈ 0.37
    
    push();
    fill(g_color);
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(14);
    text('y = eˣ', mapX(g_label_x), mapY(g_label_y));
    pop();
    drawArrow(mapX(g_label_x + 0.3), mapY(g_label_y), mapX(g_point_x), mapY(g_point_y), g_color);
    
    // 3. Phương trình y = -x^3 + x (Đỏ)
    let f_color = GRAPH_CONFIG.colors.f;
    let f_label_x = 0.5;
    let f_label_y = -0.5;
    let f_point_x = 0.5;
    let f_point_y = f(f_point_x); // y = -0.125 + 0.5 = 0.375
    
    push();
    fill(f_color);
    noStroke();
    textAlign(LEFT, CENTER);
    textSize(14);
    text('y = -x³ + x', mapX(f_label_x), mapY(f_label_y));
    pop();
    drawArrow(mapX(f_label_x), mapY(f_label_y + 0.1), mapX(f_point_x), mapY(f_point_y - 0.05), f_color);
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