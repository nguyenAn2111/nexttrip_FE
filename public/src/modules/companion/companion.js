async function initCompanion() {
    const tabs = document.querySelectorAll('.nav-tabs .nav-tab');
    const subview = document.getElementById('subview-content');
    const btnJoinCode = document.getElementById('btn-join-code');

    if (!subview) return;

    // Hàm điều phối tải giao diện (Local Client Routing)
    async function switchTab(tabName) {
        try {
            if (tabName === 'lead') {
                if (btnJoinCode) btnJoinCode.style.display = 'none';
                
                // Fetch nạp file tĩnh HTML của phân hệ Dẫn đoàn
                const response = await fetch('modules/companion/lead_trip/lead_trip.html');
                subview.innerHTML = await response.text();
                
                // Kích hoạt logic xử lý của tab Dẫn đoàn
                if (typeof initLeadTrips === 'function') {
                    initLeadTrips();
                }

            } else if (tabName === 'invite') {
                if (btnJoinCode) btnJoinCode.style.display = 'block';
                
                // Fetch nạp file tĩnh HTML của phân hệ Lời mời
                const response = await fetch('modules/companion/invite/invite.html');
                subview.innerHTML = await response.text();
                
                // Kích hoạt logic xử lý của tab Lời mời
                if (typeof initInvites === 'function') {
                    initInvites();
                }
            }
        } catch (error) {
            console.error(`Lỗi hệ thống điều hướng tab ${tabName}:`, error);
            subview.innerHTML = `<p style="color:red; padding:20px;">Không thể tải dữ liệu phân hệ. Vui lòng tải lại trang.</p>`;
        }
    }

    // Gắn sự kiện click chuyển đổi tab lớn
    tabs.forEach(tab => {
        tab.addEventListener('click', async () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const targetTab = tab.getAttribute('data-tab');
            await switchTab(targetTab);
        });
    });

    // CHẠY MẶC ĐỊNH: Tải tab "Tôi dẫn đoàn" khi vừa vào chức năng kế hoạch đồng hành
    await switchTab('lead');
}
window.initCompanion = initCompanion; // Expose function to global scope for external calls