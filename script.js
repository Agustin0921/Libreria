// script.js - Versión profesional para tu frontend de Librería
// Mantiene compatibilidad con las funciones globales usadas en el HTML.
// Mejora: fetch con timeout, soporte JWT, mejor UX y manejo de demo-mode.

// ------------- CONFIG ---------------- //
const API_URL = "http://127.0.0.1:8000";
const FETCH_TIMEOUT = 6000; // ms

// ------------- UTILIDADES ------------- //
function showNotification(message, opts = {}) {
  // opts: { type: "success"|"error"|"info", duration: ms }
  const duration = opts.duration || 3000;
  let n = document.getElementById("notificacion-carrito");
  if (!n) {
    n = document.createElement("div");
    n.id = "notificacion-carrito";
    n.style.cssText = `
      position: fixed; top: 100px; right: 20px; z-index:10000;
      padding: 14px 18px; border-radius:10px; box-shadow:0 6px 18px rgba(0,0,0,0.15);
      font-weight:700; font-family: 'Quicksand', sans-serif; transform: translateX(400px);
      transition: transform 0.32s ease, opacity 0.32s ease;
    `;
    document.body.appendChild(n);
  }
  n.textContent = message;
  n.style.background = opts.type === "error" ? "#e74c3c" : (opts.type === "info" ? "#667eea" : "#27ae60");
  n.style.color = "#fff";
  n.style.opacity = "1";
  n.style.transform = "translateX(0)";

  clearTimeout(n._hideTimeout);
  n._hideTimeout = setTimeout(() => {
    n.style.transform = "translateX(400px)";
    n.style.opacity = "0";
  }, duration);
}

function formatMoney(num) {
  try { return Number(num).toLocaleString(); } catch { return num; }
}

