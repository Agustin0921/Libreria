# main.py (preparado para Render / producción)
import os
from datetime import datetime, timedelta
from typing import List

from fastapi import FastAPI, HTTPException, Form, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.hash import bcrypt_sha256
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from models import Usuario, Producto, Pedido, Base, Categoria, CarritoItem

# ---------------- Config ----------------
API_TITLE = "API Librería Escolar - Producción"
app = FastAPI(title=API_TITLE)

# Database: usa env var DATABASE_URL si existe (ej: sqlite:///./database.db o postgres URL)
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./database.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {})
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)

# Crear tablas si no existen
Base.metadata.create_all(bind=engine)

# JWT / Security
SECRET_KEY = os.getenv("SECRET_KEY", "CAMBIALO_POR_UNA_SECRETA_EN_RENDER")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60 * 24 * 7))  # 7 días por defecto

def crear_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def obtener_usuario_desde_token(token: str = Depends(oauth2_scheme)):
    db = SessionLocal()
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token inválido")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")
    usuario = db.query(Usuario).filter(Usuario.id == int(user_id)).first()
    if not usuario:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    return usuario

def verificar_admin(usuario: Usuario = Depends(obtener_usuario_desde_token)):
    if usuario.rol != "admin":
        raise HTTPException(status_code=403, detail="Permisos insuficientes")
    return usuario

# ---------------- CORS ----------------
# Orígenes permitidos: desde ENV o defaults (ajustar al dominio de tu frontend)
default_frontend = os.getenv("FRONTEND_ORIGIN", "https://agustin0921.github.io")
extra_origins = os.getenv("ALLOWED_ORIGINS", "")
origins = [default_frontend]
if extra_origins:
    origins += [o.strip() for o in extra_origins.split(",") if o.strip()]
# Allow localhost for testing
origins += ["http://localhost:8000", "http://127.0.0.1:8000"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=list(dict.fromkeys(origins)),  # unique
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------- Endpoints básicos ----------------
@app.get("/")
def root():
    return {"message": "API Librería Escolar - OK"}

@app.get("/health")
def health():
    return {"status": "ok", "database": DATABASE_URL}


# =========================
# JWT CONFIG
# =========================
SECRET_KEY = os.getenv("SECRET_KEY", "cambia_esto_por_una_clave_muy_segura")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 días

def crear_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

from fastapi.security import OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def obtener_usuario_desde_token(token: str = Depends(oauth2_scheme)):
    db = SessionLocal()
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: int = int(payload.get("sub"))
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token inválido")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")
    usuario = db.query(Usuario).filter(Usuario.id == user_id).first()
    if not usuario:
        raise HTTPException(status_code=401, detail="Usuario no encontrado")
    return usuario

def verificar_admin(usuario: Usuario = Depends(obtener_usuario_desde_token)):
    if usuario.rol != "admin":
        raise HTTPException(status_code=403, detail="Permisos insuficientes")
    return usuario

# =========================
# ENDPOINTS PÚBLICOS / AUTENTICACIÓN
# =========================

@app.get("/")
def home():
    return {"mensaje": "✅ API Librería Escolar profesional funcionando (compatible)"}

# token endpoint (OAuth2 password grant) - mantiene /token para clientes que lo usen
@app.post("/token")
def login_for_token(form_data: OAuth2PasswordRequestForm = Depends()):
    db = SessionLocal()
    usuario = db.query(Usuario).filter(Usuario.email == form_data.username).first()
    if not usuario or not bcrypt_sha256.verify(form_data.password, usuario.password):
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
    access_token = crear_token({"sub": str(usuario.id)})
    return {"access_token": access_token, "token_type": "bearer", "usuario": {"id": usuario.id, "nombre": usuario.nombre, "email": usuario.email, "rol": usuario.rol}}

# Legacy-login compatible con frontend que usa /login (Form POST)
@app.post("/login")
def login_legacy(email: str = Form(...), password: str = Form(...)):
    db = SessionLocal()
    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    if not usuario or not bcrypt_sha256.verify(password, usuario.password):
        raise HTTPException(status_code=401, detail="Usuario o contraseña incorrectos")
    token = crear_token({"sub": str(usuario.id)})
    # devolver formato fácil para frontend legacy: id, nombre, email, access_token
    return {"id": usuario.id, "nombre": usuario.nombre, "email": usuario.email, "access_token": token, "rol": usuario.rol}

# registro (crea usuario y devuelve token) - compatible
@app.post("/register")
def register(nombre: str = Form(...), email: str = Form(...), password: str = Form(...)):
    db = SessionLocal()
    existente = db.query(Usuario).filter(Usuario.email == email).first()
    if existente:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")
    hashed = bcrypt_sha256.hash(password)
    nuevo = Usuario(nombre=nombre, email=email, password=hashed)
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    token = crear_token({"sub": str(nuevo.id)})
    # devolver formato compatible
    return {"id": nuevo.id, "nombre": nuevo.nombre, "email": nuevo.email, "access_token": token, "rol": nuevo.rol}

