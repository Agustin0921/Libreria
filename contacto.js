// === SCRIPT ESPECÍFICO PARA PÁGINA DE CONTACTO ===



document.addEventListener('DOMContentLoaded', function() {
    inicializarFormularioContacto();
    inicializarFAQ();
    inicializarMapa();
    inicializarValidaciones();
});

// === FORMULARIO DE CONTACTO ===
function inicializarFormularioContacto() {
    const formulario = document.getElementById('formularioContacto');
    const botonEnviar = document.querySelector('.boton-enviar-contacto');
    
    if (!formulario) return;
    
    formulario.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validarFormulario()) {
            enviarFormulario();
        }
    });
    
    // Validación en tiempo real
    const inputs = formulario.querySelectorAll('input, select, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validarCampo(this);
        });
        
        input.addEventListener('input', function() {
            limpiarError(this);
        });
    });
}

function validarFormulario() {
    const formulario = document.getElementById('formularioContacto');
    const campos = formulario.querySelectorAll('input[required], select[required], textarea[required]');
    let valido = true;
    
    campos.forEach(campo => {
        if (!validarCampo(campo)) {
            valido = false;
        }
    });
    
    return valido;
}

function validarCampo(campo) {
    const valor = campo.value.trim();
    const grupo = campo.closest('.grupo-formulario');
    const mensajeError = grupo.querySelector('.mensaje-error');
    
    // Limpiar estado anterior
    grupo.classList.remove('error');
    mensajeError.textContent = '';
    
    // Validaciones específicas
    if (campo.hasAttribute('required') && !valor) {
        mostrarError(grupo, mensajeError, 'Este campo es obligatorio');
        return false;
    }
    
    if (campo.type === 'email' && valor) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(valor)) {
            mostrarError(grupo, mensajeError, 'Ingresa un email válido');
            return false;
        }
    }
    
    if (campo.type === 'tel' && valor) {
        const telefonoRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
        if (!telefonoRegex.test(valor)) {
            mostrarError(grupo, mensajeError, 'Ingresa un teléfono válido');
            return false;
        }
    }
    
    return true;
}

function mostrarError(grupo, mensajeError, mensaje) {
    grupo.classList.add('error');
    mensajeError.textContent = mensaje;
}

function limpiarError(campo) {
    const grupo = campo.closest('.grupo-formulario');
    const mensajeError = grupo.querySelector('.mensaje-error');
    
    grupo.classList.remove('error');
    mensajeError.textContent = '';
}

function enviarFormulario() {
    const formulario = document.getElementById('formularioContacto');
    const botonEnviar = document.querySelector('.boton-enviar-contacto');
    const datosFormulario = new FormData(formulario);
    
    // Mostrar estado de carga
    botonEnviar.classList.add('cargando');
    botonEnviar.disabled = true;
    
    // Simular envío (en un caso real, aquí iría una petición fetch/AJAX)
    setTimeout(() => {
        // Simular respuesta exitosa
        mostrarNotificacionExito();
        formulario.reset();
        
        // Restaurar botón
        botonEnviar.classList.remove('cargando');
        botonEnviar.disabled = false;
    }, 2000);
}

function mostrarNotificacionExito() {
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion-exito';
    notificacion.innerHTML = `
        <div class="contenido-notificacion">
            <i class="fas fa-check-circle"></i>
            <div>
                <strong>¡Mensaje enviado!</strong>
                <p>Te contactaremos dentro de las próximas 24 horas.</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(notificacion);
    
    // Mostrar notificación
    setTimeout(() => {
        notificacion.classList.add('mostrar');
    }, 100);
    
    // Ocultar y remover después de 5 segundos
    setTimeout(() => {
        notificacion.classList.remove('mostrar');
        setTimeout(() => {
            if (document.body.contains(notificacion)) {
                document.body.removeChild(notificacion);
            }
        }, 300);
    }, 5000);
}

// === PREGUNTAS FRECUENTES ===
function inicializarFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const pregunta = item.querySelector('.faq-pregunta');
        
        pregunta.addEventListener('click', function() {
            // Cerrar otros items abiertos
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('activo')) {
                    otherItem.classList.remove('activo');
                }
            });
            
            // Alternar estado actual
            item.classList.toggle('activo');
        });
    });
}

// === MAPA ===
function inicializarMapa() {
    const botonVerMapa = document.getElementById('botonVerMapa');
    
    if (botonVerMapa) {
        botonVerMapa.addEventListener('click', function() {
            // En un caso real, aquí se integraría Google Maps API
            // Por ahora, abrir en Google Maps
            const direccion = encodeURIComponent('Av. Principal 123, Ciudad');
            window.open(`https://www.google.com/maps/search/?api=1&query=${direccion}`, '_blank');
        });
    }
}

// === VALIDACIONES ADICIONALES ===
function inicializarValidaciones() {
    // Validar número de teléfono con formato internacional
    const telefonoInput = document.getElementById('telefono');
    if (telefonoInput) {
        telefonoInput.addEventListener('input', function(e) {
            let valor = e.target.value.replace(/\D/g, '');
            
            // Formatear número
            if (valor.length > 0) {
                valor = '+' + valor;
            }
            
            e.target.value = valor;
        });
    }
    
    // Limitar longitud del mensaje
    const mensajeTextarea = document.getElementById('mensaje');
    if (mensajeTextarea) {
        mensajeTextarea.addEventListener('input', function(e) {
            const maxLength = 1000;
            const currentLength = e.target.value.length;
            
            if (currentLength > maxLength) {
                e.target.value = e.target.value.substring(0, maxLength);
            }
            
            // Opcional: mostrar contador de caracteres
            actualizarContadorCaracteres(currentLength, maxLength);
        });
    }
}

function actualizarContadorCaracteres(actual, maximo) {
    let contador = document.getElementById('contador-caracteres');
    
    if (!contador) {
        contador = document.createElement('div');
        contador.id = 'contador-caracteres';
        contador.style.cssText = `
            font-size: 0.8rem;
            color: #6c757d;
            text-align: right;
            margin-top: 5px;
        `;
        
        const grupoMensaje = document.querySelector('#mensaje').closest('.grupo-formulario');
        grupoMensaje.appendChild(contador);
    }
    
    contador.textContent = `${actual}/${maximo} caracteres`;
    
    if (actual > maximo * 0.9) {
        contador.style.color = '#e74c3c';
    } else if (actual > maximo * 0.75) {
        contador.style.color = '#f39c12';
    } else {
        contador.style.color = '#6c757d';
    }
}

// === FUNCIONES GLOBALES ===
window.mostrarFormularioContacto = function() {
    const formularioSection = document.querySelector('.seccion-formulario-mapa');
    if (formularioSection) {
        formularioSection.scrollIntoView({ 
            behavior: 'smooth',
            block: 'start'
        });
        
        // Opcional: focus en el primer campo
        const primerCampo = document.querySelector('#nombre');
        if (primerCampo) {
            setTimeout(() => {
                primerCampo.focus();
            }, 1000);
        }
    }
};

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', inicializarFormularioContacto);
} else {
    inicializarFormularioContacto();
}