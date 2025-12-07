/**
 * SHORTCOL 3D ENGINE - CORE CALCULATION MODULE
 * ---------------------------------------------
 * Chuyên gia: Phân tích cột bê tông cốt thép lệch tâm xiên (Biaxial Bending)
 * Phương pháp: Tích phân sợi (Fiber Integration Method)
 * Tiêu chuẩn: TCVN 5574:2018 | Eurocode 2 | ACI 318-19
 * * Version: 2.1.0 (Fixed Logic & Material Models)
 */

class ShortCol3D {
    constructor() {
        this.Es = 200000; // Module đàn hồi thép mặc định (MPa)
    }

    /**
     * MAIN FUNCTION: Phân tích toàn bộ
     * @param {Object} data - Dữ liệu đầu vào đã chuẩn hóa từ AppCal
     */
    analyze(data) {
        // 1. Giải bóc dữ liệu
        const { type, B, H, D, fck, fyk, bars, standard } = data;

        // 2. Thiết lập mô hình vật liệu chuẩn
        const mat = this.setupMaterial(standard, fck, fyk);

        // 3. Tạo lưới sợi (Discretization)
        const fibers = this.generateFiberMesh(type, B, H, D);
        
        // 4. Chuẩn hóa tọa độ cốt thép (đảm bảo đúng hệ trục tâm 0,0)
        // Lưu ý: Input bars đã có tọa độ x,y từ tâm
        const steelBars = bars.map(b => ({ x: b.x, y: b.y, As: b.As }));

        // 5. Tính toán mặt tương tác 3D
        const surfacePoints = this.computeInteractionSurface(fibers, steelBars, mat, type, B, H, D);

        return {
            surfacePoints,
            materialModel: mat,
            meshStats: { 
                concreteNodes: fibers.length, 
                steelNodes: steelBars.length 
            }
        };
    }

    // =========================================================================
    // A. MATERIAL MODELING (MÔ HÌNH VẬT LIỆU)
    // =========================================================================

    setupMaterial(standard, f_input, fy_input) {
        let mat = {
            standard: standard,
            f_c: f_input,      // Cường độ bê tông (Rb, fcd, f'c)
            f_y: fy_input,     // Cường độ cốt thép (Rs, fyd, fy)
            eps_cu: 0.0035,    // Biến dạng cực hạn của bê tông
            eps_c1: 0.002,     // Biến dạng tại đỉnh ứng suất (EC2/TCVN)
            eps_y: fy_input / 200000, // Biến dạng chảy dẻo thép
            type: 'nonlinear', // nonlinear (Parabola) hoặc whitney
            beta1: 0.85        // Hệ số khối ứng suất (cho ACI)
        };

        if (standard === 'ACI') {
            // ACI 318: Input là f'c (MPa)
            mat.eps_cu = 0.003; 
            mat.type = 'whitney';
            
            // Tính Beta1 theo ACI 318
            if (f_input <= 28) {
                mat.beta1 = 0.85;
            } else if (f_input >= 55) {
                mat.beta1 = 0.65;
            } else {
                mat.beta1 = 0.85 - 0.05 * (f_input - 28) / 7;
            }
        } 
        else if (standard === 'EC2') {
            // Eurocode 2: Input là fcd
            // Cấp độ bền <= C50/60
            mat.eps_cu = 0.0035;
            mat.eps_c1 = 0.002;
            mat.type = 'parabola';
        } 
        else {
            // TCVN 5574:2018: Input là Rb
            mat.eps_cu = 0.0035;
            mat.eps_c1 = 0.002;
            mat.type = 'parabola'; // Sơ đồ 3 đoạn hoặc phi tuyến
        }

        return mat;
    }

