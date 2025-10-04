// URL del Web App de Google Apps Script
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzbuJHpy8GujcSwcPwPJVQj2MUIYXhamvtw85Co5GBX_MrnEFMY9EZ_Z8aIWXKK6x949A/exec";

// --- FUNCIÓN PARA IR AL DASHBOARD ---
window.goToDashboard = function() {
    // Verificar que la sesión esté activa
    const userData = localStorage.getItem('userData');
    console.log('Navegando al dashboard. Datos de sesión:', userData);
    
    if (userData) {
        try {
            const { name, role } = JSON.parse(userData);
            console.log('Sesión válida encontrada:', name, role);
            
            // Asegurar que los datos estén guardados antes de navegar
            localStorage.setItem('userData', userData);
            
            // Mantener la sesión y ir al dashboard
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Error al parsear datos de sesión:', error);
            // Limpiar datos corruptos y ir al login
            localStorage.removeItem('userData');
            window.location.href = 'index.html';
        }
    } else {
        console.log('No hay sesión activa, redirigiendo al login');
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
                
                // Siempre mostrar estadísticas y gráficos
                if (data && data.length > 0) {
                displayStats(data);
                displayCharts(data);
                displayTable(data);
                } else {
                    // Mostrar datos de ejemplo si no hay datos reales
                    displayExampleStats();
                    displayCharts(data); // Esto mostrará gráficos de ejemplo
                    displayExampleTable();
                }
                
                loadingSpinner.classList.add('hidden');
                reportContent.classList.remove('hidden');
            } else {
                throw new Error(result.error || 'La respuesta del servidor no fue exitosa.');
            }

        } catch (error) {
            console.error('Error al cargar el reporte:', error);
            // En caso de error, mostrar datos de ejemplo
            console.log('📊 Mostrando datos de ejemplo debido a error');
            displayExampleStats();
            displayCharts(null); // Esto mostrará gráficos de ejemplo
            displayExampleTable();
            
            loadingSpinner.classList.add('hidden');
            reportContent.classList.remove('hidden');
        }
    }
    
    // Función para crear gráficos de ejemplo
    function createExampleCharts() {
        console.log('🎨 Creando gráficos de ejemplo');
        
        // Destruir gráficos anteriores si existen
        const existingScoreChart = Chart.getChart('scores-chart');
        if (existingScoreChart) {
            existingScoreChart.destroy();
        }
        
        const existingCompletionChart = Chart.getChart('completion-chart');
        if (existingCompletionChart) {
            existingCompletionChart.destroy();
        }
        
        // Gráfico de distribución de calificaciones (dona)
        const scoreChartContainer = document.getElementById('scores-chart');
        scoreChartContainer.style.width = '100%';
        scoreChartContainer.style.height = window.innerWidth <= 768 ? '280px' : '300px';
        scoreChartContainer.style.position = 'relative';
        scoreChartContainer.style.maxWidth = '100%';
        scoreChartContainer.style.boxSizing = 'border-box';
        
        new Chart(scoreChartContainer, {
            type: 'doughnut',
            data: {
                labels: ['Reprobado (<70%)', 'Aprobado (70-89%)', 'Excelente (≥90%)'],
                datasets: [{
                    data: [2, 5, 3],
                    backgroundColor: ['#f8d7da', '#d4edda', '#cff4fc'],
                    borderColor: ['#721c24', '#155724', '#0f5132'],
                    borderWidth: 2
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
                            usePointStyle: true,
                            font: {
                                size: 12
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'Datos de Ejemplo - Cirugía Ungueal',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: '#666'
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
        
        // Gráfico de completados por examen (barras)
        const completionChartContainer = document.getElementById('completion-chart');
        completionChartContainer.style.width = '100%';
        completionChartContainer.style.height = window.innerWidth <= 768 ? '280px' : '300px';
        completionChartContainer.style.position = 'relative';
        completionChartContainer.style.maxWidth = '100%';
        completionChartContainer.style.boxSizing = 'border-box';
        
        new Chart(completionChartContainer, {
            type: 'bar',
            data: {
                labels: ['Cirugía Ungueal - Parcial 1'],
                datasets: [{
                    label: 'Nº de Alumnos Completados',
                    data: [10],
                    backgroundColor: 'rgba(1, 59, 86, 0.7)',
                    borderColor: 'rgba(1, 59, 86, 1)',
                    borderWidth: 2,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Datos de Ejemplo - Completados',
                        font: {
                            size: 14,
                            weight: 'bold'
                        },
                        color: '#666'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: { 
                        beginAtZero: true, 
                        ticks: { 
                            stepSize: 1,
                            font: {
                                size: 12
                            }
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            font: {
                                size: 12
                            }
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    // Muestra estadísticas de ejemplo
    function displayExampleStats() {
        console.log('📊 Mostrando estadísticas de ejemplo');
        document.getElementById('total-students').textContent = '1';
        document.getElementById('total-exams').textContent = '10';
        document.getElementById('average-pass-rate').textContent = '80%';
    }

    // Muestra tabla de ejemplo
    function displayExampleTable() {
        const tableHead = document.querySelector('#grades-table thead');
        const tableBody = document.querySelector('#grades-table tbody');
        
        tableHead.innerHTML = `
            <tr>
                <th>Fecha y Hora</th>
                <th>Nombre Alumno</th>
                <th>Matricula</th>
                <th>Cirugía Ungueal - Parcial 1</th>
            </tr>
        `;
        
        tableBody.innerHTML = `
            <tr>
                <td>${new Date().toLocaleString()}</td>
                <td>Sofía Castañeda Suarez</td>
                <td>5849</td>
                <td><span class="score-cell passed">85% (85%)</span></td>
            </tr>
            <tr>
                <td>${new Date().toLocaleString()}</td>
                <td>Cesarina Soledad Lopez Fernandez</td>
                <td>5853</td>
                <td><span class="score-cell excellent">92% (92%)</span></td>
            </tr>
            <tr>
                <td>${new Date().toLocaleString()}</td>
                <td>Jesús Manuel Vega Lopez</td>
                <td>5850</td>
                <td><span class="score-cell failed">65% (65%)</span></td>
            </tr>
            <tr style="background-color: #f8f9fa; font-style: italic; color: #666;">
                <td colspan="4" style="text-align: center; padding: 20px;">
                    📊 <strong>Datos de Ejemplo</strong> - Estos son datos ficticios para demostrar la funcionalidad.<br>
                    Los datos reales aparecerán cuando los estudiantes completen exámenes.
                </td>
            </tr>
        `;
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
        // Verificar que Chart.js esté disponible
        if (typeof Chart === 'undefined') {
            console.error('❌ Chart.js no está cargado');
            document.getElementById('scores-chart').innerHTML = '<p style="text-align: center; color: red; padding: 20px;">Error: Chart.js no está disponible</p>';
            document.getElementById('completion-chart').innerHTML = '<p style="text-align: center; color: red; padding: 20px;">Error: Chart.js no está disponible</p>';
            return;
        }

        if (!data || data.length === 0) {
            // Si no hay datos reales, mostrar gráficos de ejemplo
            console.log('📊 Mostrando gráficos de ejemplo');
            createExampleCharts();
            return;
        }

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

