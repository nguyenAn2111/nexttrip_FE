// import { API_STORAGE } from "../../../service/api_storage.js";
// import { request } from "../../../service/api_base.js";

// function initGeneral() {
//     const tabs = document.querySelectorAll(".sub-tab-item");
//     const backBtn = document.getElementById("closeDetailBtn");

//     if (backBtn) {
//         backBtn.addEventListener("click", () => {
//             if (window.router) window.router.navigate('/trip');
//             else window.location.hash = '#/trip';
//         });
//     }

//     function getTripId() {
//         const hash = window.location.hash || '';
//         const query = hash.includes('?') ? hash.split('?')[1] : window.location.search.slice(1);
//         const params = new URLSearchParams(query);
//         return params.get('id') || localStorage.getItem('currentTripId');
//     }

//     function formatDateDisplay(dateStr) {
//         if (!dateStr) return "-";
//         const parts = dateStr.split("-");
//         if (parts.length !== 3) return dateStr;
//         return `${parts[2]}/${parts[1]}/${parts[0]}`;
//     }

//     function formatVND(amount) {
//         return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
//     }

//     function setOverviewLoading(message) {
//         const statusElement = document.getElementById("tripGeneralStatus");
//         if (statusElement) {
//             statusElement.textContent = message;
//         }

//         const locationElement = document.getElementById("infoLocation");
//         const startElement = document.getElementById("infoStartDate");
//         const endElement = document.getElementById("infoEndDate");
//         const membersElement = document.getElementById("infoMembers");
//         const descriptionElement = document.getElementById("infoDescription");

//         if (locationElement) locationElement.textContent = 'Đang tải...';
//         if (startElement) startElement.textContent = '-';
//         if (endElement) endElement.textContent = '-';
//         if (membersElement) membersElement.textContent = '-';
//         if (descriptionElement) descriptionElement.value = message;
//     }

//     function renderTripOverview(trip) {
//         const titleElement = document.getElementById("detailTripTitle");
//         const locationElement = document.getElementById("infoLocation");
//         const startElement = document.getElementById("infoStartDate");
//         const endElement = document.getElementById("infoEndDate");
//         const membersElement = document.getElementById("infoMembers");
//         const descriptionElement = document.getElementById("infoDescription");

//         if (titleElement) {
//             titleElement.textContent = `Chuyến đi: ${trip.title || trip.destination || 'Chưa rõ tên chuyến đi'}`;
//         }
//         if (locationElement) {
//             locationElement.textContent = trip.destination || trip.place || 'Chưa cập nhật';
//         }
//         if (startElement) {
//             startElement.textContent = formatDateDisplay(trip.startDate || trip.start_date || '');
//         }
//         if (endElement) {
//             endElement.textContent = formatDateDisplay(trip.endDate || trip.end_date || '');
//         }
//         if (membersElement) {
//             membersElement.textContent = trip.numberMember != null
//                 ? `${trip.numberMember} người`
//                 : trip.number_member != null
//                     ? `${trip.number_member} người`
//                     : 'Chưa cập nhật';
//         }
//         if (descriptionElement) {
//             descriptionElement.value = trip.description || trip.note || 'Không có ghi chú chuyến đi.';
//         }
//     }

//     // --- HÀM RENDER BẢNG DỰ TOÁN CHI PHÍ TỔNG QUAN ---
//     function renderFinanceBudget(financeData) {
//         // Tìm thẻ tbody của bảng Chi phí tổng quan
//         const tbody = document.querySelector(".table-panel table tbody");
//         if (!tbody) {
//             console.warn("⚠️ Không tìm thấy bảng chi phí tổng quan trong general.html");
//             return;
//         }

//         // Lấy dữ liệu dự toán từ API (nếu không có, mặc định là 0)
//         const budget = financeData || {
//             stayPay: 0,
//             movePay: 0,
//             eatPay: 0,
//             actPay: 0,
//             otherPay: 0
//         };

