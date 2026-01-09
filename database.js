// Database management for SPPD Generator
class SPPDDatabase {
    constructor() {
        this.dbName = 'SPPDGeneratorDB';
        this.version = 1;
        this.db = null;
    }

    // Initialize database
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);

            request.onerror = () => {
                console.error('Database error:', request.error);
                reject(request.error);
            };

            request.onsuccess = () => {
                this.db = request.result;
                console.log('Database opened successfully');
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Create employees table
                if (!db.objectStoreNames.contains('employees')) {
                    const employeesStore = db.createObjectStore('employees', { keyPath: 'id', autoIncrement: true });
                    employeesStore.createIndex('nip', 'nip', { unique: true });
                    employeesStore.createIndex('nama', 'nama', { unique: false });
                }

                // Create trips table
                if (!db.objectStoreNames.contains('trips')) {
                    const tripsStore = db.createObjectStore('trips', { keyPath: 'id', autoIncrement: true });
                    tripsStore.createIndex('employeeId', 'employeeId', { unique: false });
                    tripsStore.createIndex('tanggalDari', 'tanggalDari', { unique: false });
                    tripsStore.createIndex('tanggalSampai', 'tanggalSampai', { unique: false });
                }
            };
        });
    }

    // Initialize with default employee data if database is empty
    async initializeDefaultData() {
        const employees = await this.getAllEmployees();
        if (employees.length === 0) {
            const defaultEmployees = [
                {
                    nama: "drh. Rihimeha A. Praing, MP",
                    nip: "19680523 199803 1 005",
                    golongan: "IV/C",
                    jabatan: "Kepala Dinas Komunikasi Dan Informatika"
                },
                {
                    nama: "Drs. Aryanto Umbu Jawud",
                    nip: "19720419 199303 1 003",
                    golongan: "IV/B",
                    jabatan: "Sekretaris Dinas Komunikasi dan Informatika"
                },
                {
                    nama: "Yublina L. Dappa Sapu",
                    nip: "19670724 199702 2 001",
                    golongan: "IV/A",
                    jabatan: "Kepala Bidang Layanan Komunikasi dan Publik"
                },
                {
                    nama: "Paulus Laka, SH",
                    nip: "19670403 200801 1 014",
                    golongan: "IV/A",
                    jabatan: "Kepala Bidang Pengelola Informasi Publik"
                },
                {
                    nama: "Yerli Inti Milla Kenda, S.Sos",
                    nip: "19800801 200604 1 013",
                    golongan: "IV/A",
                    jabatan: "Kepala Bidang E-Govermen"
                },
                {
                    nama: "Nano Eko Prasetyo, ST",
                    nip: "19771216 201001 1 013",
                    golongan: "III/C",
                    jabatan: "Kepala Bidang Teknologi Informasi Komunikasi"
                },
                {
                    nama: "Thimotius N. Kalumbang, A.Md",
                    nip: "19710606 199903 1 008",
                    golongan: "III/B",
                    jabatan: "Fungsional"
                },
                {
                    nama: "Mauritz K. Mbele, S.Kom",
                    nip: "19830403 200903 1 004",
                    golongan: "III/B",
                    jabatan: "Fungsional"
                },
                {
                    nama: "Elpride Pane, SE",
                    nip: "19760216 201001 2 021",
                    golongan: "III/D",
                    jabatan: "Fungsional"
                },
                {
                    nama: "Alfredo K. Ortega, S.Kom",
                    nip: "19860508 201001 1 019",
                    golongan: "III/D",
                    jabatan: "Pranata Komputer"
                },
                {
                    nama: "Stepanus Umbu Robaka, SE",
                    nip: "19671231 200212 1 001",
                    golongan: "III/C",
                    jabatan: "Fungsional"
                },
                {
                    nama: "Filipus Rasa Moro Wawi, S.Sos",
                    nip: "197410 16 200903 1 003",
                    golongan: "III/D",
                    jabatan: "Fungsional"
                },
                {
                    nama: "Yoan Yismaya Rasi, SE",
                    nip: "19830623 201001 2 035",
                    golongan: "III/D",
                    jabatan: "Kasubag Keuangan"
                },
                {
                    nama: "Jemris Lomi Loba, S.IP",
                    nip: "19870720 201100 1 014",
                    golongan: "III/D",
                    jabatan: "Fungsional"
                },
                {
                    nama: "Juprison Sairo, S.Kom",
                    nip: "19860611 201402 1 003",
                    golongan: "III/D",
                    jabatan: "Fungsional"
                },
                {
                    nama: "Eduardus L. Bani, SE",
                    nip: "19750213 200801 1 014",
                    golongan: "III/C",
                    jabatan: "Fungsional"
                },
                {
                    nama: "Nikodemus U. Diala, A.Md",
                    nip: "19791119 200604 1 011",
                    golongan: "III/B",
                    jabatan: "Kasubag Kepegawaian"
                },
                {
                    nama: "Agusti Nunu, S.IP",
                    nip: "19850816 201402 1 011",
                    golongan: "III/B",
                    jabatan: "Fungsional"
                },
                {
                    nama: "Apliana Kartini Ande, A.Md",
                    nip: "19760421 201001 1 009",
                    golongan: "III/B",
                    jabatan: "STAF"
                },
                {
                    nama: "Khristina T. Daga, S.Sos",
                    nip: "19891215 201902 2 005",
                    golongan: "III/B",
                    jabatan: "STAF"
                },
                {
                    nama: "Yosua A.R.P Pratama, S.Kom",
                    nip: "19900726 201902 1 003",
                    golongan: "III/B",
                    jabatan: "STAF"
                },
                {
                    nama: "Sisilia S. Andung, S.Kom",
                    nip: "19852806 201902 2 003",
                    golongan: "III/A",
                    jabatan: "Pertama Pranata Komputer"
                },
                {
                    nama: "Yakub L. Seingo, S.Kom",
                    nip: "19890619 202321 1 019",
                    golongan: "III/A",
                    jabatan: "Ahli Pertama Pranata Komputer"
                },
                {
                    nama: "Anjela Ngadu",
                    nip: "19781022 201101 2 004",
                    golongan: "II/D",
                    jabatan: "STAF"
                }
            ];

            for (const employee of defaultEmployees) {
                await this.addEmployee(employee);
            }
            console.log('Default employee data initialized');
        }
    }

    // Employee operations
    async addEmployee(employee) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['employees'], 'readwrite');
            const store = transaction.objectStore('employees');
            const request = store.add(employee);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllEmployees() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['employees'], 'readonly');
            const store = transaction.objectStore('employees');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getEmployeeById(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['employees'], 'readonly');
            const store = transaction.objectStore('employees');
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async updateEmployee(employee) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['employees'], 'readwrite');
            const store = transaction.objectStore('employees');
            const request = store.put(employee);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteEmployee(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['employees'], 'readwrite');
            const store = transaction.objectStore('employees');
            const request = store.delete(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Trip operations
    async addTrip(trip) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['trips'], 'readwrite');
            const store = transaction.objectStore('trips');
            const request = store.add(trip);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllTrips() {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['trips'], 'readonly');
            const store = transaction.objectStore('trips');
            const request = store.getAll();

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getTripsByEmployeeId(employeeId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['trips'], 'readonly');
            const store = transaction.objectStore('trips');
            const index = store.index('employeeId');
            const request = index.getAll(employeeId);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getTripById(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['trips'], 'readonly');
            const store = transaction.objectStore('trips');
            const request = store.get(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async updateTrip(trip) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['trips'], 'readwrite');
            const store = transaction.objectStore('trips');
            const request = store.put(trip);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteTrip(id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction(['trips'], 'readwrite');
            const store = transaction.objectStore('trips');
            const request = store.delete(id);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Get trip summary statistics
    async getTripSummary() {
        const trips = await this.getAllTrips();
        const employees = await this.getAllEmployees();

        const summary = {
            totalTrips: trips.length,
            tripsByEmployee: {},
            tripsByMonth: {},
            recentTrips: trips.slice(-10).reverse() // Last 10 trips
        };

        // Count trips by employee
        trips.forEach(trip => {
            if (!summary.tripsByEmployee[trip.employeeId]) {
                summary.tripsByEmployee[trip.employeeId] = 0;
            }
            summary.tripsByEmployee[trip.employeeId]++;
        });

        // Count trips by month
        trips.forEach(trip => {
            const date = new Date(trip.tanggalDari);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            if (!summary.tripsByMonth[monthKey]) {
                summary.tripsByMonth[monthKey] = 0;
            }
            summary.tripsByMonth[monthKey]++;
        });

        // Add employee names to summary
        summary.tripsByEmployeeWithNames = {};
        for (const [employeeId, count] of Object.entries(summary.tripsByEmployee)) {
            const employee = employees.find(emp => emp.id == employeeId);
            if (employee) {
                summary.tripsByEmployeeWithNames[employee.nama] = count;
            }
        }

        return summary;
    }

    // Close database
    close() {
        if (this.db) {
            this.db.close();
            console.log('Database closed');
        }
    }
}

// Global database instance
const db = new SPPDDatabase();
