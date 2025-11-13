// ==== LIMPIEZA DE SESIÓN ANTIGUA ==== //
document.addEventListener("DOMContentLoaded", () => {
  const usuarioGuardado = localStorage.getItem("usuario");
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
            <img src="${item.imagen}" alt="${item.nombre}" onerror="this.src='https://via.placeholder.com/150x150/4A90E2/FFFFFF?text=Imagen'">
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

// === FUNCIONES MEJORADAS (CON Y SIN BACKEND) ===

// Función para verificar si el backend está disponible
async function verificarBackend() {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        
        const response = await fetch('http://127.0.0.1:8000/productos', {
            signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        return response.ok;
    } catch (error) {
        console.log('🔌 Backend no disponible, usando modo demo');
        return false;
    }
}

// Función para cargar pedidos del usuario (FUNCIONA CON Y SIN BACKEND)
async function cargarPedidosUsuario() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    
    if (!usuario) {
        return [];
    }
    
    try {
        const backendDisponible = await verificarBackend();
        
        if (backendDisponible && usuario.id) {
            // === MODO BACKEND ===
            console.log('✅ Cargando pedidos desde backend');
            const response = await fetch(`http://127.0.0.1:8000/usuarios/${usuario.id}/pedidos`);
            if (response.ok) {
                const pedidos = await response.json();
                return pedidos;
            }
        }
        
        // === MODO DEMO (sin backend) ===
        console.log('🔄 Cargando pedidos desde demo');
        const pedidosDemo = JSON.parse(localStorage.getItem('pedidos_demo') || '[]');
        
        // Filtrar pedidos del usuario actual (en demo, todos son del usuario)
        return pedidosDemo.slice(-10); // Últimos 10 pedidos
        
    } catch (error) {
        console.error('Error cargando pedidos:', error);
        
        // Fallback a modo demo
        const pedidosDemo = JSON.parse(localStorage.getItem('pedidos_demo') || '[]');
        return pedidosDemo.slice(-10);
    }
}

// Función para cancelar pedido (FUNCIONA CON Y SIN BACKEND)
async function cancelarPedidoBackend(pedidoId) {
    try {
        const backendDisponible = await verificarBackend();
        
        if (backendDisponible) {
            // === MODO BACKEND ===
            const response = await fetch(`http://127.0.0.1:8000/pedidos/${pedidoId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) {
                throw new Error('Error al cancelar pedido');
            }
            
            const resultado = await response.json();
            mostrarNotificacion(resultado.mensaje);
            return true;
        } else {
            // === MODO DEMO (sin backend) ===
            const pedidosDemo = JSON.parse(localStorage.getItem('pedidos_demo') || '[]');
            const pedidosActualizados = pedidosDemo.filter(pedido => pedido.id !== pedidoId);
            localStorage.setItem('pedidos_demo', JSON.stringify(pedidosActualizados));
            
            mostrarNotificacion('Pedido demo cancelado exitosamente');
            return true;
        }
        
    } catch (error) {
        console.error('Error cancelando pedido:', error);
        mostrarNotificacion('Error al cancelar pedido');
        return false;
    }
}

// Función para finalizar compra (FUNCIONA CON Y SIN BACKEND)
async function finalizarCompraBackend() {
    if (carrito.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    if (!usuario) {
        alert('Debes iniciar sesión para finalizar la compra');
        return;
    }
    
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    
    try {
        const backendDisponible = await verificarBackend();
        
        if (backendDisponible && usuario.id) {
            // === MODO BACKEND ===
            console.log('✅ Procesando compra con backend');
            
            // Realizar cada pedido en el backend
            for (const item of carrito) {
                const formData = new FormData();
                formData.append('usuario_id', usuario.id);
                formData.append('producto_id', item.id);
                formData.append('cantidad', item.cantidad);
                
                const response = await fetch('http://127.0.0.1:8000/pedidos', {
                    method: 'POST',
                    body: formData
                });
                
                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.detail || 'Error en el pedido');
                }
            }
            
            mostrarNotificacion(`¡Compra realizada con éxito! Total: $${total.toLocaleString()}`);
            
        } else {
            // === MODO DEMO (sin backend) ===
            console.log('🔄 Procesando compra en modo demo');
            
            // Crear pedidos demo en localStorage
            const pedidosExistentes = JSON.parse(localStorage.getItem('pedidos_demo') || '[]');
            const nuevosPedidos = carrito.map(item => ({
                id: Date.now() + Math.random(),
                producto_id: item.id,
                producto_nombre: item.nombre,
                cantidad: item.cantidad,
                precio_unitario: item.precio,
                total: item.precio * item.cantidad,
                fecha: new Date().toISOString()
            }));
            
            localStorage.setItem('pedidos_demo', JSON.stringify([...pedidosExistentes, ...nuevosPedidos]));
            
            mostrarNotificacion(`¡Compra demo realizada! Total: $${total.toLocaleString()}`);
        }
        
        // Limpiar carrito después de compra exitosa (en ambos modos)
        carrito = [];
        localStorage.setItem('carrito', JSON.stringify(carrito));
        renderizarCarrito();
        actualizarContadorCarrito();
        
        // Recargar pedidos
        if (typeof cargarMisPedidos === 'function') {
            await cargarMisPedidos();
        }
        
    } catch (error) {
        console.error('Error en finalizar compra:', error);
        alert('Error al procesar la compra: ' + error.message);
    }
}

// Función para cargar y mostrar los pedidos del usuario
async function cargarMisPedidos() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const pedidosSection = document.getElementById('pedidos-usuario');
    const listaPedidos = document.getElementById('lista-pedidos');
    const pedidosVacio = document.getElementById('pedidos-vacio');
    
    // Mostrar sección solo si hay usuario logueado
    if (usuario) {
        pedidosSection.style.display = 'block';
        
        try {
            const pedidos = await cargarPedidosUsuario();
            
            if (pedidos.length === 0) {
                listaPedidos.style.display = 'none';
                pedidosVacio.style.display = 'block';
                return;
            }
            
            listaPedidos.style.display = 'grid';
            pedidosVacio.style.display = 'none';
            
            listaPedidos.innerHTML = pedidos.map(pedido => `
                <div class="pedido-item" data-pedido-id="${pedido.id}">
                    <div class="pedido-info">
                        <h4>${pedido.producto_nombre}</h4>
                        <p>Pedido #${Math.round(pedido.id)}</p>
                    </div>
                    <div class="pedido-cantidad">
                        <small>Cantidad</small>
                        <div>${pedido.cantidad} und</div>
                    </div>
                    <div class="pedido-precio">
                        <small>Precio c/u</small>
                        <div>$${pedido.precio_unitario}</div>
                    </div>
                    <div class="pedido-total">
                        <small>Total</small>
                        <div>$${pedido.total}</div>
                    </div>
                    <button class="btn-cancelar" onclick="cancelarPedido(${pedido.id})" 
                            title="Cancelar pedido">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Error cargando pedidos:', error);
            listaPedidos.innerHTML = '<p>Error al cargar los pedidos</p>';
        }
    } else {
        pedidosSection.style.display = 'none';
    }
}

// Función mejorada para cancelar pedido
async function cancelarPedido(pedidoId) {
    if (!confirm('¿Estás seguro de que quieres cancelar este pedido?')) {
        return;
    }
    
    const btnCancelar = document.querySelector(`[data-pedido-id="${pedidoId}"] .btn-cancelar`);
    if (btnCancelar) {
        btnCancelar.disabled = true;
        btnCancelar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Cancelando...';
    }
    
    try {
        const success = await cancelarPedidoBackend(pedidoId);
        
        if (success) {
            // Recargar la lista de pedidos
            await cargarMisPedidos();
            mostrarNotificacion('Pedido cancelado exitosamente');
        }
    } catch (error) {
        console.error('Error cancelando pedido:', error);
        if (btnCancelar) {
            btnCancelar.disabled = false;
            btnCancelar.innerHTML = '<i class="fas fa-times"></i> Cancelar';
        }
    }
}

// Función para mostrar/ocultar sección de pedidos basado en el estado de login
function actualizarVisibilidadPedidos() {
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const pedidosSection = document.getElementById('pedidos-usuario');
    
    if (usuario) {
        pedidosSection.style.display = 'block';
        cargarMisPedidos(); // Cargar pedidos automáticamente
    } else {
        pedidosSection.style.display = 'none';
    }
}

// === SCRIPT PRINCIPAL ===
document.addEventListener("DOMContentLoaded", () => {
  // === LOGIN Y REGISTRO (MISMA PÁGINA) ===
  if (window.location.pathname.includes("login.html")) {
    console.log("🔧 Inicializando página de login...");
    
    const container = document.querySelector(".container");
    const registerBtn = document.querySelector(".register-btn");
    const loginBtn = document.querySelector(".login-btn");

    if (registerBtn && loginBtn && container) {
      registerBtn.addEventListener("click", () => {
        container.classList.add("active");
        console.log("📝 Cambiando a registro");
      });
      loginBtn.addEventListener("click", () => {
        container.classList.remove("active");
        console.log("🔐 Cambiando a login");
      });
    }

    // === REGISTRO ===
    const registerForm = document.getElementById("register-form");
    if (registerForm) {
      console.log("✅ Formulario de registro encontrado");
      registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        console.log("📨 Enviando formulario de registro...");

        const nombre = document.getElementById("register-nombre").value.trim();
        const email = document.getElementById("register-email").value.trim();
        const password = document.getElementById("register-password").value.trim();

        // Verificación básica
        if (!nombre || !email || !password) {
          alert("Por favor completa todos los campos");
          return;
        }

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
          // Fallback para cuando el backend no está disponible
          alert("Backend no disponible. Usando modo demo...");
          const usuarioDemo = {
            nombre: nombre,
            email: email,
            id: Date.now()
          };
          localStorage.setItem("usuario", JSON.stringify(usuarioDemo));
          alert("✅ Registro demo exitoso. Bienvenido " + nombre);
          window.location.href = "index.html";
        }
      });
    }

    // === LOGIN ===
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
      console.log("✅ Formulario de login encontrado");
      loginForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        console.log("📨 Enviando formulario de login...");

        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value.trim();

        // Verificación básica
        if (!email || !password) {
          alert("Por favor completa todos los campos");
          return;
        }

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
          // Fallback para cuando el backend no está disponible
          alert("Backend no disponible. Usando modo demo...");
          const usuarioDemo = {
            nombre: "Usuario Demo",
            email: email,
            id: Date.now()
          };
          localStorage.setItem("usuario", JSON.stringify(usuarioDemo));
          alert("✅ Login demo exitoso. Bienvenido!");
          window.location.href = "index.html";
        }
      });
    }
  }

  // --- MENÚ RESPONSIVE (NAVBAR) MEJORADO ---
  const toggle = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");

  if (toggle && navLinks) {
    toggle.addEventListener("click", (e) => {
      e.stopPropagation();
      navLinks.classList.toggle("active");
      toggle.classList.toggle("open");

      // Cambiar ícono de manera más confiable
      const icon = toggle.querySelector("i");
      if (navLinks.classList.contains("active")) {
        icon.classList.remove("fa-bars");
        icon.classList.add("fa-times");
        // Prevenir scroll del body cuando el menú está abierto
        document.body.style.overflow = 'hidden';
      } else {
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
        // Restaurar scroll del body
        document.body.style.overflow = '';
      }
    });

    // Cerrar menú al hacer clic en un enlace (móvil)
    navLinks.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        navLinks.classList.remove("active");
        toggle.classList.remove("open");
        
        const icon = toggle.querySelector("i");
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
        
        document.body.style.overflow = '';
      }
    });

    // Cerrar menú al hacer clic fuera (móvil)
    document.addEventListener('click', (e) => {
      if (navLinks.classList.contains('active') && 
          !navLinks.contains(e.target) && 
          !toggle.contains(e.target)) {
        navLinks.classList.remove("active");
        toggle.classList.remove("open");
        
        const icon = toggle.querySelector("i");
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
        
        document.body.style.overflow = '';
      }
    });

    // Cerrar menú con tecla Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        navLinks.classList.remove("active");
        toggle.classList.remove("open");
        
        const icon = toggle.querySelector("i");
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
        
        document.body.style.overflow = '';
      }
    });
  }

  /* === CONTROL DE USUARIO Y MENÚ "MI CUENTA" === */
  const userMenu = document.getElementById("userMenu");
  const userName = document.getElementById("userName");
  const loginIcon = document.getElementById("loginIcon");
  const logoutBtn = document.getElementById("logoutBtn");
  const dropdownMenu = document.getElementById("dropdownMenu");

  let usuario = null;

  // Intentar obtener usuario válido desde localStorage
  try {
    const raw = localStorage.getItem("usuario");
    if (raw) {
      const data = JSON.parse(raw);
      if (data && data.nombre && data.email) {
        usuario = data;
      } else {
        localStorage.removeItem("usuario");
      }
    }
  } catch {
    localStorage.removeItem("usuario");
  }

  // Mostrar u ocultar el icono y el menú según haya sesión
  if (usuario) {
    if (userName) userName.textContent = `Hola, ${usuario.nombre.split(' ')[0]}`;
    if (userMenu) userMenu.style.display = "flex";
    if (loginIcon) loginIcon.style.display = "none";
  } else {
    if (userMenu) userMenu.style.display = "none";
    if (loginIcon) loginIcon.style.display = "inline-flex";
  }

  // Abrir/cerrar menú desplegable
  if (userMenu) {
    const userInfo = userMenu.querySelector(".user-info");
    
    if (userInfo) {
      userInfo.addEventListener("click", (e) => {
        e.stopPropagation();
        userMenu.classList.toggle("active");
      });
    }

    // Cerrar menú al hacer click fuera
    document.addEventListener("click", (e) => {
      if (!userMenu.contains(e.target)) {
        userMenu.classList.remove("active");
      }
    });
  }

  // Cerrar sesión
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("usuario");
      localStorage.removeItem("token");
      window.location.href = "login.html";
    });
  }

  // === CARRITO - INICIALIZACIÓN ===
  actualizarContadorCarrito();

  // Renderizar carrito si estamos en la página del carrito
  if (window.location.pathname.includes("carrito.html")) {
      renderizarCarrito();
      actualizarVisibilidadPedidos();
      
      // Event listeners para botones del carrito
      const vaciarBtn = document.getElementById('vaciar-carrito');
      const comprarBtn = document.getElementById('comprar');
      const seguirComprandoBtn = document.getElementById('seguir-comprando');
      
      if (vaciarBtn) {
          vaciarBtn.addEventListener('click', vaciarCarrito);
      }
      
      if (comprarBtn) {
          comprarBtn.addEventListener('click', finalizarCompraBackend);
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
      const cardAltura = cards[0].offsetHeight + 30;
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

        console.log('🛒 Agregando producto:', producto);
        agregarAlCarrito(producto);
      }
    });
  }

  // === LOADER DE TRANSICIÓN ENTRE PÁGINAS ===
  const loader = document.getElementById("loader");
  if (loader) {
    setTimeout(() => {
      loader.classList.add("oculto");
    }, 1200);
  }
});

// === NAVBAR DESAPARECE AL HACER SCROLL ===
let lastScroll = 0;
const navbar = document.querySelector(".navbar");

window.addEventListener("scroll", () => {
  const currentScroll = window.pageYOffset;
  if (!navbar) return;

  if (currentScroll > lastScroll && currentScroll > 100) {
    navbar.classList.add("hide");
  } else {
    navbar.classList.remove("hide");
  }

  lastScroll = currentScroll;
});

// Hacer funciones disponibles globalmente
window.agregarAlCarrito = agregarAlCarrito;
window.cambiarCantidadCarrito = cambiarCantidadCarrito;
window.eliminarDelCarrito = eliminarDelCarrito;
window.vaciarCarrito = vaciarCarrito;
window.finalizarCompra = finalizarCompra;
window.finalizarCompraBackend = finalizarCompraBackend;
window.cargarMisPedidos = cargarMisPedidos;
window.cancelarPedido = cancelarPedido;
window.actualizarVisibilidadPedidos = actualizarVisibilidadPedidos;