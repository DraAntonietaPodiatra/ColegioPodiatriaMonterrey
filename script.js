// --- BASE DE DATOS DE ALUMNOS Y MATRÍCULAS ---
const studentData = {
    
    // ALUMNOS REALES
    "CESARINA SOLEDAD LOPEZ FERNANDEZ": { matricula: 5853, role: "Alumno" },
    "SOFIA CASTAÑEDA SUAREZ": { matricula: 5849, role: "Alumno" },
    "JESUS MANUEL VEGA LOPEZ": { matricula: 5850, role: "Alumno" },
    "EDGAR ALFREDO SANCHEZ LIRA": { matricula: 5858, role: "Alumno" },
    "RICARDO ALEJANDRO ROMO GONZALEZ": { matricula: 5854, role: "Alumno" },
    "KEVIN ANTONIO GUTIERREZ PACHECO": { matricula: 5848, role: "Alumno" },
    "DIANA LAURA BAÑUELOS REYES": { matricula: 5847, role: "Alumno" },
    "GEORGINA VILLALPANDO LÓPEZ": { matricula: 5856, role: "Alumno" },
    "JAQUELINE GUADALUPE VERA CABRERA": { matricula: 5851, role: "Alumno" },
    "MARIA SUSANA HERNANDEZ PAULA": { matricula: 5852, role: "Alumno" },
    
    // Profesora con contraseña LEONIDAS
    "Dra. Antonieta Alejandra Acosta Grajales": { matricula: "PROF", role: "Profesor", password: "LEONIDAS" }
};

// --- REFERENCIAS AL DOM ---
let studentNameSelect, studentMatriculaInput, studentPasswordInput, loginButton;
let userAvatar, userName, userRole, welcomeMessage;

