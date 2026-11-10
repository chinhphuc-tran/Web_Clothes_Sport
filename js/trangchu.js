document.addEventListener("DOMContentLoaded", () => {
    // Hàm viết tắt rút gọn document.getElementById
    const $ = id => document.getElementById(id); const $$ = sel => document.querySelectorAll(sel);

    // ================= 1. XỬ LÝ ĐĂNG NHẬP & ADMIN =================
    const savedUser = sessionStorage.getItem("sneakerUser");
    if (savedUser && $("authArea")) {
        const isAdmin = savedUser === "admin";
        $("authArea").innerHTML = `
            <div class="d-flex align-items-center gap-2">
                ${isAdmin ? `<button class="btn btn-sm btn-primary fw-bold" data-bs-toggle="modal" data-bs-target="#adminOrderModal" onclick="renderAdminOrders()"><i class="bi bi-list-check"></i> Đơn Hàng</button>` : ''}
                <span class="badge ${isAdmin ? 'bg-danger' : 'bg-success'} p-2 shadow-sm fs-6">
                    <i class="bi ${isAdmin ? 'bi-shield-lock' : 'bi-person-check'} me-1"></i>${isAdmin ? 'Admin' : savedUser}
                </span>
                <button class="btn btn-sm btn-danger" onclick="sessionStorage.removeItem('sneakerUser'); location.reload();"><i class="bi bi-box-arrow-right"></i></button>
            </div>
        `;
    }

    if ($("loginForm")) {
        $("loginForm").onsubmit = e => {
            e.preventDefault();
            let u = $("usernameInput"), p = $("passwordInput");
            let valid = u.value.trim().length >= 3 && p.value.trim().length >= 6;
            u.classList.toggle("is-invalid", u.value.trim().length < 3);
            p.classList.toggle("is-invalid", p.value.trim().length < 6);
            if (valid) {
                sessionStorage.setItem("sneakerUser", u.value.trim());
                alert("Đăng nhập thành công!"); location.reload();
            }
        };
    }

    // ================= 2. GIỎ HÀNG & THANH TOÁN LƯU ĐƠN =================
    let cart = JSON.parse(localStorage.getItem("sneakerZoneCart")) || [];

   window.renderCart = () => {
        let totalQty = 0, totalMoney = 0;
        let html = cart.map((item, i) => {
            let price = parseInt(String(item.price).replace(/\D/g, "")) || 0;
            totalQty += (item.qty = item.qty || 1);
            totalMoney += price * item.qty;
            return `
                <div class="border rounded-3 p-3 mb-2 bg-white d-flex justify-content-between align-items-center shadow-sm">
                    <div>
                        <h6 class="fw-bold mb-1 text-dark" style="font-size: 15px;">${item.name}</h6>
                        <span class="text-danger small">${item.price}</span>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        <button class="btn text-white fw-bold d-flex align-items-center justify-content-center p-0" style="background-color: #ff5722; width: 22px; height: 32px; border-radius: 4px;" onclick="changeQty(${i}, -1)">-</button>
                        <span class="fw-bold px-1 text-dark">${item.qty}</span>
                        <button class="btn text-white fw-bold d-flex align-items-center justify-content-center p-0" style="background-color: #ff5722; width: 22px; height: 32px; border-radius: 4px;" onclick="changeQty(${i}, 1)">+</button>
                    </div>
                </div>`;
        }).join("");

        if (document.getElementById("cartCountBadge")) document.getElementById("cartCountBadge").textContent = totalQty;
        if (document.getElementById("cartTotalCount")) document.getElementById("cartTotalCount").textContent = totalQty + " sản phẩm";
        if (document.getElementById("cartFinalTotal")) document.getElementById("cartFinalTotal").textContent = totalMoney.toLocaleString("vi-VN") + " đ";
        if (document.getElementById("cartListUI")) document.getElementById("cartListUI").innerHTML = html || `<div class="text-center text-muted py-3">Giỏ hàng trống</div>`;
    };
    window.changeQty = (i, step) => {
        if ((cart[i].qty += step) <= 0) cart.splice(i, 1);
        localStorage.setItem("sneakerZoneCart", JSON.stringify(cart)); renderCart();
    };

    if ($("btnClearCart")) $("btnClearCart").onclick = () => { cart = []; localStorage.removeItem("sneakerZoneCart"); renderCart(); };

    // Nút thanh toán: Đẩy đơn vào LocalStorage để Admin kiểm tra
    if ($("btnCheckout")) $("btnCheckout").onclick = () => {
        if (!cart.length) return alert("Giỏ hàng đang trống!");
        let orders = JSON.parse(localStorage.getItem("sneakerZoneOrders")) || [];
        let orderId = "DH" + Math.floor(Math.random() * 9000 + 1000);
        orders.push({
            id: orderId, customer: savedUser || "Khách vãng lai",
            items: cart.map(i => `${i.name} (x${i.qty})`).join("<br>"),
            total: $("cartFinalTotal").textContent, time: new Date().toLocaleString("vi-VN")
        });
        localStorage.setItem("sneakerZoneOrders", JSON.stringify(orders));
        alert("🎉 Đặt hàng thành công! Mã đơn của bạn: " + orderId);
        cart = []; localStorage.removeItem("sneakerZoneCart"); location.reload();
    };

    renderCart();

    // ================= 3. QUẢN LÝ ĐƠN HÀNG DÀNH CHO ADMIN =================
    window.renderAdminOrders = () => {
        let orders = JSON.parse(localStorage.getItem("sneakerZoneOrders")) || [];
        if ($("adminOrderListUI")) {
            $("adminOrderListUI").innerHTML = orders.length ? orders.slice().reverse().map(o => `
                <tr><td class="fw-bold text-danger">${o.id}</td><td class="fw-bold">${o.customer}</td>
                <td class="text-start small">${o.items}</td><td class="fw-bold text-success">${o.total}</td>
                <td class="small text-muted">${o.time}</td></tr>`).join("") : `<tr><td colspan="5">Chưa có đơn hàng!</td></tr>`;
        }
    };
    if ($("btnClearAllOrders")) $("btnClearAllOrders").onclick = () => {
        if (confirm("Xóa lịch sử đơn?")) {
            localStorage.removeItem("sneakerZoneOrders"); 
            renderAdminOrders();
        }
    };     
    // ================= 4. CLICK SẢN PHẨM (THÊM GIỎ HÀNG VÀ CHUYỂN TRANG) ================= 
    $$(".product-card").forEach(c => c.style.cursor = "pointer");
    document.addEventListener("click", e => {
        let card = e.target.closest(".product-card");
        if (!card) return;

        let name = card.querySelector(".product-name")?.textContent.trim();
        let price = card.querySelector(".product-price")?.textContent.trim();
        let img = card.querySelector("img")?.getAttribute("src");

        // Bấm nút Mua -> Thêm vào giỏ | Bấm ngoài nút -> Nhảy sang Chi Tiết
        if (e.target.closest(".btn-buy-js") || e.target.closest(".btn-buy")) {
            let found = cart.find(i => i.name === name);
            found ? found.qty++ : cart.push({ name, price, qty: 1 });
            localStorage.setItem("sneakerZoneCart", JSON.stringify(cart)); renderCart();
            alert(`Đã thêm ${name} vào giỏ!`);
        } else if (name && price && img) {
            window.location.href = `./chitietsanpham.html?name=${encodeURIComponent(name)}&price=${encodeURIComponent(price)}&img=${encodeURIComponent(img)}`;
        }
    });

    // ================= 5. TÌM KIẾM & LỌC SẢN PHẨM =================
    let cards = $$(".product-card");
    if ($("searchInput")) $("searchInput").onkeyup = function () {
        let kw = this.value.toLowerCase().trim();
        cards.forEach(c => c.style.display = c.querySelector(".product-name").textContent.toLowerCase().includes(kw) ? "" : "none");
    };

    if ($("btnApplyFilter")) $("btnApplyFilter").onclick = () => {
        let brand = $("filterBrand").value, price = $("filterPrice").value;
        cards.forEach(c => {
            let b = c.dataset.brand, p = parseInt(c.dataset.price || 0);
            let okBrand = brand === "all" || b === brand;
            let okPrice = price === "all" || (price === "under1m" && p < 1e6) || (price === "1mto2m" && p >= 1e6 && p <= 2e6) || (price === "over2m" && p > 2e6);
            c.style.display = okBrand && okPrice ? "" : "none";
        });
    };

    // ================= 6. BỘ ĐẾM NGƯỢC FLASH SALE =================
    if ($("fs-hours")) {
        let fsTime = localStorage.getItem("flashTime") || (new Date().getTime() + 86400000);
        localStorage.setItem("flashTime", fsTime);
        setInterval(() => {
            let d = fsTime - new Date().getTime();
            if (d < 0) { fsTime = new Date().getTime() + 86400000; localStorage.setItem("flashTime", fsTime); d = 86400000; }
            $("fs-hours").textContent = String(Math.floor((d / 3600000) % 24)).padStart(2, '0');
            $("fs-minutes").textContent = String(Math.floor((d / 60000) % 60)).padStart(2, '0');
            $("fs-seconds").textContent = String(Math.floor((d / 1000) % 60)).padStart(2, '0');
        }, 1000);
    }
});

// ================= 7. THÔNG BÁO HỆ THỐNG KHI TẢI TRANG XONG =================
window.addEventListener("load", () => {
    if ("Notification" in window) {
        let showNote = () => new Notification("Sneaker Zone 👟", { body: "Sản phẩm vừa được cập nhật!", icon: "./imgtrangchu/logo.jpeg" });
        Notification.permission === "granted" ? showNote() : Notification.requestPermission().then(p => p === "granted" && showNote());
    }
});