class MedicationDB {
    constructor() {
        this.dbName = 'MedicationReminderDB';
        this.version = 1;
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('medications')) {
                    const store = db.createObjectStore('medications', { keyPath: 'id' });
                    store.createIndex('date', 'date', { unique: false });
                    store.createIndex('time', 'time', { unique: false });
                }
            };
        });
    }

    async addMedication(medication) {
        const transaction = this.db.transaction(['medications'], 'readwrite');
        const store = transaction.objectStore('medications');
        return store.add(medication);
    }

    async getAllMedications() {
        const transaction = this.db.transaction(['medications'], 'readonly');
        const store = transaction.objectStore('medications');
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async updateMedication(medication) {
        const transaction = this.db.transaction(['medications'], 'readwrite');
        const store = transaction.objectStore('medications');
        return store.put(medication);
    }

    async deleteMedication(id) {
        const transaction = this.db.transaction(['medications'], 'readwrite');
        const store = transaction.objectStore('medications');
        return store.delete(id);
    }
}