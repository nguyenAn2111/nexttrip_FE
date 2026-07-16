
// function initLeadTrips() {
//     const leadList = document.getElementById('lead-trip-list');
//     const inviteModal = document.getElementById('invite-companion-modal');
//     const assignModal = document.getElementById('assign-role-modal');

//     // Giả lập dữ liệu API trả về từ Server
//     const mockLeadTrips = [
//         { id: 101, title: "Du lịch gia đình Đà Nẵng 7/2026", time: "20/06 - 24/06/2024", members: "8 thành viên", status: "Đang lên kế hoạch", img: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=400" }
//     ];

//     if (!leadList) return;

//     // Render danh sách thẻ card sử dụng lớp css trip-card dùng chung kích thước lớn
//     leadList.innerHTML = mockLeadTrips.map(trip => `
//         <div class="trip-card">
//             <img src="${trip.img}" class="trip-card-image">
//             <div class="trip-card-body">
//                 <div class="trip-title">Chuyến đi: ${trip.title}</div>
//                 <div class="trip-info-item">Thời gian: <span>${trip.time}</span></div>
//                 <div class="trip-info-item">Trạng thái: <span class="status-badge" style="background:#e0f2fe; color:#0369a1">${trip.status}</span></div>
//                 <div class="trip-info-item">Vai trò: <span>Trưởng đoàn</span></div>
//                 <div class="trip-info-item">Số người: <span>${trip.members}</span></div>
//             </div>
//             <div class="trip-card-actions">
//                 <button class="mini-btn btn-open-invite" style="background:#22c55e; color:white">Mời bạn đồng hành</button>
//                 <button class="mini-btn btn-open-assign" style="background:#f43f5e; color:white">Phân công</button>
//             </div>
//         </div>
//     `).join('');

//     // Đăng ký sự kiện mở các Modal tương ứng ngay sau khi render xong card
//     document.querySelector('.btn-open-invite')?.addEventListener('click', () => inviteModal?.classList.remove('hidden'));
//     document.querySelector('.btn-open-assign')?.addEventListener('click', () => assignModal?.classList.remove('hidden'));

//     // Đăng ký sự kiện đóng modal (nút Hủy)
//     document.querySelectorAll('.btn-close-invite').forEach(btn => {
//         btn.addEventListener('click', () => inviteModal?.classList.add('hidden'));
//     });
//     document.querySelectorAll('.btn-close-assign').forEach(btn => {
//         btn.addEventListener('click', () => assignModal?.classList.add('hidden'));
//     });

//     // Xử lý chuyển đổi tiểu mục con (Mời bằng ID / Bằng SĐT) trong Modal Mời bạn
//     const subTabs = document.querySelectorAll('.sub-tab');
//     subTabs.forEach(tab => {
//         tab.addEventListener('click', () => {
//             subTabs.forEach(t => t.classList.remove('active'));
//             tab.classList.add('active');

//             const isId = tab.getAttribute('data-subtab') === 'id';
//             document.getElementById('invite-label').innerText = isId ? "Nhập ID người dùng" : "Nhập Số điện thoại";
//             document.getElementById('invite-input').placeholder = isId ? "Ví dụ: NT123456" : "Ví dụ: 0912345678";
//             document.getElementById('invite-note').innerHTML = isId 
//                 ? "ID người dùng có thể tìm thấy trong <b>Hồ sơ cá nhân > Thông tin tài khoản</b>"
//                 : "Đảm bảo số điện thoại đã được đăng ký và xác thực trên hệ thống <b>NextTrip</b>";
//         });
//     });

//     // Sự kiện Copy nhanh mã mời
//     document.getElementById('btn-copy-code')?.addEventListener('click', () => {
//         const codeInput = document.getElementById('share-code-input');
//         if (codeInput) {
//             codeInput.select();
//             navigator.clipboard.writeText(codeInput.value);
//             alert("Đã sao chép mã mời vào bộ nhớ tạm!");
//         }
//     });
// }
import { API_STORAGE } from "../../../service/api_storage.js";
import { request } from "../../../service/api_base.js";

