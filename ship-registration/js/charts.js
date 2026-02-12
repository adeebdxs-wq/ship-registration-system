/**
 * نظام الرسوم البيانية والتقارير لنظام تسجيل السفن
 */

class DashboardCharts {
    constructor() {
        this.charts = new Map();
        this.init();
    }
    
    init() {
        this.loadCharts();
        this.setupChartUpdates();
    }
    
    loadCharts() {
        // تحميل جميع الرسوم البيانية في الصفحة
        const chartElements = document.querySelectorAll('[data-chart]');
        
        chartElements.forEach(element => {
            const chartType = element.dataset.chart;
            const chartId = element.id || `chart-${Math.random().toString(36).substr(2, 9)}`;
            
            if (!element.id) element.id = chartId;
            
            this.createChart(chartId, chartType);
        });
    }
    
    createChart(chartId, chartType) {
        const canvas = document.getElementById(chartId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        let chart;
        
        switch (chartType) {
            case 'requests-overview':
                chart = this.createRequestsOverviewChart(ctx);
                break;
                
            case 'monthly-stats':
                chart = this.createMonthlyStatsChart(ctx);
                break;
                
            case 'performance':
                chart = this.createPerformanceChart(ctx);
                break;
                
            case 'ship-types':
                chart = this.createShipTypesChart(ctx);
                break;
                
            case 'processing-time':
                chart = this.createProcessingTimeChart(ctx);
                break;
                
            default:
                console.warn(`نوع الرسم البياني غير معروف: ${chartType}`);
                return;
        }
        
        this.charts.set(chartId, chart);
    }
    
    createRequestsOverviewChart(ctx) {
        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['مقبولة', 'قيد المراجعة', 'مرفوضة'],
                datasets: [{
                    data: [28, 12, 5],
                    backgroundColor: [
                        '#4CAF50', // أخضر
                        '#FF9800', // برتقالي
                        '#F44336'  // أحمر
                    ],
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
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                family: 'Cairo, sans-serif'
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'نظرة عامة على الطلبات',
                        font: {
                            size: 16,
                            family: 'Cairo, sans-serif'
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = Math.round((value / total) * 100);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                },
                cutout: '70%'
            }
        });
    }
    
