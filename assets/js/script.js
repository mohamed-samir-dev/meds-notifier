class MedicationReminder {
    constructor() {
        this.medications = JSON.parse(localStorage.getItem('medications')) || [];
        this.currentFilter = 'all';
        this.isRTL = true;

        this.translations = {
            ar: {
                title: 'تذكير الأدوية',
                addNew: 'إضافة دواء جديد',
                medName: 'اسم الدواء',
                dosage: 'الجرعة',
                date: 'التاريخ',
                time: 'الوقت',
                day: 'اليوم',
                addMed: 'إضافة الدواء',
                medList: 'قائمة الأدوية',
                all: 'الكل',
                upcoming: 'القادمة',
                past: 'المنتهية',
                noMeds: 'لا توجد أدوية مضافة بعد',
                addToCalendar: 'إضافة للتقويم',
                delete: 'حذف',
                expired: 'منتهي',
                upcomingStatus: 'قادم',
                notificationTitle: 'تذكير الدواء',
                notificationBody: 'حان وقت تناول',
                enableNotifications: 'تفعيل الإشعارات',
                days: ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
            },
            en: {
                title: 'Medication Reminder',
                addNew: 'Add New Medication',
                medName: 'Medication Name',
                dosage: 'Dosage',
                date: 'Date',
                time: 'Time',
                day: 'Day',
                addMed: 'Add Medication',
                medList: 'Medications List',
                all: 'All',
                upcoming: 'Upcoming',
                past: 'Past',
                noMeds: 'No medications added yet',
                addToCalendar: 'Add to Calendar',
                delete: 'Delete',
                expired: 'Expired',
                upcomingStatus: 'Upcoming',
                notificationTitle: 'Medication Reminder',
                notificationBody: 'Time to take',
                enableNotifications: 'Enable Notifications',
                days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
            }
        };
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.requestNotificationPermission();
        this.displayMedications();
        this.scheduleNotifications();
        this.updateLanguage();
    }

    setupEventListeners() {
        document.getElementById('medicationForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addMedication();
        });

        document.getElementById('langToggle').addEventListener('click', () => {
            this.toggleLanguage();
        });

        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.filterMedications(e.target.dataset.filter);
            });
        });

        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchSection(e.target.dataset.section);
            });
        });

        document.getElementById('exportBtn')?.addEventListener('click', () => this.exportData());
        document.getElementById('importBtn')?.addEventListener('click', () => document.getElementById('importFile').click());
        document.getElementById('importFile')?.addEventListener('change', (e) => this.importData(e));
        
        document.getElementById('addQuickMed')?.addEventListener('click', () => this.quickAddMedication());
        document.getElementById('clearExpired')?.addEventListener('click', () => this.clearExpiredMedications());
        document.getElementById('viewCalendar')?.addEventListener('click', () => this.openGoogleCalendar());
        document.getElementById('setReminder')?.addEventListener('click', () => this.setGeneralReminder());
    }

    addMedication() {
        const name = document.getElementById('medName').value.trim();
        const dosage = document.getElementById('medDosage').value.trim();
        const date = document.getElementById('medDate').value;
        const time = document.getElementById('medTime').value;

        // Validation
        if (!name || !dosage || !date || !time) {
            alert('Please fill in all fields');
            return;
        }

        const selectedDateTime = new Date(`${date}T${time}`);
        if (isNaN(selectedDateTime.getTime())) {
            alert('Invalid date or time');
            return;
        }

        const medication = {
            id: Date.now(),
            name,
            dosage,
            date,
            time,
            datetime: selectedDateTime,
            notified: false
        };

        this.medications.push(medication);
        this.saveMedications();
        this.displayMedications();
        this.updateDashboard();
        this.scheduleNotifications();
        document.getElementById('medicationForm').reset();
    }

    saveMedications() {
        try {
            localStorage.setItem('medications', JSON.stringify(this.medications));
        } catch (error) {
            console.error('Error saving medications:', error);
            alert('Error saving data. Please try again.');
        }
    }

    displayMedications() {
        const container = document.getElementById('medicationsList');
        const now = new Date();
        
        let filteredMeds = this.medications;
        
        if (this.currentFilter === 'upcoming') {
            filteredMeds = this.medications.filter(med => new Date(med.datetime) > now);
        } else if (this.currentFilter === 'past') {
            filteredMeds = this.medications.filter(med => new Date(med.datetime) <= now);
        }

        if (filteredMeds.length === 0) {
            container.innerHTML = `<p class="no-medications">${this.getCurrentTranslation().noMeds}</p>`;
            return;
        }

        container.innerHTML = filteredMeds.map(med => {
            const isExpired = new Date(med.datetime) <= now;
            const statusClass = isExpired ? 'expired' : 'upcoming';
            const statusText = isExpired ? this.getCurrentTranslation().expired : this.getCurrentTranslation().upcomingStatus;
            
            return `
                <div class="medication-card ${statusClass}">
                    <div class="medication-header">
                        <div class="medication-name">${med.name}</div>
                        <div class="medication-status status-${isExpired ? 'expired' : 'upcoming'}">${statusText}</div>
                    </div>
                    <div class="medication-details">
                        <p><strong>${this.getCurrentTranslation().dosage}:</strong> ${med.dosage}</p>
                        <p><strong>${this.getCurrentTranslation().date}:</strong> ${med.date}</p>
                        <p><strong>${this.getCurrentTranslation().day}:</strong> ${this.getCurrentTranslation().days[new Date(med.date).getDay()]}</p>
                        <p><strong>${this.getCurrentTranslation().time}:</strong> ${med.time}</p>
                    </div>
                    <div class="medication-actions">
                        <button class="btn-calendar" onclick="medicationApp.addToGoogleCalendar(${med.id})">
                            <i class="fab fa-google"></i> ${this.getCurrentTranslation().addToCalendar}
                        </button>
                        <button class="btn-delete" onclick="medicationApp.deleteMedication(${med.id})">
                            <i class="fas fa-trash"></i> ${this.getCurrentTranslation().delete}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    filterMedications(filter) {
        this.currentFilter = filter;
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
        this.displayMedications();
    }

    deleteMedication(id) {
        this.medications = this.medications.filter(med => med.id !== id);
        this.saveMedications();
        this.displayMedications();
        this.updateDashboard();
    }

    addToGoogleCalendar(id) {
        const med = this.medications.find(m => m.id === id);
        if (!med) return;

        const startDate = new Date(med.datetime);
        const endDate = new Date(startDate.getTime() + 30 * 60000);

        const formatDate = (date) => {
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };

        const title = encodeURIComponent(`${this.getCurrentTranslation().notificationTitle}: ${med.name}`);
        const details = encodeURIComponent(`${this.getCurrentTranslation().dosage}: ${med.dosage}`);
        const dates = `${formatDate(startDate)}/${formatDate(endDate)}`;

        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}`;
        window.open(url, '_blank');
    }

    async requestNotificationPermission() {
        if ('Notification' in window) {
            if (Notification.permission === 'default') {
                const banner = document.getElementById('notificationBanner');
                banner.classList.remove('hidden');
            }
        }
    }

    async enableNotifications() {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            document.getElementById('notificationBanner').classList.add('hidden');
            this.scheduleNotifications();
        }
    }

    scheduleNotifications() {
        if (Notification.permission !== 'granted') return;

        const now = new Date();
        this.medications.forEach(med => {
            const medTime = new Date(med.datetime);
            if (medTime > now && !med.notified) {
                const timeUntil = medTime.getTime() - now.getTime();
                
                setTimeout(() => {
                    new Notification(this.getCurrentTranslation().notificationTitle, {
                        body: `${this.getCurrentTranslation().notificationBody} ${med.name} - ${med.dosage}`,
                        icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23667eea"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
                        tag: `medication-${med.id}`
                    });
                    
                    med.notified = true;
                    this.saveMedications();
                    this.displayMedications();
                }, timeUntil);
            }
        });
    }

    toggleLanguage() {
        this.isRTL = !this.isRTL;
        this.updateLanguage();
    }

    updateLanguage() {
        const html = document.documentElement;
        const lang = this.isRTL ? 'ar' : 'en';
        const dir = this.isRTL ? 'rtl' : 'ltr';
        
        html.setAttribute('lang', lang);
        html.setAttribute('dir', dir);
        
        document.getElementById('langToggle').textContent = this.isRTL ? 'EN' : 'AR';
        
        const t = this.getCurrentTranslation();
        document.querySelector('header h1').innerHTML = `<i class="fas fa-pills"></i> ${t.title}`;
        
        const addMedSection = document.querySelector('.add-medication h2');
        if (addMedSection) addMedSection.textContent = t.addNew;
        
        const labels = {
            'medName': t.medName,
            'medDosage': t.dosage,
            'medDate': t.date,
            'medTime': t.time
        };
        
        Object.entries(labels).forEach(([id, text]) => {
            const label = document.querySelector(`label[for="${id}"]`);
            if (label) label.textContent = text;
        });
        
        const btnPrimary = document.querySelector('.btn-primary');
        if (btnPrimary) btnPrimary.innerHTML = `<i class="fas fa-plus"></i> ${t.addMed}`;
        
        const medListTitle = document.querySelector('.medications-list h2');
        if (medListTitle) medListTitle.textContent = t.medList;
        
        const tabs = document.querySelectorAll('.tab-btn');
        if (tabs[0]) tabs[0].textContent = t.all;
        if (tabs[1]) tabs[1].textContent = t.upcoming;
        if (tabs[2]) tabs[2].textContent = t.past;
        
        this.displayMedications();
    }

    getCurrentTranslation() {
        return this.translations[this.isRTL ? 'ar' : 'en'];
    }

    switchSection(section) {
        this.currentSection = section;
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-section="${section}"]`).classList.add('active');
        
        document.getElementById('dashboard-section').classList.toggle('hidden', section !== 'dashboard');
        document.getElementById('medications-section').classList.toggle('hidden', section !== 'medications');
        
        if (section === 'dashboard') {
            this.updateDashboard();
        }
    }

    updateDashboard() {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
        
        const totalMeds = this.medications.length;
        const upcomingMeds = this.medications.filter(med => new Date(med.datetime) > now).length;
        const expiredMeds = this.medications.filter(med => new Date(med.datetime) <= now).length;
        const todayMeds = this.medications.filter(med => {
            const medDate = new Date(med.datetime);
            return medDate >= today && medDate < tomorrow;
        }).length;
        
        document.getElementById('totalMeds').textContent = totalMeds;
        document.getElementById('upcomingMeds').textContent = upcomingMeds;
        document.getElementById('expiredMeds').textContent = expiredMeds;
        document.getElementById('todayMeds').textContent = todayMeds;
        
        this.drawStatusChart();
        this.drawWeeklyChart();
    }

    drawStatusChart() {
        const canvas = document.getElementById('statusChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const now = new Date();
        const upcoming = this.medications.filter(med => new Date(med.datetime) > now).length;
        const expired = this.medications.filter(med => new Date(med.datetime) <= now).length;
        
        const total = upcoming + expired;
        if (total === 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#a0aec0';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 80;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        const upcomingAngle = (upcoming / total) * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, 0, upcomingAngle);
        ctx.fillStyle = '#48bb78';
        ctx.fill();
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, upcomingAngle, 2 * Math.PI);
        ctx.fillStyle = '#f56565';
        ctx.fill();
    }

    drawWeeklyChart() {
        const container = document.getElementById('weeklyChart');
        if (!container) return;
        
        const days = this.getCurrentTranslation().days;
        const weekData = new Array(7).fill(0);
        
        this.medications.forEach(med => {
            const dayOfWeek = new Date(med.date).getDay();
            weekData[dayOfWeek]++;
        });
        
        const maxCount = Math.max(...weekData, 1);
        
        container.innerHTML = weekData.map((count, index) => {
            const height = (count / maxCount) * 150;
            return `
                <div class="day-bar">
                    <div class="bar" style="height: ${height}px" title="${count} medications"></div>
                    <div class="day-label">${days[index].substring(0, 3)}</div>
                </div>
            `;
        }).join('');
    }

    exportData() {
        const data = {
            medications: this.medications,
            exportDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `medications-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data.medications && Array.isArray(data.medications)) {
                    this.medications = data.medications;
                    this.saveMedications();
                    this.displayMedications();
                    this.updateDashboard();
                    this.scheduleNotifications();
                    alert('Data imported successfully!');
                } else {
                    alert('Invalid file format!');
                }
            } catch (error) {
                alert('Error reading file!');
            }
        };
        reader.readAsText(file);
    }

    quickAddMedication() {
        this.switchSection('medications');
        document.getElementById('medName').focus();
    }

    clearExpiredMedications() {
        const now = new Date();
        const expiredCount = this.medications.filter(med => new Date(med.datetime) <= now).length;
        
        if (expiredCount === 0) {
            alert('No expired medications to clear!');
            return;
        }
        
        if (confirm(`Delete ${expiredCount} expired medications?`)) {
            this.medications = this.medications.filter(med => new Date(med.datetime) > now);
            this.saveMedications();
            this.displayMedications();
            this.updateDashboard();
            alert(`${expiredCount} expired medications deleted!`);
        }
    }

    openGoogleCalendar() {
        window.open('https://calendar.google.com', '_blank');
    }

    setGeneralReminder() {
        if (Notification.permission !== 'granted') {
            alert('Please enable notifications first!');
            return;
        }
        
        const time = prompt('Set reminder time (minutes from now):');
        if (time && !isNaN(time)) {
            setTimeout(() => {
                new Notification('Medication Reminder', {
                    body: 'Don\'t forget to check your medications!',
                    icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23667eea"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>'
                });
            }, parseInt(time) * 60000);
            alert(`Reminder set for ${time} minutes!`);
        }
    }
}

const medicationApp = new MedicationReminder();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    });
}