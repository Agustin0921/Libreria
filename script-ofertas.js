// === SCRIPT ESPECÍFICO PARA PÁGINA DE OFERTAS ===

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar funcionalidades específicas de ofertas
    inicializarFiltrosOfertas();
    inicializarContadoresOfertas();
    inicializarOfertasRelampago();
    inicializarPaginacionOfertas();
    inicializarAnimacionesOfertas(); // Nueva función añadida
});

// === FILTROS DE OFERTAS ===
function inicializarFiltrosOfertas() {
    const filtroBtns = document.querySelectorAll('.boton-filtro-ofertas'); // Corregido selector
    const ofertaCards = document.querySelectorAll('[data-categoria]');
    
    filtroBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const categoria = this.getAttribute('data-categoria');
            
            // Actualizar botón activo
            filtroBtns.forEach(b => b.classList.remove('activo'));
            this.classList.add('activo');
            
            // Filtrar ofertas
            ofertaCards.forEach(card => {
                if (categoria === 'todas' || card.getAttribute('data-categoria') === categoria) {
                    card.style.display = 'block';
                    setTimeout(() => {
                        card.style.opacity = '1';
                        card.style.transform = 'translateY(0)';
                    }, 50);
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'translateY(20px)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// === CONTADORES REGRESIVOS ===
function inicializarContadoresOfertas() {
    // Contador principal del hero
    actualizarContadorHero();
    
    // Contador de ofertas relámpago
    actualizarContadorRelampago();
}

function actualizarContadorHero() {
    const daysElement = document.getElementById('dias-ofertas'); // Corregido ID
    const hoursElement = document.getElementById('horas-ofertas'); // Corregido ID
    const minutesElement = document.getElementById('minutos-ofertas'); // Corregido ID
    const secondsElement = document.getElementById('segundos-ofertas'); // Corregido ID
    
    if (!daysElement) return;
    
    // Establecer fecha de finalización (3 días desde ahora)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 3);
    
    function updateCountdown() {
        const now = new Date();
        const difference = endDate - now;
        
        if (difference <= 0) {
            daysElement.textContent = '00';
            hoursElement.textContent = '00';
            minutesElement.textContent = '00';
            secondsElement.textContent = '00';
            return;
        }
        
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        daysElement.textContent = days.toString().padStart(2, '0');
        hoursElement.textContent = hours.toString().padStart(2, '0');
        minutesElement.textContent = minutes.toString().padStart(2, '0');
        secondsElement.textContent = seconds.toString().padStart(2, '0');
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
}

// === OFERTAS RELÁMPAGO ===
function inicializarOfertasRelampago() {
    actualizarContadorRelampago();
    actualizarProgresoStock();
}

function actualizarContadorRelampago() {
    const timerElement = document.getElementById('temporizador-relampago'); // Corregido ID
    if (!timerElement) return;
    
    // Establecer tiempo restante (24 horas)
    let hours = 23;
    let minutes = 45;
    let seconds = 12;
    
    const timer = setInterval(() => {
        seconds--;
        if (seconds < 0) {
            seconds = 59;
            minutes--;
            if (minutes < 0) {
                minutes = 59;
                hours--;
                if (hours < 0) {
                    clearInterval(timer);
                    timerElement.textContent = '¡Oferta Finalizada!';
                    // Deshabilitar botones de compra
                    document.querySelectorAll('.boton-relampago').forEach(btn => { // Corregido selector
                        btn.textContent = 'Oferta Finalizada';
                        btn.style.background = '#95a5a6';
                        btn.style.cursor = 'not-allowed';
                        btn.onclick = null;
                    });
                    return;
                }
            }
        }
        
        timerElement.textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function actualizarProgresoStock() {
    // Simular actualización de stock en tiempo real
    setInterval(() => {
        const progressBars = document.querySelectorAll('.relleno-progreso'); // Corregido selector
        progressBars.forEach(bar => {
            const currentWidth = parseInt(bar.style.width) || 75;
            if (currentWidth > 10) {
                // Reducir progresivamente el stock
                const newWidth = Math.max(10, currentWidth - Math.random() * 2);
                bar.style.width = `${newWidth}%`;
                
                // Actualizar texto de stock
                const stockText = bar.closest('.contenido-oferta-relampago').querySelector('.stock-relampago');
                if (stockText) {
                    const match = stockText.textContent.match(/(\d+)/);
                    if (match) {
                        const currentStock = parseInt(match[1]);
                        if (currentStock > 1) {
                            const newStock = currentStock - 1;
                            stockText.textContent = `Quedan ${newStock} de 20`;
                        }
                    }
                }
            }
        });
    }, 30000); // Actualizar cada 30 segundos
}

// === PAGINACIÓN DE OFERTAS ===
function inicializarPaginacionOfertas() {
    const pagButtons = document.querySelectorAll('.boton-pagina'); // Corregido selector
    
    pagButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            // Actualizar botón activo
            pagButtons.forEach(b => b.classList.remove('activo'));
            this.classList.add('activo');
            
            // Simular cambio de página
            if (this.textContent === 'Siguiente') {
                const currentActive = document.querySelector('.boton-pagina.activo');
                const nextIndex = Array.from(pagButtons).indexOf(currentActive) + 1;
                if (nextIndex < pagButtons.length - 1) {
                    pagButtons.forEach(b => b.classList.remove('activo'));
                    pagButtons[nextIndex].classList.add('activo');
                }
            }
            
            // Mostrar animación de cambio de página
            const ofertasGrid = document.querySelector('.grid-destacadas-ofertas'); // Corregido selector
            if (ofertasGrid) {
                ofertasGrid.style.opacity = '0';
                setTimeout(() => {
                    ofertasGrid.style.opacity = '1';
                }, 300);
            }
        });
    });
}

// === ANIMACIONES ESPECIALES PARA OFERTAS ===
function inicializarAnimacionesOfertas() {
    // Efecto de parpadeo para ofertas relámpago
    const relampagoBadges = document.querySelectorAll('.badge-relampago');
    relampagoBadges.forEach(badge => {
        setInterval(() => {
            badge.style.opacity = badge.style.opacity === '0.7' ? '1' : '0.7';
        }, 1000);
    });
    
    // Efecto hover mejorado para tarjetas de oferta
    const ofertaCards = document.querySelectorAll('.tarjeta-oferta-destacada, .tarjeta-oferta-relampago');
    ofertaCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-5px) scale(1)';
        });
    });
}

