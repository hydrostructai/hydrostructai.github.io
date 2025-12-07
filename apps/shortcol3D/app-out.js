/**
 * APP OUTPUT COMPONENT (RESULT DISPLAY)
 * Nhiệm vụ:
 * 1. Vẽ biểu đồ tương tác 3D (Mesh + Points).
 * 2. Tính toán hệ số an toàn dựa trên mặt tương tác đã sinh ra.
 * 3. Hiển thị bảng kết quả chi tiết.
 */

const { useEffect, useRef, useState, useMemo } = React;

const AppOut = ({ results, input }) => {
    const chartRef = useRef(null);
    const [safetyFactors, setSafetyFactors] = useState({});

    // --- 1. HELPER: TÍNH HỆ SỐ AN TOÀN (K) ---
    // Thuật toán: Tìm giao điểm của vector tải trọng với mặt tương tác
    // K = |Vector Sức kháng| / |Vector Tải trọng|
    const calculateSafetyFactor = (load, surfacePoints) => {
        const { P, Mx, My } = load;
        const distLoad = Math.sqrt(P*P + Mx*Mx + My*My);
        
        // Nếu tải trọng = 0, an toàn tuyệt đối
        if (distLoad < 0.01) return { k: 999, isSafe: true };

        // Vector đơn vị của tải trọng
        const uLx = Mx / distLoad;
        const uLy = My / distLoad;
        const uLz = P / distLoad;

        // Tìm điểm trên mặt tương tác có hướng gần nhất với vector tải trọng
        // (Sử dụng tích vô hướng để tìm Cosine góc nhỏ nhất)
        let maxDot = -1;
        let bestPoint = null;

        for (let pt of surfacePoints) {
            const distPt = Math.sqrt(pt.x*pt.x + pt.y*pt.y + pt.z*pt.z);
            if (distPt < 0.01) continue;

            // Dot product của vector đơn vị
            const dot = (pt.x * uLx + pt.y * uLy + pt.z * uLz) / distPt;

            if (dot > maxDot) {
                maxDot = dot;
                bestPoint = pt;
            }
        }

        // Nếu tìm thấy điểm tương đồng hướng (ngưỡng cos > 0.98 ~ góc lệch < 11 độ)
        // Lưu ý: Do lưới điểm rời rạc, ta chấp nhận sai số góc nhỏ
        if (bestPoint && maxDot > 0.95) {
            const distCap = Math.sqrt(bestPoint.x**2 + bestPoint.y**2 + bestPoint.z**2);
            const k = distCap / distLoad;
            return { k: k, isSafe: k >= 1.0 };
        }

        return { k: 0, isSafe: false }; // Không tìm thấy (ngoài vùng bao phủ hoặc lỗi)
    };

    // --- 2. EFFECT: TÍNH TOÁN & VẼ BIỂU ĐỒ ---
    useEffect(() => {
        if (!results || !chartRef.current || !input) return;

        const { surfacePoints } = results;
        const loads = input.loads || [];

        // A. Tính toán lại hệ số an toàn cho tất cả các tổ hợp
        const newSafetyFactors = {};
        loads.forEach(l => {
            newSafetyFactors[l.id] = calculateSafetyFactor(l, surfacePoints);
        });
        setSafetyFactors(newSafetyFactors);

        // B. Chuẩn bị dữ liệu vẽ Plotly

        // 1. Trace: Mặt tương tác (Mesh3D)
        const meshTrace = {
            type: 'mesh3d',
            x: surfacePoints.map(p => p.x), // Mx
            y: surfacePoints.map(p => p.y), // My
            z: surfacePoints.map(p => p.z), // P
            alphahull: 0, // Convex hull tạo khối kín
            opacity: 0.35, // Trong suốt để nhìn thấy điểm bên trong
            color: '#3b82f6', // Blue-500
            hoverinfo: 'none', // Tắt hover trên mặt để đỡ rối
            name: 'Vùng chịu lực'
        };

        // 2. Trace: Các điểm tải trọng (Scatter3D)
        const loadTrace = {
            type: 'scatter3d',
            mode: 'markers',
            x: loads.map(l => l.Mx),
            y: loads.map(l => l.My),
            z: loads.map(l => l.P),
            marker: { 
                size: 5, 
                color: loads.map(l => newSafetyFactors[l.id]?.isSafe ? '#22c55e' : '#ef4444'), // Green/Red
                symbol: 'circle',
                line: { color: 'white', width: 1 }
            },
            text: loads.map(l => l.note),
            hovertemplate: '<b>%{text}</b><br>Mx: %{x:.1f}<br>My: %{y:.1f}<br>P: %{z:.1f}<extra></extra>',
            name: 'Điểm tải trọng'
        };

        // 3. Trace: Các đường gióng từ gốc 0,0,0 đến điểm tải (Lines)
        // Giúp nhìn không gian 3D dễ hơn
        const lineTraces = loads.map(l => {
            const isSafe = newSafetyFactors[l.id]?.isSafe;
            return {
                type: 'scatter3d',
                mode: 'lines',
                x: [0, l.Mx], y: [0, l.My], z: [0, l.P],
                line: { 
                    width: 4, 
                    color: isSafe ? '#22c55e' : '#ef4444' // Green/Red
                },
                hoverinfo: 'none',
                showlegend: false
            };
        });

        // 4. Trace: Trục tọa độ giả (để hiển thị rõ trục 0)
        const axesTrace = {
            type: 'scatter3d',
            mode: 'lines',
            x: [0, 0, 0, 0, 0, 0],
            y: [0, 0, 0, 0, 0, 0],
            z: [Math.min(...surfacePoints.map(p=>p.z)), Math.max(...surfacePoints.map(p=>p.z)), 0, 0, 0, 0],
            line: { color: 'black', width: 1 },
            hoverinfo: 'none',
            showlegend: false
        };

        // C. Cấu hình Layout Plotly
        const layout = {
            title: { text: 'Biểu đồ tương tác không gian', font: { size: 14 } },
            scene: {
                xaxis: { title: 'Mx (kNm)', backgroundcolor: "#f8fafc", gridcolor: "#e2e8f0" },
                yaxis: { title: 'My (kNm)', backgroundcolor: "#f8fafc", gridcolor: "#e2e8f0" },
                zaxis: { title: 'P (kN)', backgroundcolor: "#f1f5f9", gridcolor: "#cbd5e1" },
                camera: { 
                    eye: { x: 1.6, y: 1.6, z: 1.6 }, // Góc nhìn xa một chút
                    up: { x: 0, y: 0, z: 1 } // Trục Z hướng lên
                },
                aspectmode: 'cube' // Tỉ lệ 1:1:1
            },
            margin: { l: 0, r: 0, b: 0, t: 30 },
            height: 500, // Chiều cao cố định
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)',
            showlegend: true,
            legend: { x: 0, y: 1 }
        };

        const config = { 
            responsive: true, 
            displayModeBar: true, 
            displaylogo: false,
            modeBarButtonsToRemove: ['lasso2d', 'select2d']
        };

        // Vẽ biểu đồ (New Plot để reset hoàn toàn khi dữ liệu đổi)
        Plotly.newPlot(chartRef.current, [meshTrace, loadTrace, ...lineTraces], layout, config);

    }, [results, input]); // Chạy lại khi input hoặc results thay đổi

    // --- 3. RENDER TRẠNG THÁI CHỜ ---
    if (!results) {
        return (
            <div className="h-full flex flex-col items-center justify-center bg-slate-50 border-l border-slate-100">
                <div className="text-center p-8 opacity-50">
                    <i className="bi bi-bar-chart-steps text-6xl mb-4 text-slate-300 block"></i>
                    <h3 className="text-lg font-medium text-slate-500">Chưa có dữ liệu tính toán</h3>
                    <p className="text-sm text-slate-400 mt-2">Vui lòng nhập thông số và nhấn "Tính toán"</p>
                </div>
            </div>
        );
    }

    // --- 4. RENDER GIAO DIỆN KẾT QUẢ ---
    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header Kết quả */}
            <div className="px-6 py-3 border-b flex justify-between items-center bg-white sticky top-0 z-10">
                <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wide">
                    <i className="bi bi-graph-up-arrow text-blue-600 me-2"></i> Kết quả phân tích
                </h3>
                <div className="flex gap-2">
                    <span className="flex items-center text-[10px] font-bold px-2 py-1 bg-green-100 text-green-700 rounded border border-green-200">
                        <span className="w-2 h-2 bg-green-500 rounded-full me-1"></span> Đạt
                    </span>
                    <span className="flex items-center text-[10px] font-bold px-2 py-1 bg-red-100 text-red-700 rounded border border-red-200">
                        <span className="w-2 h-2 bg-red-500 rounded-full me-1"></span> Không đạt
                    </span>
                </div>
            </div>

            {/* Vùng chứa Biểu đồ & Bảng (Scrollable) */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-4 grid gap-6">
                    
                    {/* A. 3D Chart Container */}
                    <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-slate-100 p-2 relative">
                        {/* Div này để Plotly mount vào */}
                        <div ref={chartRef} className="w-full h-[500px]"></div>
                        
                        {/* Hướng dẫn thao tác */}
                        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg border shadow-sm text-xs text-slate-500 pointer-events-none">
                            <i className="bi bi-mouse me-1"></i> Xoay: Chuột trái | Zoom: Cuộn
                        </div>
                    </div>

                    {/* B. Results Table */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                            <h4 className="text-xs font-bold text-slate-600 uppercase">Chi tiết kiểm tra</h4>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b">
                                    <tr>
                                        <th className="px-4 py-3 font-semibold">Tổ hợp</th>
                                        <th className="px-4 py-3 font-semibold text-right">P (kN)</th>
                                        <th className="px-4 py-3 font-semibold text-right">Mx (kNm)</th>
                                        <th className="px-4 py-3 font-semibold text-right">My (kNm)</th>
                                        <th className="px-4 py-3 font-semibold text-center" title="Hệ số an toàn K = R/S">Hệ số K</th>
                                        <th className="px-4 py-3 font-semibold text-center">Trạng thái</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {input.loads.map((l, idx) => {
                                        const result = safetyFactors[l.id] || { k: 0, isSafe: false };
                                        const kVal = result.k === 999 ? "∞" : result.k.toFixed(2);
                                        
                                        return (
                                            <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-3 font-bold text-slate-700">{l.note}</td>
                                                <td className="px-4 py-3 text-right font-mono text-slate-600">{l.P}</td>
                                                <td className="px-4 py-3 text-right font-mono text-slate-600">{l.Mx}</td>
                                                <td className="px-4 py-3 text-right font-mono text-slate-600">{l.My}</td>
                                                
                                                {/* Cột Hệ số K */}
                                                <td className="px-4 py-3 text-center">
                                                    <span className={`font-bold ${result.isSafe ? 'text-green-600' : 'text-red-600'}`}>
                                                        {kVal}
                                                    </span>
                                                </td>
                                                
                                                {/* Cột Trạng thái (Badge) */}
                                                <td className="px-4 py-3 text-center">
                                                    {result.isSafe ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                            <i className="bi bi-check-circle-fill text-[10px]"></i> Đạt
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                                            <i className="bi bi-x-circle-fill text-[10px]"></i> K.Đạt
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* C. Stats Info */}
                    <div className="text-[10px] text-slate-400 text-center pb-2">
                        * Hệ số an toàn K được tính theo phương pháp tỷ số bán kính vector trong không gian (Radial Path).
                        <br/>
                        Mesh Nodes: {results.meshStats?.concreteNodes || 0} | Rebar Nodes: {results.meshStats?.steelNodes || 0}
                    </div>

                </div>
            </div>
        </div>
    );
};

// Expose to Global
window.AppOut = AppOut;