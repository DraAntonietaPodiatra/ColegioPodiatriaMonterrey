/* =================================================================== */
/* JavaScript Base para Exámenes - Plataforma Académica de Podiatría  */
/* =================================================================== */

class ExamenPodiatria {
    constructor(config) {
        this.config = config;
        this.participantName = '';
        this.currentQuestionIndex = 0;
        this.userAnswers = [];
        this.caseStudyCache = { text: '', sources: [], questions: '' };
        this.startTime = Date.now();
        this.examAlreadyCompleted = false;
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.checkExamCompletion();
        if (!this.examAlreadyCompleted) {
            this.checkExamStatus();
        }
    }

    // --- BASE DE DATOS DE ALUMNOS Y PROFESORES ---
    get studentData() {
        return {
            // ALUMNOS DE PRUEBA (para testing - eliminar después)
            "Prueba 1": { matricula: 1234, role: "Alumno" },
            "Prueba 2": { matricula: 1235, role: "Alumno" },
            "Prueba 3": { matricula: 1236, role: "Alumno" },
            "Prueba 4": { matricula: 1237, role: "Alumno" },
            "Prueba 5": { matricula: 1238, role: "Alumno" },
            "Prueba 6": { matricula: 1239, role: "Alumno" },
            "Prueba 7": { matricula: 1240, role: "Alumno" },
            "Prueba 8": { matricula: 1241, role: "Alumno" },
            "Prueba 9": { matricula: 1242, role: "Alumno" },
            "Prueba 10": { matricula: 1243, role: "Alumno" },
            
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
    }

    // --- ELEMENTOS DEL DOM ---
    get elements() {
        return {
            startScreen: document.getElementById('start-screen'),
            quizScreen: document.getElementById('quiz-screen'),
            reviewScreen: document.getElementById('review-screen'),
            finalScreen: document.getElementById('final-screen'),
            studentNameSelect: document.getElementById('studentName'),
            studentCodeContainer: document.getElementById('student-code-container'),
            studentCodeInput: document.getElementById('studentCode'),
            studentPasswordInput: document.getElementById('studentPassword'),
            actionButtons: document.getElementById('action-buttons'),
            statusMessage: document.getElementById('status-message'),
            questionNumberEl: document.getElementById('question-number'),
            totalQuestionsEl: document.getElementById('total-questions'),
            progressBar: document.getElementById('progress-bar'),
            questionTextEl: document.getElementById('question-text'),
            optionsContainer: document.getElementById('options-container'),
            nextButton: document.getElementById('next-button'),
            currentSectionEl: document.getElementById('current-section'),
            examBlockedContainer: document.getElementById('exam-blocked-container')
        };
    }

    // --- CONFIGURACIÓN DE EVENTOS ---
    setupEventListeners() {
        const { studentNameSelect, studentCodeInput, studentPasswordInput } = this.elements;

        studentNameSelect.addEventListener('change', () => this.handleStudentSelection());
        studentCodeInput.addEventListener('input', () => this.validateForm());
        
        if (studentPasswordInput) {
            studentPasswordInput.addEventListener('input', () => this.validateForm());
        }
    }

    // --- MANEJO DE SELECCIÓN DE ESTUDIANTE ---
    async handleStudentSelection() {
        const { studentNameSelect, studentCodeContainer, studentPasswordContainer } = this.elements;
        const selectedName = studentNameSelect.value;
        
        if (!selectedName) return;

        const userData = this.studentData[selectedName];
        
        if (userData.role === 'Profesor') {
            // Mostrar campo de contraseña para profesores
            studentCodeContainer.classList.add('hidden');
            if (studentPasswordContainer) {
                studentPasswordContainer.classList.remove('hidden');
            }
        } else {
            // Mostrar campo de matrícula para estudiantes
            studentCodeContainer.classList.remove('hidden');
            if (studentPasswordContainer) {
                studentPasswordContainer.classList.add('hidden');
            }
        }
        
        await this.checkExamCompletion();
        if (!this.examAlreadyCompleted) {
            this.checkExamStatus();
        }
    }

    // --- VALIDACIÓN DE FORMULARIO ---
    validateForm() {
        const { studentNameSelect, studentCodeInput, studentPasswordInput } = this.elements;
        const selectedName = studentNameSelect.value;
        
        if (!selectedName) return;

        const userData = this.studentData[selectedName];
        let isValid = false;

        if (userData.role === 'Profesor') {
            const enteredPassword = studentPasswordInput ? studentPasswordInput.value : '';
            isValid = enteredPassword === userData.password;
        } else {
            const enteredCode = parseInt(studentCodeInput.value, 10);
            isValid = enteredCode === userData.matricula;
        }

        this.updateStartButton(isValid);
    }

    // --- ACTUALIZAR BOTÓN DE INICIO ---
    updateStartButton(isValid) {
        const { actionButtons } = this.elements;
        const startBtn = actionButtons.querySelector('button');
        
        if (startBtn) {
            startBtn.disabled = !isValid;
        }
    }

    // --- VERIFICAR COMPLETADO DEL EXAMEN EN GOOGLE SHEETS ---
    async checkExamCompletion() {
        const { studentNameSelect } = this.elements;
        const selectedName = studentNameSelect.value;
        
        if (!selectedName) return;

        const userData = this.studentData[selectedName];
        const isTeacher = userData.role === 'Profesor';
        const studentId = isTeacher ? 'PROF' : userData.matricula;
        const examId = this.config.examId;
        
        if (!studentId || !examId) {
            console.warn('No se puede verificar el estado del examen: falta studentId o examId');
            return;
        }
        
        try {
            const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzbuJHpy8GujcSwcPwPJVQj2MUIYXhamvtw85Co5GBX_MrnEFMY9EZ_Z8aIWXKK6x949A/exec';
            const response = await fetch(`${APPS_SCRIPT_URL}?action=checkExamCompletion&studentId=${studentId}&examId=${examId}`);
            const result = await response.json();
            
            if (result.success && result.completed) {
                this.showExamBlocked(result);
                this.examAlreadyCompleted = true;
            }
        } catch (error) {
            console.error('Error verificando completado del examen:', error);
            // Si hay error, permitir continuar (no bloquear por fallo de red)
        }
    }

    // --- MOSTRAR EXAMEN BLOQUEADO ---
    showExamBlocked(result) {
        const { startScreen, studentCodeInput, studentPasswordInput, studentCodeContainer, studentPasswordContainer } = this.elements;
        
        // Ocultar la pantalla de inicio
        startScreen.classList.add('hidden');
        
        // Crear contenedor de bloqueo si no existe
        let blockedContainer = document.getElementById('exam-blocked-container');
        if (!blockedContainer) {
            blockedContainer = document.createElement('div');
            blockedContainer.id = 'exam-blocked-container';
            blockedContainer.className = 'exam-blocked';
            
            const mainContainer = document.querySelector('.exam-container') || document.body;
            mainContainer.appendChild(blockedContainer);
        }
        
        // Mostrar mensaje de bloqueo
        blockedContainer.innerHTML = `
            <div class="blocked-message">
                <i data-lucide="lock" class="blocked-icon"></i>
                <h2>Examen Ya Completado</h2>
                <p>Este examen ya ha sido completado previamente.</p>
                <div class="score-display">
                    <strong>Tu calificación:</strong> ${result.score}
                </div>
                <p class="blocked-note">
                    Por motivos de integridad académica, no se permite repetir exámenes.
                    Si crees que esto es un error, contacta a tu profesor.
                </p>
                <button onclick="window.location.href='../index.html'" class="btn btn-principal btn-completo">Volver a la Plataforma</button>
            </div>
        `;
        
        blockedContainer.style.display = 'block';
        lucide.createIcons();
    }

    // --- VERIFICAR ESTADO DEL EXAMEN ---
    checkExamStatus() {
        if (this.examAlreadyCompleted) {
            return; // No hacer nada si el examen ya está bloqueado
        }
        
        const { studentNameSelect, studentCodeInput, studentPasswordInput, statusMessage, actionButtons } = this.elements;
        const selectedName = studentNameSelect.value;
        
        if (!selectedName) return;

        const userData = this.studentData[selectedName];
        const isTeacher = userData.role === 'Profesor';
        const identifier = isTeacher ? 'PROF' : userData.matricula;
        
        const completedKey = `exam_completed_${this.config.examId}_${identifier}`;
        const stateKey = `exam_state_${this.config.examId}_${identifier}`;
        const reviewKey = `exam_review_${this.config.examId}_${identifier}`;
        
        const isCompleted = localStorage.getItem(completedKey);
        const savedState = localStorage.getItem(stateKey);
        const reviewData = localStorage.getItem(reviewKey);

        // Limpiar campos según el tipo de usuario
        if (isTeacher && studentPasswordInput) {
            studentPasswordInput.disabled = false;
            studentPasswordInput.value = '';
        } else {
            studentCodeInput.disabled = false;
            studentCodeInput.value = '';
        }
        
        statusMessage.textContent = '';
        this.createStartButton();

        if (isCompleted) {
            statusMessage.textContent = 'Este examen ya ha sido completado y registrado.';
            statusMessage.style.color = 'var(--success)';
            if (isTeacher && studentPasswordInput) studentPasswordInput.disabled = true;
            else studentCodeInput.disabled = true;
            
            if (reviewData) {
                this.createReviewButton(); // Muestra el botón "Ver Resultados"
            } else {
                actionButtons.querySelector('button').disabled = true;
            }

        } else if (savedState) {
            statusMessage.textContent = 'Hemos detectado un examen sin finalizar.';
            statusMessage.style.color = 'var(--colegio-gold)';
            this.createResumeButton();
            if (isTeacher && studentPasswordInput) studentPasswordInput.disabled = true;
            else studentCodeInput.disabled = true;

        } else {
            this.validateForm();
        }
    }

    // --- CREAR BOTÓN DE INICIO ---
    createStartButton() {
        const { actionButtons } = this.elements;
        actionButtons.innerHTML = `
            <button id="start-button" onclick="examen.validateAndStart()" 
                    class="btn btn-principal btn-completo" disabled>
                Comenzar Examen
            </button>
        `;
    }

    // --- CREAR BOTÓN DE CONTINUAR ---
    createResumeButton() {
        const { actionButtons } = this.elements;
        actionButtons.innerHTML = `
            <button onclick="examen.resumeExam()" 
                    class="btn btn-oro btn-completo">
                Continuar Examen
            </button>
        `;
    }

    // --- CREAR BOTÓN DE REVISIÓN ---
    createReviewButton() {
        const { actionButtons } = this.elements;
        actionButtons.innerHTML = `
            <button onclick="examen.showPastResults()" 
                    class="btn btn-principal btn-completo">
                Ver Resultados
            </button>
        `;
    }

    // --- MOSTRAR RESULTADOS PASADOS ---
    showPastResults() {
        const { studentNameSelect } = this.elements;
        const selectedName = studentNameSelect.value;
        const userData = this.studentData[selectedName];
        const identifier = userData.role === 'Profesor' ? 'PROF' : userData.matricula;
        const reviewKey = `exam_review_${this.config.examId}_${identifier}`;
        
        const savedAnswers = JSON.parse(localStorage.getItem(reviewKey));

        if (savedAnswers) {
            this.participantName = selectedName;
            this.userAnswers = savedAnswers;
            this.showReviewScreen();
        } else {
            alert("No se encontraron los datos de la revisión. Es posible que hayas limpiado el caché de tu navegador.");
        }
    }

    // --- VALIDAR Y COMENZAR EXAMEN ---
    validateAndStart() {
        const { studentNameSelect, studentCodeInput, studentPasswordInput } = this.elements;
        const selectedName = studentNameSelect.value;
        
        if (!selectedName) return;

        const userData = this.studentData[selectedName];
        const isTeacher = userData.role === 'Profesor';
        const identifier = isTeacher ? 'PROF' : userData.matricula;
        
        const stateKey = `exam_state_${this.config.examId}_${identifier}`;
        const completedKey = `exam_completed_${this.config.examId}_${identifier}`;

        if (localStorage.getItem(completedKey) || localStorage.getItem(stateKey)) {
            alert('Este examen ya fue iniciado o completado y no puede ser reiniciado desde cero.');
            return;
        }

        let isValid = false;
        if (isTeacher) {
            const enteredPassword = studentPasswordInput ? studentPasswordInput.value : '';
            isValid = enteredPassword === userData.password;
        } else {
            const enteredCode = parseInt(studentCodeInput.value, 10);
            isValid = enteredCode === userData.matricula;
        }

        if (isValid) {
            this.startQuiz();
        } else {
            const message = isTeacher ? 'La contraseña es incorrecta.' : 'El número de matrícula es incorrecto.';
            alert(message + ' Por favor, verifícalo.');
        }
    }

    // --- CONTINUAR EXAMEN ---
    resumeExam() {
        const { studentNameSelect } = this.elements;
        const selectedName = studentNameSelect.value;
        const userData = this.studentData[selectedName];
        const isTeacher = userData.role === 'Profesor';
        const identifier = isTeacher ? 'PROF' : userData.matricula;
        
        const stateKey = `exam_state_${this.config.examId}_${identifier}`;
        const savedState = JSON.parse(localStorage.getItem(stateKey));

        if (savedState) {
            this.participantName = savedState.participantName;
            this.currentQuestionIndex = savedState.currentQuestionIndex;
            this.userAnswers = savedState.userAnswers;
            
            this.showQuizScreen();
        }
    }

    // --- COMENZAR EXAMEN ---
    startQuiz() {
        const { studentNameSelect } = this.elements;
        this.participantName = studentNameSelect.value;
        this.userAnswers = new Array(this.config.questions.length).fill(null);
        this.currentQuestionIndex = 0;
        
        this.showQuizScreen();
    }

    // --- MOSTRAR PANTALLA DE EXAMEN ---
    showQuizScreen() {
        const { startScreen, quizScreen, totalQuestionsEl } = this.elements;
        
        startScreen.classList.add('hidden');
        quizScreen.classList.remove('hidden');
        totalQuestionsEl.textContent = this.config.questions.length;
        
        this.showQuestion();
    }

    // --- MOSTRAR PREGUNTA ---
    showQuestion() {
        const { questionNumberEl, progressBar, questionTextEl, optionsContainer, nextButton, currentSectionEl } = this.elements;
        
        const question = this.config.questions[this.currentQuestionIndex];
        
        questionNumberEl.textContent = this.currentQuestionIndex + 1;
        currentSectionEl.textContent = question.section;
        progressBar.style.width = `${((this.currentQuestionIndex) / this.config.questions.length) * 100}%`;
        questionTextEl.textContent = question.question;
        
        optionsContainer.innerHTML = '';
        nextButton.disabled = this.userAnswers[this.currentQuestionIndex] === null;
        nextButton.textContent = (this.currentQuestionIndex === this.config.questions.length - 1) ? 'Finalizar Examen' : 'Siguiente';

        const optionsHtml = question.options.map((option, index) => `
            <button class="opcion-examen ${this.userAnswers[this.currentQuestionIndex] === index ? 'seleccionada' : ''}" 
                    onclick="examen.selectAnswer(${index}, this)">
                <span class="letra-opcion">${String.fromCharCode(65 + index)}</span>
                <span>${option}</span>
            </button>
        `).join('');
        
        optionsContainer.innerHTML = optionsHtml;
    }

    // --- SELECCIONAR RESPUESTA ---
    selectAnswer(index, button) {
        this.userAnswers[this.currentQuestionIndex] = index;
        
        document.querySelectorAll('.opcion-examen').forEach(btn => btn.classList.remove('seleccionada'));
        button.classList.add('seleccionada');
        
        const { nextButton } = this.elements;
        nextButton.disabled = false;
    }

    // --- SIGUIENTE PREGUNTA ---
    nextQuestion() {
        if (this.userAnswers[this.currentQuestionIndex] === null) return;
        
        this.saveProgress();

        this.currentQuestionIndex++;
        if (this.currentQuestionIndex < this.config.questions.length) {
            this.showQuestion();
        } else {
            const { progressBar, nextButton } = this.elements;
            progressBar.style.width = '100%';
            nextButton.disabled = true;
            setTimeout(() => this.showReviewScreen(), 300);
        }
    }

    // --- GUARDAR PROGRESO ---
    saveProgress() {
        if (!this.participantName) return;
        
        const userData = this.studentData[this.participantName];
        const isTeacher = userData.role === 'Profesor';
        const identifier = isTeacher ? 'PROF' : userData.matricula;
        
        const stateKey = `exam_state_${this.config.examId}_${identifier}`;
        const state = {
            participantName: this.participantName,
            currentQuestionIndex: this.currentQuestionIndex,
            userAnswers: this.userAnswers
        };
        
        localStorage.setItem(stateKey, JSON.stringify(state));
    }

    // --- MOSTRAR PANTALLA DE REVISIÓN ---
    showReviewScreen() {
        const { quizScreen, reviewScreen } = this.elements;
        
        quizScreen.classList.add('hidden');
        reviewScreen.classList.remove('hidden');
        
        this.renderReviewScreen();
    }

    // --- RENDERIZAR PANTALLA DE REVISIÓN ---
    renderReviewScreen() {
        const reviewContainer = document.getElementById('review-container');
        reviewContainer.innerHTML = '';

        this.config.questions.forEach((question, index) => {
            const userAnswerIndex = this.userAnswers[index];
            const isCorrect = question.options[userAnswerIndex] === question.answer;
            const borderClass = isCorrect ? 'correcta' : 'incorrecta';
            
            reviewContainer.innerHTML += `
                <div class="item-revision ${borderClass}">
                    <p class="pregunta-revision">${question.question}</p>
                    <p class="respuesta-usuario">
                        Tu respuesta: <span class="font-semibold">${question.options[userAnswerIndex] || 'No respondida'}</span>
                    </p>
                    ${!isCorrect ? `
                        <p class="respuesta-correcta">
                            Respuesta Correcta: <span class="font-semibold">${question.answer}</span>
                        </p>
                    ` : ''}
                    <div class="explicacion">
                        <p class="titulo-explicacion">Explicación:</p>
                        <p>${question.feedback}</p>
                    </div>
                </div>
            `;
        });
    }

    // --- MOSTRAR RESULTADO FINAL ---
    showFinalResult() {
        const { reviewScreen, finalScreen } = this.elements;
        
        reviewScreen.classList.add('hidden');
        finalScreen.classList.remove('hidden');

        const results = this.calculateResults();
        this.renderFinalResults(results);
        this.saveFinalResults(results);
    }

    // --- CALCULAR RESULTADOS ---
    calculateResults() {
        let correctAnswers = 0;
        let hasIncorrectAnswers = false;
        
        this.userAnswers.forEach((answer, index) => {
            if (this.config.questions[index].options[answer] === this.config.questions[index].answer) {
                correctAnswers++;
            } else {
                hasIncorrectAnswers = true;
            }
        });
        
        const totalQuestions = this.config.questions.length;
        const percentage = (correctAnswers / totalQuestions) * 100;
        
        return {
            correctAnswers,
            totalQuestions,
            percentage,
            hasIncorrectAnswers
        };
    }

    // --- RENDERIZAR RESULTADOS FINALES ---
    renderFinalResults(results) {
        const resultName = document.getElementById('result-name');
        const scoreText = document.getElementById('score-text');
        const feedbackText = document.getElementById('feedback-text');
        const resultBox = document.getElementById('result-box');
        const caseStudyContainer = document.getElementById('gemini-case-study-container');

        if (resultName) resultName.textContent = this.participantName;
        if (scoreText) scoreText.textContent = `${results.correctAnswers} / ${results.totalQuestions}`;
        
        if (results.percentage >= 80) {
            resultBox.style.backgroundColor = 'var(--success-bg)';
            resultBox.style.color = 'var(--success)';
            feedbackText.textContent = '¡Excelente trabajo! Has demostrado un conocimiento sobresaliente.';
        } else if (results.percentage >= 60) {
            resultBox.style.backgroundColor = 'var(--warning-bg)';
            resultBox.style.color = 'var(--warning)';
            feedbackText.textContent = '¡Buen esfuerzo! Has finalizado el curso.';
        } else {
            resultBox.style.backgroundColor = 'var(--danger-bg)';
            resultBox.style.color = 'var(--danger)';
            feedbackText.textContent = 'Resultado no aprobatorio. Revisa las explicaciones para identificar áreas de oportunidad.';
        }

        if (results.hasIncorrectAnswers && caseStudyContainer) {
            caseStudyContainer.classList.remove('hidden');
        }
    }

    // --- GUARDAR RESULTADOS FINALES ---
    saveFinalResults(results) {
        const userData = this.studentData[this.participantName];
        const isTeacher = userData.role === 'Profesor';
        const identifier = isTeacher ? 'PROF' : userData.matricula;
        
        const completedKey = `exam_completed_${this.config.examId}_${identifier}`;
        const stateKey = `exam_state_${this.config.examId}_${identifier}`;
        const reviewKey = `exam_review_${this.config.examId}_${identifier}`;

        localStorage.setItem(completedKey, 'true');
        // Guardamos las respuestas para la revisión futura.
        localStorage.setItem(reviewKey, JSON.stringify(this.userAnswers));
        localStorage.removeItem(stateKey);

        // Enviar datos al backend
        this.sendToBackend(this.participantName, results.correctAnswers, results.totalQuestions);
    }

    // --- ENVIAR AL BACKEND ---
    async sendToBackend(name, score, total) {
        console.log(`--- ENVÍO A BACKEND ---`);
        console.log(`Examen: ${this.config.examTitle}`);
        console.log(`Nombre: ${name}`);
        console.log(`Calificación: ${score} de ${total}`);
        
        const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzbuJHpy8GujcSwcPwPJVQj2MUIYXhamvtw85Co5GBX_MrnEFMY9EZ_Z8aIWXKK6x949A/exec';
        
        const userData = this.studentData[name];
        if (!userData) {
            console.error("No se encontraron datos para el usuario:", name);
            return;
        }
        
        const percentage = total > 0 ? (score / total) * 100 : 0;
        
        const data = {
            studentName: name,
            studentId: userData.role === 'Profesor' ? 'PROF' : userData.matricula,
            examId: this.config.examId,
            score: score,
            totalQuestions: total,
            percentage: Math.round(percentage * 100) / 100
        };
        
        try {
            const response = await fetch(APPS_SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', // Para evitar errores de CORS con Apps Script
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            console.log('✅ Calificación enviada exitosamente a Google Sheets.');
        } catch (error) {
            console.error('❌ Error de conexión al enviar la calificación:', error);
        }
    }
}

// --- FUNCIONES GLOBALES PARA COMPATIBILIDAD ---
let examen;

function validateAndStart() {
    if (examen) examen.validateAndStart();
}

function nextQuestion() {
    if (examen) examen.nextQuestion();
}

function selectAnswer(index, button) {
    if (examen) examen.selectAnswer(index, button);
}

function showFinalResult() {
    if (examen) examen.showFinalResult();
}

function resumeExam() {
    if (examen) examen.resumeExam();
}

function showPastResults() {
    if (examen) examen.showPastResults();
}

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    // La configuración del examen se definirá en cada archivo HTML específico
    if (typeof examConfig !== 'undefined') {
        examen = new ExamenPodiatria(examConfig);
    }
});
