from models import Producto, Base
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Conexión con la base SQLite
engine = create_engine("sqlite:///./database.db", connect_args={"check_same_thread": False})
Session = sessionmaker(bind=engine)
db = Session()

# Lista de productos iniciales
productos = [
    Producto(nombre="Cuaderno Rivadavia", categoria="Papelería", precio=2500, stock=20),
    Producto(nombre="Pack Escolar Primaria", categoria="Packs", precio=9500, stock=10),
    Producto(nombre="Bolígrafo Azul", categoria="Escritura", precio=400, stock=50),
]

db.add_all(productos)
db.commit()

print("✅ Productos cargados con éxito en la base de datos.")