// Fetch con timeout y Authorization si existe token
async function fetchWithTimeout(url, options = {}, timeout = FETCH_TIMEOUT) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  const token = localStorage.getItem("token");
  const headers = options.headers ? { ...options.headers } : {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(url, { ...options, signal: controller.signal, headers });
    clearTimeout(id);
    return res;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

// Comprueba si backend responde (rápido)
async function backendAvailable() {
  try {
    const res = await fetchWithTimeout(`${API_URL}/productos`, { method: "GET" }, 2000);
    return res.ok;
  } catch {
    return false;
  }
}

// ------------- CARRITO (localStorage) ------------- //
let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

function persistCarrito() {
  localStorage.setItem("carrito", JSON.stringify(carrito));
}

function actualizarContadorCarrito() {
  const contador = document.getElementById("cantidad-carrito");
  const totalItems = carrito.reduce((s, it) => s + (it.cantidad || 1), 0);
  if (contador) {
    contador.textContent = totalItems;
    contador.style.display = totalItems > 0 ? "flex" : "none";
  }
}

// ------------- OPERACIONES CARRITO ------------- //
function agregarAlCarrito(producto) {
  // producto: { id, nombre, precio, imagen, descripcion, cantidad }
  try {
    const existing = carrito.find(i => String(i.id) === String(producto.id));
    if (existing) {
      existing.cantidad = (existing.cantidad || 1) + (producto.cantidad || 1);
    } else {
      carrito.push({
        id: producto.id,
        nombre: producto.nombre,
        precio: Number(producto.precio),
        imagen: producto.imagen,
        descripcion: producto.descripcion,
        cantidad: producto.cantidad || 1
      });
    }
    persistCarrito();
    actualizarContadorCarrito();
    showNotification(`${producto.nombre} agregado al carrito`);
  } catch (e) {
    console.error("Error agregarAlCarrito:", e);
    showNotification("Error agregando producto", { type: "error" });
  }
}

function cambiarCantidadCarrito(index, cambio) {
  const item = carrito[index];
  if (!item) return;
  item.cantidad = (item.cantidad || 1) + cambio;
  if (item.cantidad <= 0) {
    eliminarDelCarrito(index);
    return;
  }
  persistCarrito();
  renderizarCarrito();
  actualizarContadorCarrito();
}

function eliminarDelCarrito(index) {
  if (!carrito[index]) return;
  const nombre = carrito[index].nombre;
  carrito.splice(index, 1);
  persistCarrito();
  renderizarCarrito();
  actualizarContadorCarrito();
  showNotification(`${nombre} eliminado del carrito`, { type: "info" });
}

function vaciarCarrito() {
  if (!carrito.length) return;
  if (!confirm("¿Estás seguro de vaciar el carrito?")) return;
  carrito = [];
  persistCarrito();
  renderizarCarrito();
  actualizarContadorCarrito();
  showNotification("Carrito vaciado");
}

function actualizarTotalCarrito() {
  const subtotalEl = document.getElementById("subtotal");
  const totalEl = document.getElementById("carrito-total");
  const subtotal = carrito.reduce((s, it) => s + (Number(it.precio) * (it.cantidad || 1)), 0);
  if (subtotalEl) subtotalEl.textContent = `$${formatMoney(subtotal)}`;
  if (totalEl) totalEl.textContent = `$${formatMoney(subtotal)}`;
}

// Renderizado del carrito (en carrito.html)
function renderizarCarrito() {
  const cont = document.getElementById("carrito-contenedor");
  const vacio = document.getElementById("carrito-vacio");
  const resumen = document.getElementById("carrito-resumen");
  if (!cont) return;
  if (!carrito.length) {
    cont.innerHTML = "";
    if (vacio) vacio.style.display = "block";
    if (resumen) resumen.style.display = "none";
    return;
  }
  if (vacio) vacio.style.display = "none";
  if (resumen) resumen.style.display = "block";

  cont.innerHTML = carrito.map((item, idx) => `
    <div class="carrito-item" data-id="${item.id}">
      <img src="${item.imagen || 'https://via.placeholder.com/150'}" alt="${item.nombre}" onerror="this.src='https://via.placeholder.com/150'">
      <div class="carrito-info">
        <h3>${item.nombre}</h3>
        <p>${item.descripcion || 'Producto de librería'}</p>
        <p class="carrito-precio">$${formatMoney(item.precio)}</p>
      </div>
      <div class="carrito-cantidad">
        <button class="disminuir-cantidad" onclick="cambiarCantidadCarrito(${idx}, -1)">-</button>
        <span>${item.cantidad || 1}</span>
        <button class="aumentar-cantidad" onclick="cambiarCantidadCarrito(${idx}, 1)">+</button>
      </div>
      <button class="eliminar-item" onclick="eliminarDelCarrito(${idx})"><i class="fas fa-trash"></i></button>
    </div>
  `).join("");

  actualizarTotalCarrito();
}

// ------------- LOGIN / REGISTER (guardado token si existe) ------------- //
async function submitRegister(nombre, email, password) {
  const fd = new FormData();
  fd.append("nombre", nombre);
  fd.append("email", email);
  fd.append("password", password);

  try {
    const res = await fetchWithTimeout(`${API_URL}/register`, { method: "POST", body: fd }, FETCH_TIMEOUT);
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Error registrando");
    // Si el backend devuelve token (JWT), guardarlo
    if (data.token) localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", JSON.stringify(data));
    return data;
  } catch (err) {
    throw err;
  }
}

async function submitLogin(email, password) {
  const fd = new FormData();
  fd.append("email", email);
  fd.append("password", password);

  try {
    const res = await fetchWithTimeout(`${API_URL}/login`, { method: "POST", body: fd }, FETCH_TIMEOUT);
    const data = await res.json();
    if (!res.ok) throw new Error(data.detail || "Usuario o contraseña incorrectos");
    if (data.token) localStorage.setItem("token", data.token);
    localStorage.setItem("usuario", JSON.stringify(data));
    return data;
  } catch (err) {
    throw err;
  }
}

// ------------- PEDIDOS: FINALIZAR COMPRA ------------- //
// Mantener compatibilidad con tu backend actual: envía un POST por item a /pedidos
async function finalizarCompraBackend() {
  if (!carrito.length) {
    alert("Tu carrito está vacío");
    return;
  }
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario || !usuario.id) {
    alert("Debes iniciar sesión para finalizar la compra");
    return;
  }

  // Bloquear botón comprar si existe
  const comprarBtn = document.getElementById("comprar");
  if (comprarBtn) { comprarBtn.disabled = true; comprarBtn.innerHTML = "<i class='fas fa-spinner fa-spin'></i> Procesando..."; }

  const total = carrito.reduce((s, it) => s + (it.precio * (it.cantidad || 1)), 0);
  let backendUp = await backendAvailable();

  try {
    if (backendUp) {
      // Enviar pedidos uno por uno (tu backend actual acepta formulario con usuario_id, producto_id, cantidad)
      const failures = [];
      for (const item of carrito) {
        const fd = new FormData();
        fd.append("usuario_id", usuario.id);
        fd.append("producto_id", item.id);
        fd.append("cantidad", item.cantidad || 1);

        try {
          const res = await fetchWithTimeout(`${API_URL}/pedidos`, { method: "POST", body: fd }, FETCH_TIMEOUT);
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            failures.push({ item, reason: err.detail || `HTTP ${res.status}` });
          }
        } catch (err) {
          failures.push({ item, reason: err.message });
        }
      }

      if (failures.length) {
        // Mantener carrito con los items fallidos (opcional) -> aquí los dejamos como estaban
        showNotification(`Algunos productos NO se pudieron procesar: ${failures.length}`, { type: "error" });
        console.error("Fallos en pedidos:", failures);
      } else {
        showNotification(`¡Compra realizada! Total: $${formatMoney(total)}`);
        carrito = [];
        persistCarrito();
        renderizarCarrito();
        actualizarContadorCarrito();
      }
    } else {
      // Modo demo: crear pedidos en localStorage 'pedidos_demo'
      const pedidosExistentes = JSON.parse(localStorage.getItem("pedidos_demo") || "[]");
      const nuevos = carrito.map(it => ({
        id: Date.now() + Math.floor(Math.random() * 1000),
        producto_id: it.id,
        producto_nombre: it.nombre,
        cantidad: it.cantidad,
        precio_unitario: it.precio,
        total: it.precio * it.cantidad,
        fecha: new Date().toISOString()
      }));
      localStorage.setItem("pedidos_demo", JSON.stringify([...pedidosExistentes, ...nuevos]));
      showNotification(`Compra demo realizada! Total: $${formatMoney(total)}`);
      carrito = []; persistCarrito(); renderizarCarrito(); actualizarContadorCarrito();
    }
  } catch (err) {
    console.error("Error finalizarCompraBackend:", err);
    showNotification("Error procesando la compra", { type: "error" });
  } finally {
    if (comprarBtn) { comprarBtn.disabled = false; comprarBtn.innerHTML = "Comprar"; }
    // Actualizar sección pedidos si existe
    if (typeof cargarMisPedidos === "function") {
      await cargarMisPedidos().catch(()=>{});
    }
  }
}

