import { API_STORAGE } from "../../service/api_storage.js";
import { request } from "../../service/api_base.js";

function initHome() {
    // Tìm vùng chứa danh sách chuyến đi dựa trên class thực tế trong HTML của bạn
    const tripsGrid = document.querySelector(".trips-grid");
    if (!tripsGrid) {
        console.warn("⚠️ Không tìm thấy thẻ div chứa danh sách .trips-grid");
        return;
    }

    // --- CÁC HÀM TRỢ GIÚP TÍNH TOÁN THỜI GIAN ---

    // 1. Tính số ngày đêm (Ví dụ: "4 ngày 3 đêm" hoặc "10 ngày 9 đêm")
    function calculateDaysNights(startStr, endStr) {
        if (!startStr || !endStr) return "Chưa rõ thời gian";
        const start = new Date(startStr);
        const end = new Date(endStr);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Tính cả ngày bắt đầu
        
        if (diffDays <= 1) return "1 ngày";
        return `${diffDays} ngày ${diffDays - 1} đêm`;
    }

    function formatDateDisplay(dateStr) {
        if (!dateStr) return "--";
        const [year, month, day] = dateStr.split("-");
        return `${day}/${month}/${year}`;
    }

    function getDaysUntilTrip(startStr) {
        if (!startStr) return null;
        const today = new Date(); // Thời gian thực tế hệ thống (2026)
        const startDate = new Date(startStr);
        
        today.setHours(0, 0, 0, 0);
        startDate.setHours(0, 0, 0, 0);

        const diffTime = startDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays > 0 ? `Trong ${diffDays} ngày` : null;
    }

    function getStatusLabel(status) {
        const s = (status || '').toString().toUpperCase();
        if (s === 'PLANNING') return 'Đang lập kế hoạch';
        if (s === 'PROCESSING') return 'Đang diễn ra';
        if (s === 'END') return 'Đã kết thúc';
        return 'Chưa xác định';
    }
        function getStatusClass(status) {
        const s = (status || '').toString().toUpperCase();
        if (s === 'PLANNING') return 'planning';
        if (s === 'PROCESSING') return 'processing';
        if (s === 'END') return 'completed';
        return 'other';
    }

    // --- HÀM RENDER HTML ĐỘNG ---
    function renderHomeTrips(trips) {
        tripsGrid.innerHTML = ""; // Xóa các thẻ HTML tĩnh rỗng

        if (!trips || trips.length === 0) {
            tripsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; color: #7f8c8d; padding: 40px;">
                    <p>Chưa có hành trình nào được lên lịch sắp tới.</p>
                </div>`;
            return;
        }

        trips.forEach(trip => {
            const card = document.createElement("div");
            card.className = "trip-card";
            card.setAttribute("data-id", trip.trip_id || trip.id);
            card.style.cursor = "pointer";

            // 1. Xử lý ảnh (Base64 hoặc URL trực tiếp)
            let imgSrc = "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400"; // Ảnh mặc định dự phòng
            if (trip.image) {
                imgSrc = trip.image.startsWith("data:image") || trip.image.startsWith("http")
                    ? trip.image 
                    : `data:image/jpeg;base64,${trip.image}`;
            }

            // 2. Tính toán các giá trị thời gian hiển thị
            const formattedStart = formatDateDisplay(trip.start_date);
            const formattedEnd = formatDateDisplay(trip.end_date);
            const dateRange = `${formattedStart.split('/')[0]} - ${formattedEnd}`; // Rút gọn dạng "20 - 24/06/2026"
            
            const durationText = calculateDaysNights(trip.start_date, trip.end_date);
            const countdownText = getDaysUntilTrip(trip.start_date);
            const memberCount = trip.number_member ? `${trip.number_member} người` : "Chưa cập nhật";
            const statusLabel = getStatusLabel(trip.status);
            const statusClass = getStatusClass(trip.status);

            // 3. Render chuẩn cấu trúc HTML ban đầu của bạn
            card.innerHTML = `
                <div class="trip-img-wrap">
                    ${countdownText ? `<span class="badge-days">${countdownText}</span>` : ""}
                    <img src="${imgSrc}" alt="${trip.destination || 'NextTrip'}">
                </div>
                <div class="trip-info">
                    <div class="trip-title">${trip.title || "Hành trình không tên"}</div>
                    <div class="trip-status-label ${statusClass}">${statusLabel}</div>
                    <div class="trip-date">${dateRange}</div>
                    <div class="trip-footer">
                        <span><i class="bi bi-calendar3"></i> ${durationText}</span>
                        <span><i class="bi bi-people"></i> ${memberCount}</span>
                    </div>
                </div>
            `;
            // Bấm vào card chuyển hướng đến trang tổng quan chi tiết của Trip đó
            card.addEventListener("click", () => {
                const tripId = trip.trip_id || trip.id;
                localStorage.setItem("currentTripId", tripId);
                window.location.hash = `#/trip/general?id=${tripId}`;
            });

            tripsGrid.appendChild(card);
        });
    }

    // --- GỌI API LẤY DATA THẬT ---
    async function fetchHomeTrips() {
        try {
            tripsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 30px; color: #7f8c8d;">
                    Đang tải hành trình sắp tới...
                </div>`;
            
            const response = await request(API_STORAGE.TRIP.home_view, {
                method: "GET"
            });

            console.log('home_view response:', response);

            let trips = [];
            if (Array.isArray(response)) {
                trips = response;
            } else if (response && Array.isArray(response.data)) {
                trips = response.data;
            } else if (response && Array.isArray(response.items)) {
                trips = response.items;
            } else if (response && Array.isArray(response.results)) {
                trips = response.results;
            }

            renderHomeTrips(trips);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu Home:", error);
            tripsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; color: #e53935; padding: 30px;">
                    Không thể kết nối đến máy chủ. Vui lòng thử lại sau!
                </div>`;
        }
    }

    // Khởi động tiến trình lấy dữ liệu
    fetchHomeTrips();
}

window.initHome = initHome;