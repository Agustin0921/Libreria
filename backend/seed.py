# seed.py - VERSIÓN ACTUALIZADA CON TUS PRODUCTOS
from models import Producto, Base, Usuario
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from passlib.hash import bcrypt_sha256

engine = create_engine("sqlite:///./database.db", connect_args={"check_same_thread": False})
Session = sessionmaker(bind=engine)
db = Session()

# Limpiar tablas existentes
db.query(Producto).delete()
db.query(Usuario).delete()
db.commit()

# Usuario de prueba
usuario_prueba = Usuario(
    nombre="Cliente Demo",
    email="demo@libreria.com",
    password=bcrypt_sha256.hash("123456")
)
db.add(usuario_prueba)

# TUS 22 PRODUCTOS DEL HTML (con los mismos IDs)
productos = [
    # Mantén los mismos IDs que en tu HTML
    Producto(id=1, nombre="Cuaderno A4 Avon", categoria="Cuadernos", precio=2500, stock=20),
    Producto(id=2, nombre="Lápiz Faber Castell", categoria="Escritura", precio=500, stock=50),
    Producto(id=3, nombre="Mochila Escolar", categoria="Mochilas", precio=15000, stock=15),
    Producto(id=8, nombre="Cartuchera Triple Compartimento", categoria="Accesorios", precio=4500, stock=12),
    Producto(id=9, nombre="Marcadores Pastel", categoria="Escritura", precio=2800, stock=25),
    Producto(id=10, nombre="Resaltadores Fluorescentes", categoria="Escritura", precio=2200, stock=30),
    Producto(id=11, nombre="Tijera Sky", categoria="Papelería", precio=1600, stock=18),
    Producto(id=12, nombre="Corrector Líquido", categoria="Escritura", precio=1200, stock=22),
    Producto(id=13, nombre="Regla de 30cm y Semicirculo", categoria="Geometría", precio=800, stock=25),
    Producto(id=14, nombre="Cuaderno Potosí 48h", categoria="Cuadernos", precio=3200, stock=20),
    Producto(id=15, nombre="Mochila Deportiva Escolar", categoria="Mochilas", precio=18000, stock=10),
    Producto(id=16, nombre="Pegamento en Barra 40g", categoria="Papelería", precio=900, stock=40),
    Producto(id=17, nombre="Compás Escolar", categoria="Geometría", precio=2600, stock=15),
    Producto(id=18, nombre="Cuaderno Gloria 48h", categoria="Cuadernos", precio=7000, stock=18),
    Producto(id=19, nombre="Lapicera Sky Azul", categoria="Escritura", precio=1000, stock=35),
    Producto(id=20, nombre="Goma Filgo", categoria="Escritura", precio=500, stock=60),
    Producto(id=21, nombre="Sacapuntas", categoria="Escritura", precio=1900, stock=20),
    Producto(id=22, nombre="Felpon Permanente", categoria="Escritura", precio=900, stock=25),
]

db.add_all(productos)
db.commit()

print(f"✅ {len(productos)} productos y usuario demo cargados exitosamente!")