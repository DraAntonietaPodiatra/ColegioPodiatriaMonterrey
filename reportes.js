// URL del Web App de Google Apps Script
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzbuJHpy8GujcSwcPwPJVQj2MUIYXhamvtw85Co5GBX_MrnEFMY9EZ_Z8aIWXKK6x949A/exec";

// --- FUNCIÓN PARA IR AL DASHBOARD ---
window.goToDashboard = function() {
    // Verificar que la sesión esté activa
    const userData = localStorage.getItem('userData');
    if (userData) {
        // Mantener la sesión y ir al dashboard
        window.location.href = 'index.html';
    } else {
        // Si no hay sesión, ir al login
        window.location.href = 'index.html';
    }
};

// --- FUNCIÓN PARA CERRAR SESIÓN ---
window.logout = function() {
    if (confirm('¿Estás seguro de que quieres cerrar sesión?')) {
        // Limpiar datos de sesión
        localStorage.removeItem('userData');
        sessionStorage.clear();
        
        // Redirigir al login
        window.location.href = 'index.html';
    }
};

document.addEventListener('DOMContentLoaded', () => {

    const loadingSpinner = document.getElementById('loading-spinner');
    const reportContent = document.getElementById('report-content');

    // Función principal para obtener y mostrar los datos
    async function fetchAndDisplayReports() {
        try {
            console.log('🔍 Intentando cargar datos de reportes...');
            console.log('📡 URL:', `${SCRIPT_URL}?action=getReportData`);
            
            const response = await fetch(`${SCRIPT_URL}?action=getReportData`);
            console.log('📨 Respuesta recibida:', response.status, response.statusText);
            
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
            }
            
            const result = await response.json();
            console.log('📊 Datos recibidos:', result);

            if (result.success) {
                const data = result.data;
                console.log('✅ Datos procesados:', data);
                
                if (!data || data.length === 0) {
                    loadingSpinner.innerHTML = `
                        <div style="text-align: center; padding: 40px;">
                            <p style="color: #666; font-size: 1.2rem;">No hay datos de exámenes disponibles</p>
                            <p style="color: #999;">Realiza algunos exámenes para ver las estadísticas aquí.</p>
                            <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: var(--colegio-medium-blue); color: white; border: none; border-radius: 5px; cursor: pointer;">Actualizar</button>
                        </div>
                    `;
                    return;
                }
                
                displayStats(data);
                displayCharts(data);
                displayTable(data);
                
                loadingSpinner.classList.add('hidden');
                reportContent.classList.remove('hidden');
            } else {
                throw new Error(result.error || 'La respuesta del servidor no fue exitosa.');
            }

        } catch (error) {
            console.error('Error al cargar el reporte:', error);
            loadingSpinner.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <p style="color: red;"><strong>Error al cargar el reporte:</strong> ${error.message}</p>
                    <p style="color: #666;">Por favor, verifica que:</p>
                    <ul style="text-align: left; color: #666; max-width: 400px; margin: 0 auto;">
                        <li>La URL del Apps Script es correcta</li>
                        <li>El script está implementado como aplicación web</li>
                        <li>La hoja de cálculo se llama "Examenes podiatria"</li>
                        <li>El acceso está configurado como "Cualquier usuario"</li>
                    </ul>
                    <button onclick="location.reload()" style="margin-top: 20px; padding: 10px 20px; background: var(--colegio-medium-blue); color: white; border: none; border-radius: 5px; cursor: pointer;">Reintentar</button>
                </div>
            `;
        }
    }
    
    // Muestra las estadísticas principales
    function displayStats(data) {
        if (!data || data.length === 0) return;

        console.log('📊 Datos para estadísticas:', data);

        const totalStudents = data.length;
        const examColumns = Object.keys(data[0] || {}).filter(key => 
            !['Timestamp', 'Nombre_Alumno', 'Matricula', ''].includes(key) && 
            key && key.trim() !== ''
        );
        
        // Contar exámenes completados (que tienen al menos una calificación)
        let completedExams = 0;
        examColumns.forEach(exam => {
            const hasCompletions = data.some(student => {
                const score = student[exam];
                return score && String(score).trim() !== '' && !String(score).includes('-');
            });
            if (hasCompletions) completedExams++;
        });
        
        // Contar total de calificaciones individuales
        let totalGrades = 0;
        data.forEach(student => {
            examColumns.forEach(exam => {
                const score = student[exam];
                if (score && String(score).trim() !== '' && !String(score).includes('-')) {
                    totalGrades++;
                }
            });
        });
        
        const totalExams = completedExams;
        const totalIndividualGrades = totalGrades;

        console.log('📝 Columnas de exámenes encontradas:', examColumns);
        console.log('📊 Exámenes completados:', completedExams);
        console.log('📊 Total de calificaciones:', totalIndividualGrades);

        let totalScores = 0;
        let passedScores = 0;
        
        data.forEach(student => {
            examColumns.forEach(exam => {
                const score = student[exam];
                if (score && String(score).trim() !== '') {
                    console.log(`🎯 Procesando puntuación para ${student.Nombre_Alumno || 'Alumno'} en ${exam}:`, score);
                    
                    const percentageMatch = String(score).match(/\((\d+\.?\d*)%\)/);
                    if (percentageMatch) {
                        const percentage = parseFloat(percentageMatch[1]);
                        console.log(`📈 Porcentaje extraído: ${percentage}`);
                        
                        if (!isNaN(percentage) && isFinite(percentage) && percentage >= 0 && percentage <= 100) {
                            totalScores++;
                            if (percentage >= 70) passedScores++;
                        } else {
                            console.warn(`⚠️ Porcentaje inválido detectado: ${percentage}`);
                        }
                    } else {
                        console.warn(`⚠️ No se pudo extraer porcentaje de: ${score}`);
                    }
                }
            });
        });

        console.log(`📊 Total scores: ${totalScores}, Passed scores: ${passedScores}`);

        const averagePassRate = totalScores > 0 ? 
            Math.min(100, Math.max(0, ((passedScores / totalScores) * 100))).toFixed(1) : 0;
        
        console.log(`📈 Tasa de aprobación calculada: ${averagePassRate}%`);
        
        document.getElementById('total-students').textContent = completedExams;
        document.getElementById('total-exams').textContent = totalIndividualGrades;
        document.getElementById('average-pass-rate').textContent = `${averagePassRate}%`;
    }
    
    // Muestra los gráficos
    function displayCharts(data) {
        if (!data || data.length === 0) return;

        console.log('📊 Datos para gráficos:', data);

        const examColumns = Object.keys(data[0] || {}).filter(key => 
            !['Timestamp', 'Nombre_Alumno', 'Matricula', ''].includes(key) && 
            key && key.trim() !== ''
        );

        console.log('📝 Columnas para gráficos:', examColumns);

        const scoreDistribution = { 'Reprobado (<70%)': 0, 'Aprobado (70-89%)': 0, 'Excelente (≥90%)': 0 };
        const completionData = {};
        examColumns.forEach(exam => completionData[exam] = 0);

        data.forEach(student => {
            examColumns.forEach(exam => {
                const score = student[exam];
                if (score && String(score).trim() !== '') {
                    completionData[exam]++;
                    const percentageMatch = String(score).match(/\((\d+\.?\d*)%\)/);
                    if (percentageMatch) {
                        const percentage = parseFloat(percentageMatch[1]);
                        console.log(`📈 Porcentaje en gráfico: ${percentage} para ${student.Nombre_Alumno || 'Alumno'} en ${exam}`);
                        
                        if (!isNaN(percentage) && isFinite(percentage) && percentage >= 0 && percentage <= 100) {
                            if (percentage >= 90) scoreDistribution['Excelente (≥90%)']++;
                            else if (percentage >= 70) scoreDistribution['Aprobado (70-89%)']++;
                            else scoreDistribution['Reprobado (<70%)']++;
                        } else {
                            console.warn(`⚠️ Porcentaje inválido en gráfico: ${percentage}`);
                        }
                    } else {
                        console.warn(`⚠️ No se pudo extraer porcentaje en gráfico de: ${score}`);
                    }
                }
            });
        });

        console.log('📊 Distribución de puntuaciones:', scoreDistribution);
        console.log('📊 Datos de finalización:', completionData);

        // Validar y limpiar datos para el gráfico de distribución
        const cleanedScoreData = {};
        let hasValidData = false;
        
        Object.keys(scoreDistribution).forEach(key => {
            const value = scoreDistribution[key];
            console.log(`🔍 Validando ${key}: ${value}`);
            
            if (!isNaN(value) && isFinite(value) && value >= 0 && Number.isInteger(value)) {
                cleanedScoreData[key] = value;
                if (value > 0) hasValidData = true;
            } else {
                console.warn(`⚠️ Valor inválido para ${key}: ${value}`);
                cleanedScoreData[key] = 0;
            }
        });
        
        console.log('📊 Datos limpios para gráfico:', cleanedScoreData);
        console.log('📊 ¿Tiene datos válidos?', hasValidData);
        
        if (hasValidData && Object.keys(cleanedScoreData).length > 0) {
            // Verificar que Chart.js esté disponible
            if (typeof Chart === 'undefined') {
                console.error('❌ Chart.js no está cargado');
                document.getElementById('scores-chart').innerHTML = '<p style="text-align: center; color: red; padding: 20px;">Error: Chart.js no está disponible</p>';
                return;
            }
            
            // Destruir gráfico anterior si existe
            const existingChart = Chart.getChart('scores-chart');
            if (existingChart) {
                console.log('🗑️ Destruyendo gráfico anterior');
                existingChart.destroy();
            }
            
            console.log('🎨 Creando nuevo gráfico de distribución');
            
            // Asegurar que el contenedor tenga dimensiones fijas
            const chartContainer = document.getElementById('scores-chart');
            chartContainer.style.width = '100%';
            chartContainer.style.height = '300px';
            chartContainer.style.position = 'relative';
            
            new Chart(chartContainer, {
                type: 'doughnut',
                data: {
                    labels: Object.keys(cleanedScoreData),
                    datasets: [{
                        data: Object.values(cleanedScoreData),
                        backgroundColor: ['#f8d7da', '#d4edda', '#cff4fc'],
                        borderColor: ['#721c24', '#155724', '#0f5132'],
                        borderWidth: 1
                    }]
                },
                options: { 
                    responsive: true, 
                    maintainAspectRatio: false,
                    aspectRatio: 1,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                usePointStyle: true
                            }
                        }
                    },
                    animation: {
                        animateRotate: true,
                        animateScale: true,
                        duration: 1000
                    },
                    cutout: '50%'
                }
            });
        } else {
            console.warn('⚠️ No hay datos válidos para gráfico de distribución');
            document.getElementById('scores-chart').innerHTML = '<p style="text-align: center; color: #666; padding: 20px;">No hay datos válidos para mostrar</p>';
        }

        // Validar que tenemos datos válidos para el gráfico de finalización
        const validCompletion = Object.values(completionData).every(val => !isNaN(val) && isFinite(val) && val >= 0);
        
        if (validCompletion && Object.keys(completionData).length > 0) {
            new Chart(document.getElementById('completion-chart'), {
                type: 'bar',
                data: {
                    labels: Object.keys(completionData),
                    datasets: [{
                        label: 'Nº de Alumnos Completados',
                        data: Object.values(completionData),
                        backgroundColor: 'rgba(1, 59, 86, 0.7)',
                        borderColor: 'rgba(1, 59, 86, 1)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: { 
                            beginAtZero: true, 
                            ticks: { stepSize: 1 } 
                        }
                    }
                }
            });
        } else {
            console.warn('⚠️ Datos inválidos para gráfico de finalización:', completionData);
            document.getElementById('completion-chart').innerHTML = '<p style="text-align: center; color: #666;">No hay datos válidos para mostrar</p>';
        }
    }

    // Muestra la tabla de calificaciones
    function displayTable(data) {
        const tableHead = document.querySelector('#grades-table thead');
        const tableBody = document.querySelector('#grades-table tbody');
        
        if (!data || data.length === 0) {
            tableHead.innerHTML = '<tr><th>Información</th></tr>';
            tableBody.innerHTML = '<tr><td>No hay datos de alumnos para mostrar.</td></tr>';
            return;
        }
        
        const headers = Object.keys(data[0]).filter(h => h).map(h => {
            if (h === 'Timestamp') return 'Fecha y Hora';
            if (h === 'Nombre_Alumno') return 'Nombre Alumno';
            return h;
        });
        tableHead.innerHTML = `<tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>`;
        
        tableBody.innerHTML = data.map(student => {
            const cells = headers.map(header => {
                // Mapear el header de vuelta al nombre original para acceder a los datos
                let originalHeader = header;
                if (header === 'Fecha y Hora') originalHeader = 'Timestamp';
                if (header === 'Nombre Alumno') originalHeader = 'Nombre_Alumno';
                
                const value = student[originalHeader] || '-';
                
                if (originalHeader === 'Timestamp') {
                    return `<td>${new Date(value).toLocaleString()}</td>`;
                }

                if (!['Nombre_Alumno', 'Matricula'].includes(originalHeader)) {
                    let scoreClass = 'not-taken';
                    if (String(value).includes('%')) {
                        const percentageMatch = String(value).match(/\((\d+\.?\d*)%\)/);
                        if (percentageMatch) {
                            const percentage = parseFloat(percentageMatch[1]);
                            if (percentage >= 90) scoreClass = 'excellent';
                            else if (percentage >= 70) scoreClass = 'passed';
                            else scoreClass = 'failed';
                        }
                    }
                    return `<td><span class="score-cell ${scoreClass}">${value}</span></td>`;
                }
                
                return `<td>${value}</td>`;

            }).join('');
            return `<tr>${cells}</tr>`;
        }).join('');
    }

    lucide.createIcons();
    fetchAndDisplayReports();
});