// === AGREGAR PRODUCTOS EN OFERTA AL CARRITO ===
function agregarOfertaAlCarrito(producto) {
    // Añadir información de oferta al producto
    producto.esOferta = true;
    producto.descuento = producto.descuento || 0;
    
    // Usar la función global agregarAlCarrito
    if (typeof window.agregarAlCarrito === 'function') {
        window.agregarAlCarrito(producto);
    } else {
        console.error('Función agregarAlCarrito no disponible');
        // Fallback: agregar directamente al localStorage
        let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
        carrito.push(producto);
        localStorage.setItem('carrito', JSON.stringify(carrito));
        mostrarNotificacionOferta(`${producto.nombre} agregado al carrito`);
    }
}

// === NOTIFICACIONES ESPECIALES PARA OFERTAS ===
function mostrarNotificacionOferta(mensaje) {
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion-oferta';
    notificacion.innerHTML = `
        <div class="notificacion-content">
            <i class="fas fa-bolt"></i>
            <span>${mensaje}</span>
        </div>
    `;
    
    // Estilos para la notificación
    notificacion.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ff6b6b 0%, #e74c3c 100%);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(notificacion);
    
    // Animación de entrada
    setTimeout(() => {
        notificacion.style.transform = 'translateX(0)';
    }, 100);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notificacion.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (document.body.contains(notificacion)) {
                document.body.removeChild(notificacion);
            }
        }, 300);
    }, 3000);
}

// Hacer funciones disponibles globalmente
window.agregarOfertaAlCarrito = agregarOfertaAlCarrito;

