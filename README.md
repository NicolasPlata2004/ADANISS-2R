# Kairos 2.0 — Deploy en Firebase Hosting

## ✅ Estado actual
La app está lista para producción:
- Sin barra de developer
- Logo real desde `logo.png`
- Persistencia en `localStorage`
- Scheduler dinámico
- Responsive (desktop sidebar + mobile)

---

## 🚀 Deploy en Firebase

### 1. Instala Firebase CLI (solo la primera vez)
```bash
npm install -g firebase-tools
```

### 2. Inicia sesión
```bash
firebase login
```

### 3. Crea un proyecto en Firebase Console
Ve a https://console.firebase.google.com/  
→ **Add project** → ponle el nombre que quieras (ej. `kairos-planner`)

### 4. Actualiza `.firebaserc`
Abre el archivo `.firebaserc` y cambia `"kairos-app"` por el **Project ID** real de tu proyecto:
```json
{
  "projects": {
    "default": "TU-PROJECT-ID-AQUI"
  }
}
```

### 5. Deploy
Desde la carpeta del proyecto (`Kairos 2.0`):
```bash
firebase deploy --only hosting
```

✅ Firebase te dará una URL tipo:  
`https://TU-PROYECTO.web.app`

---

## 📁 Archivos que se publican
- `index.html` — entrada principal
- `logo.png` — logo de la app
- `styles.css` — estilos
- `store.jsx`, `scheduler.jsx`, `ui.jsx` — lógica central
- `screens-*.jsx` — pantallas
- `prototype.jsx` — router

Los archivos ignorados están en `firebase.json` bajo `"ignore"`.

---

## 🔄 Actualizaciones futuras
Cada vez que hagas cambios, solo ejecuta:
```bash
firebase deploy --only hosting
```

---

## 🌐 Alternativas de hosting gratuito
Si prefieres no usar Firebase:
- **Netlify**: arrastra la carpeta a https://app.netlify.com/drop
- **Vercel**: `npx vercel` desde la carpeta
- **GitHub Pages**: sube el repo y activa Pages desde Settings
