const menuItems = document.querySelectorAll(".menu-item")
const content = document.getElementById("app-content")

function loadPage(page) {

    fetch(`pages/${page}.html`)
        .then(res => res.text())
        .then(html => {
            content.innerHTML = html

            if (page === "course-management") {
                initCourseManagement()
            }
            if (page === "course-approval") {
                initApprovalManagement()
            }

            if (page === "course-setting") {
                initCourseSetting && initCourseSetting()
            }
        })
        .catch(err => console.error("Load page error:", err))
}

// menu click
menuItems.forEach(item => {
    item.addEventListener("click", function (e) {
        e.preventDefault()

        menuItems.forEach(i => i.classList.remove("active"))
        this.classList.add("active")

        loadPage(this.dataset.page)
    })
})

// load mặc định
window.onload = function () {
    loadPage("course-management")
}