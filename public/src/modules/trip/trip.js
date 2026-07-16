import { API_STORAGE } from "../../service/api_storage.js";
import { request } from "../../service/api_base.js";

function initTrip() {
    const listContainer = document.getElementById("tripListGrid");
    const statusFilter = document.getElementById("tripStatusFilter");
    let allTrips = [];

    if (!listContainer) return;

    // 💡 Hàm phụ trợ: Chuyển đổi mã trạng thái Backend thành class CSS và Nhãn hiển thị
    const getStatusInfo = (statusStr) => {
        const s = (statusStr || "").toUpperCase();
        switch (s) {
            case "PLANNING": return { class: "planning", label: "Đang lập kế hoạch" };
            case "PROCESSING": return { class: "ongoing", label: "Đang diễn ra" };
            case "END": return { class: "completed", label: "Đã kết thúc" };
            default: return { class: "planning", label: "Chưa xác định" };
        }
    };

    function renderTrips(trips) {
        listContainer.innerHTML = "";

        if (!trips || trips.length === 0) {
            listContainer.innerHTML = `
                <div class="panel" style="text-align: center; color: #7f8c8d; padding: 40px;">
                    <i class="fas fa-suitcase-rolling" style="font-size: 48px; margin-bottom: 10px; color: #b0bec5;"></i>
                    <p>Không tìm thấy chuyến đi phù hợp.</p>
                </div>`;
            return;
        }

        trips.forEach(trip => {
            const card = document.createElement("div");
            card.className = "trip-card";
            card.setAttribute("data-id", trip.trip_id); // Dùng trip_id từ API
            card.style.cursor = "pointer";

            const displayTime = `${trip.start_date || '--'} đến ${trip.end_date || '--'}`;

            const displayMembers = trip.number_member ? `${trip.number_member} thành viên` : 'Chưa cập nhật';

            // Dự phòng trường hợp API trả về key là trip_status thay vì status
            const statusInfo = getStatusInfo(trip.status || trip.trip_status);
            // 4. Xử lý hình ảnh Base64
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
                        <i class="fas fa-user-circle"></i>
                        <div>Trưởng đoàn</div>
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
                
                <div class="trip-card-actions">
                    <button class="mini-btn btn-red view-trip-btn" data-id="${trip.trip_id}">
                        <i class="fas fa-eye"></i> Cập nhật
                    </button>
                    <button class="mini-btn btn-light delete-trip-btn" data-id="${trip.trip_id}">
                        <i class="fas fa-trash-alt" style="color: #e53935;"></i> Xóa
                    </button>
                </div>
            `;
            listContainer.appendChild(card);
        });
    }
    async function fetchAndRenderTrips() {
        try {
            // Hẹn giờ hiển thị loading cho UX tốt hơn
            listContainer.innerHTML = '<div style="text-align:center; padding:40px; color:#7f8c8d;">Đang tải dữ liệu chuyến đi...</div>';

            const response = await request(API_STORAGE.TRIP.get_list, {
                method: "GET"
            });

            // Lấy trực tiếp mảng "data" từ response trả về
            if (response && response.data) {
                allTrips = response.data;
                renderTrips(allTrips);
            } else {
                allTrips = [];
                renderTrips([]);
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách chuyến đi:", error);
            listContainer.innerHTML = '<div style="color: #e53935; text-align:center; padding:40px;">Có lỗi kết nối hệ thống. Vui lòng thử lại sau!</div>';
        }
    }

    // ================= XỬ LÝ MODAL TẠO CHUYẾN ĐI =================
    const createNewTripBtn = document.getElementById("createNewTripBtn");
    const createTripModal = document.getElementById("createTripModal");
    const cancelCreateTripBtn = document.getElementById("cancelCreateTripBtn");
    const createTripForm = document.getElementById("createTripForm");
    const imageInput = document.getElementById("tripImage");

    // Biến lưu trữ mảng chuỗi ảnh (dạng Base64)
    let uploadedImageBase64 = null;

    // Mở modal
    if (createNewTripBtn && createTripModal) {
        createNewTripBtn.addEventListener("click", () => {
            createTripModal.classList.remove("hidden");
        });
    }

    // Đóng modal & Reset form
    const closeModal = () => {
        if (createTripModal) createTripModal.classList.add("hidden");
        if (createTripForm) createTripForm.reset();
        uploadedImageBase64 = null; // Reset ảnh đã tải lên
    };
    if (cancelCreateTripBtn) {
        cancelCreateTripBtn.addEventListener("click", closeModal);
    }

    // Lắng nghe sự kiện chọn file ảnh (Bắt buộc phải check if)
    if (imageInput) {
        imageInput.addEventListener("change", function (e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function (event) {
                    uploadedImageBase64 = event.target.result.split(',')[1]; // Lấy phần Base64 sau dấu phẩy
                };
                reader.readAsDataURL(file);
            }
        });
    } else {
        console.warn("⚠️ Không tìm thấy thẻ input #tripImage");
    }

    // Xử lý Submit Form gọi API (Bắt buộc phải check if)
    if (createTripForm) {
        createTripForm.addEventListener("submit", async (e) => {
            e.preventDefault(); // Rất quan trọng: Chặn load lại trang

            const payload = {
                image: uploadedImageBase64,
                title: document.getElementById("tripTitle").value,
                code: document.getElementById("tripCode").value,
                description: document.getElementById("tripDescription").value,
                start_date: document.getElementById("tripStartDate").value,
                end_date: document.getElementById("tripEndDate").value,
                destination: document.getElementById("tripDestination").value
            };

            const submitBtn = document.getElementById("confirmCreateTripBtn");

            try {
                if (submitBtn) {
                    submitBtn.innerText = "Đang xử lý...";
                    submitBtn.disabled = true;
                }

                await request(API_STORAGE.TRIP.create, {
                    method: "POST",
                    body: JSON.stringify(payload)
                });

                alert("Tạo chuyến đi mới thành công!");
                closeModal();

            } catch (error) {
                // api_base đã tự động bắt và log chi tiết ra console, ở đây chỉ hiển thị cho Client
                console.error("Lỗi submit hành trình:", error);
                alert(`Không thể tạo chuyến đi: ${error.message}`);
            } finally {
                const submitBtn = document.getElementById("confirmCreateTripBtn");
                if (submitBtn) {
                    submitBtn.innerText = "Xác nhận thêm mới";
                    submitBtn.disabled = false;
                }
            }
        });
    } else {
        console.error("❌ Không tìm thấy Form #createTripForm. Bạn đã dán đoạn HTML Modal vào file trip.html chưa?");
    }

    // ================= XỬ LÝ MODAL CẬP NHẬT CHUYẾN ĐI =================
    const updateTripModal = document.getElementById("updateTripModal");
    const updateTripForm = document.getElementById("updateTripForm");
    const cancelUpdateTripBtn = document.getElementById("cancelUpdateTripBtn");

    if (cancelUpdateTripBtn) {
        cancelUpdateTripBtn.addEventListener("click", () => {
            updateTripModal.classList.add("hidden");
            updateTripForm.reset();
        });
    }

    // Hàm gọi API lấy chi tiết và hiển thị lên Modal
    async function openUpdateModal(tripId) {
        try {
            const endpoint = API_STORAGE.TRIP.get_detail.replace("{id}", tripId);
            const response = await request(endpoint, { method: "GET" });

            // 1. In ra Console để dễ kiểm tra xem Backend trả về gì
            console.log("Dữ liệu chi tiết chuyến đi:", response);

            // 2. Lấy dữ liệu linh hoạt (có 'data' wrapper hoặc không)
            const trip = response.data ? response.data : response;

            if (!trip) {
                alert("Dữ liệu chuyến đi trả về bị trống!");
                return;
            }

            // 3. Kiểm tra xem HTML Modal đã có trong DOM chưa
            const updateTripModal = document.getElementById("updateTripModal");
            if (!updateTripModal) {
                console.error("❌ LỖI: Không tìm thấy HTML Modal! Bạn đã dán mã Modal vào trip.html chưa?");
                alert("Lỗi giao diện: Không tìm thấy form cập nhật.");
                return;
            }

            // Đổ dữ liệu vào Form một cách an toàn (tránh lỗi null)
            document.getElementById("updateTripId").value = tripId;

            const titleInput = document.getElementById("updateTripTitle");
            if (titleInput) titleInput.value = trip.title || "";

            const codeInput = document.getElementById("updateTripCode");
            if (codeInput) codeInput.value = trip.code || "";

            const destInput = document.getElementById("updateTripDestination");
            if (destInput) destInput.value = trip.destination || "";

            const startInput = document.getElementById("updateTripStartDate");
            if (startInput) startInput.value = trip.startDate || "";

            const endInput = document.getElementById("updateTripEndDate");
            if (endInput) endInput.value = trip.endDate || "";

            const descInput = document.getElementById("updateTripDescription");
            if (descInput) descInput.value = trip.description || "";

            const statusInput = document.getElementById("updateTripStatus");
            if (statusInput && trip.status) {
                statusInput.value = trip.status.toUpperCase();
            } else if (statusInput && trip.trip_status) {
                statusInput.value = trip.trip_status.toUpperCase();
            }

            // Hiển thị Modal
            updateTripModal.classList.remove("hidden");

        } catch (error) {
            console.error("Lỗi khi tải chi tiết chuyến đi:", error);
            alert("Không thể tải thông tin chuyến đi để cập nhật.");
        }
    }

    // Xử lý Submit Form Cập nhật
    if (updateTripForm) {
        updateTripForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const tripId = document.getElementById("updateTripId").value;
            const submitBtn = document.getElementById("confirmUpdateTripBtn");

            // include both snake_case and camelCase keys to satisfy backend variations
            const payload = {
                title: document.getElementById("updateTripTitle").value,
                code: document.getElementById("updateTripCode").value,
                description: document.getElementById("updateTripDescription").value,
                // camelCase
                startDate: document.getElementById("updateTripStartDate").value,
                endDate: document.getElementById("updateTripEndDate").value,
                // snake_case (some endpoints expect this)
                start_date: document.getElementById("updateTripStartDate").value,
                end_date: document.getElementById("updateTripEndDate").value,
                destination: document.getElementById("updateTripDestination").value,
                // status fields in both possible keys
                status: document.getElementById("updateTripStatus").value,
                trip_status: document.getElementById("updateTripStatus").value
            };

            if (!tripId) {
                console.error('Không tìm thấy tripId khi submit update form');
                alert('Lỗi: Không xác định ID chuyến đi. Vui lòng thử lại.');
                return;
            }

            const endpoint = API_STORAGE.TRIP.update.replace("{tripId}", tripId);
            console.log('Gọi API cập nhật:', endpoint, 'payload=', payload);

            try {
                submitBtn.innerText = "Đang lưu...";
                submitBtn.disabled = true;

                // Giả định backend dùng phương thức PUT cho update
                await request(endpoint, {
                    method: "PUT",
                    body: JSON.stringify(payload)
                });

                alert("Cập nhật chuyến đi thành công!");
                updateTripModal.classList.add("hidden");

                // Tự động tải lại danh sách
                fetchAndRenderTrips();
            } catch (error) {
                console.error("Lỗi khi cập nhật chuyến đi:", error);
                alert("Không thể cập nhật chuyến đi: " + error.message);
            } finally {
                submitBtn.innerText = "Lưu thay đổi";
                submitBtn.disabled = false;
            }
        });
    }

    // ================= SỰ KIỆN CLICK TRÊN DANH SÁCH THẺ =================
    listContainer.addEventListener("click", async (e) => {
        // 1. Nếu click vào nút XÓA
        const deleteBtn = e.target.closest(".delete-trip-btn");
        if (deleteBtn) {
            e.stopPropagation(); // Ngăn chặn trigger thẻ cha
            if (confirm("Bạn có chắc chắn muốn xóa hành trình này? Hệ thống sẽ không thể khôi phục.")) {
                const tripId = deleteBtn.getAttribute("data-id");
                try {
                    const endpoint = API_STORAGE.TRIP.delete.replace("{tripId}", tripId);
                    await request(endpoint, { method: "DELETE" });
                    alert("Đã xóa chuyến đi thành công.");
                    fetchAndRenderTrips(); // Tự động cập nhật lại danh sách
                } catch (error) {
                    console.error("Lỗi khi xóa:", error);
                    alert("Có lỗi xảy ra khi xóa: " + error.message);
                }
            }
            return;
        }

        // 2. Nếu click vào nút CẬP NHẬT
        const updateBtn = e.target.closest(".view-trip-btn");
        if (updateBtn) {
            e.stopPropagation(); // Ngăn chặn trigger thẻ cha
            const tripId = updateBtn.getAttribute("data-id");
            openUpdateModal(tripId);
            return;
        }

        // 3. Nếu click vào THẺ (Vùng trống ngoài 2 nút trên) -> Chuyển sang General
        const card = e.target.closest(".trip-card");
        if (card) {
            const tripId = card.getAttribute("data-id");
            navigateToGeneral(tripId);
        }
    });

    // Hàm tập trung điều phối trang tổng quan
    function navigateToGeneral(tripId) {
        console.log("Kích hoạt chuyển hướng URL sang:", tripId);
        // Lưu ID vào bộ nhớ tạm để trang general.js sau khi nạp có thể lấy ra sử dụng
        localStorage.setItem("currentTripId", tripId);

        // Đổi hash -> main.js tự động nhận biết, bóc tách chuỗi và load file general.html/general.js
        window.location.hash = `#/trip/general?id=${tripId}`;
    }

    if (statusFilter) {
        statusFilter.addEventListener("change", (e) => {
            const filterValue = e.target.value;
            const statusMap = {
                planning: "PLANNING",
                ongoing: "PROCESSING",
                completed: "END"
            };

            if (filterValue === "all") {
                renderTrips(allTrips);
                return;
            }

            const mappedStatus = statusMap[filterValue];
            if (!mappedStatus) {
                renderTrips(allTrips);
                return;
            }

            const filteredTrips = allTrips.filter(trip => {
                return (trip.status || "").toUpperCase() === mappedStatus;
            });

            renderTrips(filteredTrips);
        });
    }

    // Kết xuất giao diện lần đầu
    fetchAndRenderTrips()
}

window.initTrip = initTrip;