function initLeadTrips() {
    const listContainer = document.getElementById("lead-trip-list");
    if (!listContainer) return;

    let selectedTripIdForAction = null; // Biến lưu trữ ID chuyến đi đang thực hiện tác vụ

    // 💡 Hàm phụ trợ: Chuyển đổi mã trạng thái Backend thành class CSS và nhãn hiển thị
    const getStatusInfo = (statusStr) => {
        const s = (statusStr || "").toUpperCase();
        switch (s) {
            case "PLANNING": return { class: "planning", label: "Đang lập kế hoạch" };
            case "PROCESSING": return { class: "processing", label: "Đang diễn ra" };
            case "END": return { class: "end", label: "Đã kết thúc" };
            default: return { class: "planning", label: "Chưa xác định" };
        }
    };

    // 🔄 Render danh sách các chuyến đi do tôi dẫn đoàn / tham gia đồng hành
    function renderLeadTrips(trips) {
        listContainer.innerHTML = "";

        if (!trips || trips.length === 0) {
            listContainer.innerHTML = `
                <div class="panel" style="text-align: center; color: #7f8c8d; padding: 40px; width: 100%;">
                    <i class="fas fa-users" style="font-size: 48px; margin-bottom: 10px; color: #b0bec5;"></i>
                    <p>Bạn chưa dẫn dắt hay tham gia chuyến đi nhóm nào.</p>
                </div>`;
            return;
        }

        trips.forEach(trip => {
            const card = document.createElement("div");
            card.className = "trip-card";
            card.setAttribute("data-id", trip.trip_id);
            card.style.cursor = "pointer";

            const displayTime = `${trip.start_date || '--'} đến ${trip.end_date || '--'}`;
            const displayMembers = trip.number_member ? `${trip.number_member} thành viên` : 'Chưa cập nhật';
            const statusInfo = getStatusInfo(trip.status);
            
            // Xử lý hình ảnh Base64
            let imgSrc = "https://placehold.co/500x300?text=No+Image";
            if (trip.image) {
                imgSrc = trip.image.startsWith('data:image') 
                    ? trip.image 
                    : `data:image/jpeg;base64,${trip.image}`;
            }

            card.innerHTML = `
                <img src="${imgSrc}" class="trip-card-image" alt="${trip.title || 'Chuyến đi'}">
                
                <div class="trip-card-body">
                    <h3 class="trip-title">${trip.title}</h3>

                    <div class="trip-info-item">
                        <i class="far fa-calendar-alt"></i>
                        <div>${displayTime}</div>
                    </div>

                    <div class="trip-info-item">
                        <i class="fas fa-map-marker-alt"></i>
                        <div>${trip.destination || 'Đang cập nhật'}</div>
                    </div>

                    <div class="trip-info-item">
                        <i class="fas fa-users"></i>
                        <div>${displayMembers}</div>
                    </div>

                    <div class="trip-info-item" style="grid-column: span 2;">
                        <i class="fas fa-star-of-life"></i>
                        <div class="trip-status-container">
                            <div class="trip-status-badge status-${statusInfo.class}">${statusInfo.label}</div>
                        </div>
                    </div>
                </div>
                
                <div class="trip-card-actions" style="display: flex; gap: 8px; padding: 10px 15px;">
                    <button class="mini-btn btn-blue btn-open-invite-modal" data-id="${trip.trip_id}" data-code="${trip.code || 'NT-NEXTTRIP'}">
                        <i class="bi bi-person-plus-fill"></i> Mời bạn
                    </button>
                    </div>
                    `;
                    // <button class="mini-btn btn-light btn-open-assign-modal" data-id="${trip.trip_id}">
                    //     <i class="bi bi-shield-lock-fill"></i> Phân vai
                    // </button>

            // Click vào thân thẻ (tránh phần nút hành động) để xem chi tiết thông tin tổng quan chuyến đi
            // card.addEventListener("click", (e) => {
            //     if (e.target.closest(".trip-card-actions")) return;
                
            //     const tripId = trip.trip_id;
            //     localStorage.setItem("currentTripId", tripId);
            //     window.location.hash = `#/trip/general?id=${tripId}`;
            // });

            listContainer.appendChild(card);
        });
    }

    async function fetchAndRenderLeadTrips() {
        try {
            listContainer.innerHTML = '<div style="text-align:center; padding:40px; color:#7f8c8d; width: 100%;">Đang tải danh sách đồng hành...</div>';
            
            const response = await request(API_STORAGE.COMPANION.get_list, {
                method: "GET"
            });

            if (response && response.data) {
                renderLeadTrips(response.data);
            } else {
                renderLeadTrips([]);
            }
        } catch (error) {
            console.error("Lỗi khi tải danh sách chuyến đi đồng hành:", error);
            listContainer.innerHTML = '<div style="color: #e53935; text-align:center; padding:40px; width: 100%;">Có lỗi khi tải dữ liệu chuyến đi. Vui lòng thử lại!</div>';
        }
    }

    // ================= XỬ LÝ MODAL MỜI BẠN ĐỒNG HÀNH =================
    const inviteModal = document.getElementById("invite-companion-modal");
    const shareCodeInput = document.getElementById("share-code-input");
    const btnCopyCode = document.getElementById("btn-copy-code");
    const inviteInput = document.getElementById("invite-input");
    const inviteLabel = document.getElementById("invite-label");
    const inviteNote = document.getElementById("invite-note");
    const btnSubmitInvite = document.getElementById("btn-submit-invite");
    const subTabs = document.querySelectorAll(".sub-tab");

    let activeSubTab = "id"; // Mặc định là tìm kiếm mời bằng ID

    // Mở modal Mời bạn
    listContainer.addEventListener("click", (e) => {
        const inviteBtn = e.target.closest(".btn-open-invite-modal");
        if (inviteBtn) {
            e.stopPropagation();
            selectedTripIdForAction = inviteBtn.getAttribute("data-id");
            const tripCode = inviteBtn.getAttribute("data-code");

            if (shareCodeInput) shareCodeInput.value = tripCode;
            if (inviteModal) inviteModal.classList.remove("hidden");
        }
    });

    // Sự kiện Copy Code mời nhanh
    if (btnCopyCode && shareCodeInput) {
        btnCopyCode.addEventListener("click", () => {
            shareCodeInput.select();
            shareCodeInput.setSelectionRange(0, 99999); // Dành cho di động
            navigator.clipboard.writeText(shareCodeInput.value);
            alert("Đã sao chép mã mời vào khay nhớ tạm!");
        });
    }

    // Chuyển đổi tab con: Mời bằng ID / SĐT
    subTabs.forEach(tab => {
        tab.addEventListener("click", () => {
            subTabs.forEach(t => {
                t.classList.remove("active");
                t.style.color = "#64748b";
            });
            tab.classList.add("active");
            tab.style.color = "#1e40af";

            activeSubTab = tab.getAttribute("data-subtab");

            if (activeSubTab === "id") {
                inviteLabel.innerText = "Nhập ID người dùng";
                inviteInput.placeholder = "Ví dụ: NT123456";
                inviteNote.innerHTML = "ID người dùng có thể tìm thấy trong <b>Hồ sơ cá nhân > Thông tin tài khoản</b>";
            } else {
                inviteLabel.innerText = "Nhập Số điện thoại người dùng";
                inviteInput.placeholder = "Ví dụ: 0987654321";
                inviteNote.innerHTML = "Nhập chính xác số điện thoại đã đăng ký tài khoản NextTrip để gửi lời mời tham gia.";
            }
        });
    });

    // Submit gửi lời mời
    if (btnSubmitInvite) {
        btnSubmitInvite.addEventListener("click", async () => {
            const inputValue = inviteInput.value.trim();
            if (!inputValue) {
                alert("Vui lòng nhập thông tin để gửi lời mời!");
                return;
            }

            // Chuẩn bị body theo contract mới: POST /api/v1.0/companion/{tripId}/invite
            const body = (activeSubTab === "id")
                ? { userId: inputValue }
                : { phoneNumber: inputValue };

            // Xây dựng endpoint từ API_STORAGE và tripId
            const endpoint = API_STORAGE.COMPANION.invite.replace("{tripId}", selectedTripIdForAction);

            try {
                btnSubmitInvite.disabled = true;
                btnSubmitInvite.innerText = "Đang gửi...";

                await request(endpoint, {
                    method: "POST",
                    body: JSON.stringify(body)
                });

                alert("Gửi lời mời đồng hành thành công!");
                closeInviteModal();
                // Làm mới danh sách sau khi mời thành công
                await fetchAndRenderLeadTrips();
            } catch (error) {
                console.error("Lỗi gửi lời mời:", error);
                alert(`Không thể gửi lời mời: ${error.message}`);
            } finally {
                btnSubmitInvite.disabled = false;
                btnSubmitInvite.innerText = "Xác nhận mời";
            }
        });
    }

    // Đóng Modal Mời bạn
    const closeInviteModal = () => {
        if (inviteModal) inviteModal.classList.add("hidden");
        if (inviteInput) inviteInput.value = "";
    };

    document.querySelectorAll(".btn-close-invite").forEach(btn => {
        btn.addEventListener("click", closeInviteModal);
    });


    // ================= XỬ LÝ MODAL PHÂN CÔNG ĐỒNG HÀNH =================
    const assignModal = document.getElementById("assign-role-modal");
    const selectMember = document.getElementById("select-member");
    const selectRole = document.getElementById("select-role");
    const btnSubmitAssign = document.getElementById("btn-submit-assign");

    // Mở modal Phân vai trò
    listContainer.addEventListener("click", async (e) => {
        const assignBtn = e.target.closest(".btn-open-assign-modal");
        if (assignBtn) {
            e.stopPropagation();
            selectedTripIdForAction = assignBtn.getAttribute("data-id");

            // Gọi API lấy danh sách thành viên hiện tại của nhóm trước để đổ vào Select Option
            try {
                selectMember.innerHTML = '<option value="">Đang tải danh sách...</option>';
                
                const response = await request(`/api/v1.0/companion/members/${selectedTripIdForAction}`, {
                    method: "GET"
                });

                selectMember.innerHTML = "";
                if (response && response.data && response.data.length > 0) {
                    response.data.forEach(member => {
                        const option = document.createElement("option");
                        option.value = member.user_id;
                        option.innerText = `${member.full_name} (${member.role || 'Thành viên'})`;
                        selectMember.appendChild(option);
                    });
                } else {
                    selectMember.innerHTML = '<option value="">Không tìm thấy thành viên khả dụng</option>';
                }

                if (assignModal) assignModal.classList.remove("hidden");
            } catch (error) {
                console.error("Không thể tải thành viên:", error);
                alert("Lỗi hệ thống không thể nạp danh sách thành viên.");
            }
        }
    });

    // Submit Phân vai trò
    if (btnSubmitAssign) {
        btnSubmitAssign.addEventListener("click", async () => {
            const memberId = selectMember.value;
            const role = selectRole.value;

            if (!memberId) {
                alert("Vui lòng chọn thành viên cần phân vai trò!");
                return;
            }

            const payload = {
                trip_id: selectedTripIdForAction,
                user_id: memberId,
                role: role
            };

            try {
                btnSubmitAssign.disabled = true;
                btnSubmitAssign.innerText = "Đang xử lý...";

                await request("/api/v1.0/companion/assign_role", {
                    method: "POST",
                    body: JSON.stringify(payload)
                });

                alert("Phân công vai trò thành công!");
                closeAssignModal();
                fetchAndRenderLeadTrips(); // Tải lại giao diện cập nhật số liệu
            } catch (error) {
                console.error("Lỗi phân công vai trò:", error);
                alert(`Không thể phân công: ${error.message}`);
            } finally {
                btnSubmitAssign.disabled = false;
                btnSubmitAssign.innerText = "Phân công";
            }
        });
    }

    // Đóng Modal Phân vai trò
    const closeAssignModal = () => {
        if (assignModal) assignModal.classList.add("hidden");
    };

    document.querySelectorAll(".btn-close-assign").forEach(btn => {
        btn.addEventListener("click", closeAssignModal);
    });


    // Khởi động lấy dữ liệu lần đầu
    fetchAndRenderLeadTrips();
}

window.initLeadTrips = initLeadTrips;