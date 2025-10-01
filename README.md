# PodiaClass - Plataforma Educativa del Colegio de Podiatría

Este repositorio contiene la plataforma educativa "PodiaClass" para el Colegio de Podiatría de Monterrey, incluyendo el sistema de exámenes en línea.

## 🏗️ Estructura del Proyecto

```
PodiaClass/
├── index.html              # Dashboard principal de la plataforma
├── style.css               # Estilos principales
├── script.js               # Lógica de autenticación y navegación
├── apps-script.gs          # Backend para Google Sheets (múltiples exámenes)
├── README.md               # Documentación completa
└── examenes/
    ├── css/
    │   └── examen-base.css # Estilos base para todos los exámenes
    ├── js/
    │   └── examen-base.js  # Lógica base para todos los exámenes
    ├── cirugia-ungueal-parcial1.html # Primer examen implementado
    ├── plantilla-examen.html         # Plantilla para nuevos exámenes
    └── README.md           # Documentación específica de exámenes
```

## 🚀 Características Principales

### ✅ **Funcionalidades Implementadas**

- **Autenticación Dual**: 
  - Estudiantes: Matrícula
  - Profesores: Contraseña `LEONIDAS`
- **Sistema de Exámenes**:
  - 20 preguntas del Primer Parcial de Cirugía Ungueal
  - Guardado automático de progreso
  - Prevención de reenvío
  - Caso de estudio personalizado con IA
- **Diseño Profesional**:
  - Colores institucionales del Colegio
  - Diseño responsivo
  - Animaciones suaves

### 🎨 **Diseño Visual**

- **Colores Institucionales**:
  - Azul oscuro: `#012130`
  - Azul medio: `#013b56` 
  - Dorado: `#c5a473`
- **Tipografía**: Lato (Google Fonts)
- **Iconografía**: Lucide Icons

## 📋 Instrucciones de Instalación

### 1. **Subir Archivos a GitHub**

Sube los siguientes archivos a la raíz de tu repositorio:

- `index.html`
- `style.css` 
- `script.js`
- `apps-script.gs`

Y la carpeta `examen/` completa.

### 2. **Configurar Google Sheets**

#### Crear la Hoja de Cálculo:

1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja de cálculo
3. Nómbrala "PodiaClass - Calificaciones"
4. Renombra la primera hoja como "Calificaciones"
5. Los encabezados se crearán automáticamente cuando ejecutes el Apps Script

#### Estructura de la Hoja (Múltiples Exámenes):
```
Timestamp | Nombre_Alumno | Matricula | Cirugía Ungueal P1 | Anatomía P1 | Fisiología P1 | ...
```

**Formato de Calificaciones**: `18/20 (90%)`

- **Verde**: ≥80% (Aprobado)
- **Amarillo**: 60-79% (Regular) 
- **Rojo**: <60% (Reprobado)

### 3. **Configurar Apps Script**

#### Desplegar el Backend:

1. En tu Hoja de Cálculo, ve a **Extensiones > Apps Script**
2. Elimina el código existente
3. Copia y pega el contenido completo de `apps-script.gs`
4. **IMPORTANTE**: Cambia `TU_SHEET_ID_AQUI` por el ID real de tu Google Sheet
5. Haz clic en **Implementar > Nueva implementación**
6. Configúralo como:
   - **Tipo**: Aplicación web
   - **Acceso**: Cualquier usuario
   - **Ejecutar como**: Yo
7. Haz clic en **Implementar**
8. **Copia la URL de la aplicación web** que se genere

#### Configurar la URL en el Examen:

1. Abre el archivo `examen/script.js`
2. Busca la línea: `const APPS_SCRIPT_URL = 'TU_URL_DE_APPS_SCRIPT_AQUI';`
3. Reemplaza `TU_URL_DE_APPS_SCRIPT_AQUI` con la URL que copiaste

### 4. **Configurar GitHub Pages (Opcional)**

Para hospedar la plataforma:

1. Ve a **Settings** de tu repositorio en GitHub
2. Busca **Pages** en el menú lateral
3. En **Source**, selecciona **Deploy from a branch**
4. Selecciona **main** branch y **/ (root)**
5. Haz clic en **Save**
6. Tu plataforma estará disponible en: `https://tu-usuario.github.io/PodiaClass`

## 👥 Usuarios del Sistema

### **Estudiantes**
- **Matrículas disponibles**: 5847, 5848, 5849, 5850, 5851, 5852, 5853, 5854, 5856, 5858
- **Proceso**: Seleccionar nombre → Ingresar matrícula → Acceder

### **Profesora**
- **Nombre**: Dra. Antonieta Alejandra Acosta Grajales (Profesora)
- **Contraseña**: `LEONIDAS`
- **Proceso**: Seleccionar nombre → Ingresar contraseña → Acceder

## 📊 Datos que se Guardan

Cada examen completado se guarda con:

- **Información del Estudiante**: Nombre, matrícula
- **Resultados**: Aciertos, total de preguntas, porcentaje
- **Detalles del Examen**: ID del examen, secciones evaluadas
- **Metadatos**: Timestamp, tiempo empleado, user agent

## 🔧 Personalización

### **Agregar Nuevos Exámenes**

#### Paso 1: Crear el Examen
1. Copia `examenes/plantilla-examen.html`
2. Renómbralo (ej: `examenes/anatomia-parcial1.html`)
3. Modifica el archivo:
   - Cambia el título del examen
   - Actualiza `examConfig` con las nuevas preguntas
   - Cambia el `examId` único

#### Paso 2: Actualizar Apps Script
En `apps-script.gs`, agrega el nuevo examen al mapeo:
```javascript
const EXAM_COLUMNS = {
    'cirugia_ungueal_parcial1': 'Cirugía Ungueal P1',
    'anatomia_parcial1': 'Anatomía P1',        // ← Nuevo examen
    'fisiologia_parcial1': 'Fisiología P1'
};
```

#### Paso 3: Agregar al Dashboard
En `index.html`, agrega un enlace al nuevo examen en la sección correspondiente.

#### Paso 4: Desplegar Cambios
1. Actualiza el Apps Script con el nuevo mapeo
2. Redespliega la aplicación web
3. La nueva columna se creará automáticamente cuando un estudiante complete el examen

### **Modificar Usuarios**

Edita la base de datos en `script.js`:

```javascript
const studentData = {
    "NUEVO ESTUDIANTE": { matricula: 1234, role: "Alumno" },
    // ... más usuarios
};
```

## 🐛 Solución de Problemas

### **Error: "URL de Apps Script no configurada"**
- Verifica que hayas reemplazado la URL en `examen/script.js`
- Asegúrate de que la URL sea correcta y accesible

### **Error: "Error al guardar en Google Sheets"**
- Verifica que el ID de la hoja esté correcto en `apps-script.gs`
- Asegúrate de que el Apps Script tenga permisos para editar la hoja
- Verifica que la hoja se llame exactamente "Calificaciones"

### **Error de Autenticación**
- Para estudiantes: Verifica que la matrícula coincida exactamente
- Para profesores: La contraseña debe ser exactamente `LEONIDAS`

## 📈 Próximas Funcionalidades

- [ ] Panel de administración para profesores
- [ ] Reportes de calificaciones con gráficos
- [ ] Sistema de videos y clases
- [ ] Múltiples exámenes por materia
- [ ] Notificaciones por email
- [ ] Exportación de resultados a PDF

## 📞 Soporte

Para soporte técnico o consultas sobre el sistema, contacta al equipo de desarrollo.

---

**Desarrollado para el Colegio de Podiatría de Monterrey**  
*Plataforma educativa moderna y escalable*
