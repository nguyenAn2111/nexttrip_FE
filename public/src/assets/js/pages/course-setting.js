function initCourseSetting() {

    const tableBody = document.getElementById("settingCourseTableBody")
    if (!tableBody) return

    let selectedId = null
    let debounceTimer

    // ================= STATE =================
    const state = {
        keyword: "",
        type: ""
    }

    const typeMap = {
        FORCE: "Bắt buộc",
        OPTIONAL: "Tự chọn",
        BASE: "Cơ sở"
    }

    // ================= API =================
    function buildQuery() {
        const params = new URLSearchParams()

        if (state.keyword) params.append("keyword", state.keyword)
        if (state.type) params.append("type", state.type)

        return params.toString()
    }

    function loadData() {
        const url = `http://localhost:4711/api/v1.0/pdt/course/list?${buildQuery()}`

        tableBody.innerHTML = `<tr><td colspan="5">Loading...</td></tr>`

        fetch(url)
            .then(res => res.json())
            .then(res => renderTable(res.data))
            .catch(err => {
                console.error(err)
                tableBody.innerHTML = `<tr><td colspan="5">Lỗi tải dữ liệu</td></tr>`
            })
    }

    // ================= RENDER =================
    function renderTable(data) {

        if (!data || data.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="5">Không có dữ liệu</td></tr>`
            return
        }

        tableBody.innerHTML = ""

        data.forEach(c => {

            const row = `
                <tr>
                    <td>${c.code}</td>
                    <td>${c.name}</td>
                    <td>${c.credit}</td>
                    <td>${typeMap[c.type] || c.type}</td>
                    <td class="action-cell">
                        <button class="mini-btn blue edit-btn" data-id="${c.id}">Sửa</button>
                    </td>
                </tr>
            `

            tableBody.insertAdjacentHTML("beforeend", row)
        })
    }

    // ================= EVENTS =================

    const searchInput = document.getElementById("settingSearch")
    const typeSelect = document.getElementById("settingCourseType")

    searchInput?.addEventListener("input", () => {
        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(() => {
            state.keyword = searchInput.value.trim()
            loadData()
        }, 400)
    })

    typeSelect?.addEventListener("change", () => {
        state.type = typeSelect.value === "ALL" ? "" : typeSelect.value
        loadData()
    })

    // ================= EDIT =================
    tableBody.addEventListener("click", (e) => {

        if (!e.target.classList.contains("edit-btn")) return

        selectedId = e.target.dataset.id

        fetch(`http://localhost:4711/api/v1.0/pdt/course/detail/${selectedId}`)
            .then(res => res.json())
            .then(res => {
                const c = res.data

                courseCodeInput.value = c.code
                courseNameInput.value = c.name
                courseCreditInput.value = c.credit
                courseTypeInput.value = c.type
            })
    })

    // ================= UPDATE =================
    document.getElementById("updateCourseBtn")?.addEventListener("click", () => {

        if (!selectedId) return alert("Chọn học phần trước")

        fetch(`http://localhost:4711/api/v1.0/pdt/course/detail/${selectedId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                code: courseCodeInput.value,
                name: courseNameInput.value,
                credit: Number(courseCreditInput.value),
                type: courseTypeInput.value
            })
        })
        .then(() => {
            alert("Cập nhật thành công")
            loadData()
        })
    })

    // ================= DELETE =================
    document.getElementById("deleteCourseBtn")?.addEventListener("click", () => {

        if (!selectedId) return alert("Chọn học phần")

        if (!confirm("Bạn có chắc chắn muốn xóa?")) return

        fetch(`http://localhost:4711/api/v1.0/pdt/course/${selectedId}`, {
            method: "DELETE"
        })
        .then(() => {
            alert("Xóa thành công")
            selectedId = null
            loadData()
        })
    })

    // ================= MODAL ADD =================
    const modal = document.getElementById("addCourseModal")

    document.getElementById("addCourseBtn")?.addEventListener("click", () => {
        modal.classList.remove("hidden")
    })

    document.getElementById("closeModal")?.addEventListener("click", () => {
        modal.classList.add("hidden")
    })

    document.getElementById("submitAddCourse")?.addEventListener("click", () => {

        fetch("http://localhost:4711/api/v1.0/pdt/course", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                code: add_code.value,
                name: add_name.value,
                credit: Number(add_credit.value),
                startDate: new Date(add_start.value).toISOString(),
                endDate: new Date(add_end.value).toISOString(),
                type: add_type.value,
                term: "2025.2"
            })
        })
        .then(() => {
            alert("Thêm thành công")
            modal.classList.add("hidden")
            loadData()
        })
    })

    // ================= RESET =================
    document.getElementById("resetCourseBtn")?.addEventListener("click", () => {
        selectedId = null
        document.querySelectorAll("#course-setting-page input").forEach(i => i.value = "")
    })

    // ================= INIT =================
    loadData()
}