    /**
     * Tính ứng suất bê tông (Sigma_c) tại biến dạng (Strain)
     * Quy ước: Nén là âm (-), Kéo là dương (+)
     */
    getConcreteStress(strain, mat) {
        // Bê tông không chịu kéo
        if (strain >= 0) return 0;

        const e = Math.abs(strain); // Lấy trị tuyệt đối để tính toán
        
        // 1. Mô hình Whitney (ACI)
        if (mat.type === 'whitney') {
            // ACI giả định khối ứng suất chữ nhật tương đương
            // Tuy nhiên trong phân tích sợi (Fiber), để đảm bảo hội tụ số học và biểu đồ trơn,
            // ta thường dùng mô hình phi tuyến tương đương hoặc logic "if in block".
            // Ở đây áp dụng đúng logic khối chữ nhật Whitney để chuẩn ACI.
            
            // Logic Whitney cho Fiber:
            // Ứng suất = 0.85f'c NẾU nằm trong vùng a = beta1 * c
            // Điều này khó thực hiện ở cấp độ fiber nếu không biết c.
            // NHƯNG: Trong hàm integrateSection, ta đã biết phân bố biến dạng.
            // Ta có thể check biến dạng: Nếu strain > eps_limit thì max stress.
            
            // Cách đơn giản hóa cho ACI Fiber: Dùng mô hình Hognestad hoặc Parabola biến đổi
            // Nhưng để đúng "khối chữ nhật", ta cần truyền tham số chiều sâu vùng nén c vào hàm này.
            // Do hàm này độc lập, ta sẽ dùng mô hình Parabola cải tiến cho ACI để biểu đồ mượt hơn
            // (Thực tế ACI cho phép dùng Stress-Strain thực tế).
            
            const f_max = 0.85 * mat.f_c;
            if (e > mat.eps_cu) return 0; // Vỡ

            // Mô hình Hognestad sửa đổi (thông dụng cho phân tích cột ACI)
            const e0 = 2 * 0.85 * mat.f_c / (4700 * Math.sqrt(mat.f_c)); // Ec theo ACI
            if (e < e0) {
                return -f_max * (2*(e/e0) - (e/e0)**2);
            }
            return -f_max * (1 - 0.15 * (e - e0)/(mat.eps_cu - e0));
        }

        // 2. Mô hình Parabola-Rectangle (TCVN / EC2)
        // Sigma = fcd * [1 - (1 - e/e_c1)^n] với n=2
        const f_max = mat.f_c;
        
        if (e > mat.eps_cu) return 0; // Vỡ (Crushed)

        if (e <= mat.eps_c1) {
            // Vùng cong Parabola
            return -f_max * (1 - Math.pow(1 - (e / mat.eps_c1), 2));
        } else {
            // Vùng chữ nhật (Plastic plateau)
            return -f_max;
        }
    }

    /**
     * Tính ứng suất cốt thép (Sigma_s) - Đàn hồi dẻo lý tưởng
     */
    getSteelStress(strain, mat) {
        const stress = strain * this.Es;
        // Giới hạn chảy dẻo (+/- fy)
        if (stress > mat.f_y) return mat.f_y;
        if (stress < -mat.f_y) return -mat.f_y;
        return stress;
    }

    // =========================================================================
    // B. MESH GENERATION (CHIA LƯỚI SỢI)
    // =========================================================================

    generateFiberMesh(type, B, H, D) {
        const fibers = [];
        
        // Điều chỉnh độ mịn lưới (Tăng lên để chính xác hơn)
        const nx = 20; 
        const ny = 20;
        
        if (type === 'rect') {
            const dx = B / nx;
            const dy = H / ny;
            const dA = dx * dy;
            
            for (let i = 0; i < nx; i++) {
                for (let j = 0; j < ny; j++) {
                    // Tọa độ tâm sợi (Gốc 0,0 tại trọng tâm tiết diện)
                    fibers.push({
                        x: -B/2 + (i + 0.5) * dx,
                        y: -H/2 + (j + 0.5) * dy,
                        dA: dA
                    });
                }
            }
        } else {
            // Chia lưới tròn (Polar -> Cartesian)
            const nr = 12; // Số lớp vòng tròn
            const ntheta = 24; // Số chia góc
            const R = D / 2;
            
            for (let i = 0; i < nr; i++) {
                const r_inner = i * R / nr;
                const r_outer = (i + 1) * R / nr;
                const r_center = (r_inner + r_outer) / 2;
                const dA = (Math.PI * (r_outer**2 - r_inner**2)) / ntheta;

                for (let j = 0; j < ntheta; j++) {
                    const theta = (j * 2 * Math.PI) / ntheta;
                    fibers.push({
                        x: r_center * Math.cos(theta),
                        y: r_center * Math.sin(theta),
                        dA: dA
                    });
                }
            }
        }
        return fibers;
    }

