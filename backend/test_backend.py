import requests
import json

BASE_URL = "http://127.0.0.1:8000"

def test_endpoint(endpoint, method="GET", data=None):
    try:
        if method == "GET":
            response = requests.get(f"{BASE_URL}{endpoint}")
        elif method == "POST":
            response = requests.post(f"{BASE_URL}{endpoint}", data=data)
        elif method == "PUT":
            response = requests.put(f"{BASE_URL}{endpoint}", data=data)
        elif method == "DELETE":
            response = requests.delete(f"{BASE_URL}{endpoint}")
        
        print(f"🔍 {method} {endpoint}: {response.status_code}")
        if response.status_code == 200:
            print("✅ Éxito")
            if response.content:
                return response.json()
        else:
            print(f"❌ Error: {response.text}")
        return None
    except Exception as e:
        print(f"🚨 Error de conexión: {e}")
        return None

print("=== INICIANDO PRUEBAS DEL BACKEND ===")

# 1. Probar endpoints básicos
test_endpoint("/")
test_endpoint("/productos")
test_endpoint("/usuarios")
test_endpoint("/pedidos")

# 2. Probar producto específico
test_endpoint("/productos/1")

# 3. Probar registro de usuario
user_data = {
    "nombre": "Usuario Test",
    "email": "test@ejemplo.com",
    "password": "123456"
}
test_endpoint("/register", "POST", user_data)

# 4. Probar login
login_data = {
    "email": "demo@libreria.com",
    "password": "123456"
}
test_endpoint("/login", "POST", login_data)

print("=== PRUEBAS COMPLETADAS ===")