import { API_STORAGE } from "../../../service/api_storage.js";
import { request } from "../../../service/api_base.js";

function initInvites() {
    const inviteList = document.getElementById('invite-trip-list');
    const joinCodeModal = document.getElementById('join-code-modal');
    const btnModalSubmit = document.getElementById('btn-modal-submit');
    const tripCodeInput = document.getElementById('trip-code-input');

    const userId = 2;

    if (!inviteList) return;

    // 💡 Hàm phụ trợ chuyển đổi chuỗi trạng thái từ Backend sang nhãn hiển thị và CSS class tương ứng
    const getStatusBadge = (statusStr) => {
        const s = (statusStr || "").toUpperCase();
        switch (s) {
            case "PLANNING": return `<span class="status-badge planning">Đang lập kế hoạch</span>`;
            case "PROCESSING": return `<span class="status-badge processing">Đang diễn ra</span>`;
            case "END": return `<span class="status-badge end">Đã kết thúc</span>`;
            default: return `<span>Chưa cập nhật</span>`;
        }
    };

    // 🔄 Render danh sách lời mời động từ API
    function renderInvites(invites) {
        inviteList.innerHTML = "";

        if (!invites || invites.length === 0) {
            inviteList.innerHTML = `
                <div style="text-align: center; color: #7f8c8d; padding: 40px; width: 100%;">
                    <i class="bi bi-envelope-open" style="font-size: 40px; color: #cbd5e1; display:block; margin-bottom:10px;"></i>
                    Hộp thư trống. Bạn không có lời mời tham gia chuyến đi nào!
                </div>`;
            return;
        }

        inviteList.innerHTML = invites.map(trip => {
            // Xử lý hình ảnh Base64 hoặc ảnh mặc định từ Backend
            let imgSrc = "https://placehold.co/400x250?text=NextTrip";
            if (trip.image) {
                imgSrc = trip.image.startsWith('data:image') 
                    ? trip.image 
                    : `data:image/jpeg;base64,${trip.image}`;
            }

            const timeDisplay = (trip.start_date && trip.end_date) 
                ? `<i class="bi bi-calendar"></i> ${trip.start_date} đến ${trip.end_date}` 
                : `Thời gian: <span>Chưa cập nhật</span>`;

            const memberDisplay = trip.number_member 
                ? `${trip.number_member} thành viên` 
                : `Chưa cập nhật thành viên`;

            return `
                <div class="trip-card" data-id="${trip.invite_id || trip.trip_id}">
                    <img src="${imgSrc}" class="trip-card-image" alt="${trip.title}">
                    <div class="trip-card-body">
                        <div class="trip-title" style="font-weight:700; font-size:16px; color:#1e3a8a; margin-bottom:8px;">
                            Chuyến đi: ${trip.title}
                        </div>
                        <div class="trip-info-item">${timeDisplay}</div>
                        <div class="trip-info-item">Trạng thái: ${getStatusBadge(trip.status)}</div>
                        <div class="trip-info-item">Vai trò đề xuất: <span style="color:#2563eb; font-weight:600;">Thành viên</span></div>
                        <div class="trip-info-item"><i class="bi bi-people"></i> ${memberDisplay}</div>
                    </div>
                    <div class="trip-card-actions" style="display: flex; gap: 10px; padding: 10px 15px;">
                        <button class="mini-btn btn-blue btn-small btn-accept" data-id="${trip.invite_id || trip.trip_id}" style="flex:1;">Tham gia</button>
                        <button class="mini-btn btn-red btn-small btn-decline" data-id="${trip.invite_id || trip.trip_id}" style="flex:1;">Từ chối</button>
                    </div>
                </div>
            `;
        }).join('');
    }

    async function fetchInvitesData() {
        try {
            inviteList.innerHTML = '<div style="text-align:center; padding:40px; color:#64748b; width:100%;">Đang tải danh sách lời mời...</div>';
            
            // Gửi kèm userId vào query parameter khi fetch danh sách lời mời
            const response = await request(`${API_STORAGE.COMPANION.list_invites}?userId=${userId}`, {
                method: "GET"
            });

            if (response && response.data) {
                renderInvites(response.data);
            } else {
                renderInvites([]);
            }
        } catch (error) {
            console.error("Lỗi khi fetch danh sách lời mời:", error);
            inviteList.innerHTML = '<div style="color:#ef4444; text-align:center; padding:40px; width:100%;">Không thể kết nối đến máy chủ. Vui lòng thử lại!</div>';
        }
    }

    // ================= ỦY QUYỀN SỰ KIỆN NÚT TRÊN CARD (TỐI ƯU HƠN ONCLICK) =================
    inviteList.addEventListener('click', async (e) => {
        const acceptBtn = e.target.closest('.btn-accept');
        const declineBtn = e.target.closest('.btn-decline');

        // Hành động: Chấp nhận lời mời
        if (acceptBtn) {
            const id = acceptBtn.getAttribute('data-id');
            if (confirm("Xác nhận tham gia vào chuyến đi nhóm này?")) {
                try {
                    acceptBtn.disabled = true;
                    await request(`/api/v1.0/companion/invite/accept/${id}`, {
                        method: "PUT"
                    });
                    alert("Chúc mừng! Bạn đã trở thành thành viên đồng hành của chuyến đi.");
                    fetchInvitesData(); // Tải lại danh sách
                } catch (error) {
                    alert(`Không thể tham gia: ${error.message}`);
                    acceptBtn.disabled = false;
                }
            }
        }

        // Hành động: Từ chối lời mời
        if (declineBtn) {
            const id = declineBtn.getAttribute('data-id');
            if (confirm("Bạn có chắc chắn muốn xóa và từ chối lời mời này không?")) {
                try {
                    declineBtn.disabled = true;
                    await request(`/api/v1.0/companion/invite/decline/${id}`, {
                        method: "DELETE"
                    });
                    alert("Đã xóa bỏ lời mời thành công.");
                    fetchInvitesData(); // Tải lại danh sách
                } catch (error) {
                    alert(`Không thể từ chối: ${error.message}`);
                    declineBtn.disabled = false;
                }
            }
        }
    });

    // ================= QUẢN LÝ SỰ KIỆN MODAL MỜI BẰNG MÃ (JOIN CODE) =================
    
    // Nút mở modal (nằm ở khung trang chính companion.html)
    const btnJoinCode = document.getElementById('btn-join-code');
    if (btnJoinCode) {
        btnJoinCode.onclick = () => {
            if (joinCodeModal) joinCodeModal.classList.remove('hidden');
        };
    }

    // Nút đóng modal
    document.getElementById('btn-modal-close')?.addEventListener('click', () => {
        if (joinCodeModal) joinCodeModal.classList.add('hidden');
        if (tripCodeInput) tripCodeInput.value = "";
    });

    // Xác nhận tham gia bằng mã code gửi lên Backend
    if (btnModalSubmit) {
        btnModalSubmit.addEventListener('click', async () => {
            if (!tripCodeInput) return;
            
            const codeValue = tripCodeInput.value.trim().toUpperCase();
            if (!codeValue) {
                alert("Vui lòng điền mã chuyến đi chính xác!");
                return;
            }

            try {
                btnModalSubmit.disabled = true;
                btnModalSubmit.innerText = "Đang xử lý...";

                await request("/api/v1.0/companion/invite/join-code", {
                    method: "POST",
                    body: JSON.stringify({ code: codeValue })
                });

                alert(`Tham gia thành công chuyến đi nhóm với mã: ${codeValue}`);
                
                // Đóng và dọn dẹp form
                joinCodeModal?.classList.add('hidden');
                tripCodeInput.value = "";
                
                // Cập nhật lại danh sách nếu cần thiết
                fetchInvitesData();
            } catch (error) {
                console.error("Lỗi khi tham gia bằng mã:", error);
                alert(`Lỗi: ${error.message || "Mã chuyến đi không hợp lệ hoặc đã hết hạn!"}`);
            } finally {
                btnModalSubmit.disabled = false;
                btnModalSubmit.innerText = "Tham gia";
            }
        });
    }

    // Khởi tạo chạy nạp dữ liệu ngay khi phân hệ Lời mời hiển thị
    fetchInvitesData();
}

window.initInvites = initInvites;