//         // 1. Hardcode tạm thời phần chi phí thực tế (Đã chi)
//         const actualSpent = {
//             stayPay: 4400000,
//             movePay: 0,
//             eatPay: 0,
//             actPay: 156151,
//             otherPay: 1000000
//         };

//         // 2. Tính toán tổng cộng chi phí
//         const totalBudget = (budget.stayPay || 0) + (budget.movePay || 0) + (budget.eatPay || 0) + (budget.actPay || 0) + (budget.otherPay || 0);
//         const totalActual = actualSpent.stayPay + actualSpent.movePay + actualSpent.eatPay + actualSpent.actPay + actualSpent.otherPay;

//         // 3. Render các dòng vào bảng
//         tbody.innerHTML = `
//             <tr>
//                 <td>Lưu trú</td>
//                 <td style="font-weight: 500; color: #2c3e50;">${formatVND(budget.stayPay || 0)}</td>
//                 <td>${formatVND(actualSpent.stayPay)}</td>
//             </tr>
//             <tr>
//                 <td>Di chuyển</td>
//                 <td style="font-weight: 500; color: #2c3e50;">${formatVND(budget.movePay || 0)}</td>
//                 <td>${formatVND(actualSpent.movePay)}</td>
//             </tr>
//             <tr>
//                 <td>Ăn uống</td>
//                 <td style="font-weight: 500; color: #2c3e50;">${formatVND(budget.eatPay || 0)}</td>
//                 <td>${formatVND(actualSpent.eatPay)}</td>
//             </tr>
//             <tr>
//                 <td>Hoạt động / Vé</td>
//                 <td style="font-weight: 500; color: #2c3e50;">${formatVND(budget.actPay || 0)}</td>
//                 <td>${formatVND(actualSpent.actPay)}</td>
//             </tr>
//             <tr>
//                 <td>Chi phí khác</td>
//                 <td style="font-weight: 500; color: #2c3e50;">${formatVND(budget.otherPay || 0)}</td>
//                 <td>${formatVND(actualSpent.otherPay)}</td>
//             </tr>
//             <tr style="font-weight: bold; background: #f8fafc;">
//                 <td>Tổng chi phí</td>
//                 <td style="color:#276FBC;">${formatVND(totalBudget)}</td>
//                 <td style="color:#e53935;">${formatVND(totalActual)}</td>
//             </tr>
//         `;
//     }

//     // --- TẢI TẤT CẢ DỮ LIỆU ĐỒNG THỜI ---
//     // async function loadAllGeneralData(tripId) {
//     //     if (!tripId) {
//     //         setOverviewLoading('Không tìm thấy ID chuyến đi. Vui lòng quay lại danh sách.');
//     //         return;
//     //     }

//     //     setOverviewLoading('Đang tải thông tin chuyến đi...');

//     //     try {
//     //         // Chuẩn bị các endpoint
//     //         const tripEndpoint = API_STORAGE.TRIP.get_detail.replace('{id}', tripId);
//     //         const financeEndpoint = API_STORAGE.FINANCE.get_detail.replace('{id}', tripId);

//     //         // Gọi đồng thời cả 2 API
//     //         const [tripRes, financeRes] = await Promise.allSettled([
//     //             request(tripEndpoint, { method: 'GET' }),
//     //             request(financeEndpoint, { method: 'GET' })
//     //         ]);

//     //         // 1. Xử lý thông tin Chuyến đi tổng quan
//     //         if (tripRes.status === "fulfilled" && tripRes.value) {
//     //             const trip = tripRes.value.data ? tripRes.value.data : tripRes.value;
//     //             const statusElement = document.getElementById("tripGeneralStatus");
//     //             if (statusElement) statusElement.textContent = '';
//     //             renderTripOverview(trip);
//     //         } else {
//     //             throw new Error("Không thể nạp thông tin hành trình.");
//     //         }

