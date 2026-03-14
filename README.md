# DK Electronic — Tienda Online de Electrodomésticos

Tienda e-commerce estática para **República Dominicana**, desplegada en **GitHub Pages**. Vende televisores, aires acondicionados y electrodomésticos de las marcas Samsung, LG, Sony, Midea y Whirlpool. Los pedidos se canalizan a través de WhatsApp.

🌐 **Sitio en vivo:** [https://reynanthony.github.io/dk-electronic/](https://reynanthony.github.io/dk-electronic/)

---

## 🏗️ Arquitectura

```
dk-electronic/
├── index.html              # Página principal (catálogo general)
├── categoria.html          # Página de categoría dinámica
├── televisores.html        # Alias estático → redirige a categoría
├── aires.html
├── electrodomesticos.html
├── garantia.html           # Página de garantía
├── envios.html             # Información de envíos
├── contacto.html           # Formulario de contacto
│
├── app-publico.js          # ⭐ JS principal del frontend público
├── dataStore.js            # Store centralizado (carga todos los JSONs)
├── navigation.js           # Renderiza nav y footer dinámicamente
│
├── productos.json          # 📦 Base de datos de productos (editada por el admin)
├── categorias.json         # Categorías disponibles
├── marcas.json             # Marcas para el banner
├── promociones.json        # Promociones del carrusel
├── tienda.json             # Configuración de la tienda (WhatsApp, nombre)
├── version.json            # Control de versión para cache-busting
│
├── sw.js                   # Service Worker (PWA, soporte offline)
├── manifest.json           # Configuración PWA
│
├── imagenes/               # Logos de marcas (SVG)
├── logo/                   # Logo de DK Electronic
├── videos/                 # Videos promocionales
│
├── push.bat                # Script de deploy manual (Windows)
│
└── admin-app/              # App de administración (Electron, uso interno)
    ├── src/
    ├── package.json
    └── ...
```

### Flujo de datos

```
GitHub Pages → JSONs estáticos → DataStore.js (singleton) → app-publico.js → DOM
```

El admin modifica `productos.json` localmente y hace push con `push.bat` o desde el panel admin embedded (que usa la GitHub API con un token personal).

---

## 🚀 Setup Local

### Requisitos
- Cualquier servidor HTTP estático (Live Server de VSCode, Python, etc.)
- **No** se requiere Node.js para el frontend

### Iniciar localmente

```bash
# Opción 1: Python
python -m http.server 8080

# Opción 2: Node http-server
npx http-server -p 8080

# Opción 3: VSCode Live Server (extensión)
# Click derecho en index.html → "Open with Live Server"
```

Abrir en `http://localhost:8080`

---

## 📦 Deploy a GitHub Pages

### Manual (con push.bat)
```bat
push.bat "mensaje del commit"
```

### Configurar el panel Admin integrado
1. Presionar `Ctrl+K` en el sitio para abrir el panel de login
2. En el primer acceso, se te pedirá **establecer** una contraseña (mínimo 6 caracteres)
3. Una vez dentro, ir a **⚙️ Configurar GitHub** e ingresar tu [GitHub Personal Access Token](https://github.com/settings/tokens/new?scopes=repo&description=DK-Electronic) con permisos `repo`
4. Usar **🌐 Publicar Cambios** para subir los cambios directamente desde el navegador

> ⚠️ El token de GitHub se guarda en `sessionStorage` del navegador. Nunca lo compartas ni lo incluyas en el código.

---

## ✏️ Cómo agregar/editar contenido

### Agregar un producto
Editar `productos.json` directamente, o usar el Panel Admin en el sitio.

Estructura de un producto:
```json
{
  "id": 1,
  "nombre": "Smart TV Samsung 55\"",
  "descripcion": "Resolución 4K UHD, HDR10+",
  "precio": 45000,
  "categoria": "televisores",
  "imagen": "https://...",
  "destacado": true,
  "garantia": true,
  "garantiaAnios": 2,
  "garantiaCond": "Garantía de fábrica"
}
```

### Agregar una categoría
Editar `categorias.json`:
```json
{
  "nombre": "Refrigeradoras",
  "slug": "refrigeradoras",
  "imagen": "https://..."
}
```

---

## 🔒 Seguridad

- La contraseña del admin se establece en el **primer acceso** y se guarda en `localStorage` encriptada por el propio navegador
- **No existe contraseña por defecto** — el admin debe establecer una al primer uso
- El token de GitHub se usa solo en `sessionStorage` y se borra al cerrar la pestaña
- Todos los datos de productos se sanitizan antes de insertarse en el DOM (prevención XSS)

---

## 🛠️ Tecnologías

| Tecnología | Uso |
|-----------|-----|
| HTML5 + CSS3 | Estructura y estilos base |
| Tailwind CSS (CDN) | Utilidades de estilo |
| Vanilla JavaScript (ES2020+) | Toda la lógica de la app |
| GitHub Pages | Hosting estático gratuito |
| GitHub API | Publicación de cambios desde el admin |
| WhatsApp API | Canal de ventas y contacto |
| Service Worker | Soporte PWA/offline básico |

---

## 📄 Licencia

MIT © 2026 DK Electronic
