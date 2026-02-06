# 🚀 Guía de Despliegue en Render

Tu aplicación Pokédex necesita **2 servicios separados** en Render:

## 📋 Paso 1: Desplegar el Backend (Servidor Socket.io)

### Crear un **Web Service**

1. En Render Dashboard, clic en **"New +"** → **"Web Service"**
2. Conecta tu repositorio GitHub `ToonCharly/Pokedex`
3. Configura:

```
Name: pokedex-server (o el nombre que prefieras)
Region: Cualquiera
Branch: main
Root Directory: server
Runtime: Node
Build Command: npm install
Start Command: node server.js
Instance Type: Free
```

### Environment Variables (Variables de Entorno):

Agregar estas variables:

| Nombre | Valor |
|--------|-------|
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | `https://pokedex.onrender.com` (⚠️ CAMBIA ESTO por la URL de tu frontend una vez desplegado) |

4. Clic en **"Create Web Service"**
5. **⚠️ IMPORTANTE**: Copia la URL del servicio desplegado (ej: `https://pokedex-server.onrender.com`)

---

## 🎨 Paso 2: Desplegar el Frontend (React + Vite)

### Crear un **Static Site**

1. En Render Dashboard, clic en **"New +"** → **"Static Site"**
2. Conecta tu repositorio GitHub `ToonCharly/Pokedex`
3. Configura:

```
Name: pokedex (o el nombre que prefieras)
Branch: main
Root Directory: (dejar VACÍO - raíz del proyecto)
Build Command: npm install && npm run build
Publish Directory: dist
```

### Environment Variables (Variables de Entorno):

Agregar esta variable:

| Nombre | Valor |
|--------|-------|
| `VITE_SERVER_URL` | `https://pokedex-server.onrender.com` (⚠️ USA LA URL de tu backend del Paso 1) |

4. Clic en **"Create Static Site"**

---

## 🔄 Paso 3: Actualizar el Backend con la URL del Frontend

1. Ve al servicio **pokedex-server** en Render
2. Entra en **Environment**
3. Actualiza la variable `FRONTEND_URL` con la URL real de tu frontend
4. Render redesplegará automáticamente el servidor

---

## ✅ Verificación

Tu aplicación debería estar funcionando:

- **Frontend**: `https://pokedex.onrender.com` (o el nombre que elegiste)
- **Backend**: `https://pokedex-server.onrender.com`

### Probar la Batalla:

1. Abre dos pestañas con tu frontend
2. Entra a "Batalla" en ambas
3. Selecciona Pokémon en ambas
4. ¡Deberían poder batallar!

---

## 🐛 Troubleshooting

### Error "Failed to connect to server":

- Verifica que `VITE_SERVER_URL` en el frontend apunte a la URL correcta del backend
- Verifica que el backend esté corriendo (verde en Render Dashboard)

### CORS errors:

- Verifica que `FRONTEND_URL` en el backend tenga la URL correcta del frontend
- Asegúrate de que `NODE_ENV=production` esté configurado en el backend

### El backend se queda "dormido":

- Los servicios gratuitos de Render se duermen después de 15 minutos de inactividad
- La primera conexión puede tardar ~30 segundos en "despertar" el servidor

---

## 💡 Notas Importantes

- **Ambos servicios deben estar desplegados** para que la aplicación funcione
- Las batallas solo funcionan con el servidor backend activo
- En el plan gratuito, los servicios se duermen después de inactividad
- Puedes ver los logs en tiempo real en cada servicio de Render

---

## 🔄 Redeploy Automático

Cada vez que hagas `git push` a tu rama `main`, Render redesplegará automáticamente ambos servicios.
