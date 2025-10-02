document.addEventListener('DOMContentLoaded', () => {

    // --- BASE DE DATOS DE ALUMNOS Y MATRÍCULAS ---
    const studentData = {
        // ALUMNOS DE PRUEBA (para testing - eliminar después)
        "Prueba 1": { matricula: 1234, role: "Alumno" },
        "Prueba 2": { matricula: 1235, role: "Alumno" },
        "Prueba 3": { matricula: 1236, role: "Alumno" },
        
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
    const loginScreen = document.getElementById('login-screen');
    const appLayout = document.querySelector('.app-layout');
    const studentNameSelect = document.getElementById('studentName');
    const studentMatriculaInput = document.getElementById('studentMatricula');
    const studentPasswordInput = document.getElementById('studentPassword');
    const loginButton = document.getElementById('login-button');
    
    const userAvatar = document.getElementById('user-avatar');
    const userName = document.getElementById('user-name');
    const userRole = document.getElementById('user-role');
    const welcomeMessage = document.getElementById('welcome-message');

    // --- INICIALIZACIÓN ---
    function init() {
        populateStudentDropdown();
        setupLoginListeners();
        lucide.createIcons(); // Inicializa los iconos
    }

    // --- FUNCIONES DE AUTENTICACIÓN Y UI ---

    // Llena la lista desplegable de nombres
    function populateStudentDropdown() {
        const studentNames = Object.keys(studentData);
        studentNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            option.textContent = name;
            studentNameSelect.appendChild(option);
        });
    }
    
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
        
        const userData = studentData[name];
        const matriculaContainer = document.getElementById('student-matricula-container');
        const passwordContainer = document.getElementById('student-password-container');
        
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
        
        if (!name || !userData) {
            loginButton.disabled = true;
            return;
        }
        
        let isValid = false;
        if (userData.role === 'Profesor') {
            const password = studentPasswordInput ? studentPasswordInput.value : '';
            isValid = password === userData.password;
        } else {
            const matricula = studentMatriculaInput.value;
            isValid = matricula && parseInt(matricula, 10) === userData.matricula;
        }
        
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
        if (role === 'Profesor') {
            greeting = '¡Hola, Dra. Antonieta!';
        } else {
            greeting = `¡Hola, ${nameParts[0]}!`;
        }
        
        const initials = (nameParts[0] ? nameParts[0][0] : '') + (nameParts.length > 1 ? nameParts[1][0] : '');
        
        userAvatar.textContent = initials.toUpperCase();
        userName.textContent = name;
        userRole.textContent = role;
        welcomeMessage.textContent = greeting;
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
                e.preventDefault();
                // Lógica de navegación (por ahora solo funciona el dashboard)
                // ...
            });
        });
    }

    // --- EJECUTAR INICIALIZACIÓN ---
    init();

});