//     //         // 2. Xử lý thông tin Dự toán tài chính ngân sách
//     //         if (financeRes.status === "fulfilled" && financeRes.value && financeRes.value.data) {
//     //             renderFinanceBudget(financeRes.value.data);
//     //         } else {
//     //             console.warn("Chưa có dự toán tài chính hoặc lỗi nạp API Finance, render mặc định 0 ₫");
//     //             renderFinanceBudget(null);
//     //         }

//     //     } catch (error) {
//     //         console.error('Lỗi khi tải dữ liệu tổng quan:', error);
//     //         setOverviewLoading(`Không thể tải dữ liệu: ${error.message}`);
//     //     }
//     // }
//     // --- TẢI TẤT CẢ DỮ LIỆU ĐỒNG THỜI ---
//     async function loadAllGeneralData(tripId) {
//         if (!tripId) {
//             setOverviewLoading('Không tìm thấy ID chuyến đi. Vui lòng quay lại danh sách.');
//             return;
//         }

//         setOverviewLoading('Đang tải thông tin chuyến đi...');

//         try {
//             // Chuẩn bị các endpoint
//             const tripEndpoint = API_STORAGE.TRIP.get_detail.replace('{id}', tripId);
//             const financeEndpoint = API_STORAGE.FINANCE.get_detail.replace('{id}', tripId);

//             // Gọi đồng thời cả 2 API
//            const [tripRes, financeRes] = await Promise.allSettled([
//                 request(tripEndpoint, { 
//                     method: 'GET' 
//                 }),
//                 request(financeEndpoint, { 
//                     method: 'GET',
//                     headers: {
//                         // Đảm bảo không truyền body rỗng hoặc các header thừa gây lỗi 400
//                         "Accept": "application/json"
//                     }
//                 })
//             ]);

//             // 1. Xử lý thông tin Chuyến đi tổng quan
//             if (tripRes.status === "fulfilled" && tripRes.value) {
//                 // Đảm bảo bóc tách đúng cấu trúc { data: { ... } }
//                 const trip = tripRes.value.data ? tripRes.value.data : tripRes.value;
//                 const statusElement = document.getElementById("tripGeneralStatus");
//                 if (statusElement) statusElement.textContent = '';
//                 renderTripOverview(trip);
//             } else {
//                 throw new Error("Không thể nạp thông tin hành trình.");
//             }

//             // 2. Xử lý thông tin Dự toán tài chính ngân sách
//             if (financeRes.status === "fulfilled" && financeRes.value) {
//                 const responseData = financeRes.value;
                
//                 // Trích xuất "data" dựa trên cấu trúc lồng của Response API
//                 let financeData = null;
//                 if (responseData.data && responseData.data.data) {
//                     financeData = responseData.data.data; // Trường hợp API_BASE chưa bóc vỏ response
//                 } else if (responseData.data) {
//                     financeData = responseData.data;      // Trường hợp API_BASE đã bóc vỏ 1 lớp response.data
//                 } else {
//                     financeData = responseData;
//                 }

//                 console.log("Dữ liệu tài chính đã bóc tách thành công:", financeData);
//                 renderFinanceBudget(financeData);
//             } else {
//                 console.warn("Chưa có dự toán tài chính hoặc lỗi nạp API Finance, render mặc định 0 ₫");
//                 renderFinanceBudget(null);
//             }

//         } catch (error) {
//             console.error('Lỗi khi tải dữ liệu tổng quan:', error);
//             setOverviewLoading(`Không thể tải dữ liệu: ${error.message}`);
//         }
//     }

//     tabs.forEach(tab => {
//         tab.addEventListener("click", (e) => {
//             const clickedTab = e.currentTarget;
//             tabs.forEach(t => t.classList.remove("active"));
//             clickedTab.classList.add("active");

//             const targetTab = clickedTab.getAttribute("data-tab");
//             if (!targetTab) return;
//             switchTab(targetTab);
//         });
//     });

//     function switchTab(tabName) {
//         const subContentArea = document.getElementById("trip-sub-content");
//         if (!subContentArea) return;

//         if (tabName === "general") {
//             location.reload();
//             return;
//         }

