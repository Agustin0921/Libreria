# models.py
from sqlalchemy import Column, Integer, String, Float, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship, declarative_base
from datetime import datetime

Base = declarative_base()

class Usuario(Base):
    __tablename__ = "usuarios"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    rol = Column(String, default="cliente")  # 'cliente' o 'admin'
    pedidos = relationship("Pedido", back_populates="usuario")
    carrito_items = relationship("CarritoItem", back_populates="usuario")

class Categoria(Base):
    __tablename__ = "categorias"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, unique=True, nullable=False)
    productos = relationship("Producto", back_populates="categoria")

class Producto(Base):
    __tablename__ = "productos"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    categoria_id = Column(Integer, ForeignKey("categorias.id"), nullable=True)
    categoria = relationship("Categoria", back_populates="productos")
    precio = Column(Float, nullable=False)
    stock = Column(Integer, default=0)
    imagen = Column(String, nullable=True)  # ruta o URL de la imagen
    descripcion = Column(String, nullable=True)
    pedidos = relationship("Pedido", back_populates="producto")
    carrito_items = relationship("CarritoItem", back_populates="producto")

class Pedido(Base):
    __tablename__ = "pedidos"
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    producto_id = Column(Integer, ForeignKey("productos.id"))
    cantidad = Column(Integer, nullable=False)
    precio_unitario = Column(Float, nullable=False)
    total = Column(Float, nullable=False)
    estado = Column(String, default="pendiente")  # pendiente, enviado, entregado, cancelado
    fecha = Column(DateTime, default=datetime.utcnow)

    usuario = relationship("Usuario", back_populates="pedidos")
    producto = relationship("Producto", back_populates="pedidos")

class CarritoItem(Base):
    __tablename__ = "carrito_items"
    id = Column(Integer, primary_key=True, index=True)
    usuario_id = Column(Integer, ForeignKey("usuarios.id"))
    producto_id = Column(Integer, ForeignKey("productos.id"))
    cantidad = Column(Integer, default=1)

    usuario = relationship("Usuario", back_populates="carrito_items")
    producto = relationship("Producto", back_populates="carrito_items")