# obtener perfil (protegido)
@app.get("/perfil")
def perfil(usuario: Usuario = Depends(obtener_usuario_desde_token)):
    return {"id": usuario.id, "nombre": usuario.nombre, "email": usuario.email, "rol": usuario.rol}

# =========================
# PRODUCTOS / CATEGORÍAS / BÚSQUEDA / PAGINACIÓN
# =========================

@app.get("/productos", tags=["productos"])
def listar_productos(q: str = None, categoria: str = None, page: int = 1, limit: int = 12):
    db = SessionLocal()
    query = db.query(Producto)
    if q:
        query = query.filter(Producto.nombre.ilike(f"%{q}%"))
    if categoria:
        # filtrar por nombre de categoría
        query = query.join(Producto.categoria).filter(Categoria.nombre == categoria)
    total = query.count()
    productos = query.offset((page - 1) * limit).limit(limit).all()
    result = []
    for p in productos:
        result.append({
            "id": p.id,
            "nombre": p.nombre,
            "categoria": p.categoria.nombre if p.categoria else None,
            "precio": p.precio,
            "stock": p.stock,
            "imagen": p.imagen,
            "descripcion": p.descripcion
        })
    return {"total": total, "page": page, "limit": limit, "productos": result}

# Legacy endpoint: devolver lista simple (compatibilidad con frontend antiguo)
@app.get("/productos/all")
def listar_productos_all():
    db = SessionLocal()
    productos = db.query(Producto).all()
    return [
        {
            "id": p.id,
            "nombre": p.nombre,
            "categoria": p.categoria.nombre if p.categoria else None,
            "precio": p.precio,
            "stock": p.stock,
            "imagen": p.imagen,
            "descripcion": p.descripcion
        } for p in productos
    ]

@app.get("/productos/{producto_id}")
def get_producto(producto_id: int):
    db = SessionLocal()
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    return {
        "id": producto.id,
        "nombre": producto.nombre,
        "categoria": producto.categoria.nombre if producto.categoria else None,
        "precio": producto.precio,
        "stock": producto.stock,
        "imagen": producto.imagen,
        "descripcion": producto.descripcion
    }

# subir imagen para producto (admin)
@app.post("/productos/{producto_id}/upload-image")
def upload_imagen_producto(producto_id: int, file: UploadFile = File(...), admin: Usuario = Depends(verificar_admin)):
    db = SessionLocal()
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    # guardar archivo en carpeta local "uploads"
    uploads_dir = "uploads"
    os.makedirs(uploads_dir, exist_ok=True)
    filename = f"{producto_id}_{file.filename}"
    filepath = os.path.join(uploads_dir, filename)
    with open(filepath, "wb") as f:
        f.write(file.file.read())
    producto.imagen = filepath
    db.commit()
    return {"mensaje": "Imagen subida", "imagen": filepath}

# crear/actualizar producto (admin)
@app.post("/productos", dependencies=[Depends(verificar_admin)])
def crear_producto(nombre: str = Form(...), precio: float = Form(...), stock: int = Form(...), categoria_id: int = Form(None), descripcion: str = Form(None)):
    db = SessionLocal()
    p = Producto(nombre=nombre, precio=precio, stock=stock, categoria_id=categoria_id, descripcion=descripcion)
    db.add(p)
    db.commit()
    db.refresh(p)
    return {"mensaje": "Producto creado", "producto_id": p.id}

@app.put("/productos/{producto_id}", dependencies=[Depends(verificar_admin)])
def actualizar_producto_admin(producto_id: int, nombre: str = Form(None), precio: float = Form(None), stock: int = Form(None), categoria_id: int = Form(None), descripcion: str = Form(None)):
    db = SessionLocal()
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    if nombre is not None: producto.nombre = nombre
    if precio is not None: producto.precio = precio
    if stock is not None: producto.stock = stock
    if categoria_id is not None: producto.categoria_id = categoria_id
    if descripcion is not None: producto.descripcion = descripcion
    db.commit()
    return {"mensaje": "Producto actualizado"}

# categorias
@app.get("/categorias")
def listar_categorias():
    db = SessionLocal()
    cats = db.query(Categoria).all()
    return [{"id": c.id, "nombre": c.nombre} for c in cats]

@app.post("/categorias", dependencies=[Depends(verificar_admin)])
def crear_categoria(nombre: str = Form(...)):
    db = SessionLocal()
    existente = db.query(Categoria).filter(Categoria.nombre == nombre).first()
    if existente:
        raise HTTPException(status_code=400, detail="Categoría ya existe")
    c = Categoria(nombre=nombre)
    db.add(c)
    db.commit()
    db.refresh(c)
    return {"id": c.id, "nombre": c.nombre}

# =========================
# CARRITO (persistido en DB)
# =========================

@app.get("/carrito")
def obtener_carrito(usuario: Usuario = Depends(obtener_usuario_desde_token)):
    db = SessionLocal()
    items = db.query(CarritoItem).filter(CarritoItem.usuario_id == usuario.id).all()
    result = []
    for it in items:
        result.append({
            "id": it.id,
            "producto_id": it.producto_id,
            "nombre": it.producto.nombre,
            "cantidad": it.cantidad,
            "precio_unitario": it.producto.precio,
            "imagen": it.producto.imagen
        })
    return result

