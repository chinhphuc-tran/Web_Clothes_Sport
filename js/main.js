document.addEventListener("DOMContentLoaded", function () {
    // 1. ĐĂNG NHẬP VỚI SESSIONSTORAGE & VALIDATION
    const loginForm = document.getElementById("loginForm");
    const usernameInput = document.getElementById("usernameInput");
    const passwordInput = document.getElementById("passwordInput");
    const authArea = document.getElementById("authArea");

    function renderAuthUI() {
        const currentUser = sessionStorage.getItem("sneakerUser");
        if (currentUser && authArea) {
            authArea.innerHTML = `
                <span class="badge bg-success p-2 fs-6">
                    <i class="bi bi-person-check-fill me-1"></i>Xin chào, ${currentUser}
                </span>
                <button class="btn btn-sm btn-danger ms-1" id="btnLogout" title="Đăng xuất">
                    <i class="bi bi-box-arrow-right"></i>
                </button>
            `;
            document.getElementById("btnLogout").addEventListener("click", function () {
                sessionStorage.removeItem("sneakerUser");
                location.reload();
            });
        }
    }
    renderAuthUI();

    if (loginForm) {
        loginForm.addEventListener("submit", function (e) {
            e.preventDefault();
            let valid = true;

            if (usernameInput.value.trim().length < 3) {
                usernameInput.classList.add("is-invalid");
                valid = false;
            } else {
                usernameInput.classList.remove("is-invalid");
                usernameInput.classList.add("is-valid");
            }

            if (passwordInput.value.trim().length < 6) {
                passwordInput.classList.add("is-invalid");
                valid = false;
            } else {
                passwordInput.classList.remove("is-invalid");
                passwordInput.classList.add("is-valid");
            }

            if (valid) {
                sessionStorage.setItem("sneakerUser", usernameInput.value.trim());
                alert("🎉 Đăng nhập thành công! Chào mừng " + usernameInput.value.trim() + " đến với Sneaker Zone.");
                location.reload();
            }
        });
    }

    // 2. GIỎ HÀNG VỚI LOCALSTORAGE (ĐỒNG BỘ TẤT CẢ CÁC TRANG)
    const cartCountBadge = document.getElementById("cartCountBadge");
    const cartListUI = document.getElementById("cartListUI");
    const cartTotalCount = document.getElementById("cartTotalCount");
    let cart = JSON.parse(localStorage.getItem("sneakerZoneCart")) || [];

    function updateCartUI() {
        if (cartCountBadge) cartCountBadge.textContent = cart.length;
        if (cartTotalCount) cartTotalCount.textContent = cart.length + " sản phẩm";
        if (cartListUI) {
            cartListUI.innerHTML = "";
            if (cart.length === 0) {
                cartListUI.innerHTML = `<li class="list-group-item text-center text-muted">Giỏ hàng đang trống!</li>`;
            } else {
                cart.forEach((item, index) => {
                    cartListUI.innerHTML += `
                        <li class="list-group-item d-flex justify-content-between align-items-center">
                            <span><i class="bi bi-check2-square text-success me-2"></i><b>${item.name}</b> - <span class="text-danger">${item.price}</span></span>
                            <button class="btn btn-sm btn-outline-danger btn-remove-item" data-index="${index}">
                                <i class="bi bi-x-lg"></i>
                            </button>
                        </li>
                    `;
                });
                document.querySelectorAll(".btn-remove-item").forEach(btn => {
                    btn.addEventListener("click", function () {
                        const idx = this.getAttribute("data-index");
                        cart.splice(idx, 1);
                        localStorage.setItem("sneakerZoneCart", JSON.stringify(cart));
                        updateCartUI();
                    });
                });
            }
        }
    }
    updateCartUI();

    const buyButtons = document.querySelectorAll(".btn-buy-js, .btn-buy");
    buyButtons.forEach(button => {
        button.addEventListener("click", function () {
            const card = this.closest(".product-card");
            const name = card.querySelector(".product-name").textContent.trim();
            const price = card.querySelector(".product-price").textContent.trim();

            cart.push({ name, price });
            localStorage.setItem("sneakerZoneCart", JSON.stringify(cart));
            updateCartUI();

            const originalHTML = this.innerHTML;
            this.innerHTML = `<i class="bi bi-check-lg"></i> Đã thêm!`;
            this.style.backgroundColor = "#198754";
            setTimeout(() => {
                this.innerHTML = originalHTML;
                this.style.backgroundColor = "";
            }, 1000);
        });
    });

    const btnClearCart = document.getElementById("btnClearCart");
    if (btnClearCart) {
        btnClearCart.addEventListener("click", function () {
            cart = [];
            localStorage.removeItem("sneakerZoneCart");
            updateCartUI();
        });
    }

    const btnCheckout = document.getElementById("btnCheckout");
    if (btnCheckout) {
        btnCheckout.addEventListener("click", function () {
            if (cart.length === 0) {
                alert("Giỏ hàng của bạn đang trống, hãy chọn mua sản phẩm nhé!");
            } else {
                alert("🎉 Đặt hàng thành công " + cart.length + " sản phẩm! Sneaker Zone sẽ liên hệ giao hàng sớm nhất.");
                cart = [];
                localStorage.removeItem("sneakerZoneCart");
                updateCartUI();
            }
        });
    }

    // 3. TÌM KIẾM SẢN PHẨM TRÊN TRANG HIỆN TẠI (DOM)
    const searchInput = document.getElementById("searchInput");
    const allCards = document.querySelectorAll(".product-card");
    if (searchInput && allCards.length > 0) {
        searchInput.addEventListener("keyup", function () {
            const keyword = this.value.toLowerCase().trim();
            allCards.forEach(card => {
                const title = card.querySelector(".product-name").textContent.toLowerCase();
                card.style.display = title.includes(keyword) ? "" : "none";
            });
        });
    }

    // 4. FORM TƯ VẤN & FORM LIÊN HỆ
    const consultForm = document.getElementById("consultForm");
    if (consultForm) {
        consultForm.addEventListener("submit", function (e) {
            e.preventDefault();
            alert("🎉 Cảm ơn bạn! Yêu cầu tư vấn đã được ghi nhận, chúng tôi sẽ liên hệ trong 5 phút.");
            consultForm.reset();
        });
    }

    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", function (e) {
            e.preventDefault();
            alert("📩 Tin nhắn của bạn đã được gửi thành công đến Sneaker Zone HCM!");
            contactForm.reset();
        });
    }
});