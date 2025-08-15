class MedicationReminder {
    constructor() {
        this.medications = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.requestNotificationPermission();
        this.loadMedications();
        this.updateMedicationList();
    }

    setupEventListeners() {
        document.getElementById('addMedBtn').addEventListener('click', () => {
            this.showPage('addMedForm');
        });

        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.showPage('dashboard');
        });

        document.getElementById('medicationForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addMedication();
        });
    }

    showPage(pageId) {
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        document.getElementById(pageId).classList.add('active');
    }

    async requestNotificationPermission() {
        if ('Notification' in window) {
            await Notification.requestPermission();
        }
    }

    addMedication() {
        const name = document.getElementById('medName').value;
        const dosage = document.getElementById('dosage').value;
        const date = document.getElementById('medDate').value;
        const time = document.getElementById('medTime').value;
        const repeat = document.getElementById('repeatInterval').value;

        const medication = {
            id: Date.now(),
            name,
            dosage,
            date,
            time,
            repeat,
            taken: false
        };

        this.medications.push(medication);
        this.saveMedications();
        this.scheduleNotification(medication);
        this.updateMedicationList();
        this.showPage('dashboard');
        document.getElementById('medicationForm').reset();
    }

    scheduleNotification(medication) {
        const scheduledTime = new Date(`${medication.date}T${medication.time}`);
        const now = new Date();
        const timeUntil = scheduledTime.getTime() - now.getTime();

        if (timeUntil > 0) {
            setTimeout(() => {
                this.showNotification(medication);
            }, timeUntil);
        }
    }

    showNotification(medication) {
        if (Notification.permission === 'granted') {
            new Notification(`وقت تناول ${medication.name}`, {
                body: `الجرعة: ${medication.dosage}`,
                icon: 'icon-192.png'
            });
        }
    }

    updateMedicationList() {
        const listContainer = document.getElementById('medicationList');
        listContainer.innerHTML = '';

        this.medications.forEach(med => {
            const medElement = document.createElement('div');
            medElement.className = 'medication-item';
            medElement.innerHTML = `
                <h3>${med.name}</h3>
                <p>الجرعة: ${med.dosage}</p>
                <p>التاريخ: ${med.date} - الوقت: ${med.time}</p>
                <div class="medication-actions">
                    <button class="btn-small btn-taken" onclick="app.markAsTaken(${med.id})">تم التناول</button>
                    <button class="btn-small btn-calendar" onclick="app.addToCalendar(${med.id})">إضافة للتقويم</button>
                </div>
            `;
            listContainer.appendChild(medElement);
        });
    }

    markAsTaken(id) {
        const medication = this.medications.find(med => med.id === id);
        if (medication) {
            medication.taken = true;
            this.saveMedications();
            this.updateMedicationList();
        }
    }

    addToCalendar(id) {
        const medication = this.medications.find(med => med.id === id);
        if (medication) {
            const startDate = new Date(`${medication.date}T${medication.time}`);
            const endDate = new Date(startDate.getTime() + 30 * 60000); // 30 minutes later
            
            const formatDate = (date) => {
                return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            };

            const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(medication.name)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(`الجرعة: ${medication.dosage}`)}`;
            
            window.open(calendarUrl, '_blank');
        }
    }

    saveMedications() {
        localStorage.setItem('medications', JSON.stringify(this.medications));
    }

    loadMedications() {
        const saved = localStorage.getItem('medications');
        if (saved) {
            this.medications = JSON.parse(saved);
        }
    }
}

const app = new MedicationReminder();