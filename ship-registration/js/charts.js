// ========================================
// الملف: charts.js
// الوصف: إنشاء وتحديث الرسوم البيانية
// النظام: نظام تسجيل السفن الإلكتروني
// ========================================

// ===== تخزين الرسوم البيانية =====
const charts = {};

// ===== تهيئة جميع الرسوم البيانية =====
function initializeCharts() {
    // رسوم النظرة العامة
    initializeRegistrationsChart();
    initializeShipTypesChart();
    
    // رسوم السفن
    initializeShipDistributionChart();
    initializeShipSizeChart();
    
    // الرسوم المالية
    initializeRevenueChart();
    initializeRevenueByTypeChart();
    
    // رسوم الموظفين
    initializeEmployeePerformanceChart();
    initializeEmployeeActivityChart();
}

// ===== رسم بياني: التسجيل الشهري =====
function initializeRegistrationsChart() {
    const ctx = document.getElementById('registrationsChart')?.getContext('2d');
    if (!ctx) return;
    
    if (charts.registrationsChart) {
        charts.registrationsChart.destroy();
    }
    
    charts.registrationsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
            datasets: [{
                label: 'عدد السفن المسجلة',
                data: [85, 92, 78, 95, 88, 84, 90, 96, 102, 98, 105, 110],
                borderColor: '#1e4b7a',
                backgroundColor: 'rgba(30, 75, 122, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#1e4b7a',
                pointBorderColor: 'white',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    rtl: true,
                    labels: {
                        font: {
                            family: 'Noto Sans Arabic',
                            size: 12
                        }
                    }
                },
                tooltip: {
                    rtl: true,
                    titleFont: {
                        family: 'Noto Sans Arabic'
                    },
                    bodyFont: {
                        family: 'Noto Sans Arabic'
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: 'Noto Sans Arabic'
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 20,
                        font: {
                            family: 'Noto Sans Arabic'
                        }
                    }
                }
            }
        }
    });
}

