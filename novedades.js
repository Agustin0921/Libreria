// novedades.js - Funcionalidades mejoradas para la página de novedades

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando novedades mejoradas...');

    // Esperar a que el DOM esté completamente cargado
    setTimeout(initNovedades, 100);
});

function initNovedades() {
    // Elementos del DOM
    const filtroBtns = document.querySelectorAll('.filtro-btn');
    const novedadesGrid = document.getElementById('novedadesGrid');
    const novedadCards = document.querySelectorAll('.novedad-card');
    const contadorResultados = document.getElementById('contadorResultados');
    const sinResultados = document.getElementById('sinResultados');
    const btnReiniciar = document.getElementById('btnReiniciar');

    console.log('🔍 Elementos encontrados:', {
        filtros: filtroBtns.length,
        cards: novedadCards.length,
        contador: !!contadorResultados,
        sinResultados: !!sinResultados,
        btnReiniciar: !!btnReiniciar
    });

    // Forzar display block para todas las secciones
    document.querySelectorAll('section.filtros-novedades, section.impacto-social, section.eventos-calendario, main.novedades-container').forEach(section => {
        section.style.display = 'block';
        section.style.visibility = 'visible';
        section.style.opacity = '1';
    });

    // Inicializar contador
    if (novedadCards.length > 0 && contadorResultados) {
        actualizarContador(novedadCards.length);
    }

    // Filtrado de novedades
    if (filtroBtns.length > 0) {
        filtroBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remover clase active de todos los botones
                filtroBtns.forEach(b => b.classList.remove('active'));
                // Agregar clase active al botón clickeado
                this.classList.add('active');
                
                const categoria = this.dataset.categoria;
                console.log('🎯 Filtrando por categoría:', categoria);
                filtrarNovedades(categoria);
            });
        });
    }

    // Función para filtrar novedades
    function filtrarNovedades(categoria) {
        let visibleCount = 0;
        
        novedadCards.forEach(card => {
            const cardCategoria = card.dataset.categoria;
            
            if (categoria === 'todas' || cardCategoria === categoria) {
                card.style.display = 'block';
                card.style.visibility = 'visible';
                card.style.opacity = '1';
                visibleCount++;
                
                // Animación de aparición
                setTimeout(() => {
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, 100);
            } else {
                card.style.opacity = '0';
                card.style.transform = 'translateY(20px)';
                setTimeout(() => {
                    card.style.display = 'none';
                }, 300);
            }
        });

        // Mostrar/ocultar mensaje de sin resultados
        if (sinResultados && novedadesGrid) {
            if (visibleCount === 0) {
                sinResultados.style.display = 'block';
                novedadesGrid.style.display = 'none';
            } else {
                sinResultados.style.display = 'none';
                novedadesGrid.style.display = 'grid';
            }
        }

        actualizarContador(visibleCount);
    }

    // Actualizar contador de resultados
    function actualizarContador(cantidad) {
        if (contadorResultados) {
            contadorResultados.textContent = `Mostrando ${cantidad} novedad${cantidad !== 1 ? 'es' : ''}`;
            contadorResultados.style.display = 'block';
        }
    }

    // Botón reiniciar filtros
    if (btnReiniciar) {
        btnReiniciar.addEventListener('click', function() {
            if (filtroBtns.length > 0) {
                filtroBtns.forEach(btn => btn.classList.remove('active'));
                const btnTodas = document.querySelector('.filtro-btn[data-categoria="todas"]');
                if (btnTodas) {
                    btnTodas.classList.add('active');
                    filtrarNovedades('todas');
                }
            }
        });
    }

    // Inicializar animación de números del impacto social
    initAnimacionNumeros();

    // Efectos hover mejorados
    initHoverEffects();

    // Smooth scroll
    initSmoothScroll();

    // Animación inicial escalonada
    initAnimacionInicial();

    console.log('✅ Novedades mejoradas inicializadas correctamente');
}

function initAnimacionNumeros() {
    const numerosEstadisticas = document.querySelectorAll('.estadistica .numero');
    
    if (numerosEstadisticas.length === 0) {
        console.log('⚠️ No se encontraron números para animar');
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                console.log('🎯 Animando números de impacto social...');
                
                numerosEstadisticas.forEach(numero => {
                    const target = parseInt(numero.dataset.count);
                    if (isNaN(target)) {
                        console.warn('❌ Count no válido:', numero.dataset.count);
                        return;
                    }

                    const duration = 2000;
                    const step = target / (duration / 16);
                    let current = 0;
                    
                    const timer = setInterval(() => {
                        current += step;
                        if (current >= target) {
                            current = target;
                            clearInterval(timer);
                        }
                        numero.textContent = Math.floor(current);
                    }, 16);
                });
                
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    const impactoSection = document.querySelector('.impacto-social');
    if (impactoSection) {
        observer.observe(impactoSection);
    }
}

function initHoverEffects() {
    // Efectos hover para tarjetas de novedades
    const novedadCards = document.querySelectorAll('.novedad-card');
    novedadCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-5px) scale(1)';
        });
    });

    // Efectos hover para tarjetas de eventos
    const eventoCards = document.querySelectorAll('.evento-card');
    eventoCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-5px)';
        });
    });
}

function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

function initAnimacionInicial() {
    setTimeout(() => {
        const cards = document.querySelectorAll('.novedad-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 150);
        });
    }, 500);
}