// ------------- PEDIDOS: CARGAR Y CANCELAR ------------- //
async function cargarPedidosUsuario() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  if (!usuario) return [];
  try {
    const up = await backendAvailable();
    if (up && usuario.id) {
      const res = await fetchWithTimeout(`${API_URL}/usuarios/${usuario.id}/pedidos`, { method: "GET" }, FETCH_TIMEOUT);
      if (!res.ok) throw new Error("Error al obtener pedidos");
      const data = await res.json();
      return data;
    } else {
      // Demo
      const pedidosDemo = JSON.parse(localStorage.getItem("pedidos_demo") || "[]");
      return pedidosDemo.filter(p => true).slice(-20);
    }
  } catch (err) {
    console.error("cargarPedidosUsuario error:", err);
    const pedidosDemo = JSON.parse(localStorage.getItem("pedidos_demo") || "[]");
    return pedidosDemo.slice(-20);
  }
}

async function cancelarPedidoBackend(pedidoId) {
  try {
    const up = await backendAvailable();
    if (up) {
      const res = await fetchWithTimeout(`${API_URL}/pedidos/${pedidoId}`, { method: "DELETE" }, FETCH_TIMEOUT);
      if (!res.ok) {
        const d = await res.json().catch(()=>({}));
        throw new Error(d.detail || `HTTP ${res.status}`);
      }
      const r = await res.json().catch(()=>({}));
      showNotification(r.mensaje || "Pedido cancelado");
      return true;
    } else {
      // Demo mode
      const pedidos = JSON.parse(localStorage.getItem("pedidos_demo") || "[]");
      const nuevos = pedidos.filter(p => String(p.id) !== String(pedidoId));
      localStorage.setItem("pedidos_demo", JSON.stringify(nuevos));
      showNotification("Pedido demo cancelado");
      return true;
    }
  } catch (err) {
    console.error("Error cancelarPedidoBackend:", err);
    showNotification("Error cancelando pedido", { type: "error" });
    return false;
  }
}

