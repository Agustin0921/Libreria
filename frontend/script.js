// ==== LIMPIEZA DE SESIÓN ANTIGUA ==== //
document.addEventListener("DOMContentLoaded", () => {
  const usuarioGuardado = localStorage.getItem("usuario");

  // Si no estás en modo servidor (no logueado realmente), limpiar
  if (!window.location.href.includes("localhost") && !window.location.href.includes("127.0.0.1")) {
    if (usuarioGuardado) {
      localStorage.removeItem("usuario");
      localStorage.removeItem("token");
      console.log("🧹 Sesión limpia: usuario eliminado porque no hay servidor activo.");
    }
  }
});

// === CARRITO DE COMPRAS MEJORADO ===
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

// Actualizar contador del carrito
function actualizarContadorCarrito() {
    const contador = document.getElementById('cantidad-carrito');
    const totalItems = carrito.reduce((sum, item) => sum + (item.cantidad || 1), 0);
    if (contador) {
        contador.textContent = totalItems;
        contador.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// Mostrar notificación
function mostrarNotificacion(mensaje) {
    let notificacion = document.getElementById('notificacion-carrito');
    if (!notificacion) {
        notificacion = document.createElement('div');
        notificacion.id = 'notificacion-carrito';
        notificacion.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 15px 25px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.3);
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            font-weight: 600;
            max-width: 300px;
            font-family: 'Quicksand', sans-serif;
        `;
        document.body.appendChild(notificacion);
    }
    
    notificacion.textContent = mensaje;
    notificacion.style.transform = 'translateX(0)';
    
    setTimeout(() => {
        notificacion.style.transform = 'translateX(400px)';
    }, 3000);
}

// Agregar producto al carrito (VERSIÓN MEJORADA)
function agregarAlCarrito(producto) {
    const productoExistente = carrito.find(item => item.id === producto.id);
    
    if (productoExistente) {
        productoExistente.cantidad += (producto.cantidad || 1);
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
    
    // Guardar en localStorage
    localStorage.setItem('carrito', JSON.stringify(carrito));
    
    // Actualizar interfaz
    actualizarContadorCarrito();
    
    // Mostrar notificación
    mostrarNotificacion(`${producto.nombre} agregado al carrito`);
}

// Renderizar carrito en página de carrito
function renderizarCarrito() {
    const contenedor = document.getElementById('carrito-contenedor');
    const carritoVacio = document.getElementById('carrito-vacio');
    const carritoResumen = document.getElementById('carrito-resumen');
    
    if (!contenedor) return;
    
    if (carrito.length === 0) {
        contenedor.innerHTML = '';
        if (carritoVacio) carritoVacio.style.display = 'block';
        if (carritoResumen) carritoResumen.style.display = 'none';
        return;
    }
    
    if (carritoVacio) carritoVacio.style.display = 'none';
    if (carritoResumen) carritoResumen.style.display = 'block';
    
    contenedor.innerHTML = carrito.map((item, index) => `
        <div class="carrito-item" data-id="${item.id}">
            <img src="${item.imagen}" alt="${item.nombre}" onerror="this.src='/frontend/img/placeholder.jpg'">
            <div class="carrito-info">
                <h3>${item.nombre}</h3>
                <p>${item.descripcion || 'Producto de librería'}</p>
                <p class="carrito-precio">$${item.precio.toLocaleString()}</p>
            </div>
            <div class="carrito-cantidad">
                <button class="disminuir-cantidad" onclick="cambiarCantidadCarrito(${index}, -1)">-</button>
                <span>${item.cantidad || 1}</span>
                <button class="aumentar-cantidad" onclick="cambiarCantidadCarrito(${index}, 1)">+</button>
            </div>
            <button class="eliminar-item" onclick="eliminarDelCarrito(${index})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
    
    actualizarTotalCarrito();
}

// Cambiar cantidad de producto en carrito
function cambiarCantidadCarrito(index, cambio) {
    const item = carrito[index];
    if (item) {
        item.cantidad = (item.cantidad || 1) + cambio;
        
        if (item.cantidad <= 0) {
            eliminarDelCarrito(index);
        } else {
            localStorage.setItem('carrito', JSON.stringify(carrito));
            renderizarCarrito();
            actualizarContadorCarrito();
        }
    }
}

// Eliminar producto del carrito
function eliminarDelCarrito(index) {
    const productoEliminado = carrito[index].nombre;
    carrito.splice(index, 1);
    localStorage.setItem('carrito', JSON.stringify(carrito));
    renderizarCarrito();
    actualizarContadorCarrito();
    mostrarNotificacion(`${productoEliminado} eliminado del carrito`);
}

// Vaciar carrito completo
function vaciarCarrito() {
    if (carrito.length === 0) return;
    
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        carrito = [];
        localStorage.setItem('carrito', JSON.stringify(carrito));
        renderizarCarrito();
        actualizarContadorCarrito();
        mostrarNotificacion('Carrito vaciado');
    }
}

// Actualizar total del carrito
function actualizarTotalCarrito() {
    const totalElement = document.getElementById('carrito-total');
    const subtotalElement = document.getElementById('subtotal');
    
    if (totalElement || subtotalElement) {
        const subtotal = carrito.reduce((sum, item) => sum + (item.precio * (item.cantidad || 1)), 0);
        const total = subtotal;
        
        if (subtotalElement) {
            subtotalElement.textContent = `$${subtotal.toLocaleString()}`;
        }
        if (totalElement) {
            totalElement.textContent = `$${total.toLocaleString()}`;
        }
    }
}

// Finalizar compra
function finalizarCompra() {
    if (carrito.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    const total = carrito.reduce((sum, item) => sum + (item.precio * (item.cantidad || 1)), 0);
    alert(`¡Compra realizada con éxito! Total: $${total.toLocaleString()}`);
    
    // Limpiar carrito después de compra
    carrito = [];
    localStorage.setItem('carrito', JSON.stringify(carrito));
    renderizarCarrito();
    actualizarContadorCarrito();
}

// Hacer funciones disponibles globalmente
window.agregarAlCarrito = agregarAlCarrito;
window.cambiarCantidadCarrito = cambiarCantidadCarrito;
window.eliminarDelCarrito = eliminarDelCarrito;
window.vaciarCarrito = vaciarCarrito;
window.finalizarCompra = finalizarCompra;

// === SCRIPT PRINCIPAL ===
document.addEventListener("DOMContentLoaded", () => {
  // === LOGIN Y REGISTRO (MISMA PÁGINA) ===
  if (window.location.pathname.includes("login.html")) {
    const container = document.querySelector(".container");
    const registerBtn = document.querySelector(".register-btn");
    const loginBtn = document.querySelector(".login-btn");

    if (registerBtn && loginBtn && container) {
      registerBtn.addEventListener("click", () => container.classList.add("active"));
      loginBtn.addEventListener("click", () => container.classList.remove("active"));
    }

    // === REGISTRO ===
    const registerForm = document.getElementById("register-form");
    if (registerForm) {
      registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const nombre = document.getElementById("register-nombre").value.trim();
        const email = document.getElementById("register-email").value.trim();
        const password = document.getElementById("register-password").value.trim();

        const formData = new FormData();
        formData.append("nombre", nombre);
        formData.append("email", email);
        formData.append("password", password);

        try {
          const response = await fetch("http://127.0.0.1:8000/register", {
            method: "POST",
            body: formData,
          });

          const data = await response.json();

          if (!response.ok) {
            alert(data.detail || "Error al registrar el usuario");
            return;
          }

          alert("✅ Registro exitoso, ahora estás logueado.");
          localStorage.setItem("usuario", JSON.stringify(data));
          window.location.href = "index.html";
        } catch (err) {
          console.error("Error al registrar:", err);
          alert("Error de conexión con el servidor");
        }
      });
    }

    // === LOGIN ===
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value.trim();

        const formData = new FormData();
        formData.append("email", email);
        formData.append("password", password);

        try {
          const response = await fetch("http://127.0.0.1:8000/login", {
            method: "POST",
            body: formData,
          });

          const data = await response.json();

          if (!response.ok) {
            alert(data.detail || "Usuario o contraseña incorrectos");
            return;
          }

          localStorage.setItem("usuario", JSON.stringify(data));
          alert("✅ Bienvenido " + data.nombre);
          window.location.href = "index.html";
        } catch (err) {
          console.error("Error al iniciar sesión:", err);
          alert("Error de conexión con el servidor");
        }
      });
    }
  }

  // --- MENÚ RESPONSIVE (NAVBAR) ---
  const toggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");

  if (toggle && navLinks) {
    toggle.addEventListener("click", () => {
      navLinks.classList.toggle("active");
      toggle.classList.toggle("open");

      const icon = toggle.querySelector("i");
      if (navLinks.classList.contains("active")) {
        icon.classList.remove("fa-bars");
        icon.classList.add("fa-times");
      } else {
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
      }
    });
  }

  /* === CONTROL DE USUARIO Y MENÚ "MI CUENTA" === */
  const userMenu = document.getElementById("userMenu");
  const userName = document.getElementById("userName");
  const loginIcon = document.getElementById("loginIcon");
  const logoutBtn = document.getElementById("logoutBtn");

  let usuario = null;

  // Intentar obtener usuario válido desde localStorage
  try {
    const raw = localStorage.getItem("usuario");
    if (raw) {
      const data = JSON.parse(raw);
      if (data && data.nombre && data.email) usuario = data;
      else localStorage.removeItem("usuario");
    }
  } catch {
    localStorage.removeItem("usuario");
  }

  // Mostrar u ocultar el icono y el menú según haya sesión
  if (usuario) {
    userName.textContent = `Hola, ${usuario.nombre}`;
    userMenu.style.display = "flex";
    loginIcon.style.display = "none";
  } else {
    userMenu.style.display = "none";
    loginIcon.style.display = "inline-flex";
  }

  // Abrir/cerrar menú desplegable
  const dropdown = document.getElementById("dropdownMenu");
  const userInfo = userMenu?.querySelector(".user-info");

  if (userInfo) {
    userInfo.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdown.classList.toggle("active");
    });
  }

  document.addEventListener("click", () => {
    if (dropdown) dropdown.classList.remove("active");
  });

  // Cerrar sesión
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("usuario");
      if (userMenu) userMenu.style.display = "none";
      if (loginIcon) loginIcon.style.display = "inline-flex";
      window.location.href = "login.html";
    });
  }

  // === CARRITO - INICIALIZACIÓN ===
  actualizarContadorCarrito();
  
  // Renderizar carrito si estamos en la página del carrito
  if (window.location.pathname.includes("carrito.html")) {
      renderizarCarrito();
      
      // Event listeners para botones del carrito
      const vaciarBtn = document.getElementById('vaciar-carrito');
      const comprarBtn = document.getElementById('comprar');
      const seguirComprandoBtn = document.getElementById('seguir-comprando');
      
      if (vaciarBtn) {
          vaciarBtn.addEventListener('click', vaciarCarrito);
      }
      
      if (comprarBtn) {
          comprarBtn.addEventListener('click', finalizarCompra);
      }
      
      if (seguirComprandoBtn) {
          seguirComprandoBtn.addEventListener('click', function() {
              window.location.href = 'productos.html';
          });
      }
  }

  // === PÁGINA DE PRODUCTOS CON PAGINACIÓN ===
  if (window.location.pathname.includes("productos.html")) {
    const contenedor = document.getElementById("productos");
    const cards = Array.from(contenedor.querySelectorAll(".producto-card"));
    const paginacion = document.getElementById("paginacion");
    let paginas = [];
    let paginaActual = 0;

    // --- Calcular cuántas tarjetas entran en pantalla ---
    function dividirPorAltura() {
      paginas = [];
      const alturaMaxima = contenedor.clientHeight || window.innerHeight * 0.8;
      const cardAltura = cards[0].offsetHeight + 30; // altura aprox. + gap
      const filasVisibles = Math.floor(alturaMaxima / cardAltura);
      const columnas = getComputedStyle(contenedor).gridTemplateColumns.split(" ").length;
      const productosPorPagina = filasVisibles * columnas;

      for (let i = 0; i < cards.length; i += productosPorPagina) {
        paginas.push(cards.slice(i, i + productosPorPagina));
      }
    }

    // --- Mostrar la página actual ---
    function mostrarPagina() {
      cards.forEach(card => card.style.display = "none");
      if (paginas[paginaActual]) {
        paginas[paginaActual].forEach(card => card.style.display = "block");
      }
      generarPaginacion();
    }

    // --- Generar botones de paginación ---
    function generarPaginacion() {
      paginacion.innerHTML = "";
      paginas.forEach((_, i) => {
        const btn = document.createElement("button");
        btn.textContent = i + 1;
        btn.classList.toggle("active", i === paginaActual);
        btn.addEventListener("click", () => {
          paginaActual = i;
          mostrarPagina();
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
        paginacion.appendChild(btn);
      });
    }

    // --- Inicializar ---
    window.addEventListener("load", () => {
      dividirPorAltura();
      mostrarPagina();
    });

    window.addEventListener("resize", () => {
      dividirPorAltura();
      mostrarPagina();
    });

    // --- Botones de cantidad + y - ---
    contenedor.addEventListener("click", e => {
      if (e.target.classList.contains("mas") || e.target.classList.contains("menos")) {
        const input = e.target.parentElement.querySelector(".cantidad-input");
        let valor = parseInt(input.value) || 1;
        if (e.target.classList.contains("mas")) valor++;
        if (e.target.classList.contains("menos") && valor > 1) valor--;
        input.value = valor;
        return;
      }

      if (e.target.classList.contains("agregar")) {
        const card = e.target.closest(".producto-card");
        const cantidad = parseInt(card.querySelector(".cantidad-input").value) || 1;

        const producto = {
          id: card.dataset.id,
          nombre: card.dataset.nombre,
          precio: parseFloat(card.dataset.precio),
          imagen: card.dataset.img,
          descripcion: card.dataset.desc,
          cantidad: cantidad
        };

        agregarAlCarrito(producto);
      }
    });
  }

  // === LOADER DE TRANSICIÓN ENTRE PÁGINAS ===
  const loader = document.getElementById("loader");
  if (loader) {
    setTimeout(() => loader.classList.add("oculto"), 1200);

    const enlaces = document.querySelectorAll("a[href]");
    enlaces.forEach(link => {
      link.addEventListener("click", e => {
        const href = link.getAttribute("href");
        if (!href.startsWith("http") && !href.startsWith("#") && !href.includes("mailto:")) {
          e.preventDefault();
          loader.classList.remove("oculto");
          setTimeout(() => { window.location.href = href; }, 700);
        }
      });
    });
  }

  // === NAVBAR MEJORADO PARA NOVEDADES ===
  if (window.location.pathname.includes("novedades.html")) {
    
    // Control del menú de usuario para novedades
    const userMenu = document.getElementById("userMenu");
    const dropdown = document.getElementById("dropdownMenu");

    if (userMenu) {
      const userInfo = userMenu.querySelector(".user-info");
      
      if (userInfo) {
        userInfo.addEventListener("click", (e) => {
          e.stopPropagation();
          userMenu.classList.toggle("active");
        });
      }

      // Cerrar menú al hacer click fuera
      document.addEventListener("click", () => {
        userMenu.classList.remove("active");
      });
    }

    // Efectos hover mejorados para enlaces de navegación
    const navLinksElements = document.querySelectorAll(".nav_links a");
    navLinksElements.forEach(link => {
      link.addEventListener("mouseenter", function() {
        this.style.transform = "translateY(-2px)";
      });
      
      link.addEventListener("mouseleave", function() {
        this.style.transform = "translateY(0)";
      });
    });

    // Efecto de aparición suave para el header
    const header = document.querySelector(".header");
    if (header) {
      setTimeout(() => {
        header.style.opacity = "1";
        header.style.transform = "translateY(0)";
      }, 300);
    }

    console.log("🎨 Navbar de novedades mejorado cargado correctamente");
  }
});

