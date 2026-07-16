// const menuItems = document.querySelectorAll(".menu-item")
// const content = document.getElementById("app-content")

// function loadPage(page) {
//     const pagePath = `modules/${page}/${page}.html`

//     fetch(pagePath)
//         .then(res => {
//             if (!res.ok) throw new Error(`Failed to load ${pagePath} (${res.status})`)
//             return res.text()
//         })
//         .then(html => {
//             content.innerHTML = html

//             if (page === "home") {
//                 initHome()
//             }

//             if (page === "ai_chat") {
//                 initAI()
//             }
//             if (page === "companion") {
//                 initCompanion()
//             }

//              if (page === "trip") {
//                 initTrip()
//             }
//         })
//         .catch(err => console.error("Load page error:", err))
// }

// // menu click
// menuItems.forEach(item => {
//     item.addEventListener("click", function (e) {
//         e.preventDefault()

//         menuItems.forEach(i => i.classList.remove("active"))
//         this.classList.add("active")

//         loadPage(this.dataset.page)
//     })
// })

// // load mặc định
// window.onload = function () {
//     loadPage("home")
// }
const menuItems = document.querySelectorAll(".menu-item");
const content = document.getElementById("app-content");

// Hàm phân tích URL băm (Hash Router)
function handleRouting() {
    // 1. Lấy chuỗi băm, mặc định là '#/home' nếu trống
    let hash = window.location.hash || '#/home';
    
    // 2. Tách chuỗi tham số query string (ví dụ: ?id=trip_danang_2026) ra khỏi path thực tế
    let cleanPath = hash.split('?')[0]; // Kết quả: '#/home', '#/trip' hoặc '#/trip/general'
    
    // 3. Loại bỏ ký tự '#' và '/' ở đầu để lấy chuỗi xử lý module
    let route = cleanPath.replace(/^#\//, ''); // Kết quả: 'home', 'trip' hoặc 'trip/general'
    if (!route) route = 'home';

    // 4. Kích hoạt nạp layout tĩnh tương ứng
    loadPage(route);
    
    // 5. Đồng bộ trạng thái active trên Sidebar dựa theo URL hiện tại
    syncSidebarActive(route.split('/')[0]); // Chỉ lấy module gốc cấp 1 để highlight menu
}

// Hàm fetch HTML và khởi tạo module tương ứng
function loadPage(route) {
    // FIX ĐƯỜNG DẪN: index.html và main.js nằm cùng cấp với modules, không thêm "src/" ở đầu
    let pagePath = `modules/${route}/${route.split('/').pop()}.html`; 

    fetch(pagePath)
        .then(res => {
            if (!res.ok) throw new Error(`Failed to load ${pagePath} (${res.status})`);
            return res.text();
        })
        .then(html => {
            content.innerHTML = html;

            // Kiểm tra và khởi chạy hàm Logic JS tương ứng với từng màn hình
            const baseModule = route.split('/')[0];
            const subModule = route.split('/')[1];

            if (baseModule === "home" && typeof initHome === "function") {
                initHome();
            }
            else if (baseModule === "ai_chat" && typeof initAI === "function") {
                initAI();
            }
            else if (baseModule === "companion" && typeof initCompanion === "function") {
                initCompanion();
            }
            else if (baseModule === "trip") {
                // Nếu bấm vào danh sách Trip cha
                if (!subModule && typeof initTrip === "function") {
                    initTrip();
                } 
                // Nếu click vào Thẻ để sang trang Tổng quan con (trip/general)
                else if (subModule === "general") {
                    // Tự động nạp động file JavaScript của phân hệ general
                    import(`./modules/trip/general/general.js`)
                        .then(mod => {
                            if (mod.initGeneralModule) {
                                mod.initGeneralModule();
                            }
                        })
                        .catch(err => console.error("Lỗi tải file general.js:", err));
                }
            }
        })
        .catch(err => {
            console.error("Load page error:", err);
            content.innerHTML = `
                <div class="panel" style="text-align: center; color: #e53935; padding: 40px;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 10px;"></i>
                    <p>Lỗi không thể tải trang hành trình này.</p>
                    <small style="color: #7f8c8d; display: block; margin-top: 5px;">Chi tiết: ${err.message}</small>
                </div>`;
        });
}

// Đồng bộ class active trên thanh điều hướng Sidebar
function syncSidebarActive(baseModule) {
    menuItems.forEach(item => {
        if (item.dataset.page === baseModule) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });
}

// Đăng ký sự kiện click chuột trên Menu Sidebar
menuItems.forEach(item => {
    item.addEventListener("click", function (e) {
        e.preventDefault();
        const targetPage = this.dataset.page;
        window.location.hash = `#/${targetPage}`;
    });
});

// Lắng nghe các sự kiện thay đổi băm trên thanh URL toàn hệ thống
window.addEventListener('hashchange', handleRouting);
window.addEventListener('load', handleRouting);