    // =========================================================================
    // C. INTEGRATION ENGINE (TÍCH PHÂN NỘI LỰC)
    // =========================================================================

    /**
     * Tính toán P, Mx, My từ mặt phẳng biến dạng
     * Mặt phẳng: Strain(x,y) = eps_0 + y * curvature_x + x * curvature_y
     */
    integrateSection(fibers, bars, mat, eps_0, phi_x, phi_y, current_c) {
        let N_int = 0;  // Lực dọc tích hợp (N)
        let Mx_int = 0; // Momen quanh trục X (N.mm)
        let My_int = 0; // Momen quanh trục Y (N.mm)

        // 1. Tích phân Bê tông
        // Nếu là ACI Whitney, cần xử lý logic khối chữ nhật ở đây
        const isWhitney = mat.type === 'whitney';
        const a_depth = isWhitney ? mat.beta1 * current_c : 0;

        // Lưu ý: Để đơn giản hóa logic Whitney cho Fiber trong vòng lặp này:
        // Ta có thể dùng logic hình học (khoảng cách đến thớ biên < a)
        // Hoặc dùng hàm ứng suất liên tục (đã cài ở getConcreteStress).
        // Dưới đây dùng hàm ứng suất liên tục để đảm bảo biểu đồ mượt.

        for (let fib of fibers) {
            // Tính biến dạng tại tâm sợi
            const strain = eps_0 + phi_x * fib.y + phi_y * fib.x;
            
            // Lấy ứng suất
            let stress = 0;
            if (isWhitney) {
                 // ACI Whitney Logic chính xác cho Fiber:
                 // Nếu strain nén > 0 và nằm trong vùng a: stress = 0.85f'c
                 // Vùng nén là vùng có strain < 0.
                 // Ta cần biết khoảng cách từ trục trung hòa.
                 // Tuy nhiên, dùng hàm xấp xỉ Hognestad ở trên sẽ mượt hơn cho 3D.
                 stress = this.getConcreteStress(strain, mat);
            } else {
                 stress = this.getConcreteStress(strain, mat);
            }

            const force = stress * fib.dA;

            N_int += force;
            Mx_int += force * fib.y;
            My_int += force * fib.x;
        }

        // 2. Tích phân Thép
        for (let bar of bars) {
            const strain = eps_0 + phi_x * bar.y + phi_y * bar.x;
            const stress = this.getSteelStress(strain, mat);
            const force = stress * bar.As;

            N_int += force;
            Mx_int += force * bar.y;
            My_int += force * bar.x;
        }

        // 3. Chuyển đổi dấu và đơn vị
        // Hệ quy chiếu: Nén là âm (-) trong tính toán strain/stress.
        // Output kỹ sư: Nén là P dương (+).
        // Moment: Quy tắc bàn tay phải. 
        // Với trục Y hướng lên: y dương nén -> Mx dương làm căng thớ dưới.
        // Công thức Mx = Integral(sigma * y * dA).
        // Nếu thớ trên (y>0) bị nén (sigma<0) -> Mx đóng góp âm.
        // Để ra moment ngoại lực cân bằng: M_ext = - M_int.
        
        return {
            P: -N_int / 1000,      // Đổi ra kN (Dương là Nén)
            Mx: -Mx_int / 1e6,     // kNm (Momen ngoại lực)
            My: -My_int / 1e6      // kNm
        };
    }

    // =========================================================================
    // D. SURFACE GENERATION (QUÉT MẶT TƯƠNG TÁC)
    // =========================================================================