document.addEventListener('DOMContentLoaded', () => {
    // Obtener referencias del DOM
    studentNameSelect = document.getElementById('studentName');
    studentMatriculaInput = document.getElementById('studentMatricula');
    studentPasswordInput = document.getElementById('studentPassword');
    loginButton = document.getElementById('login-button');
    
    userAvatar = document.getElementById('user-avatar');
    userName = document.getElementById('user-name');
    userRole = document.getElementById('user-role');
    welcomeMessage = document.getElementById('welcome-message');
    
    // Configurar listeners
    setupLoginListeners();
    
    // Inicializar iconos después de que todo esté listo
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    } else {
        console.warn('Lucide no está disponible');
    }

    // Lógica para manejar la sesión del dashboard
    const loginScreen = document.getElementById('login-screen');
    const appLayout = document.querySelector('.app-layout');
    const userDataString = localStorage.getItem('userData');

    if (userDataString) {
        // Si hay datos de sesión, muestra el dashboard
        try {
            const user = JSON.parse(userDataString);
            
            // Ocultar login y mostrar la app
            loginScreen.classList.add('hidden');
            appLayout.classList.remove('hidden');

            // Personalizar la bienvenida y el perfil
            document.getElementById('welcome-message').textContent = `¡Hola, ${user.name.split(' ')[0]}!`;
            document.getElementById('user-name').textContent = user.name;
            document.getElementById('user-role').textContent = user.role;
            
            // Crear inicial para el avatar
            const initials = user.name.split(' ').map(n => n[0]).join('');
            document.getElementById('user-avatar').textContent = initials.substring(0, 2);

            // Mostrar elementos solo para profesores
            if (user.role === 'Profesor') {
                document.querySelectorAll('.teacher-only').forEach(el => el.classList.remove('hidden'));
            }
            // Inicializar los íconos de Lucide que ahora son visibles
            if (typeof lucide !== 'undefined') {
                lucide.createIcons();
            }

        } catch (error) {
            // Si los datos están corruptos, se limpia la sesión y se muestra el login
            console.error('Error al parsear datos de sesión:', error);
            localStorage.removeItem('userData');
            loginScreen.classList.remove('hidden');
            appLayout.classList.add('hidden');
        }
    } else {
        // Si no hay sesión, aquí se debe configurar la lógica del formulario de login
        // (El estado por defecto ya muestra el login, así que no se necesita más código para eso)
    }

    // Poblar el dropdown de estudiantes
    populateStudentDropdown();

    // --- FUNCIONES DE AUTENTICACIÓN Y UI ---

    
    // Configura los listeners para el formulario de login
    function setupLoginListeners() {
        studentNameSelect.addEventListener('change', handleStudentSelection);
        studentMatriculaInput.addEventListener('input', validateForm);
        if (studentPasswordInput) {
            studentPasswordInput.addEventListener('input', validateForm);
        }
        loginButton.addEventListener('click', handleLogin);
    }
    
    // Maneja la selección del estudiante
    function handleStudentSelection() {
        const name = studentNameSelect.value;
        if (!name) return;
        
        console.log('🔍 Usuario seleccionado:', name);
        const userData = studentData[name];
        console.log('📊 Datos del usuario:', userData);
        
        const matriculaContainer = document.getElementById('student-matricula-container');
        const passwordContainer = document.getElementById('student-password-container');
        
        console.log('📦 Contenedores encontrados:', {
            matricula: !!matriculaContainer,
            password: !!passwordContainer
        });
        
        if (userData.role === 'Profesor') {
            // Mostrar campo de contraseña para profesores
            if (matriculaContainer) matriculaContainer.classList.add('hidden');
            if (passwordContainer) passwordContainer.classList.remove('hidden');
        } else {
            // Mostrar campo de matrícula para estudiantes
            if (matriculaContainer) matriculaContainer.classList.remove('hidden');
            if (passwordContainer) passwordContainer.classList.add('hidden');
        }
        
        validateForm();
    }

    // Valida el formulario para habilitar/deshabilitar el botón de acceso
    function validateForm() {
        const name = studentNameSelect.value;
        const userData = studentData[name];
        
        console.log('🔍 Validando:', { name, userData });
        
        if (!name || !userData) {
            console.log('❌ Datos faltantes');
            loginButton.disabled = true;
            return;
        }
        
        let isValid = false;
        if (userData.role === 'Profesor') {
            const password = studentPasswordInput ? studentPasswordInput.value : '';
            console.log('🔑 Validando contraseña:', { entered: password, expected: userData.password });
            isValid = password === userData.password;
        } else {
            const matricula = studentMatriculaInput.value;
            console.log('🎓 Validando matrícula:', { entered: matricula, expected: userData.matricula });
            isValid = matricula && parseInt(matricula, 10) === userData.matricula;
        }
        
        console.log('✅ Validación:', { isValid });
        loginButton.disabled = !isValid;
    }

    // Maneja el intento de login
    function handleLogin() {
        const name = studentNameSelect.value;
        const userData = studentData[name];
        
        if (!userData) {
            alert("Usuario no encontrado. Por favor, verifica tus datos.");
            return;
        }
        
        let isValid = false;
        if (userData.role === 'Profesor') {
            const password = studentPasswordInput ? studentPasswordInput.value : '';
            isValid = password === userData.password;
        } else {
            const matricula = parseInt(studentMatriculaInput.value, 10);
            isValid = matricula === userData.matricula;
        }
        
        if (isValid) {
            // Autenticación exitosa
            launchApp(name, userData.role);
        } else {
            // Falla de autenticación
            const message = userData.role === 'Profesor' ? 
                'Contraseña incorrecta. Por favor, verifica tus datos.' : 
                'Matrícula incorrecta. Por favor, verifica tus datos.';
            alert(message);
        }
    }

    // Lanza la aplicación principal después del login
    function launchApp(name, role) {
        // Ocultar pantalla de login y mostrar la app
        loginScreen.classList.add('hidden');
        appLayout.classList.remove('hidden');

        // Cargar datos del usuario en la UI
        loadUserData(name, role);
        setupNavigation(role);
    }

    // Carga los datos del usuario en la barra lateral y el saludo
    function loadUserData(name, role) {
        const nameParts = name.split(' ');
        
        // Para profesores, usar un saludo más apropiado
        let greeting = '';
        let welcomeText = '';
        
        if (role === 'Profesor') {
            greeting = '¡Hola, Dra. Antonieta!';
            welcomeText = 'Este es tu panel de control docente. Gestiona exámenes y revisa resultados.';
        } else {
            greeting = `¡Hola, ${nameParts[0]}!`;
            welcomeText = 'Este es tu panel de control. ¡Mucha suerte en tu examen!';
        }
        
        const initials = (nameParts[0] ? nameParts[0][0] : '') + (nameParts.length > 1 ? nameParts[1][0] : '');
        
        userAvatar.textContent = initials.toUpperCase();
        userName.textContent = name;
        userRole.textContent = role;
        welcomeMessage.textContent = greeting;
        
        // Actualizar texto de bienvenida según el rol
        const welcomeTextElement = document.querySelector('.main-header p');
        if (welcomeTextElement) {
            welcomeTextElement.textContent = welcomeText;
        }
        
        // Actualizar avatar móvil
        const mobileAvatar = document.getElementById('mobile-user-avatar');
        if (mobileAvatar) {
            mobileAvatar.textContent = initials.toUpperCase();
        }
    }

    // Configura la navegación (puede ser adaptativa según el rol)
    function setupNavigation(role) {
        // Si el usuario es Profesor, muestra el panel de admin
        if (role === 'Profesor') {
            document.querySelector('.teacher-only').classList.remove('hidden');
        }

        const navLinks = document.querySelectorAll('.nav-link');
        const views = document.querySelectorAll('.view');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                // Solo prevenir el comportamiento por defecto para enlaces internos (#)
                if (link.getAttribute('href').startsWith('#')) {
                    e.preventDefault();
                    // Lógica de navegación interna
                    // ...
                }
                // Para enlaces externos (como reportes.html), permitir navegación normal
            });
        });
    }


    // --- FUNCIÓN PARA LIMPIAR DATOS DE PRUEBA (solo para profesores) ---
    window.clearAllTestData = function() {
        if (confirm('¿Estás segura de que quieres limpiar todos los datos de prueba?\n\nEsto eliminará:\n- Progreso de exámenes de alumnos de prueba\n- Datos de localStorage de testing\n\n⚠️ Esta acción no se puede deshacer.')) {
        // Limpiar localStorage de todos los alumnos de prueba
        const testStudents = [];
        const testMatriculas = [];
            
            let cleanedCount = 0;
            
            testMatriculas.forEach(matricula => {
                // Limpiar datos de localStorage para cada matrícula de prueba
                const examId = 'cirugia_ungueal_parcial1';
                const completedKey = `exam_completed_${examId}_${matricula}`;
                const stateKey = `exam_state_${examId}_${matricula}`;
                const reviewKey = `exam_review_${examId}_${matricula}`;
                
                if (localStorage.getItem(completedKey)) {
                    localStorage.removeItem(completedKey);
                    cleanedCount++;
                }
                if (localStorage.getItem(stateKey)) {
                    localStorage.removeItem(stateKey);
                    cleanedCount++;
                }
                if (localStorage.getItem(reviewKey)) {
                    localStorage.removeItem(reviewKey);
                    cleanedCount++;
                }
            });
            
            alert(`✅ Datos de prueba limpiados exitosamente.\n\nSe eliminaron ${cleanedCount} entradas de localStorage.\n\nLos alumnos de prueba ahora pueden volver a hacer los exámenes.`);
            
            // Recargar la página para reflejar los cambios
            location.reload();
        }
    };

    // --- FUNCIONES PARA NAVEGACIÓN MÓVIL ---
    function setupMobileNavigation() {
        const mobileMenuBtn = document.getElementById('mobile-menu-btn');
        const sidebar = document.querySelector('.main-sidebar');
        const overlay = document.getElementById('sidebar-overlay');
        
        if (mobileMenuBtn && sidebar && overlay) {
            mobileMenuBtn.addEventListener('click', () => {
                sidebar.classList.toggle('open');
                overlay.classList.toggle('show');
            });
            
            overlay.addEventListener('click', () => {
                sidebar.classList.remove('open');
                overlay.classList.remove('show');
            });
        }
    }

    // --- EJECUTAR INICIALIZACIÓN ---
    init();
    setupMobileNavigation();

});

// --- FUNCIÓN PARA CERRAR SESIÓN (FUERA DEL DOMContentLoaded) ---
window.logout = function() {
    try {
        if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
            // Limpiar datos de sesión
            localStorage.removeItem('userData');
            sessionStorage.clear();
            
            // Ocultar dashboard y mostrar login
            const loginScreen = document.getElementById('login-screen');
            const appLayout = document.querySelector('.app-layout');
            
            if (loginScreen && appLayout) {
                loginScreen.classList.remove('hidden');
                appLayout.classList.add('hidden');
            }
            
            // Limpiar formulario de login
            const studentNameSelect = document.getElementById('studentName');
            const studentMatriculaInput = document.getElementById('studentMatricula');
            const studentPasswordInput = document.getElementById('studentPassword');
            
            if (studentNameSelect) studentNameSelect.value = '';
            if (studentMatriculaInput) studentMatriculaInput.value = '';
            if (studentPasswordInput) studentPasswordInput.value = '';
            
            // Recargar la página para asegurar limpieza completa
            setTimeout(() => {
                location.reload();
            }, 100);
        }
    } catch (error) {
        console.error('Error al cerrar sesión:', error);
        // Fallback: recargar la página
        location.reload();
    }
};

