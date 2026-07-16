import { request } from "../../../service/api_base.js";
import { API_STORAGE } from "../../../service/api_storage.js";

async function initTimeline() {
    // 1. Lấy thông tin ID từ URL
    const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const currentTripId = hashParams.get('id');

    if (!currentTripId) {
        console.error("Không tìm thấy Trip ID");
        return;
    }

    // --- CÁC PHẦN TỬ DOM ---
    const daySelect = document.getElementById("daySelect");
    const tbody = document.getElementById("timelineTableBody");
    
    // Nút & Modal
    const addItineraryBtn = document.getElementById("addItineraryBtn");
    const addActivityBtn = document.getElementById("addActivityBtn");
    
    const itineraryModal = document.getElementById("addItineraryModal");
    const activityModal = document.getElementById("addActivityModal");
    
    const itineraryForm = document.getElementById("addItineraryForm");
    const activityForm = document.getElementById("addActivityForm");



    // 1. Lấy danh sách các ngày (Itinerary)
    async function fetchItineraries() {
        try {
            // Sử dụng URL Parameter cho tripId
            const response = await request(`${API_STORAGE.ITINERARY.get_list}?tripId=${currentTripId}`, {
                method: "GET"
            });
            const itineraries = response.data || [];

            daySelect.innerHTML = ""; // Xóa dữ liệu cũ
            
            if (itineraries.length === 0) {
                daySelect.innerHTML = `<option value="">Chưa có lịch trình nào</option>`;
                tbody.innerHTML = `<tr><td colspan="5" style="text-align: center;">Vui lòng thêm ngày lịch trình trước</td></tr>`;
                return;
            }

            itineraries.forEach(item => {
                const option = document.createElement("option");
                // Fallback linh hoạt giữa .id và .itineraryId tùy thuộc format JSON Backend
                option.value = item.id || item.itineraryId; 
                option.dataset.date = item.date; 
                option.textContent = `Ngày ${item.day_number || item.dayNumber} - ${item.date} - ${item.title}`;
                daySelect.appendChild(option);
            });

            // Chỉ gọi fetchActivities nếu giá trị daySelect hợp lệ
            const firstItineraryId = daySelect.value;
            if (firstItineraryId && firstItineraryId !== "undefined") {
                fetchActivities(firstItineraryId);
            } else {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #888;">Không tìm thấy mã ngày lịch trình hợp lệ.</td></tr>`;
            }

        } catch (error) {
            console.error("Lỗi lấy danh sách ngày:", error);
        }
    }

    // 2. Lấy danh sách hoạt động theo ngày (Activity)
    async function fetchActivities(itineraryId) {
        // Kiểm tra an toàn chặn gửi giá trị 'undefined' hoặc rỗng lên Backend
        if (!itineraryId || itineraryId === "undefined") {
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #888;">Chưa chọn ngày lịch trình hợp lệ.</td></tr>`;
            return;
        }
        try {
            const response = await request(`${API_STORAGE.ITINERARY.activity_get_list}?itineraryId=${itineraryId}`, {
                method: "GET"
            });
            const activities = response.data || [];
            
            tbody.innerHTML = "";
            
            if (activities.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: #888;">Chưa có hoạt động nào trong ngày này.</td></tr>`;
                return;
            }

            activities.forEach(act => {
                // Parse ISO string về định dạng HH:mm
                const startTime = act.startTime 
                    ? new Date(act.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                    : '--:--';
                const endTime = act.endTime 
                    ? new Date(act.endTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
                    : '--:--';

                const row = document.createElement("tr");
                row.innerHTML = `
                    <td style="font-weight: 600; color: var(--primary);">${startTime} - ${endTime}</td>
                    <td style="text-align: left; font-weight: 500;">
                        ${act.name}
                        ${act.location ? `<br><small style="color:#666;"><i class="bi bi-geo-alt"></i> ${act.location}</small>` : ''}
                    </td>
               
                    <td style="color: #555; text-align: left;">${act.note || ''}</td>
                    <td>
                            <!-- <div class="approval-actions">
                                <button class="mini-btn red"><i class="fas fa-trash"></i></button>
                            </div> -->
                    </td>
                `;
                tbody.appendChild(row);
            });
        } catch (error) {
            console.error("Lỗi lấy danh sách hoạt động:", error);
            tbody.innerHTML = `<tr><td colspan="5" style="text-align: center; color: red;">Lỗi khi tải danh sách hoạt động.</td></tr>`;
        }
    }

    // ==========================================
    // B. LẮNG NGHE SỰ KIỆN (EVENTS)
    // ==========================================

    // Khi người dùng đổi ngày ở ô Select -> Render lại timeline
    if (daySelect) {
        daySelect.addEventListener("change", (e) => {
            fetchActivities(e.target.value);
        });
    }

    // --- Mở / Đóng Modal ---
    addItineraryBtn.addEventListener("click", () => itineraryModal.classList.remove("hidden"));
    document.getElementById("closeItineraryModal").addEventListener("click", () => itineraryModal.classList.add("hidden"));

    addActivityBtn.addEventListener("click", () => {
        const selectedId = daySelect.value;
        if (!selectedId || selectedId === "undefined") {
            alert("Vui lòng thêm Ngày lịch trình trước khi thêm hoạt động!");
            return;
        }
        activityModal.classList.remove("hidden");
    });
    document.getElementById("closeActivityModal").addEventListener("click", () => activityModal.classList.add("hidden"));

    // ==========================================
    // C. XỬ LÝ SUBMIT FORM (POST API)
    // ==========================================

    // Submit: THÊM NGÀY MỚI
    itineraryForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const payload = {
            title: document.getElementById("itineraryTitle").value,
            date: document.getElementById("itineraryDate").value,
            dayNumber: parseInt(document.getElementById("itineraryDayNumber").value)
        };

        try {
            await request(`${API_STORAGE.ITINERARY.create}?tripId=${currentTripId}`, {
                method: "POST",
                body: JSON.stringify(payload)
            });
            itineraryModal.classList.add("hidden");
            itineraryForm.reset();
            // Load lại danh sách ngày
            await fetchItineraries();
        } catch (error) {
            alert("Lỗi khi thêm ngày mới");
        }
    });

    // Submit: THÊM HOẠT ĐỘNG MỚI
    activityForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const selectedItineraryId = daySelect.value;
        
        if (!selectedItineraryId || selectedItineraryId === "undefined") {
            alert("Không tìm thấy mã ngày lịch trình hợp lệ để thêm hoạt động!");
            return;
        }

        const selectedOption = daySelect.options[daySelect.selectedIndex];
        
        // Lấy ngày (YYYY-MM-DD) từ thuộc tính dataset đã lưu lúc fetchItineraries
        const baseDate = selectedOption.dataset.date; 
        
        const startTimeInput = document.getElementById("actStartTime").value; // VD: "10:30"
        const endTimeInput = document.getElementById("actEndTime").value;     // VD: "12:00"

        // Format thành ISO 8601 String chuẩn để gửi Backend
        const startISO = new Date(`${baseDate}T${startTimeInput}:00`).toISOString();
        const endISO = new Date(`${baseDate}T${endTimeInput}:00`).toISOString();

        const payload = {
            name: document.getElementById("actName").value,
            startTime: startISO,
            endTime: endISO,
            note: document.getElementById("actNote").value,
            location: document.getElementById("actLocation").value
        };

        try {
            // Truyền itineraryId qua query param
            await request(`${API_STORAGE.ITINERARY.activity_create}?itineraryId=${selectedItineraryId}`, {
                method: "POST",
                body: JSON.stringify(payload)
            });
            activityModal.classList.add("hidden");
            activityForm.reset();
            // Load lại bảng hoạt động của ngày hiện tại
            fetchActivities(selectedItineraryId);
        } catch (error) {
            alert("Lỗi khi thêm hoạt động mới");
        }
    });


    fetchItineraries();
}

window.initTimeline = initTimeline;
export { initTimeline };