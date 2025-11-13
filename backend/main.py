from fastapi import FastAPI, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from models import Usuario, Producto, Pedido, Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from passlib.hash import bcrypt_sha256

# =========================
# CONFIGURACIÓN BÁSICA
# =========================
app = FastAPI(title="API Librería Escolar")

DATABASE_URL = "sqlite:///./database.db"
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine)

Base.metadata.create_all(bind=engine)

# =========================
# PERMITIR CONEXIÓN DESDE EL FRONTEND
# =========================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # cambiar luego si quieres restringir
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# =========================
# ENDPOINTS
# =========================

@app.get("/")
def home():
    return {"mensaje": "✅ API de Librería Escolar funcionando correctamente"}


# ---------- REGISTRO ----------
@app.post("/register")
async def register(
    nombre: str = Form(...),
    email: str = Form(...),
    password: str = Form(...)
):
    db = SessionLocal()

    # Verificar si el email ya existe
    existente = db.query(Usuario).filter(Usuario.email == email).first()
    if existente:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")

    # Crear usuario con contraseña cifrada
    hashed_pass = bcrypt_sha256.hash(password)
    nuevo_usuario = Usuario(nombre=nombre, email=email, password=hashed_pass)

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)

    return {
        "id": nuevo_usuario.id,
        "nombre": nuevo_usuario.nombre,
        "email": nuevo_usuario.email
    }


# ---------- LOGIN ----------
@app.post("/login")
async def login(
    email: str = Form(...),
    password: str = Form(...)
):
    db = SessionLocal()
    usuario = db.query(Usuario).filter(Usuario.email == email).first()

    if not usuario or not bcrypt_sha256.verify(password, usuario.password):
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")

    return {
        "id": usuario.id,
        "nombre": usuario.nombre,
        "email": usuario.email
    }


# ---------- LISTAR PRODUCTOS ----------
@app.get("/productos")
def get_productos():
    db = SessionLocal()
    productos = db.query(Producto).all()

    return [
        {
            "id": p.id,
            "nombre": p.nombre,
            "categoria": p.categoria,
            "precio": p.precio,
            "stock": p.stock,
        }
        for p in productos
    ]


# ---------- CREAR PEDIDO ----------
@app.post("/pedidos")
def crear_pedido(usuario_id: int = Form(...), producto_id: int = Form(...), cantidad: int = Form(...)):
    db = SessionLocal()
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    producto = db.query(Producto).filter(Producto.id == producto_id).first()

    if not usuario or not producto:
        raise HTTPException(status_code=404, detail="Usuario o producto no encontrado")

    if producto.stock < cantidad:
        raise HTTPException(status_code=400, detail="Stock insuficiente")

    producto.stock -= cantidad
    pedido = Pedido(usuario_id=usuario.id, producto_id=producto.id, cantidad=cantidad)
    db.add(pedido)
    db.commit()

    return {"mensaje": f"Pedido realizado correctamente de {cantidad} unidad(es) de {producto.nombre}"}


# ---------- LISTAR PEDIDOS ----------
@app.get("/pedidos")
def listar_pedidos():
    db = SessionLocal()
    pedidos = db.query(Pedido).all()
    return [
        {
            "id": p.id,
            "usuario_id": p.usuario_id,
            "producto_id": p.producto_id,
            "cantidad": p.cantidad,
        }
        for p in pedidos
    ]


# ---------- PRODUCTO POR ID ----------
@app.get("/productos/{producto_id}")
def get_producto(producto_id: int):
    db = SessionLocal()
    producto = db.query(Producto).filter(Producto.id == producto_id).first()

    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    return {
        "id": producto.id,
        "nombre": producto.nombre,
        "categoria": producto.categoria,
        "precio": producto.precio,
        "stock": producto.stock,
    }


# ---------- LISTAR USUARIOS ----------
@app.get("/usuarios")
def get_usuarios():
    db = SessionLocal()
    usuarios = db.query(Usuario).all()
    return [
        {"id": u.id, "nombre": u.nombre, "email": u.email}
        for u in usuarios
    ]

# ---------- PERFIL DE USUARIO ----------
@app.get("/perfil/{usuario_id}")
def get_perfil(usuario_id: int):
    db = SessionLocal()
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()

    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    return {
        "id": usuario.id,
        "nombre": usuario.nombre,
        "email": usuario.email
    }


# ---------- ACTUALIZAR PRODUCTO ----------
@app.put("/productos/{producto_id}")
def actualizar_producto(
    producto_id: int,
    nombre: str = Form(None),
    categoria: str = Form(None),
    precio: float = Form(None),
    stock: int = Form(None)
):
    db = SessionLocal()
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    
    if nombre is not None:
        producto.nombre = nombre
    if categoria is not None:
        producto.categoria = categoria
    if precio is not None:
        producto.precio = precio
    if stock is not None:
        producto.stock = stock
    
    db.commit()
    return {"mensaje": "Producto actualizado correctamente"}

# ---------- ELIMINAR PEDIDO ----------
@app.delete("/pedidos/{pedido_id}")
def eliminar_pedido(pedido_id: int):
    db = SessionLocal()
    pedido = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    
    if not pedido:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    
    # Restaurar stock del producto
    producto = db.query(Producto).filter(Producto.id == pedido.producto_id).first()
    if producto:
        producto.stock += pedido.cantidad
    
    db.delete(pedido)
    db.commit()
    
    return {"mensaje": "Pedido eliminado y stock restaurado"}

# ---------- ACTUALIZAR USUARIO ----------
@app.put("/usuarios/{usuario_id}")
def actualizar_usuario(
    usuario_id: int,
    nombre: str = Form(None),
    email: str = Form(None)
):
    db = SessionLocal()
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    
    if nombre is not None:
        usuario.nombre = nombre
    if email is not None:
        # Verificar si el email ya existe en otro usuario
        existente = db.query(Usuario).filter(Usuario.email == email, Usuario.id != usuario_id).first()
        if existente:
            raise HTTPException(status_code=400, detail="El email ya está en uso")
        usuario.email = email
    
    db.commit()
    return {"mensaje": "Usuario actualizado correctamente"}

# ---------- PEDIDOS POR USUARIO ----------
@app.get("/usuarios/{usuario_id}/pedidos")
def get_pedidos_usuario(usuario_id: int):
    db = SessionLocal()
    pedidos = db.query(Pedido).filter(Pedido.usuario_id == usuario_id).all()
    
    return [
        {
            "id": p.id,
            "producto_id": p.producto_id,
            "producto_nombre": p.producto.nombre,
            "cantidad": p.cantidad,
            "precio_unitario": p.producto.precio,
            "total": p.cantidad * p.producto.precio
        }
        for p in pedidos
    ]