// === LIMPIEZA PREVENTIVA DE USUARIO ===
if (localStorage.getItem("usuario")) {
  try {
    const test = JSON.parse(localStorage.getItem("usuario"));
    if (!test || !test.nombre || !test.email) {
      localStorage.removeItem("usuario");
    }
  } catch {
    localStorage.removeItem("usuario");
  }
}

// === LOADER (animación durante login/register o cambio de página) ===
const loader = document.getElementById("loader");

function mostrarLoader() {
  if (loader) loader.classList.add("active");
}

function ocultarLoader() {
  if (loader) loader.classList.remove("active");
}

// Mostrar loader mientras se procesa login/register
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    mostrarLoader();

    // Simula validación (reemplazá con tu fetch al backend)
    setTimeout(() => {
      ocultarLoader();
      window.location.href = "index.html";
    }, 2000);
  });
}

if (registerForm) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    mostrarLoader();

    // Simula registro (reemplazá con tu fetch al backend)
    setTimeout(() => {
      ocultarLoader();
      window.location.href = "index.html";
    }, 2000);
  });
}

// Mostrar loader al navegar a otra página
document.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", e => {
    const href = link.getAttribute("href");
    if (href && !href.startsWith("#") && !href.includes("javascript")) {
      e.preventDefault();
      mostrarLoader();
      setTimeout(() => { window.location.href = href; }, 800);
    }
  });
});