    createMonthlyStatsChart(ctx) {
        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'],
                datasets: [
                    {
                        label: 'طلبات مقبولة',
                        data: [15, 18, 12, 20, 22, 25],
                        backgroundColor: '#4CAF50',
                        borderColor: '#388E3C',
                        borderWidth: 1
                    },
                    {
                        label: 'طلبات مرفوضة',
                        data: [2, 3, 1, 4, 3, 2],
                        backgroundColor: '#F44336',
                        borderColor: '#D32F2F',
                        borderWidth: 1
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
                                family: 'Cairo, sans-serif'
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'الإحصائيات الشهرية',
                        font: {
                            size: 16,
                            family: 'Cairo, sans-serif'
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
                                family: 'Cairo, sans-serif'
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        ticks: {
                            stepSize: 5,
                            font: {
                                family: 'Cairo, sans-serif'
                            }
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.05)'
                        }
                    }
                }
            }
        });
    }
    
    createPerformanceChart(ctx) {
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['الأسبوع 1', 'الأسبوع 2', 'الأسبوع 3', 'الأسبوع 4'],
                datasets: [
                    {
                        label: 'معدل الإنجاز %',
                        data: [75, 82, 78, 85],
                        borderColor: '#2196F3',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4
                    },
                    {
                        label: 'متوسط وقت المعالجة (أيام)',
                        data: [2.5, 2.0, 1.8, 1.5],
                        borderColor: '#FF9800',
                        backgroundColor: 'rgba(255, 152, 0, 0.1)',
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
                                family: 'Cairo, sans-serif'
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'أداء الموظف',
                        font: {
                            size: 16,
                            family: 'Cairo, sans-serif'
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
                                family: 'Cairo, sans-serif'
                            }
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        min: 0,
                        max: 100,
                        title: {
                            display: true,
                            text: 'معدل الإنجاز %',
                            font: {
                                family: 'Cairo, sans-serif'
                            }
                        },
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            },
                            font: {
                                family: 'Cairo, sans-serif'
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        min: 0,
                        max: 5,
                        title: {
                            display: true,
                            text: 'متوسط وقت المعالجة (أيام)',
                            font: {
                                family: 'Cairo, sans-serif'
                            }
                        },
                        grid: {
                            drawOnChartArea: false
                        },
                        ticks: {
                            font: {
                                family: 'Cairo, sans-serif'
                            }
                        }
                    }
                }
            }
        });
    }
    
    createShipTypesChart(ctx) {
        return new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: ['ناقلات نفط', 'سفن شحن', 'سفن ركاب', 'سفن صيد', 'سفن حاويات'],
                datasets: [{
                    data: [15, 25, 10, 8, 12],
                    backgroundColor: [
                        '#FF6384',
                        '#36A2EB',
                        '#FFCE56',
                        '#4BC0C0',
                        '#9966FF'
                    ],
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
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                family: 'Cairo, sans-serif'
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'توزيع أنواع السفن',
                        font: {
                            size: 16,
                            family: 'Cairo, sans-serif'
                        }
                    }
                },
                scales: {
                    r: {
                        ticks: {
                            display: false
                        }
                    }
                }
            }
        });
    }
    
    createProcessingTimeChart(ctx) {
        return new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['سرعة المراجعة', 'اكتمال المستندات', 'مطابقة الشروط', 'الاستجابة', 'الدقة'],
                datasets: [
                    {
                        label: 'أداء الموظف',
                        data: [85, 90, 80, 75, 88],
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 2,
                        pointBackgroundColor: 'rgba(54, 162, 235, 1)'
                    },
                    {
                        label: 'متوسط القسم',
                        data: [75, 80, 70, 65, 78],
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 2,
                        pointBackgroundColor: 'rgba(255, 99, 132, 1)'
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
                                family: 'Cairo, sans-serif'
                            }
                        }
                    },
                    title: {
                        display: true,
                        text: 'تحليل وقت المعالجة',
                        font: {
                            size: 16,
                            family: 'Cairo, sans-serif'
                        }
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
                            callback: function(value) {
                                return value + '%';
                            },
                            font: {
                                family: 'Cairo, sans-serif'
                            }
                        },
                        pointLabels: {
                            font: {
                                family: 'Cairo, sans-serif',
                                size: 12
                            }
                        }
                    }
                }
            }
        });
    }
    
    setupChartUpdates() {
        // تحديث الرسوم البيانية عند تغيير الفلاتر
        const filterControls = document.querySelectorAll('[data-chart-filter]');
        
        filterControls.forEach(control => {
            control.addEventListener('change', () => {
                this.updateCharts();
            });
        });
        
        // تحديث دوري كل دقيقة
        setInterval(() => {
            this.updateCharts();
        }, 60000);
    }
    
    updateCharts() {
        this.charts.forEach((chart, chartId) => {
            const newData = this.getChartData(chartId);
            
            if (newData) {
                chart.data = newData;
                chart.update();
            }
        });
    }
    
    getChartData(chartId) {
        // بيانات افتراضية للرسوم البيانية
        // في التطبيق الحقيقي، يتم جلب البيانات من API
        const currentDate = new Date();
        const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو'];
        const currentMonth = currentDate.getMonth();
        
        switch (chartId) {
            case 'requests-overview-chart':
                return {
                    datasets: [{
                        data: [28 + Math.floor(Math.random() * 5), 
                               12 + Math.floor(Math.random() * 3), 
                               5 + Math.floor(Math.random() * 2)]
                    }]
                };
                
            case 'monthly-stats-chart':
                const labels = monthNames.slice(Math.max(0, currentMonth - 5), currentMonth + 1);
                return {
                    labels: labels,
                    datasets: [
                        {
                            data: labels.map(() => 15 + Math.floor(Math.random() * 15))
                        },
                        {
                            data: labels.map(() => 1 + Math.floor(Math.random() * 5))
                        }
                    ]
                };
                
            default:
                return null;
        }
    }
    
    // إنشاء رسم بياني مخصص
    createCustomChart(canvasId, config) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;
        
        const ctx = canvas.getContext('2d');
        const chart = new Chart(ctx, config);
        
        this.charts.set(canvasId, chart);
        return chart;
    }
    
    // تدمير رسم بياني
    destroyChart(chartId) {
        const chart = this.charts.get(chartId);
        if (chart) {
            chart.destroy();
            this.charts.delete(chartId);
        }
    }
    
    // تصدير رسم بياني كصورة
    exportChartAsImage(chartId, filename = 'chart.png') {
        const chart = this.charts.get(chartId);
        if (!chart) {
            console.error(`الرسم البياني ${chartId} غير موجود`);
            return;
        }
        
        const image = chart.toBase64Image();
        const link = document.createElement('a');
        link.href = image;
        link.download = filename;
        link.click();
    }
    
    // توليد تقرير بياني
    generateChartReport(chartIds, reportTitle = 'تقرير الرسوم البيانية') {
        const chartsData = [];
        
        chartIds.forEach(chartId => {
            const chart = this.charts.get(chartId);
            if (chart) {
                chartsData.push({
                    id: chartId,
                    title: chart.options.plugins.title?.text || chartId,
                    image: chart.toBase64Image(),
                    data: chart.data
                });
            }
        });
        
        return {
            title: reportTitle,
            generatedAt: new Date().toLocaleString('ar-YE'),
            charts: chartsData
        };
    }
}

// تصدير الفصل
window.DashboardCharts = DashboardCharts;

// تهيئة الرسوم البيانية تلقائياً
document.addEventListener('DOMContentLoaded', function() {
    if (typeof Chart !== 'undefined') {
        window.dashboardCharts = new DashboardCharts();
    }
});

// دوال مساعدة إضافية
const ChartUtils = {
    // تنسيق الأرقام العربية
    formatArabicNumber: function(number) {
        const arabicNumbers = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
        return number.toString().replace(/\d/g, d => arabicNumbers[d]);
    },
    
    // إنشاء تدرج ألوان
    generateColorGradient: function(baseColor, steps) {
        const colors = [];
        const rgb = this.hexToRgb(baseColor);
        
        for (let i = 0; i < steps; i++) {
            const factor = i / (steps - 1);
            const r = Math.round(rgb.r + (255 - rgb.r) * factor);
            const g = Math.round(rgb.g + (255 - rgb.g) * factor);
            const b = Math.round(rgb.b + (255 - rgb.b) * factor);
            colors.push(this.rgbToHex(r, g, b));
        }
        
        return colors;
    },
    
    hexToRgb: function(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    },
    
    rgbToHex: function(r, g, b) {
        return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    },
    
    // تحليل البيانات للإحصائيات
    analyzeDataForStats: function(data) {
        const stats = {
            total: data.length,
            average: 0,
            min: Infinity,
            max: -Infinity,
            sum: 0
        };
        
        if (data.length > 0) {
            data.forEach(value => {
                stats.sum += value;
                stats.min = Math.min(stats.min, value);
                stats.max = Math.max(stats.max, value);
            });
            
            stats.average = stats.sum / stats.total;
        }
        
        return stats;
    }
};

window.ChartUtils = ChartUtils;