// Función pública para UI
async function cargarMisPedidos() {
  const usuario = JSON.parse(localStorage.getItem("usuario"));
  const pedidosSection = document.getElementById("pedidos-usuario");
  const lista = document.getElementById("lista-pedidos");
  const vacio = document.getElementById("pedidos-vacio");
  if (!pedidosSection || !lista) return;

  if (!usuario) {
    pedidosSection.style.display = "none";
    return [];
  }
  pedidosSection.style.display = "block";
  try {
    const pedidos = await cargarPedidosUsuario();
    if (!pedidos || !pedidos.length) {
      lista.style.display = "none";
      if (vacio) vacio.style.display = "block";
      return [];
    }
    lista.style.display = "grid";
    if (vacio) vacio.style.display = "none";

    lista.innerHTML = pedidos.map(p => `
      <div class="pedido-item" data-pedido-id="${p.id}">
        <div class="pedido-info">
          <h4>${p.producto_nombre || ("ID " + p.producto_id)}</h4>
          <p>Pedido #${Math.round(p.id)}</p>
        </div>
        <div class="pedido-cantidad"><small>Cantidad</small><div>${p.cantidad}</div></div>
        <div class="pedido-precio"><small>Precio c/u</small><div>$${formatMoney(p.precio_unitario || p.producto?.precio || 0)}</div></div>
        <div class="pedido-total"><small>Total</small><div>$${formatMoney(p.total || (p.cantidad*(p.precio_unitario||0)))}</div></div>
        <button class="btn-cancelar" onclick="cancelarPedido(${p.id})"><i class="fas fa-times"></i> Cancelar</button>
      </div>
    `).join("");
    return pedidos;
  } catch (err) {
    console.error("cargarMisPedidos error:", err);
    lista.innerHTML = "<p>Error cargando pedidos</p>";
    return [];
  }
}

// wrapper UI para cancelar pedido
async function cancelarPedido(pedidoId) {
  if (!confirm("¿Seguro que deseas cancelar este pedido?")) return;
  const result = await cancelarPedidoBackend(pedidoId);
  if (result) {
    await cargarMisPedidos();
  }
}

