function initCourseManagement() {

    const tableBody = document.getElementById("courseTableBody")
    if (!tableBody) return

    // ================= STATE =================
    const state = {
        keyword: "",
        term: "",
        status: ""
    }

    const typeMap = {
        FORCE: "Bắt buộc",
        OPTIONAL: "Tự chọn",
        BASE: "Cơ sở"
    }

    let debounceTimer

    // ================= API =================
    function buildQuery() {
        const params = new URLSearchParams()

        if (state.keyword) params.append("keyword", state.keyword)
        if (state.term) params.append("term", state.term)
        if (state.status) params.append("status", state.status)

        return params.toString()
    }

    function loadCourses() {
        const url = `http://localhost:4711/api/v1.0/pdt/course/list?${buildQuery()}`

        tableBody.innerHTML = `<tr><td colspan="7">Loading...</td></tr>`

        fetch(url)
            .then(res => res.json())
            .then(res => renderTable(res.data))
            .catch(err => {
                console.error(err)
                tableBody.innerHTML = `<tr><td colspan="7">Lỗi tải dữ liệu</td></tr>`
            })
    }

    // ================= RENDER =================
    function renderTable(courses) {

        if (!courses || courses.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="7">Không có dữ liệu</td></tr>`
            return
        }

        tableBody.innerHTML = ""

        courses.forEach(course => {

            const isOpen = course.status === "OPEN"

            const row = `
                <tr>
                    <td>${course.code}</td>
                    <td>${course.name}</td>
                    <td>${typeMap[course.type] || course.type}</td>
                    <td>${formatDate(course.start_at)} - ${formatDate(course.end_at)}</td>
                    <td class="status-text ${isOpen ? "open" : "closed"}">
                        ${isOpen ? "Đang mở" : "Đóng"}
                    </td>
                    <td>${course.regis_num ?? 0}</td>
                    <td>
                        <button 
                            class="mini-btn ${isOpen ? "red" : "green"} toggle-btn"
                            data-id="${course.id}"
                            data-status="${course.status}"
                        >
                            ${isOpen ? "Đóng" : "Mở"}
                        </button>
                    </td>
                </tr>
            `

            tableBody.insertAdjacentHTML("beforeend", row)
        })
    }

    function formatDate(dateStr) {
        if (!dateStr) return ""
        return new Date(dateStr).toLocaleDateString("vi-VN")
    }

    // ================= EVENTS =================

    const searchInput = document.getElementById("search")
    searchInput?.addEventListener("input", () => {
        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => {
            state.keyword = searchInput.value.trim()
            loadCourses()
        }, 400)
    })

    const semesterSelect = document.getElementById("semester")
    semesterSelect?.addEventListener("change", () => {
        state.term = semesterSelect.value
        loadCourses()
    })

    const statusSelect = document.getElementById("status")
    statusSelect?.addEventListener("change", () => {
        const val = statusSelect.value

        if (val === "Đang mở") state.status = "OPEN"
        else if (val === "Đóng") state.status = "CLOSED"
        else state.status = ""

        loadCourses()
    })

    // ================= ACTIONS =================

    document.getElementById("openAllBtn")?.addEventListener("click", () => {
        fetch("http://localhost:4711/api/v1.0/pdt/course/openAll", { method: "PUT" })
            .then(() => loadCourses())
    })

    document.getElementById("closeAllBtn")?.addEventListener("click", () => {
        fetch("http://localhost:4711/api/v1.0/pdt/course/closeAll", { method: "PUT" })
            .then(() => loadCourses())
    })

    tableBody.addEventListener("click", (e) => {
        if (!e.target.classList.contains("toggle-btn")) return

        const { id, status } = e.target.dataset

        const url = status === "OPEN"
            ? "http://localhost:4711/api/v1.0/pdt/course/close"
            : "http://localhost:4711/api/v1.0/pdt/course/open"

        fetch(`${url}?id=${id}`, { method: "PUT" })
            .then(() => loadCourses())
    })

    // ================= INIT =================
    loadCourses()
}