@app.post("/carrito/add")
def agregar_carrito(producto_id: int = Form(...), cantidad: int = Form(1), usuario: Usuario = Depends(obtener_usuario_desde_token)):
    db = SessionLocal()
    producto = db.query(Producto).filter(Producto.id == producto_id).first()
    if not producto:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    if producto.stock < cantidad:
        raise HTTPException(status_code=400, detail="Stock insuficiente")
    existente = db.query(CarritoItem).filter(CarritoItem.usuario_id == usuario.id, CarritoItem.producto_id == producto_id).first()
    if existente:
        existente.cantidad += cantidad
    else:
        nuevo = CarritoItem(usuario_id=usuario.id, producto_id=producto_id, cantidad=cantidad)
        db.add(nuevo)
    db.commit()
    return {"mensaje": "Producto agregado al carrito"}

@app.post("/carrito/update")
def actualizar_carrito(item_id: int = Form(...), cantidad: int = Form(...), usuario: Usuario = Depends(obtener_usuario_desde_token)):
    db = SessionLocal()
    item = db.query(CarritoItem).filter(CarritoItem.id == item_id, CarritoItem.usuario_id == usuario.id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item de carrito no encontrado")
    if cantidad <= 0:
        db.delete(item)
    else:
        # validar stock
        if item.producto.stock < cantidad:
            raise HTTPException(status_code=400, detail="Stock insuficiente")
        item.cantidad = cantidad
    db.commit()
    return {"mensaje": "Carrito actualizado"}

@app.post("/carrito/clear")
def vaciar_carrito(usuario: Usuario = Depends(obtener_usuario_desde_token)):
    db = SessionLocal()
    db.query(CarritoItem).filter(CarritoItem.usuario_id == usuario.id).delete()
    db.commit()
    return {"mensaje": "Carrito vaciado"}

# =========================
# CHECKOUT -> convierte carrito en pedidos
# =========================

@app.post("/checkout")
def checkout(usuario: Usuario = Depends(obtener_usuario_desde_token)):
    db = SessionLocal()
    items: List[CarritoItem] = db.query(CarritoItem).filter(CarritoItem.usuario_id == usuario.id).all()
    if not items:
        raise HTTPException(status_code=400, detail="Carrito vacío")
    # validar stock
    for it in items:
        if it.producto.stock < it.cantidad:
            raise HTTPException(status_code=400, detail=f"Stock insuficiente para {it.producto.nombre}")
    total = 0
    pedidos_creados = []
    for it in items:
        precio_unit = it.producto.precio
        total_item = precio_unit * it.cantidad
        pedido = Pedido(usuario_id=usuario.id, producto_id=it.producto_id, cantidad=it.cantidad, precio_unitario=precio_unit, total=total_item)
        # bajar stock
        it.producto.stock -= it.cantidad
        db.add(pedido)
        pedidos_creados.append({"producto": it.producto.nombre, "cantidad": it.cantidad, "total": total_item})
        total += total_item
    # limpiar carrito
    db.query(CarritoItem).filter(CarritoItem.usuario_id == usuario.id).delete()
    db.commit()
    return {"mensaje": "Compra realizada", "total": total, "detalles": pedidos_creados}

# =========================
# PEDIDOS (cliente y admin)
# =========================
@app.get("/usuarios/pedidos")
def pedidos_usuario(usuario: Usuario = Depends(obtener_usuario_desde_token)):
    db = SessionLocal()
    pedidos = db.query(Pedido).filter(Pedido.usuario_id == usuario.id).all()
    return [{
        "id": p.id,
        "producto_id": p.producto_id,
        "producto_nombre": p.producto.nombre,
        "cantidad": p.cantidad,
        "precio_unitario": p.precio_unitario,
        "total": p.total,
        "estado": p.estado,
        "fecha": p.fecha.isoformat()
    } for p in pedidos]

@app.get("/pedidos", dependencies=[Depends(verificar_admin)])
def listar_todos_pedidos():
    db = SessionLocal()
    pedidos = db.query(Pedido).all()
    return [{
        "id": p.id,
        "usuario_id": p.usuario_id,
        "usuario_nombre": p.usuario.nombre,
        "producto_nombre": p.producto.nombre,
        "cantidad": p.cantidad,
        "total": p.total,
        "estado": p.estado,
        "fecha": p.fecha.isoformat()
    } for p in pedidos]

@app.put("/pedidos/{pedido_id}/estado", dependencies=[Depends(verificar_admin)])
def actualizar_estado_pedido(pedido_id: int, estado: str = Form(...)):
    db = SessionLocal()
    p = db.query(Pedido).filter(Pedido.id == pedido_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Pedido no encontrado")
    p.estado = estado
    db.commit()
    return {"mensaje": "Estado actualizado"}

# =========================
# USUARIOS (admin)
# =========================
@app.get("/usuarios", dependencies=[Depends(verificar_admin)])
def listar_usuarios():
    db = SessionLocal()
    usuarios = db.query(Usuario).all()
    return [{"id": u.id, "nombre": u.nombre, "email": u.email, "rol": u.rol} for u in usuarios]
