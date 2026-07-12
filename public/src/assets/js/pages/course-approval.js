function initApprovalManagement() {

    const tableBody = document.getElementById("approvalTableBody")
    if (!tableBody) return

    // ================= STATE =================
    let debounceTimer

    // ================= ELEMENT =================
    const el = {
        search: document.getElementById("approvalSearch"),
        status: document.getElementById("approvalStatus"),
        term: document.getElementById("approvalSemester"),
        unit: document.getElementById("approvalFaculty"),

        approveAllBtn: document.getElementById("approveAllBtn"),
        rejectAllBtn: document.getElementById("rejectAllBtn"),

        // modal
        modal: document.getElementById("createRegModal"),
        openModalBtn: document.getElementById("createRegBtn"),
        closeModalBtn: document.getElementById("closeCreateRegModal"),
        submitBtn: document.getElementById("submitCreateReg"),

        studentInput: document.getElementById("reg_student_code"),
        courseInput: document.getElementById("reg_course_code")
    }

    // ================= API =================
    const API = {
        FILTER: "http://localhost:4711/api/v1.0/pdt/registration/list",
        CREATE: "http://localhost:4711/api/v1.0/pdt/registration/PDT/create",
        APPROVE: id => `http://localhost:4711/api/v1.0/pdt/registration/approve?id=${id}`,
        REJECT: id => `http://localhost:4711/api/v1.0/pdt/registration/reject?id=${id}`,
        APPROVE_ALL: "http://localhost:4711/api/v1.0/pdt/registration/approveAll",
        REJECT_ALL: "http://localhost:4711/api/v1.0/pdt/registration/rejectAll"
    }

    // ================= LOAD DATA =================
    function loadData() {

        const keyword = el.search.value.trim()
        const status = el.status.value
        const term = el.term.value
        const unit = el.unit.value

        const params = new URLSearchParams()

        if (keyword) params.append("keyword", keyword)
        if (status !== "ALL") params.append("status", status)
        if (term !== "ALL") params.append("term", term)
        if (unit !== "ALL") params.append("unit", unit)

        const url = `${API.FILTER}?${params.toString()}`

        tableBody.innerHTML = `<tr><td colspan="8">Loading...</td></tr>`

        fetch(url)
            .then(res => res.json())
            .then(res => renderTable(res.data))
            .catch(err => console.error(err))
    }

    // ================= RENDER =================
    function renderTable(data) {

        tableBody.innerHTML = ""

        const statusMap = {
            WAITING: "Chờ duyệt",
            APPROVED: "Đã duyệt",
            DECLINED: "Từ chối"
        }

        data.forEach(reg => {

            const statusText = statusMap[reg.status] || reg.status

            let actions = ""

            if (reg.status === "WAITING") {
                actions = `
                    <button class="mini-btn green approve-btn" data-id="${reg.id}">Duyệt</button>
                    <button class="mini-btn red reject-btn" data-id="${reg.id}">Từ chối</button>
                `
            } else {
                actions = `
                    <button class="mini-btn gray disabled-btn" disabled>
                        ${statusText}
                    </button>
                `
            }

            const row = document.createElement("tr")

            row.innerHTML = `
                <td>${reg.code}</td>
                <td>${reg.student_name}</td>
                <td>${reg.student_code}</td>
                <td>${reg.student_unit}</td>
                <td>${reg.course_code}</td>
                <td>${reg.course_name}</td>
                <td class="approval-status-text">${statusText}</td>
                <td class="action-cell">${actions}</td>
            `

            tableBody.appendChild(row)
        })
    }

    // ================= EVENTS FILTER =================
    el.search.addEventListener("input", () => {
        clearTimeout(debounceTimer)
        debounceTimer = setTimeout(loadData, 400)
    })

    el.status.addEventListener("change", loadData)
    el.term.addEventListener("change", loadData)
    el.unit.addEventListener("change", loadData)

    // ================= ACTION BUTTON =================
    tableBody.addEventListener("click", (e) => {

        const btn = e.target
        const id = btn.dataset.id

        if (btn.classList.contains("approve-btn")) {
            fetch(API.APPROVE(id), { method: "PUT" })
                .then(() => loadData())
        }

        if (btn.classList.contains("reject-btn")) {
            fetch(API.REJECT(id), { method: "PUT" })
                .then(() => loadData())
        }
    })

    // ================= APPROVE ALL =================
    el.approveAllBtn?.addEventListener("click", () => {
        fetch(API.APPROVE_ALL, { method: "PUT" })
            .then(() => loadData())
    })

    el.rejectAllBtn?.addEventListener("click", () => {
        fetch(API.REJECT_ALL, { method: "PUT" })
            .then(() => loadData())
    })

    // ================= MODAL =================
    el.openModalBtn?.addEventListener("click", () => {
        el.modal.classList.remove("hidden")
    })

    el.closeModalBtn?.addEventListener("click", closeModal)

    function closeModal() {
        el.modal.classList.add("hidden")
        el.studentInput.value = ""
        el.courseInput.value = ""
    }

    // ================= CREATE =================
    el.submitBtn?.addEventListener("click", () => {

        const student = el.studentInput.value.trim()
        const course = el.courseInput.value.trim()

        if (!student || !course) {
            alert("Nhập đủ thông tin")
            return
        }

        fetch(API.CREATE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                student_code: student,
                course_code: course
            })
        })
            .then(() => {
                closeModal()
                loadData()
            })
            .catch(err => console.error(err))
    })

    // ================= INIT =================
    loadData()
}