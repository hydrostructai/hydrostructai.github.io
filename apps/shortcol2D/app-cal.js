/**
 * ShortCol Calculation Module
 * Chịu trách nhiệm: Tính toán cốt thép, Biểu đồ tương tác P-M, Hệ số an toàn.
 * * Phương pháp tính:
 * - Bê tông: Giả thiết khối ứng suất chữ nhật tương đương (Whitney stress block).
 * + Cột chữ nhật: Tính trực tiếp diện tích hình chữ nhật.
 * + Cột tròn: Tích phân phân giải (Strip Method) chia nhỏ tiết diện thành các dải để tính diện tích vùng nén.
 * - Cốt thép: Phương pháp tương thích biến dạng (Strain Compatibility).
 * + Giả thiết mặt cắt phẳng vẫn phẳng sau biến dạng.
 * + Biến dạng tỉ lệ tuyến tính với khoảng cách tới trục trung hòa.
 */

const ShortColCal = {
    
    /**
     * Tính diện tích 1 thanh thép từ đường kính (d)
     * @param {number} d Đường kính (mm)
     * @returns {number} Diện tích (mm2)
     */
    calcBarArea: function(d) {
        return Math.PI * d * d / 4;
    },

    /**
     * Tạo bố trí thép cho cột Chữ nhật (Rải đều chu vi)
     * @param {number} B Rộng (mm)
     * @param {number} H Cao (mm)
     * @param {number} Cover Lớp bảo vệ (mm)
     * @param {number} Nb Tổng số thanh
     * @param {number} As Diện tích 1 thanh (mm2)
     */
    generateRectLayout: function(B, H, Cover, Nb, As) {
        // Validation: Tối thiểu 4 thanh cho chữ nhật
        if (Nb < 4) Nb = 4;
        
        // Đảm bảo số thanh chẵn để đối xứng (quan trọng cho biểu đồ P-M phẳng)
        if (Nb % 2 !== 0) Nb += 1;

        const width = B - 2 * Cover;
        const height = H - 2 * Cover;
        const perimeter = 2 * (width + height);
        
        // Logic phân bố: 4 thanh cố định ở 4 góc.
        // Số thanh còn lại (Nb - 4) được chia theo tỷ lệ chiều dài cạnh.
        let n_remain = Nb - 4;
        
        // Số thanh BỤNG dọc theo cạnh H (không tính góc)
        let n_h_side = Math.round(n_remain * (height / perimeter));
        // Đảm bảo chẵn để chia đều 2 bên trái/phải
        if (n_h_side % 2 !== 0) n_h_side += 1;
        
        // Số thanh BỤNG dọc theo cạnh B (không tính góc)
        let n_b_side = n_remain - n_h_side;
        // Nếu lẻ thì điều chỉnh (ưu tiên giảm bớt 1 để đảm bảo đối xứng tuyệt đối)
        if (n_b_side < 0) n_b_side = 0;
        if (n_b_side % 2 !== 0) n_b_side -= 1;
        
        // Số thanh trên mỗi mặt (chia đôi cho 2 bên đối diện)
        const sideH = n_h_side / 2; 
        const sideB = n_b_side / 2;

        const bars = [];

        // 1. Thêm 4 thanh góc
        // Hệ tọa độ: Gốc O tại tâm tiết diện. Trục Y hướng lên, X hướng phải.
        bars.push({ x: width/2, y: height/2, As: As });   // Góc trên phải
        bars.push({ x: width/2, y: -height/2, As: As });  // Góc dưới phải
        bars.push({ x: -width/2, y: height/2, As: As });  // Góc trên trái
        bars.push({ x: -width/2, y: -height/2, As: As }); // Góc dưới trái

        // 2. Thêm thanh bụng dọc cạnh H (Trái & Phải)
        if (sideH > 0) {
            const spacing = height / (sideH + 1);
            for (let i = 1; i <= sideH; i++) {
                const y = -height/2 + spacing * i;
                bars.push({ x: width/2, y: y, As: As });  // Phải
                bars.push({ x: -width/2, y: y, As: As }); // Trái
            }
        }

        // 3. Thêm thanh bụng dọc cạnh B (Trên & Dưới)
        if (sideB > 0) {
            const spacing = width / (sideB + 1);
            for (let i = 1; i <= sideB; i++) {
                const x = -width/2 + spacing * i;
                bars.push({ x: x, y: height/2, As: As });  // Trên
                bars.push({ x: x, y: -height/2, As: As }); // Dưới
            }
        }

        return bars;
    },

    /**
     * Tạo bố trí thép cho cột Tròn (Rải đều theo góc)
     * @param {number} D Đường kính (mm)
     * @param {number} Cover Lớp bảo vệ (mm)
     * @param {number} Nb Số thanh
     * @param {number} As Diện tích 1 thanh
     */
    generateCircLayout: function(D, Cover, Nb, As) {
        const R_col = D / 2;
        const R_bars = R_col - Cover;
        const bars = [];
        
        // Tối thiểu 4 thanh (hoặc 6 theo quy phạm, nhưng để 4 cho linh hoạt)
        if (Nb < 4) Nb = 4;
        
        const d_angle = (2 * Math.PI) / Nb;

        for (let i = 0; i < Nb; i++) {
            // Bắt đầu từ góc 0 (trục X dương) xoay ngược chiều kim đồng hồ
            const angle = i * d_angle; 
            bars.push({
                x: R_bars * Math.cos(angle),
                y: R_bars * Math.sin(angle),
                As: As
            });
        }
        return bars;
    },

    /**
     * TÍNH TOÁN BIỂU ĐỒ TƯƠNG TÁC (P-M) - CORE LOGIC
     * @returns {Array<{x: number, y: number}>} Mảng các điểm (M, P)
     */
    calculateInteractionCurve: function(type, B, H, D, Rb, Rs, bars) {
        const points = [];
        const Es = 200000; // Modul đàn hồi thép (MPa)
        const e_cu = 0.0035; // Biến dạng cực hạn bê tông (theo TCVN 5574:2018)
        
        // Chiều cao tiết diện theo phương chịu uốn (trục Y)
        const h_section = (type === 'rect') ? H : D;
        
        // Thiết lập các bước quét chiều cao vùng nén c (c = x trong TCVN)
        // xi = c / h_section
        // Quét từ Kéo thuần túy (xi âm lớn) -> Uốn -> Nén thuần túy (xi dương lớn)
        const xi_steps = [
            -100, // Điểm giả định cho kéo thuần túy
            0.05, 0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5, 
            0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9, 0.95, 1.0, 
            1.1, 1.2, 1.5, 2.0, 
            100 // Điểm giả định cho nén thuần túy
        ];

        for (let xi of xi_steps) {
            const c = xi * h_section; // Chiều cao vùng nén thực tế
            let Nu = 0; // Tổng lực dọc (kN)
            let Mu = 0; // Tổng momen (kNm)

            // ---------------------------------------------------------
            // 1. TÍNH TOÁN KHẢ NĂNG CHỊU LỰC CỦA BÊ TÔNG (Fc, Mc)
            // ---------------------------------------------------------
            
            // Xác định tọa độ mép nén cực hạn (Y_top)
            // Hệ tọa độ: Tâm O(0,0). Y hướng lên. Mép trên cùng là +H/2 hoặc +R.
            const Y_top = (type === 'rect') ? H/2 : D/2;
            
            // Giả thiết khối ứng suất chữ nhật tương đương
            // Cường độ = Rb. Vùng chịu nén hiệu dụng chiều cao a = c.
            // (Đơn giản hóa so với TCVN là a = 0.8c hoặc a=c tùy cấp bền, ở đây dùng a=c cho an toàn thiên về biến dạng)
            
            if (c > 0) { // Chỉ tính bê tông khi có vùng nén (c > 0)
                if (type === 'rect') {
                    // --- CỘT CHỮ NHẬT ---
                    // Diện tích nén = B * a_eff
                    // a_eff = c nhưng không vượt quá chiều cao tiết diện H
                    let a_eff = c;
                    if (a_eff > H) a_eff = H;
                    
                    const Fc = Rb * B * a_eff; 
                    
                    // Tâm khối nén nằm cách mép trên một khoảng a_eff/2
                    // Tọa độ Y của tâm khối nén: y_c = Y_top - a_eff/2
                    // Cánh tay đòn tới tâm O: arm = y_c - 0 = Y_top - a_eff/2
                    const arm = Y_top - (a_eff / 2);
                    
                    Nu += Fc;
                    Mu += Fc * arm; 

                } else {
                    // --- CỘT TRÒN: TÍCH PHÂN DẢI (STRIP METHOD) ---
                    // Chia hình tròn thành nhiều dải ngang nhỏ (dy) để tích phân diện tích
                    const R = D / 2;
                    const numStrips = 100; // Số lượng dải càng lớn càng chính xác
                    const dy = D / numStrips;
                    
                    // Vị trí trục trung hòa: y_NA = Y_top - c
                    // Vùng nén là vùng có y > y_NA
                    const y_NA = Y_top - c;
                    
                    for (let i = 0; i < numStrips; i++) {
                        // Tọa độ tâm của dải thứ i (tính từ dưới lên hoặc trên xuống đều được, miễn hệ tọa độ chuẩn)
                        // Ở đây tính từ đáy (-R) lên đỉnh (+R)
                        const y_strip = -R + (i + 0.5) * dy; 
                        
                        // Kiểm tra nếu dải này nằm trong vùng nén
                        if (y_strip > y_NA) { 
                            // Bề rộng dải tại cao độ y: x^2 + y^2 = R^2 => x = sqrt(R^2 - y^2)
                            // Bề rộng w = 2*x
                            const val = R*R - y_strip*y_strip;
                            if (val > 0) {
                                const width_strip = 2 * Math.sqrt(val);
                                const area_strip = width_strip * dy;
                                
                                const dFc = Rb * area_strip; // Lực nén của dải nhỏ
                                
                                Nu += dFc;
                                Mu += dFc * y_strip; // Momen của dải đối với tâm O
                            }
                        }
                    }
                }
            }

            // ---------------------------------------------------------
            // 2. TÍNH TOÁN CỐT THÉP (Fs, Ms) - STRAIN COMPATIBILITY
            // ---------------------------------------------------------
            
            bars.forEach(bar => {
                let e_s = 0; // Biến dạng của thanh thép
                
                // Trục trung hòa tại y_NA = Y_top - c
                const y_NA = Y_top - c;

                // Xử lý các trường hợp c đặc biệt
                if (c >= 9999) {
                    // Nén thuần túy: Toàn bộ tiết diện chịu nén đều e_cu
                    e_s = e_cu; 
                } else if (c <= -9999) {
                    // Kéo thuần túy: Giả định kéo chảy dẻo lớn
                     e_s = -10 * (Rs/Es); 
                } else if (Math.abs(c) < 1e-5) {
                    // c xấp xỉ 0 (Kéo thuần túy tại giới hạn)
                    e_s = -10 * (Rs/Es);
                } else {
                    // Quy luật biến dạng phẳng (Tam giác đồng dạng)
                    // Biến dạng tại mép nén cực hạn (Y_top) là e_cu.
                    // Biến dạng tại trục trung hòa (y_NA) là 0.
                    // Biến dạng tại vị trí thép (bar.y):
                    // e_s / dist_from_NA = e_cu / dist_top_from_NA
                    // => e_s = e_cu * (bar.y - y_NA) / (Y_top - y_NA)
                    // => e_s = e_cu * (bar.y - (Y_top - c)) / c
                    
                    const dist_from_NA = bar.y - y_NA;
                    e_s = e_cu * (dist_from_NA / c);
                }

                // Ứng suất thép theo định luật Hooke, giới hạn bởi cường độ chảy
                let sigma_s = e_s * Es;
                
                // Cắt ngọn (Yielding)
                if (sigma_s > Rs) sigma_s = Rs;   // Nén chảy dẻo
                if (sigma_s < -Rs) sigma_s = -Rs; // Kéo chảy dẻo

                const Fs = sigma_s * bar.As;
                
                Nu += Fs;
                Mu += Fs * bar.y; // Momen đối với trục trung tâm O
            });

            // ---------------------------------------------------------
            // 3. TỔNG HỢP VÀ ĐỔI ĐƠN VỊ
            // ---------------------------------------------------------
            // Lực F đang là Newton (N) -> đổi sang kN (/1000)
            // Momen M đang là N.mm -> đổi sang kNm (/1000000)
            
            points.push({
                x: Mu / 1000000.0,
                y: Nu / 1000.0
            });
        }
        
        return points;
    },

    /**
     * Tìm hệ số an toàn k (Safety Factor) bằng Ray Casting
     * Tìm giao điểm của tia từ gốc O qua điểm tải trọng (Mu, Pu) với đường bao sức kháng.
     * k = Distance(Capacity) / Distance(Load)
     */
    calculateSafetyFactor: function(Pu, Mu, curvePoints) {
        // Luôn so sánh với trị tuyệt đối của Mu vì biểu đồ P-M thường đối xứng (hoặc chỉ vẽ nhánh dương)
        const targetM = Math.abs(Mu);
        const targetP = Pu; 
        
        // Khoảng cách từ gốc đến điểm tải trọng
        const distLoad = Math.sqrt(targetM*targetM + targetP*targetP);

        // Nếu tải trọng trùng gốc (0,0) -> An toàn tuyệt đối (về lý thuyết)
        if (distLoad < 1e-3) return 999.0;

        let bestK = null;

        // Duyệt qua từng đoạn thẳng của biểu đồ tương tác để tìm giao điểm
        for (let i = 0; i < curvePoints.length - 1; i++) {
            const p1 = curvePoints[i];
            const p2 = curvePoints[i+1];
            
            // Đoạn thẳng P1-P2 trên biểu đồ
            const x1 = p1.x; const y1 = p1.y;
            const x2 = p2.x; const y2 = p2.y;

            // Bài toán tìm giao điểm của 2 đoạn thẳng:
            // Đoạn 1 (Biểu đồ): P = P1 + u * (P2 - P1)  với 0 <= u <= 1
            // Đoạn 2 (Tia tải trọng): P = v * Load  với v > 0 (v chính là hệ số k cần tìm)
            
            // Hệ phương trình tuyến tính:
            // k * targetM = x1 + t * (x2 - x1)
            // k * targetP = y1 + t * (y2 - y1)
            
            const dx = x2 - x1;
            const dy = y2 - y1;
            
            // Giải hệ bằng định thức (Cramer)
            // k * targetM - t * dx = x1
            // k * targetP - t * dy = y1
            // D = targetM * (-dy) - targetP * (-dx) = targetP*dx - targetM*dy
            const det = targetP * dx - targetM * dy;

            // Nếu det ~ 0 => Tia tải trọng song song với đoạn biểu đồ (hiếm gặp nhưng có thể)
            if (Math.abs(det) < 1e-9) continue;

            // Tính t (tham số nội suy trên đoạn biểu đồ)
            // Dt = targetM * y1 - targetP * x1
            const t_val = (targetM * y1 - targetP * x1) / det;
            
            // Kiểm tra t có nằm trong đoạn [0, 1] không
            if (t_val >= 0 && t_val <= 1.0) {
                // Tính k (hệ số an toàn)
                let k_val;
                // Dk = x1 * (-dy) - y1 * (-dx) = y1*dx - x1*dy
                // k = Dk / D
                // Tuy nhiên ta có thể tính lại k từ t để đơn giản:
                
                if (Math.abs(targetM) > 1e-4) {
                    k_val = (x1 + t_val * dx) / targetM;
                } else {
                    // Trường hợp Momen ~ 0 (Nén đúng tâm), tính theo P
                    if (Math.abs(targetP) > 1e-4) {
                        k_val = (y1 + t_val * dy) / targetP;
                    } else {
                        k_val = 0; // Điểm 0/0
                    }
                }

                // Lấy k dương (hướng cùng chiều tải trọng)
                if (k_val > 0) {
                    // Nếu tìm thấy nhiều giao điểm (do biểu đồ lõm - hiếm), lấy cái tốt nhất
                    // Với biểu đồ lồi P-M chuẩn, tia từ gốc chỉ cắt 1 điểm duy nhất.
                    if (bestK === null || k_val > bestK) {
                        bestK = k_val;
                    }
                }
            }
        }
        
        return bestK;
    }
};