// Cấu hình URL gốc cố định của Backend cổng 8000
const API_BASE_URL = "http://localhost:8000/";

/**
 * @param {string} path - Đường dẫn API (lấy từ API_STORAGE)
 * @param {Object} options - Các tùy chọn bổ sung (method, body, headers...)
 */
export async function request(path, options = {}) {
    // Đảm bảo không bị lặp dấu gạch chéo '/' khi nối chuỗi
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    const url = `${API_BASE_URL}${cleanPath}`;

    try {
        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                ...options.headers,
            },
            ...options,
        });

        if (!response.ok) {
            let errorDetail = "";
            try {
                // Thử đọc chi tiết lỗi trả về từ Backend JSON
                const errJson = await response.json();
                errorDetail = errJson.message || errJson.detail || JSON.stringify(errJson);
            } catch (e) {
                errorDetail = await response.text();
            }

            console.error(`❌ [API Error] ${options.method || 'GET'} -> ${url} | Status: ${response.status} | Detail: ${errorDetail}`);
            throw new Error(errorDetail || `Yêu cầu thất bại với mã trạng thái: ${response.status}`);
        }

        return response.status === 204 ? null : response.json();

    } catch (error) {
        console.error(`🚨 [Network/System Error] Không thể kết nối tới: ${url}. Lý do:`, error.message);
        throw error; // Ném tiếp lỗi để bên gọi form (UI) bắt được và hiển thị alert()
    }
}