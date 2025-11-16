# seed.py
from models import Producto, Base, Usuario, Categoria
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from passlib.hash import bcrypt_sha256
import os

DB = "sqlite:///./database.db"
engine = create_engine(DB, connect_args={"check_same_thread": False})
Session = sessionmaker(bind=engine)
db = Session()

# crear tablas si no existen
Base.metadata.create_all(bind=engine)

# limpiar tablas (tené cuidado)
db.query(Producto).delete()
db.query(Usuario).delete()
db.query(Categoria).delete()
db.commit()

# crear categorias
cat1 = Categoria(nombre="Cuadernos")
cat2 = Categoria(nombre="Escritura")
cat3 = Categoria(nombre="Mochilas")
db.add_all([cat1, cat2, cat3])
db.commit()

# usuario admin y demo
admin = Usuario(nombre="Admin", email="admin@libreria.com", password=bcrypt_sha256.hash("admin123"), rol="admin")
usuario_demo = Usuario(nombre="Cliente Demo", email="demo@libreria.com", password=bcrypt_sha256.hash("123456"))
db.add_all([admin, usuario_demo])
db.commit()

# productos demo (ejemplos)
productos = [
    Producto(nombre="Cuaderno A4 Avon", categoria_id=cat1.id, precio=2500, stock=20, descripcion="Cuaderno 48 hojas"),
    Producto(nombre="Lápiz Faber Castell", categoria_id=cat2.id, precio=500, stock=50, descripcion="Lápiz HB"),
    Producto(nombre="Mochila Escolar", categoria_id=cat3.id, precio=15000, stock=15, descripcion="Mochila resistente"),
]
db.add_all(productos)
db.commit()

print("✅ Seed ejecutado: admin y demo creados, productos cargados.")
print("Admin -> email: admin@libreria.com  pass: admin123")
print("Usuario demo -> email: demo@libreria.com  pass: 123456")