// ------------- INICIALIZACIÓN Y EVENTOS DOM ------------- //
document.addEventListener("DOMContentLoaded", () => {
  // Inicializar contador y carrito
  actualizarContadorCarrito();

  // Renderizar carrito si estamos en carrito.html
  if (window.location.pathname.includes("carrito.html")) {
    renderizarCarrito();
    actualizarVisibilidadPedidos();
    const vaciarBtn = document.getElementById("vaciar-carrito");
    const comprarBtn = document.getElementById("comprar");
    const seguirBtn = document.getElementById("seguir-comprando");
    if (vaciarBtn) vaciarBtn.addEventListener("click", vaciarCarrito);
    if (comprarBtn) comprarBtn.addEventListener("click", finalizarCompraBackend);
    if (seguirBtn) seguirBtn.addEventListener("click", () => window.location.href = "productos.html");
  }

  // Inicializar login/register si estamos en login.html
  if (window.location.pathname.includes("login.html")) {
    const registerForm = document.getElementById("register-form");
    const loginForm = document.getElementById("login-form");

    if (registerForm) {
      registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const nombre = document.getElementById("register-nombre").value.trim();
        const email = document.getElementById("register-email").value.trim();
        const password = document.getElementById("register-password").value.trim();
        if (!nombre || !email || !password) { alert("Completa los campos"); return; }
        try {
          const data = await submitRegister(nombre, email, password);
          showNotification("Registro exitoso");
          window.location.href = "index.html";
        } catch (err) {
          console.error(err);
          showNotification(err.message || "Error al registrar", { type: "error" });
        }
      });
    }

    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value.trim();
        if (!email || !password) { alert("Completa los campos"); return; }

        try {
          const data = await submitLogin(email, password);
          showNotification(`Bienvenido ${data.nombre}`);
          window.location.href = "index.html";
        } catch (err) {
          console.error(err);
          showNotification(err.message || "Error al iniciar sesión", { type: "error" });
        }
      });
    }
  }

  // Menú responsive
  const toggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");
  if (toggle && navLinks) {
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      navLinks.classList.toggle("active");
      toggle.classList.toggle("open");
      const icon = toggle.querySelector("i");
      if (navLinks.classList.contains("active")) {
        icon.classList.remove("fa-bars"); icon.classList.add("fa-times");
        document.body.style.overflow = 'hidden';
      } else {
        icon.classList.remove("fa-times"); icon.classList.add("fa-bars");
        document.body.style.overflow = '';
      }
    });
    navLinks.addEventListener("click", (e) => {
      if (e.target.tagName === "A") { navLinks.classList.remove("active"); toggle.classList.remove("open"); document.body.style.overflow = ''; }
    });
    document.addEventListener("click", (e) => { if (navLinks.classList.contains("active") && !navLinks.contains(e.target) && !toggle.contains(e.target)) { navLinks.classList.remove("active"); toggle.classList.remove("open"); document.body.style.overflow = ''; }});
    document.addEventListener("keydown", (e) => { if (e.key === 'Escape' && navLinks.classList.contains('active')) { navLinks.classList.remove("active"); toggle.classList.remove("open"); document.body.style.overflow = ''; }});
  }

  // User menu / sesión
  (function manageUserMenu() {
    const userMenu = document.getElementById("userMenu");
    const userName = document.getElementById("userName");
    const loginIcon = document.getElementById("loginIcon");
    const logoutBtn = document.getElementById("logoutBtn");
    let usuario = null;
    try {
      const raw = localStorage.getItem("usuario");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.nombre && parsed.email) usuario = parsed;
      }
    } catch { localStorage.removeItem("usuario"); }

    if (usuario) {
      if (userName) userName.textContent = `Hola, ${usuario.nombre.split(" ")[0]}`;
      if (userMenu) userMenu.style.display = "flex";
      if (loginIcon) loginIcon.style.display = "none";
    } else {
      if (userMenu) userMenu.style.display = "none";
      if (loginIcon) loginIcon.style.display = "inline-flex";
    }

    if (userMenu) {
      const userInfo = userMenu.querySelector(".user-info");
      if (userInfo) userInfo.addEventListener("click", (e) => { e.stopPropagation(); userMenu.classList.toggle("active"); });
      document.addEventListener("click", (e) => { if (!userMenu.contains(e.target)) userMenu.classList.remove("active"); });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("usuario");
        localStorage.removeItem("token");
        window.location.href = "login.html";
      });
    }
  })();

  // Página productos: búsqueda simplificada (debounce)
  if (window.location.pathname.includes("productos.html")) {
    const contenedor = document.getElementById("productos");
    const inputBusqueda = document.getElementById("buscar");
    const searchBoxHeader = document.querySelector(".search-box");
    if (contenedor) {
      const todos = Array.from(contenedor.querySelectorAll(".producto-card"));
      let timeoutBusqueda = null;
      function ejecutarBusqueda() {
        const q = (inputBusqueda.value || "").toLowerCase().trim();
        const mensajePrev = document.getElementById("mensaje-no-resultados");
        if (mensajePrev) mensajePrev.remove();
        let encontrados = 0;
        todos.forEach(card => {
          const nombre = (card.dataset.nombre || "").toLowerCase();
          const desc = (card.dataset.desc || "").toLowerCase();
          if (!q || nombre.includes(q) || desc.includes(q)) { card.style.display = "block"; encontrados++; } else { card.style.display = "none"; }
        });
        if (encontrados === 0 && q) {
          const msg = document.createElement("div");
          msg.id = "mensaje-no-resultados";
          msg.className = "mensaje-no-resultados";
          msg.innerHTML = `<p>No se encontraron productos para "${q}"</p>`;
          contenedor.appendChild(msg);
        }
      }
      if (inputBusqueda) {
        inputBusqueda.addEventListener("input", () => {
          if (timeoutBusqueda) clearTimeout(timeoutBusqueda);
          timeoutBusqueda = setTimeout(ejecutarBusqueda, 450);
        });
        inputBusqueda.addEventListener("keypress", (e) => { if (e.key === "Enter") { if (timeoutBusqueda) clearTimeout(timeoutBusqueda); ejecutarBusqueda(); }});
      }
      if (searchBoxHeader) {
        searchBoxHeader.addEventListener("input", (e) => { if (inputBusqueda) inputBusqueda.value = e.target.value; if (timeoutBusqueda) clearTimeout(timeoutBusqueda); timeoutBusqueda = setTimeout(ejecutarBusqueda, 450); });
      }
      // delegación para botones dentro de contenedor
      contenedor.addEventListener("click", (e) => {
        if (e.target.classList.contains("mas") || e.target.classList.contains("menos")) {
          const input = e.target.closest(".cantidad-control")?.querySelector(".cantidad-input") || e.target.parentElement.querySelector(".cantidad-input");
          if (!input) return;
          let v = parseInt(input.value) || 1;
          if (e.target.classList.contains("mas")) input.value = v + 1;
          else if (e.target.classList.contains("menos") && v > 1) input.value = v - 1;
          e.preventDefault(); return;
        }
        if (e.target.classList.contains("agregar")) {
          const card = e.target.closest(".producto-card");
          if (!card || card.style.display === "none") return;
          const cantidad = parseInt(card.querySelector(".cantidad-input")?.value) || 1;
          const producto = {
            id: card.dataset.id,
            nombre: card.dataset.nombre,
            precio: parseFloat(card.dataset.precio),
            imagen: card.dataset.img,
            descripcion: card.dataset.desc,
            cantidad
          };
          agregarAlCarrito(producto);
          e.preventDefault();
        }
      });
    }
    // ocultar paginación si existe (tu script actual lo removía)
    const paginacion = document.getElementById("paginacion");
    if (paginacion) paginacion.style.display = "none";
  }

  // Loader hide (ya lo tenés en HTML, lo respetamos)
  const loader = document.getElementById("loader");
  if (loader) setTimeout(() => loader.classList.add("oculto"), 1200);

}); // DOMContentLoaded

// Navbar hide on scroll (mantengo)
let lastScroll = 0;
const navbar = document.querySelector(".navbar");
window.addEventListener("scroll", () => {
  const currentScroll = window.pageYOffset;
  if (!navbar) return;
  if (currentScroll > lastScroll && currentScroll > 100) { navbar.classList.add("hide"); } else { navbar.classList.remove("hide"); }
  lastScroll = currentScroll;
});

// Exponer funciones globales para compatibilidad con HTML inline handlers
window.agregarAlCarrito = agregarAlCarrito;
window.cambiarCantidadCarrito = cambiarCantidadCarrito;
window.eliminarDelCarrito = eliminarDelCarrito;
window.vaciarCarrito = vaciarCarrito;
window.finalizarCompra = finalizarCompraBackend; // alias
window.finalizarCompraBackend = finalizarCompraBackend;
window.cargarMisPedidos = cargarMisPedidos;
window.cancelarPedido = cancelarPedido;
window.actualizarVisibilidadPedidos = async function(){ await cargarMisPedidos().catch(()=>{}); };

// FIN script.js
