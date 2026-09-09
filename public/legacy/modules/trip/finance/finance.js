import { API_STORAGE } from "../../../service/api_storage.js";
import { request } from "../../../service/api_base.js";

async function initFinance() {
    const tbody = document.getElementById("financeTableBody");
    const totalExpensesEl = document.getElementById("totalExpenses");

    // Lấy Trip ID hiện tại từ URL query hoặc localStorage
    const urlParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const currentTripId = urlParams.get('id') || localStorage.getItem("currentTripId");

    // Bộ ánh xạ từ ENUM Backend sang tiếng Việt hiển thị trên giao diện
    const expenseTypeMap = {
        "STAY": "Lưu trú",
        "MOVE": "Di chuyển",
        "EAT": "Ăn uống",
        "ACTIVITY": "Hoạt động",
        "OTHER": "Khác"
    };

    // Định dạng tiền tệ VND
    function formatVND(amount) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    }

    // ================= XỬ LÝ GET LIST BẰNG API =================
    async function fetchAndRenderExpenses() {
        if (!currentTripId) {
            console.warn("Không tìm thấy ID chuyến đi để tải dữ liệu tài chính.");
            return;
        }

        try {
            // Gọi API Lấy danh sách tài chính
            const apiUrl = `/api/v1.0/finance/expense_view/${currentTripId}`;
            const response = await request(apiUrl, { method: "GET" });

            // Phân tích cấu trúc response mới: response.data.expenses và response.data.totalPay
            const responseData = response?.data || {};
            const expenses = responseData.expenses || [];
            const totalPay = responseData.totalPay || 0;

            if (tbody) tbody.innerHTML = "";

            // Hiển thị tổng số tiền đã chi lên giao diện
            if (totalExpensesEl) {
                totalExpensesEl.textContent = formatVND(totalPay);
            }

            if (expenses.length === 0) {
                if (tbody) {
                    tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #7f8c8d;">Chưa có dữ liệu chi tiêu.</td></tr>`;
                }
                return;
            }

            expenses.forEach((item, index) => {
                // Chuyển đổi loại chi phí sang tiếng Việt dựa vào map
                const typeInVietnamese = expenseTypeMap[item.type] || item.type || "Khác";

                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${index + 1}</td>
                    <td style="text-align: left; font-weight: 500;">${item.content || ""}</td>
                    <td><span class="status-text open">${typeInVietnamese}</span></td>
                    <td style="font-weight: 600; color: #e53935;">${formatVND(item.cost || 0)}</td>
                    <td><strong>${item.payer || ""}</strong></td>
                    <td style="color: #7f8c8d; text-align: left; font-size: 13px;">${item.note || ""}</td>
                `;
                if (tbody) tbody.appendChild(row);
            });
        } catch (error) {
            console.error("Lỗi khi tải danh sách chi tiêu:", error);
            if (tbody) {
                tbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: #e53935;">Lỗi tải dữ liệu. Vui lòng thử lại!</td></tr>`;
            }
        }
    }

    // Khởi chạy render bảng ngay khi mở tab
    fetchAndRenderExpenses();

    // ================= XỬ LÝ MODAL & TABS =================
    const expenseModal = document.getElementById("createExpenseModal");
    const actualForm = document.getElementById("actualExpenseForm");
    const estimateForm = document.getElementById("estimateExpenseForm");

    const closeModal = () => {
        const modal = document.getElementById("createExpenseModal");
        if (modal) modal.classList.add("hidden");
        if (actualForm) actualForm.reset();
        if (estimateForm) estimateForm.reset();
    };

    const financeContainer = document.querySelector(".finance-container") || document.body;

    financeContainer.addEventListener("click", (e) => {
        // Mở Modal
        const openBtn = e.target.closest("#addExpenseBtn");
        if (openBtn) {
            e.preventDefault();
            const modal = document.getElementById("createExpenseModal");
            if (modal) modal.classList.remove("hidden");
            return;
        }

        // Đóng Modal
        const closeBtn = e.target.closest(".cancel-modal-btn");
        if (closeBtn) {
            e.preventDefault();
            closeModal();
            return;
        }

        // Chuyển Tab
        const tabBtn = e.target.closest(".tab-btn");
        if (tabBtn) {
            e.preventDefault();
            const allTabs = document.querySelectorAll(".tab-btn");
            allTabs.forEach(t => {
                t.classList.remove("active");
                t.style.borderBottom = "none";
                t.style.color = "#7f8c8d";
                t.style.fontWeight = "500";
            });

            tabBtn.classList.add("active");
            tabBtn.style.borderBottom = "2px solid #276FBC";
            tabBtn.style.color = "#276FBC";
            tabBtn.style.fontWeight = "600";

            const targetTab = tabBtn.getAttribute("data-tab");
            if (targetTab === "actual-tab") {
                if (actualForm) {
                    actualForm.classList.remove('hidden');
                    actualForm.style.display = "block";
                }
                if (estimateForm) {
                    estimateForm.classList.add('hidden');
                    estimateForm.style.display = "none";
                }
            } else {
                if (actualForm) {
                    actualForm.classList.add('hidden');
                    actualForm.style.display = "none";
                }
                if (estimateForm) {
                    estimateForm.classList.remove('hidden');
                    estimateForm.style.display = "block";
                }
            }
            return;
        }
    });

    // ================= XỬ LÝ SUBMIT API =================

    // 1. Submit Tab Chi phí thực tế (Gọi API Create)
    if (actualForm) {
        actualForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            if (!currentTripId) {
                alert("Không tìm thấy thông tin chuyến đi! Vui lòng thử lại.");
                return;
            }

            // Đồng bộ hoá payload gửi lên phù hợp với cấu trúc DB/API backend mới (content, type, cost, payer, note)
            const payload = {
                content: document.getElementById("expenseContent").value,
                type: document.getElementById("expenseType").value,
                cost: Number(document.getElementById("expenseCost").value),
                payer: document.getElementById("expensePayer").value,
                note: document.getElementById("expenseNote").value
            };

            try {
                // Đính kèm Query Parameter tripId
                const apiUrl = `/api/v1.0/finance/expense?tripId=${currentTripId}`;

                await request(apiUrl, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });

                alert("Thêm khoản chi thực tế thành công!");
                closeModal();

                // Tải lại danh sách bảng
                await fetchAndRenderExpenses();
            } catch (error) {
                console.error("Lỗi tạo khoản chi:", error);
                alert("Thêm khoản chi thất bại: " + error.message);
            }
        });
    }

    // 2. Xử lý Submit Tab Dự toán tài chính
    if (estimateForm) {
        estimateForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            if (!currentTripId) {
                alert("Không tìm thấy thông tin chuyến đi! Vui lòng thử lại.");
                return;
            }

            const payload = {
                stayPay: Number(document.getElementById("estStay").value) || 0,
                movePay: Number(document.getElementById("estMove").value) || 0,
                eatPay: Number(document.getElementById("estEat").value) || 0,
                actPay: Number(document.getElementById("estAct").value) || 0,
                otherPay: Number(document.getElementById("estOther").value) || 0
            };

            const apiUrl = `${API_STORAGE.FINANCE.create}?tripId=${currentTripId}`;

            try {
                await request(apiUrl, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(payload)
                });

                alert("Lưu dự toán tài chính thành công!");
                closeModal();
                location.reload(); // hoặc cập nhật lại dữ liệu nếu không muốn reload

            } catch (error) {
                console.error(error);
                alert("Lưu dự toán thất bại: " + error.message);
            }
        });
    }
}

export { initFinance };
window.initFinance = initFinance;