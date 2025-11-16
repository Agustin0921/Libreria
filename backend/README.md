# Librería Backend (FastAPI) - Deploy en Render

## Requisitos
- Cuenta en GitHub
- Cuenta en Render (https://render.com)

## Archivos principales
- main.py
- models.py
- seed.py
- requirements.txt
- render.yaml (opcional)

## Pasos rápidos
1. Subir el repo a GitHub (rama `main`).
2. En Render: New → Web Service → conectar con tu repo.
3. Build command: `pip install -r requirements.txt`.
4. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`.
5. En Settings > Environment > añadir variables de entorno:
   - SECRET_KEY: tu_clave_segura
   - DATABASE_URL: (opcional) ej: sqlite:///./database.db o postgres...
   - FRONTEND_ORIGIN: https://agustin0921.github.io
6. Desplegar. Cuando termine, Render te da la URL pública (ej: https://libreria-backend.onrender.com).

## Cargar datos iniciales
- Conectarse vía Shell de Render o ejecutar localmente `python seed.py` y subir `database.db` al repo.
- O bien, ejecutar `python seed.py` desde la Shell de Render (Dashboard > Shell).

## Notas
- Revisá los orígenes (CORS) si tu frontend está en otro dominio.
- Cambiá `SECRET_KEY` por una cadena segura y secreta.
