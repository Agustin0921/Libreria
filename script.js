/******************************
 * CONFIGURACIÓN PRINCIPAL
 ******************************/
const API_URL = "https://libreria-santo-tomas.onrender.com";  
const token = localStorage.getItem("token");
const usuario = JSON.parse(localStorage.getItem("usuario")) || null;

/******************************
 * HELPERS
 ******************************/
function getAuthHeaders() {
    return {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${localStorage.getItem("token")}`
    };
}

function actualizarIconoCarrito() {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const cant = carrito.reduce((a, b) => a + b.cantidad, 0);
    const badge = document.getElementById("cantidad-carrito");
    if (badge) badge.textContent = cant;
}

function mostrarNombreUsuario() {
    const userName = document.getElementById("userName");
    const loginIcon = document.getElementById("loginIcon");
    const userMenu = document.getElementById("userMenu");

    if (!userName || !loginIcon || !userMenu) return;

    if (usuario && usuario.nombre) {
        userName.textContent = usuario.nombre;  // SOLO nombre
        loginIcon.style.display = "none";
        userMenu.style.display = "flex";
    } else {
        loginIcon.style.display = "flex";
        userMenu.style.display = "none";
    }
}

/*********************************
 *  LOGIN
 *********************************/
document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("login-form");

    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("login-email").value;
            const password = document.getElementById("login-password").value;

            try {
                const response = await fetch(`${API_URL}/login`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    alert(data.detail || "Error al iniciar sesión");
                    return;
                }

                // 🔥 Backend devuelve: access_token, id, nombre, email
                localStorage.setItem("token", data.access_token);
                localStorage.setItem("usuario", JSON.stringify({
                    id: data.id,
                    nombre: data.nombre,
                    email: data.email
                }));

                window.location.href = "index.html";
            } catch (error) {
                alert("Error en el servidor");
            }
        });
    }

    /*********************************
     *  REGISTRO
     *********************************/
    const registerForm = document.getElementById("register-form");

    if (registerForm) {
        registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const nombre = document.getElementById("register-nombre").value;
            const email = document.getElementById("register-email").value;
            const password = document.getElementById("register-password").value;

            try {
                const response = await fetch(`${API_URL}/register`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nombre, email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    alert(data.detail || "Error al registrarse");
                    return;
                }

                alert("Cuenta creada. Ahora podés iniciar sesión.");
                window.location.href = "login.html";

            } catch (error) {
                alert("Error en el servidor");
            }
        });
    }

});

/*********************************
 *  CERRAR SESIÓN
 *********************************/
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        localStorage.removeItem("carrito");
        window.location.href = "index.html";
    });
}

/*********************************
 *  CARRITO LOCAL
 *********************************/
function cargarCarrito() {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    const contenedor = document.getElementById("carrito-contenedor");
    const vacio = document.getElementById("carrito-vacio");
    const resumen = document.getElementById("carrito-resumen");

    if (!contenedor) return;

    contenedor.innerHTML = "";

    if (carrito.length === 0) {
        vacio.style.display = "block";
        resumen.style.display = "none";
        return;
    }

    vacio.style.display = "none";
    resumen.style.display = "block";

    carrito.forEach((prod, index) => {
        const item = document.createElement("div");
        item.classList.add("carrito-item");

        item.innerHTML = `
            <img src="${prod.img}" class="carrito-img">
            <div class="carrito-info">
                <h4>${prod.nombre}</h4>
                <p>Precio: $${prod.precio}</p>
                <div class="cantidad-control">
                    <button class="btn-cant disminuir" data-index="${index}">-</button>
                    <span>${prod.cantidad}</span>
                    <button class="btn-cant aumentar" data-index="${index}">+</button>
                </div>
            </div>
        `;

        contenedor.appendChild(item);
    });

    // Subtotal
    const subtotal = carrito.reduce((acc, prod) => acc + prod.precio * prod.cantidad, 0);
    document.getElementById("subtotal").textContent = `$${subtotal}`;
    document.getElementById("carrito-total").textContent = `$${subtotal}`;

    actualizarIconoCarrito();
}

/*********************************
 *  BOTONES DEL CARRITO
 *********************************/
document.addEventListener("click", (e) => {
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    if (e.target.classList.contains("aumentar")) {
        const index = e.target.dataset.index;
        carrito[index].cantidad++;
    }

    if (e.target.classList.contains("disminuir")) {
        const index = e.target.dataset.index;
        if (carrito[index].cantidad > 1) carrito[index].cantidad--;
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    cargarCarrito();
});

/*********************************
 *  VACIAR CARRITO
 *********************************/
const vaciarBtn = document.getElementById("vaciar-carrito");
if (vaciarBtn) {
    vaciarBtn.addEventListener("click", () => {
        localStorage.removeItem("carrito");
        cargarCarrito();
    });
}

/*********************************
 *  FINALIZAR COMPRA (BACKEND)
 *********************************/
const comprarBtn = document.getElementById("comprar");

if (comprarBtn) {
    comprarBtn.addEventListener("click", async () => {

        if (!token) {
            alert("Debés iniciar sesión para comprar.");
            window.location.href = "login.html";
            return;
        }

        let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
        if (carrito.length === 0) return alert("El carrito está vacío.");

        try {
            const response = await fetch(`${API_URL}/checkout`, {
                method: "POST",
                headers: getAuthHeaders(),
                body: JSON.stringify({
                    items: carrito,
                    total: carrito.reduce((a, b) => a + b.precio * b.cantidad, 0)
                })
            });

            const data = await response.json();

            if (!response.ok) {
                alert(data.detail || "Error en el checkout");
                return;
            }

            alert("Compra realizada con éxito");

            localStorage.removeItem("carrito");
            cargarCarrito();

        } catch (error) {
            alert("Error al procesar la compra.");
        }

    });
}

/*********************************
 *  MIS PEDIDOS
 *********************************/
async function cargarMisPedidos() {
    const lista = document.getElementById("lista-pedidos");
    const vacio = document.getElementById("pedidos-vacio");

    if (!lista) return;

    try {
        const response = await fetch(`${API_URL}/usuarios/pedidos`, {
            headers: getAuthHeaders()
        });

        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
            lista.innerHTML = "";
            vacio.style.display = "block";
            return;
        }

        vacio.style.display = "none";
        lista.innerHTML = "";

        data.forEach(p => {
            const box = document.createElement("div");
            box.classList.add("pedido-box");

            box.innerHTML = `
                <h4>Pedido #${p.id}</h4>
                <p>Fecha: ${p.fecha}</p>
                <p>Total: $${p.total}</p>
                <hr>
            `;

            lista.appendChild(box);
        });

    } catch (error) {
        console.error("Error obteniendo pedidos:", error);
    }
}

/*********************************
 * INICIALIZACIÓN GENERAL
 *********************************/
document.addEventListener("DOMContentLoaded", () => {
    actualizarIconoCarrito();
    mostrarNombreUsuario();
    cargarCarrito();
});
