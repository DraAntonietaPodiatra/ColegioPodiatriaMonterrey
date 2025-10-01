# Sistema de Exámenes PodiaClass

Este directorio contiene el sistema modular de exámenes para la plataforma PodiaClass del Colegio de Podiatría de Monterrey.

## Estructura de Archivos

```
examenes/
├── css/
│   └── examen-base.css          # Estilos base reutilizables
├── js/
│   └── examen-base.js           # Lógica JavaScript reutilizable
├── cirugia-ungueal-parcial1.html # Primer examen implementado
├── plantilla-examen.html        # Plantilla para nuevos exámenes
└── README.md                    # Este archivo
```

## Características del Sistema

### ✅ Funcionalidades Implementadas

- **Autenticación Dual**: Matrícula para estudiantes, contraseña para profesores
- **Contraseña Profesora**: `LEONIDAS` para Dra. Antonieta Alejandra Acosta Grajales
- **Guardado de Progreso**: Los exámenes se guardan automáticamente
- **Prevención de Reenvío**: No se puede reiniciar un examen completado
- **Caso de Estudio con IA**: Generación automática con Gemini API
- **Diseño Responsivo**: Funciona en desktop y móvil
- **Temas Consistentes**: Colores y estilos del Colegio de Podiatría

### 🎨 Diseño

- **Colores Institucionales**: Azul oscuro (#012130), azul medio (#013b56), dorado (#c5a473)
- **Tipografía**: Lato (Google Fonts)
- **Iconografía**: Lucide Icons
- **Layout**: Centrado, tarjetas con sombras, animaciones suaves

## Cómo Crear un Nuevo Examen

### Paso 1: Copiar la Plantilla

```bash
cp plantilla-examen.html mi-nuevo-examen.html
```

### Paso 2: Configurar el Examen

Edita la sección `examConfig` en el archivo HTML:

```javascript
const examConfig = {
    examId: 'anatomia_parcial1',           // ID único
    examTitle: 'Examen Parcial Anatomía',  // Título visible
    questions: [
        {
            section: "Nombre de la Sección",
            question: "Texto de la pregunta...",
            options: [
                "A) Opción 1",
                "B) Opción 2", 
                "C) Opción 3",
                "D) Opción 4"
            ],
            answer: "A) Opción 1",         // Debe coincidir exactamente
            feedback: "Explicación..."
        },
        // Más preguntas...
    ]
};
```

### Paso 3: Actualizar Metadatos

- Cambiar el `<title>` del documento
- Actualizar el título en `<h1 class="titulo-examen">`
- Actualizar el nombre del profesor en `<p class="subtitulo-examen">`

### Paso 4: Agregar al Dashboard

En `plataforma.html`, agregar un enlace al nuevo examen:

```html
<a href="examenes/mi-nuevo-examen.html" class="btn btn-primary" target="_blank">
    Iniciar Mi Examen
</a>
```

## Autenticación

### Para Estudiantes
- Seleccionar nombre de la lista
- Ingresar número de matrícula
- Sistema valida automáticamente

### Para Profesores
- Seleccionar "Dra. Antonieta Alejandra Acosta Grajales (Profesora)"
- Ingresar contraseña: `LEONIDAS`
- Acceso completo al sistema

## Base de Datos de Usuarios

Los usuarios están definidos en `js/examen-base.js`:

```javascript
const studentData = {
    "NOMBRE ESTUDIANTE": { matricula: 1234, role: "Alumno" },
    "Dra. Antonieta Alejandra Acosta Grajales": { 
        matricula: "PROF", 
        role: "Profesor", 
        password: "LEONIDAS" 
    }
};
```

## Caso de Estudio con IA

### Configuración de Gemini API

1. Obtener clave en [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Configurar en cada examen:

```javascript
const GEMINI_API_KEY = "tu_clave_aqui";
```

### Funcionalidad

- Se genera automáticamente para estudiantes con respuestas incorrectas
- Basado en temas donde falló el estudiante
- Incluye fuentes académicas consultadas
- Preguntas de refuerzo con explicaciones

## Almacenamiento Local

### Claves de LocalStorage

- `exam_completed_{examId}_{identifier}`: Marca examen como completado
- `exam_state_{examId}_{identifier}`: Estado temporal del examen

### Identificadores

- Estudiantes: Número de matrícula
- Profesores: "PROF"

## Personalización de Estilos

### Variables CSS Principales

```css
:root {
    --colegio-dark-blue: #012130;
    --colegio-medium-blue: #013b56;
    --colegio-gold: #c5a473;
    --bg-soft: #f4f7f9;
    --text-dark: #212529;
    --text-light: #495057;
}
```

### Clases Principales

- `.examen-container`: Contenedor principal
- `.examen-wrapper`: Tarjeta del examen
- `.pantalla-inicio`, `.pantalla-examen`, etc.: Pantallas específicas
- `.btn`, `.btn-principal`, `.btn-oro`: Botones

## Desarrollo Futuro

### Funcionalidades Planificadas

- [ ] Panel de administración para profesores
- [ ] Reportes de calificaciones
- [ ] Sistema de videos/clases
- [ ] Múltiples exámenes por materia
- [ ] Exportación de resultados
- [ ] Integración con backend

### Estructura de Datos para Backend

```json
{
    "examId": "cirugia_ungueal_parcial1",
    "studentName": "NOMBRE ESTUDIANTE",
    "studentId": 5853,
    "score": 18,
    "totalQuestions": 20,
    "percentage": 90,
    "timestamp": "2025-01-10T20:13:00Z",
    "answers": [...],
    "sections": {...}
}
```

## Soporte y Mantenimiento

### Archivos a Modificar para Cambios Globales

- **Estilos**: `css/examen-base.css`
- **Lógica**: `js/examen-base.js`
- **Usuarios**: Actualizar `studentData` en ambos archivos
- **Plantilla**: `plantilla-examen.html`

### Testing

1. Probar autenticación de estudiantes y profesores
2. Verificar guardado de progreso
3. Comprobar prevención de reenvío
4. Validar responsividad en móvil
5. Probar caso de estudio con IA (si está configurado)

---

**Desarrollado para el Colegio de Podiatría de Monterrey**  
*Sistema modular y escalable para evaluaciones académicas*
