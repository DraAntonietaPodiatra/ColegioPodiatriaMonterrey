document.addEventListener('DOMContentLoaded', () => {

    // --- BASE DE DATOS DE ALUMNOS Y MATRÍCULAS ---
    const studentData = {
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
        // Ejemplo de profesor para futuras implementaciones
        "Dra. Antonieta Acosta": { matricula: 1001, role: "Profesor" } 
    };

    // --- REFERENCIAS AL DOM ---
    const loginScreen = document.getElementById('login-screen');
    const appLayout = document.querySelector('.app-layout');
    const studentNameSelect = document.getElementById('studentName');
    const studentMatriculaInput = document.getElementById('studentMatricula');
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
        studentNameSelect.addEventListener('change', validateForm);
        studentMatriculaInput.addEventListener('input', validateForm);
        loginButton.addEventListener('click', handleLogin);
    }
    
    // Valida el formulario para habilitar/deshabilitar el botón de acceso
    function validateForm() {
        const name = studentNameSelect.value;
        const matricula = studentMatriculaInput.value;
        loginButton.disabled = !(name && matricula.length > 0);
    }

    // Maneja el intento de login
    function handleLogin() {
        const name = studentNameSelect.value;
        const matricula = parseInt(studentMatriculaInput.value, 10);
        
        if (studentData[name] && studentData[name].matricula === matricula) {
            // Autenticación exitosa
            launchApp(name, studentData[name].role);
        } else {
            // Falla de autenticación
            alert("Matrícula incorrecta. Por favor, verifica tus datos.");
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
        const initials = (nameParts[0] ? nameParts[0][0] : '') + (nameParts.length > 1 ? nameParts[1][0] : '');
        
        userAvatar.textContent = initials.toUpperCase();
        userName.textContent = name;
        userRole.textContent = role;
        welcomeMessage.textContent = `¡Hola, ${nameParts[0]}!`;
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

