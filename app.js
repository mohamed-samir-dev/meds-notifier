class MedicationReminder {
    constructor() {
        this.medications = [];
        this.db = new MedicationDB();
        this.init();
    }

    async init() {
        try {
            await this.db.init();
        } catch (error) {
            console.warn('IndexedDB not available, using LocalStorage');
        }
        this.setupEventListeners();
        this.requestNotificationPermission();
        await this.loadMedications();
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

    async addMedication() {
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
        await this.saveMedications();
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

        const activeMedications = this.medications.filter(med => !med.taken);
        
        if (activeMedications.length === 0) {
            listContainer.innerHTML = '<p style="text-align: center; color: #6B7280;">لا توجد أدوية مجدولة</p>';
            return;
        }

        activeMedications.forEach(med => {
            const medElement = document.createElement('div');
            medElement.className = 'medication-item';
            const countdown = this.getCountdown(med);
            medElement.innerHTML = `
                <h3>${med.name}</h3>
                <p>الجرعة: ${med.dosage}</p>
                <p>التاريخ: ${med.date} - الوقت: ${med.time}</p>
                <p class="countdown" data-id="${med.id}">${countdown}</p>
                <div class="medication-actions">
                    <button class="btn-small btn-taken" onclick="app.markAsTaken(${med.id})">تم التناول</button>
                    <button class="btn-small btn-calendar" onclick="app.addToCalendar(${med.id})">إضافة للتقويم</button>
                </div>
            `;
            listContainer.appendChild(medElement);
        });
        
        this.startCountdownTimer();
    }

    async markAsTaken(id) {
        const medication = this.medications.find(med => med.id === id);
        if (medication) {
            medication.taken = true;
            await this.saveMedications();
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

    async saveMedications() {
        try {
            if (this.db.db) {
                for (const med of this.medications) {
                    await this.db.updateMedication(med);
                }
            } else {
                localStorage.setItem('medications', JSON.stringify(this.medications));
            }
        } catch (error) {
            localStorage.setItem('medications', JSON.stringify(this.medications));
        }
    }

    async loadMedications() {
        try {
            if (this.db.db) {
                this.medications = await this.db.getAllMedications();
            } else {
                const saved = localStorage.getItem('medications');
                if (saved) {
                    this.medications = JSON.parse(saved);
                }
            }
        } catch (error) {
            const saved = localStorage.getItem('medications');
            if (saved) {
                this.medications = JSON.parse(saved);
            }
        }
    }
}

    getCountdown(medication) {
        const scheduledTime = new Date(`${medication.date}T${medication.time}`);
        const now = new Date();
        const diff = scheduledTime.getTime() - now.getTime();
        
        if (diff <= 0) {
            return 'حان وقت التناول!';
        }
        
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) {
            return `${days} يوم و ${hours} ساعة`;
        } else if (hours > 0) {
            return `${hours} ساعة و ${minutes} دقيقة`;
        } else {
            return `${minutes} دقيقة`;
        }
    }
    
    startCountdownTimer() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }
        
        this.countdownInterval = setInterval(() => {
            const countdownElements = document.querySelectorAll('.countdown');
            countdownElements.forEach(element => {
                const medId = parseInt(element.dataset.id);
                const medication = this.medications.find(med => med.id === medId);
                if (medication) {
                    element.textContent = this.getCountdown(medication);
                }
            });
        }, 60000); // Update every minute
    }
}

const app = new MedicationReminder();