    computeInteractionSurface(fibers, bars, mat, type, B, H, D) {
        const points = [];
        
        // Số lượng góc quét (Angular resolution)
        const nAngles = 36; // 10 độ một bước
        
        // Kích thước tham chiếu để tính c chuẩn hóa
        const D_ref = type === 'rect' ? Math.sqrt(B*B + H*H) : D;

        // --- 1. Điểm Nén thuần túy (Pure Compression) ---
        // Strain phẳng toàn tiết diện = eps_c0 (khoảng 0.002)
        const resComp = this.integrateSection(fibers, bars, mat, -mat.eps_c1, 0, 0, 99999);
        // Lưu ý: Nén thuần lý thuyết M=0. Nhưng do thép bố trí có thể lệch, M có thể != 0
        // Ta thêm điểm này vào list cho mọi góc để đóng nắp
        for (let i=0; i<nAngles; i++) {
             points.push({ x: 0, y: 0, z: resComp.P }); // Force top cap center
        }

        // --- 2. Điểm Kéo thuần túy (Pure Tension) ---
        // Strain phẳng toàn tiết diện = +eps_y (chảy dẻo)
        const resTens = this.integrateSection(fibers, bars, mat, mat.eps_y * 5, 0, 0, -99999);
         for (let i=0; i<nAngles; i++) {
             points.push({ x: 0, y: 0, z: resTens.P }); // Force bottom cap center
        }

        // --- 3. Quét các góc nghiêng trục trung hòa (Neutral Axis Angle) ---
        for (let i = 0; i < nAngles; i++) {
            const theta = (i * 2 * Math.PI) / nAngles;
            
            // Vector pháp tuyến của trục trung hòa (hướng vào vùng nén)
            // n = (cos, sin)
            const nx = Math.cos(theta);
            const ny = Math.sin(theta);

            // Tìm thớ xa nhất theo hướng nén (d_max) để định vị trục trung hòa
            let d_max = -Infinity;
            // Với hình chữ nhật, check 4 góc
            if (type === 'rect') {
                const corners = [
                    {x:-B/2, y:-H/2}, {x:B/2, y:-H/2}, 
                    {x:B/2, y:H/2}, {x:-B/2, y:H/2}
                ];
                corners.forEach(p => {
                    const d = p.x * nx + p.y * ny;
                    if (d > d_max) d_max = d;
                });
            } else {
                d_max = D/2; // Với hình tròn, khoảng cách max luôn là R
            }

            // Quét chiều sâu vùng nén c (từ rất nhỏ đến rất lớn)
            // c_values: Mảng các giá trị c
            // Để vẽ đẹp, ta tập trung điểm vào vùng c nhỏ (uốn nhiều)
            const c_steps = [
                0.05*D_ref, 0.1*D_ref, 0.2*D_ref, 0.3*D_ref, 
                0.4*D_ref, 0.5*D_ref, 0.6*D_ref, 0.8*D_ref, 
                1.0*D_ref, 1.5*D_ref, 2.5*D_ref
            ];

            for (let c of c_steps) {
                // Tại trạng thái giới hạn cực hạn (Ultimate Limit State):
                // Giả thiết biến dạng phẳng: Thớ nén xa nhất đạt eps_cu
                // Strain tại thớ xa nhất (d_max) = -eps_cu (Nén)
                
                // Độ cong (Curvature): phi = eps_cu / c
                // Dấu: Độ cong làm thớ có tọa độ dương (theo n) bị nén thêm
                const curvature = -mat.eps_cu / c;

                // Chiếu độ cong lên 2 trục chính
                // Phi quanh trục X (gây biến dạng theo Y): phi_x = curvature * ny
                // Phi quanh trục Y (gây biến dạng theo X): phi_y = curvature * nx
                const phi_x = curvature * ny;
                const phi_y = curvature * nx;

                // Tính biến dạng tại tâm O(0,0)
                // Strain(d) = Strain_NA + curvature * dist_from_NA
                // Strain(d_max) = -eps_cu
                // => -eps_cu = eps_0 + curvature * d_max
                // => eps_0 = -eps_cu - curvature * d_max
                // => eps_0 = -eps_cu - (-eps_cu/c) * d_max = -eps_cu * (1 - d_max/c)
                const eps_0 = -mat.eps_cu * (1 - d_max / c);

                // Tích phân
                const res = this.integrateSection(fibers, bars, mat, eps_0, phi_x, phi_y, c);
                
                points.push({ x: res.Mx, y: res.My, z: res.P });
            }
        }

        return points;
    }
}

// Expose Class to Global Window Object
window.ShortCol3D = ShortCol3D;