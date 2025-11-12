# 📚 Librería Santo Tomás

Proyecto web desarrollado para la **Librería Santo Tomás**, que ofrece productos escolares, de oficina y novedades.  
El sitio cuenta con sistema de registro, login, carrito de compras y administración básica de usuarios.

---

## 🧱 Estructura del Proyecto

```
/Libreria/
│
├── backend/
│   ├── main.py              # Servidor principal (FastAPI o Flask)
│   ├── database.py          # Configuración y conexión a la base de datos
│   ├── models.py            # Modelos de datos
│   ├── seed.py              # Datos iniciales de prueba
│   └── requirements.txt     # Dependencias del backend
│
├── frontend/
│   ├── index.html           # Página principal (Home)
│   ├── productos.html       # Catálogo de productos
│   ├── carrito.html         # Carrito de compras
│   ├── contacto.html        # Formulario de contacto
│   ├── login.html           # Login y registro
│   ├── novedades.html       # Novedades y promociones
│   ├── ofertas.html         # Sección de ofertas
│   ├── css/                 # Hojas de estilo
│   ├── js/                  # Scripts del sitio
│   └── img/                 # Imágenes del sitio
│
└── README.md                # Documentación del proyecto
```

---

## 🚀 Funcionalidades Principales

### 🖥️ **Frontend**
- Interfaz responsive con HTML, CSS y JavaScript.  
- Menú de navegación dinámico con login persistente.  
- Sistema de carrito con almacenamiento local (`localStorage`).  
- Paginación automática en productos.  
- Loader de transición entre páginas.  
- Sistema de usuario con menú desplegable (“Mi cuenta”).  

### ⚙️ **Backend**
- Implementado en **Python**.  
- Manejo de usuarios y autenticación.  
- Base de datos local `database.db`.  
- Script `seed.py` para precargar datos iniciales.  

---

## 🔧 Instalación (modo local)

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/Libreria-Santo-Tomas.git
   cd Libreria-Santo-Tomas
   ```

2. **Configurar entorno del backend**
   ```bash
   cd backend
   pip install -r requirements.txt
   python main.py
   ```

3. **Abrir el frontend**
   - Abrir el archivo `frontend/index.html` en el navegador, o  
   - Ejecutar un servidor local (por ejemplo con VS Code → “Go Live”).

---

## 🧩 Tecnologías utilizadas

| Área | Tecnologías |
|------|--------------|
| **Frontend** | HTML5, CSS3, JavaScript |
| **Backend** | Python, FastAPI / Flask |
| **Base de datos** | SQLite |
| **Control de versiones** | Git + GitHub |

---

## 👨‍💻 Integrantes del equipo

| Integrante | Rol |
|-------------|------|
| Agustín Toledo | Navbar, Login y Registro |
| Timoteo | Home y Servicios |
| Benjamín | Equipos 1 y 2 (Planes) |
| Rubén | Sección de Contacto |

---

## 📸 Vista previa

*(Podés incluir una captura de pantalla del sitio)*  
```
frontend/img/preview.png
```

---

## 💬 Comentarios

Proyecto académico para la materia de **Equipos de Programación**.  
Desarrollado con el objetivo de practicar integración frontend-backend, diseño responsive y manejo de sesiones locales.
