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
        this.scheduleNotifications();
        document.getElementById('medicationForm').reset();
    }

    saveMedications() {
        localStorage.setItem('medications', JSON.stringify(this.medications));
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
}

const medicationApp = new MedicationReminder();

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => console.log('SW registered'))
            .catch(error => console.log('SW registration failed'));
    });
}