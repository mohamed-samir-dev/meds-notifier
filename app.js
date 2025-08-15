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
        this.registerServiceWorker();
        this.requestNotificationPermission();
        await this.loadMedications();
        this.updateMedicationList();
        this.scheduleExistingMedications();
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
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                console.log('Notification permission granted');
            } else {
                alert('يرجى السماح بالإشعارات لتلقي تذكيرات الأدوية');
            }
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
                this.scheduleNextRepeat(medication);
            }, timeUntil);
        }
    }

    scheduleNextRepeat(medication) {
        if (medication.repeat === 'daily') {
            const nextDate = new Date(medication.date);
            nextDate.setDate(nextDate.getDate() + 1);
            const nextMed = {
                ...medication,
                id: Date.now(),
                date: nextDate.toISOString().split('T')[0],
                taken: false
            };
            this.medications.push(nextMed);
            this.saveMedications();
            this.scheduleNotification(nextMed);
        } else if (medication.repeat === 'weekly') {
            const nextDate = new Date(medication.date);
            nextDate.setDate(nextDate.getDate() + 7);
            const nextMed = {
                ...medication,
                id: Date.now(),
                date: nextDate.toISOString().split('T')[0],
                taken: false
            };
            this.medications.push(nextMed);
            this.saveMedications();
            this.scheduleNotification(nextMed);
        }
    }

    showNotification(medication) {
        if (Notification.permission === 'granted') {
            const notification = new Notification(`وقت تناول ${medication.name}`, {
                body: `الجرعة: ${medication.dosage}\nالوقت: ${medication.time}`,
                icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiM0RjQ2RTUiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiPgo8cGF0aCBkPSJNMTcgMjFWN2EyIDIgMCAwIDAtMi0ySDlhMiAyIDAgMCAwLTIgMnYxNGwyIDEuNSAyLTEuNSAyIDEuNSAyLTEuNSAyIDEuNVoiLz4KPHN0cm9rZSBkPSJNOSA5aDYiLz4KPHN0cm9rZSBkPSJNOSAxM2g2Ii8+CjwvcGF0aD4KPC9zdmc+Cjwvc3ZnPg==',
                tag: `medication-${medication.id}`,
                requireInteraction: true
            });
            
            // Play notification sound
            this.playNotificationSound();
            
            // Vibrate on mobile devices
            if ('vibrate' in navigator) {
                navigator.vibrate([200, 100, 200]);
            }
            
            // Auto-close after 10 seconds
            setTimeout(() => {
                notification.close();
            }, 10000);
        }
    }
    
    playNotificationSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (error) {
            console.log('Audio notification not supported');
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
            const endDate = new Date(startDate.getTime() + 15 * 60000); // 15 minutes later
            
            const formatDate = (date) => {
                return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
            };

            const title = `تذكير دواء: ${medication.name}`;
            const details = `اسم الدواء: ${medication.name}\nالجرعة: ${medication.dosage}\nالوقت: ${medication.time}\n\nتذكير من تطبيق تذكير الأدوية`;
            
            const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent('منزل')}`;
            
            // Also generate .ics file as fallback
            this.generateICSFile(medication, startDate, endDate);
            
            window.open(calendarUrl, '_blank');
        }
    }
    
    generateICSFile(medication, startDate, endDate) {
        const formatICSDate = (date) => {
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        };
        
        const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//Medication Reminder//AR',
            'BEGIN:VEVENT',
            `UID:${medication.id}@medicationreminder.app`,
            `DTSTART:${formatICSDate(startDate)}`,
            `DTEND:${formatICSDate(endDate)}`,
            `SUMMARY:تذكير دواء: ${medication.name}`,
            `DESCRIPTION:اسم الدواء: ${medication.name}\nالجرعة: ${medication.dosage}`,
            'BEGIN:VALARM',
            'TRIGGER:-PT5M',
            'ACTION:DISPLAY',
            `DESCRIPTION:وقت تناول ${medication.name}`,
            'END:VALARM',
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');
        
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        
        // Store for potential download
        medication.icsUrl = url;
    }
    
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js');
                console.log('Service Worker registered:', registration);
            } catch (error) {
                console.log('Service Worker registration failed:', error);
            }
        }
    }
    
    scheduleExistingMedications() {
        this.medications.forEach(medication => {
            if (!medication.taken) {
                this.scheduleNotification(medication);
            }
        });
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