//         const htmlUrl = `/modules/trip/${tabName}/${tabName}.html`;
//         const jsUrl = `/modules/trip/${tabName}/${tabName}.js`;

//         fetch(htmlUrl)
//             .then(res => {
//                 if (!res.ok) throw new Error("Không thể tải trang");
//                 return res.text();
//             })
//             .then(html => {
//                 subContentArea.innerHTML = html;
//                 import(jsUrl).then(module => {
//                     if (tabName === "timeline" && typeof module.initTimeline === 'function') module.initTimeline();
//                     if (tabName === "finance" && typeof module.initFinance === 'function') module.initFinance();
//                 }).catch(err => {
//                     console.error("Lỗi import module con:", err);
//                 });
//             })
//             .catch(err => {
//                 subContentArea.innerHTML = `<div class="panel"><p style="color:red;">Lỗi tải phân hệ: ${err.message}</p></div>`;
//             });
//     }

//     const tripId = getTripId();
//     loadAllGeneralData(tripId);
// }

// export function initGeneralModule() {
//     initGeneral();
// }
import { API_STORAGE } from "../../../service/api_storage.js";
import { request } from "../../../service/api_base.js";

function initGeneral() {
    const tabs = document.querySelectorAll(".sub-tab-item");
    const backBtn = document.getElementById("closeDetailBtn");

    if (backBtn) {
        backBtn.addEventListener("click", () => {
            if (window.router) window.router.navigate('/trip');
            else window.location.hash = '#/trip';
        });
    }

    function getTripId() {
        const hash = window.location.hash || '';
        const query = hash.includes('?') ? hash.split('?')[1] : window.location.search.slice(1);
        const params = new URLSearchParams(query);
        return params.get('id') || localStorage.getItem('currentTripId');
    }

    function formatDateDisplay(dateStr) {
        if (!dateStr) return "-";
        const parts = dateStr.split("-");
        if (parts.length !== 3) return dateStr;
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }

    function formatVND(amount) {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
    }

    function setOverviewLoading(message) {
        const statusElement = document.getElementById("tripGeneralStatus");
        if (statusElement) {
            statusElement.textContent = message;
        }

        const locationElement = document.getElementById("infoLocation");
        const startElement = document.getElementById("infoStartDate");
        const endElement = document.getElementById("infoEndDate");
        const membersElement = document.getElementById("infoMembers");
        const descriptionElement = document.getElementById("infoDescription");

        if (locationElement) locationElement.textContent = 'Đang tải...';
        if (startElement) startElement.textContent = '-';
        if (endElement) endElement.textContent = '-';
        if (membersElement) membersElement.textContent = '-';
        if (descriptionElement) descriptionElement.value = message;
    }

    function renderTripOverview(trip) {
        const titleElement = document.getElementById("detailTripTitle");
        const locationElement = document.getElementById("infoLocation");
        const startElement = document.getElementById("infoStartDate");
        const endElement = document.getElementById("infoEndDate");
        const membersElement = document.getElementById("infoMembers");
        const descriptionElement = document.getElementById("infoDescription");

        if (titleElement) {
            titleElement.textContent = `Chuyến đi: ${trip.title || trip.destination || 'Chưa rõ tên chuyến đi'}`;
        }
        if (locationElement) {
            locationElement.textContent = trip.destination || trip.place || 'Chưa cập nhật';
        }
        if (startElement) {
            startElement.textContent = formatDateDisplay(trip.startDate || trip.start_date || '');
        }
        if (endElement) {
            endElement.textContent = formatDateDisplay(trip.endDate || trip.end_date || '');
        }
        if (membersElement) {
            membersElement.textContent = trip.numberMember != null
                ? `${trip.numberMember} người`
                : trip.number_member != null
                    ? `${trip.number_member} người`
                    : 'Chưa cập nhật';
        }
        if (descriptionElement) {
            descriptionElement.value = trip.description || trip.note || 'Không có ghi chú chuyến đi.';
        }
    }

    // --- HÀM RENDER BẢNG DỰ TOÁN CHI PHÍ TỔNG QUAN ---
    function renderFinanceBudget(budgetData, actualData) {
        const tbody = document.querySelector(".table-panel table tbody");
        if (!tbody) {
            console.warn("⚠️ Không tìm thấy bảng chi phí tổng quan trong general.html");
            return;
        }

        // Lấy dữ liệu dự toán (nếu không có mặc định 0)
        const budget = budgetData || {};
        
        // Lấy dữ liệu thực tế (nếu không có mặc định 0)
        const actual = actualData || {};

        // 1. Tính toán Tổng dự toán chi
        const totalBudget = (budget.stayPay || 0) + (budget.movePay || 0) + (budget.eatPay || 0) + (budget.actPay || 0) + (budget.otherPay || 0);
        
        // 2. Tính toán Tổng thực tế (Ưu tiên lấy totalPay từ API, nếu không thì tự cộng)
        const totalActual = actual.totalPay || ((actual.stayPay || 0) + (actual.movePay || 0) + (actual.eatPay || 0) + (actual.actPay || 0) + (actual.otherPay || 0));

        // 3. Tổng thu dự kiến
        const totalRevenue = budget.totalRevenue || 0;

        // 4. Số tiền còn lại
        const remaining = totalRevenue - totalActual;

        // Xóa class màu đỏ/xanh cũ
        const remainingColor = remaining >= 0 ? '#4caf50' : '#e53935'; 

        // 5. Render các dòng vào bảng
        tbody.innerHTML = `
            <tr>
                <td>Lưu trú</td>
                <td style="font-weight: 500; color: #2c3e50;">${formatVND(budget.stayPay)}</td>
                <td>${formatVND(actual.stayPay)}</td>
            </tr>
            <tr>
                <td>Di chuyển</td>
                <td style="font-weight: 500; color: #2c3e50;">${formatVND(budget.movePay)}</td>
                <td>${formatVND(actual.movePay)}</td>
            </tr>
            <tr>
                <td>Ăn uống</td>
                <td style="font-weight: 500; color: #2c3e50;">${formatVND(budget.eatPay)}</td>
                <td>${formatVND(actual.eatPay)}</td>
            </tr>
            <tr>
                <td>Hoạt động / Vé</td>
                <td style="font-weight: 500; color: #2c3e50;">${formatVND(budget.actPay)}</td>
                <td>${formatVND(actual.actPay)}</td>
            </tr>
            <tr>
                <td>Chi phí khác</td>
                <td style="font-weight: 500; color: #2c3e50;">${formatVND(budget.otherPay)}</td>
                <td>${formatVND(actual.otherPay)}</td>
            </tr>
            
            <tr style="font-weight: bold; background: #f8fafc; border-top: 2px solid #eef2f6;">
                <td>Tổng chi phí</td>
                <td style="color:#276FBC;">${formatVND(totalBudget)} (Dự kiến chi)</td>
                <td style="color:#e53935; font-size: 15px;">${formatVND(totalActual)}</td>
            </tr>
            
            <tr style="font-weight: bold; background: #f0fdf4;">
                <td colspan="2" style="text-align: center; padding-right: 15px;">TỔNG THU DỰ KIẾN (Quỹ) = 110% x Dự kiến chi</td>
                <td style="color:#166534; font-size: 15px;">${formatVND(totalRevenue)}</td>
            </tr>
            
            <tr style="font-weight: bold; background: #eef2f6;">
                <td colspan="2" style="text-align: center; padding-right: 15px;">SỐ TIỀN CÒN LẠI (Quỹ - Đã chi)</td>
                <td style="color:${remainingColor}; font-size: 16px;">${formatVND(remaining)}</td>
            </tr>
        `;
    }

    // --- TẢI TẤT CẢ DỮ LIỆU ĐỒNG THỜI ---
    async function loadAllGeneralData(tripId) {
        if (!tripId) {
            setOverviewLoading('Không tìm thấy ID chuyến đi. Vui lòng quay lại danh sách.');
            return;
        }

        setOverviewLoading('Đang tải thông tin chuyến đi...');

        try {
            // Chuẩn bị các endpoint
            const tripEndpoint = API_STORAGE.TRIP.get_detail.replace('{id}', tripId);
            const financeEndpoint = API_STORAGE.FINANCE.get_detail.replace('{id}', tripId);
            const actualExpenseEndpoint = `/api/v1.0/finance/expense_general/${tripId}`;

            // Gọi đồng thời cả 3 API
           const [tripRes, financeRes, actualRes] = await Promise.allSettled([
                request(tripEndpoint, { method: 'GET' }),
                request(financeEndpoint, { method: 'GET', headers: { "Accept": "application/json" } }),
                request(actualExpenseEndpoint, { method: 'GET', headers: { "Accept": "application/json" } })
            ]);

            // 1. Xử lý thông tin Chuyến đi tổng quan
            if (tripRes.status === "fulfilled" && tripRes.value) {
                const trip = tripRes.value.data ? tripRes.value.data : tripRes.value;
                const statusElement = document.getElementById("tripGeneralStatus");
                if (statusElement) statusElement.textContent = '';
                renderTripOverview(trip);
            } else {
                throw new Error("Không thể nạp thông tin hành trình.");
            }

            // 2. Xử lý thông tin Dự toán (Budget / Revenue)
            let financeData = null;
            if (financeRes.status === "fulfilled" && financeRes.value) {
                const responseData = financeRes.value;
                if (responseData.data && responseData.data.data) {
                    financeData = responseData.data.data;
                } else if (responseData.data) {
                    financeData = responseData.data;
                } else {
                    financeData = responseData;
                }
            }

            // 3. Xử lý thông tin Thực tế (Actual Spent)
            let actualData = null;
            if (actualRes.status === "fulfilled" && actualRes.value) {
                const responseData = actualRes.value;
                if (responseData.data && responseData.data.data) {
                    actualData = responseData.data.data;
                } else if (responseData.data) {
                    actualData = responseData.data;
                } else {
                    actualData = responseData;
                }
            }

            // Gọi render bảng tổng kết truyền cả 2 object
            renderFinanceBudget(financeData, actualData);

        } catch (error) {
            console.error('Lỗi khi tải dữ liệu tổng quan:', error);
            setOverviewLoading(`Không thể tải dữ liệu: ${error.message}`);
        }
    }

    tabs.forEach(tab => {
        tab.addEventListener("click", (e) => {
            const clickedTab = e.currentTarget;
            tabs.forEach(t => t.classList.remove("active"));
            clickedTab.classList.add("active");

            const targetTab = clickedTab.getAttribute("data-tab");
            if (!targetTab) return;
            switchTab(targetTab);
        });
    });

    function switchTab(tabName) {
        const subContentArea = document.getElementById("trip-sub-content");
        if (!subContentArea) return;

        if (tabName === "general") {
            location.reload();
            return;
        }

        const htmlUrl = `/modules/trip/${tabName}/${tabName}.html`;
        const jsUrl = `/modules/trip/${tabName}/${tabName}.js`;

        fetch(htmlUrl)
            .then(res => {
                if (!res.ok) throw new Error("Không thể tải trang");
                return res.text();
            })
            .then(html => {
                subContentArea.innerHTML = html;
                import(jsUrl).then(module => {
                    if (tabName === "timeline" && typeof module.initTimeline === 'function') module.initTimeline();
                    if (tabName === "finance" && typeof module.initFinance === 'function') module.initFinance();
                }).catch(err => {
                    console.error("Lỗi import module con:", err);
                });
            })
            .catch(err => {
                subContentArea.innerHTML = `<div class="panel"><p style="color:red;">Lỗi tải phân hệ: ${err.message}</p></div>`;
            });
    }

    const tripId = getTripId();
    loadAllGeneralData(tripId);
}

export function initGeneralModule() {
    initGeneral();
}