// ===== رسم بياني: أنواع السفن =====
function initializeShipTypesChart() {
    const ctx = document.getElementById('shipTypesChart')?.getContext('2d');
    if (!ctx) return;
    
    if (charts.shipTypesChart) {
        charts.shipTypesChart.destroy();
    }
    
    charts.shipTypesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['سفن شحن', 'ناقلات نفط', 'سفن ركاب', 'سفن صيد', 'سفن حاويات', 'أخرى'],
            datasets: [{
                data: [560, 312, 225, 150, 120, 80],
                backgroundColor: [
                    '#1e4b7a',
                    '#2c7be5',
                    '#8b7355',
                    '#28a745',
                    '#ffc107',
                    '#dc3545'
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    rtl: true,
                    labels: {
                        font: {
                            family: 'Noto Sans Arabic',
                            size: 11
                        },
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                return data.labels.map((label, i) => {
                                    const value = data.datasets[0].data[i];
                                    const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                    const percentage = ((value / total) * 100).toFixed(1);
                                    return {
                                        text: `${label} (${percentage}%)`,
                                        fillStyle: data.datasets[0].backgroundColor[i],
                                        hidden: false,
                                        index: i
                                    };
                                });
                            }
                            return [];
                        }
                    }
                },
                tooltip: {
                    rtl: true,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value} سفينة (${percentage}%)`;
                        }
                    }
                }
            },
            cutout: '60%'
        }
    });
}

// ===== رسم بياني: توزيع السفن حسب النوع =====
function initializeShipDistributionChart() {
    const ctx = document.getElementById('shipDistributionChart')?.getContext('2d');
    if (!ctx) return;
    
    if (charts.shipDistributionChart) {
        charts.shipDistributionChart.destroy();
    }
    
    charts.shipDistributionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['سفن شحن', 'ناقلات نفط', 'سفن ركاب', 'سفن صيد', 'سفن حاويات'],
            datasets: [{
                label: 'عدد السفن',
                data: [560, 312, 225, 150, 120],
                backgroundColor: [
                    '#1e4b7a',
                    '#2c7be5',
                    '#8b7355',
                    '#28a745',
                    '#ffc107'
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    rtl: true
                }
            },
            scales: {
                x: {
                    ticks: {
                        font: {
                            family: 'Noto Sans Arabic'
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 100,
                        font: {
                            family: 'Noto Sans Arabic'
                        }
                    }
                }
            }
        }
    });
}

// ===== رسم بياني: حجم السفن =====
function initializeShipSizeChart() {
    const ctx = document.getElementById('shipSizeChart')?.getContext('2d');
    if (!ctx) return;
    
    if (charts.shipSizeChart) {
        charts.shipSizeChart.destroy();
    }
    
    charts.shipSizeChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['صغيرة (<1000 طن)', 'متوسطة (1000-10000 طن)', 'كبيرة (>10000 طن)'],
            datasets: [{
                data: [45, 35, 20],
                backgroundColor: ['#28a745', '#ffc107', '#dc3545'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    rtl: true,
                    labels: {
                        font: {
                            family: 'Noto Sans Arabic'
                        }
                    }
                },
                tooltip: {
                    rtl: true,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            return `${label}: ${value}%`;
                        }
                    }
                }
            }
        }
    });
}

// ===== رسم بياني: تحليل الإيرادات =====
function initializeRevenueChart() {
    const ctx = document.getElementById('revenueAnalysisChart')?.getContext('2d');
    if (!ctx) return;
    
    if (charts.revenueAnalysisChart) {
        charts.revenueAnalysisChart.destroy();
    }
    
    charts.revenueAnalysisChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
            datasets: [{
                label: 'الإيرادات (ريال)',
                data: [280000, 295000, 310000, 325000, 340000, 355000],
                backgroundColor: '#28a745',
                borderColor: '#1e7e34',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    rtl: true,
                    callbacks: {
                        label: function(context) {
                            let value = context.raw || 0;
                            return `${value.toLocaleString('ar-YE')} ريال`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: {
                        font: {
                            family: 'Noto Sans Arabic'
                        }
                    }
                },
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('ar-YE') + ' ريال';
                        },
                        font: {
                            family: 'Noto Sans Arabic'
                        }
                    }
                }
            }
        }
    });
}

// ===== رسم بياني: الإيرادات حسب النوع =====
function initializeRevenueByTypeChart() {
    const ctx = document.getElementById('revenueByTypeChart')?.getContext('2d');
    if (!ctx) return;
    
    if (charts.revenueByTypeChart) {
        charts.revenueByTypeChart.destroy();
    }
    
    charts.revenueByTypeChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['رسوم التسجيل', 'رسوم التجديد', 'الغرامات', 'خدمات إضافية'],
            datasets: [{
                data: [185000, 98000, 32000, 10000],
                backgroundColor: ['#1e4b7a', '#2c7be5', '#ffc107', '#28a745'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    rtl: true
                },
                tooltip: {
                    rtl: true,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${label}: ${value.toLocaleString('ar-YE')} ريال (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}

// ===== رسم بياني: أداء الموظفين =====
function initializeEmployeePerformanceChart() {
    const ctx = document.getElementById('employeePerformanceChart')?.getContext('2d');
    if (!ctx) return;
    
    if (charts.employeePerformanceChart) {
        charts.employeePerformanceChart.destroy();
    }
    
    charts.employeePerformanceChart = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: ['سرعة المعالجة', 'الدقة', 'الإنتاجية', 'التعاون', 'الإبداع', 'الالتزام'],
            datasets: [
                {
                    label: 'متوسط القسم',
                    data: [75, 80, 70, 85, 65, 90],
                    backgroundColor: 'rgba(52, 152, 219, 0.2)',
                    borderColor: 'rgba(52, 152, 219, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(52, 152, 219, 1)'
                },
                {
                    label: 'أفضل أداء',
                    data: [95, 92, 88, 90, 85, 94],
                    backgroundColor: 'rgba(76, 175, 80, 0.2)',
                    borderColor: 'rgba(76, 175, 80, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(76, 175, 80, 1)'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    rtl: true,
                    labels: {
                        font: {
                            family: 'Noto Sans Arabic'
                        }
                    }
                },
                tooltip: {
                    rtl: true
                }
            },
            scales: {
                r: {
                    angleLines: {
                        display: true
                    },
                    suggestedMin: 0,
                    suggestedMax: 100,
                    ticks: {
                        stepSize: 20,
                        backdropPadding: 2
                    },
                    pointLabels: {
                        font: {
                            family: 'Noto Sans Arabic',
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

// ===== رسم بياني: نشاط الموظفين =====
function initializeEmployeeActivityChart() {
    const ctx = document.getElementById('employeeActivityChart')?.getContext('2d');
    if (!ctx) return;
    
    if (charts.employeeActivityChart) {
        charts.employeeActivityChart.destroy();
    }
    
    charts.employeeActivityChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['الأسبوع 1', 'الأسبوع 2', 'الأسبوع 3', 'الأسبوع 4'],
            datasets: [
                {
                    label: 'عدد الطلبات',
                    data: [85, 92, 78, 95],
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'متوسط الوقت (أيام)',
                    data: [2.5, 2.0, 1.8, 1.5],
                    borderColor: '#ffc107',
                    backgroundColor: 'rgba(255, 193, 7, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    rtl: true,
                    labels: {
                        font: {
                            family: 'Noto Sans Arabic'
                        }
                    }
                },
                tooltip: {
                    rtl: true,
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    ticks: {
                        font: {
                            family: 'Noto Sans Arabic'
                        }
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'عدد الطلبات',
                        font: {
                            family: 'Noto Sans Arabic',
                            size: 11
                        }
                    },
                    ticks: {
                        stepSize: 20,
                        font: {
                            family: 'Noto Sans Arabic'
                        }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'متوسط الوقت (أيام)',
                        font: {
                            family: 'Noto Sans Arabic',
                            size: 11
                        }
                    },
                    grid: {
                        drawOnChartArea: false
                    },
                    ticks: {
                        stepSize: 0.5,
                        font: {
                            family: 'Noto Sans Arabic'
                        }
                    }
                }
            }
        }
    });
}

// ===== تحديث الرسم البياني =====
function updateChart(chartName, newData) {
    if (charts[chartName]) {
        charts[chartName].data = newData;
        charts[chartName].update();
    }
}

// ===== تحديث جميع الرسوم البيانية =====
function refreshAllCharts() {
    for (const chartName in charts) {
        if (charts[chartName] && typeof charts[chartName].update === 'function') {
            charts[chartName].update();
        }
    }
}

// ===== تدمير الرسم البياني =====
function destroyChart(chartName) {
    if (charts[chartName]) {
        charts[chartName].destroy();
        delete charts[chartName];
    }
}

// ===== تصدير الدوال =====
window.charts = {
    initializeCharts,
    initializeRegistrationsChart,
    initializeShipTypesChart,
    initializeShipDistributionChart,
    initializeShipSizeChart,
    initializeRevenueChart,
    initializeRevenueByTypeChart,
    initializeEmployeePerformanceChart,
    initializeEmployeeActivityChart,
    updateChart,
    refreshAllCharts,
    destroyChart
};