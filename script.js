// Fungsi untuk memformat tanggal ke format Indonesia
function formatTanggalIndonesia(tanggal) {
    const bulan = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    
    const tanggalObj = new Date(tanggal);
    const hari = tanggalObj.getDate();
    const namaBulan = bulan[tanggalObj.getMonth()];
    const tahun = tanggalObj.getFullYear();
    
    return `${hari} ${namaBulan} ${tahun}`;
}

// Fungsi untuk menghitung tanggal sampai berdasarkan tanggal dari dan selama
function hitungTanggalSampai(dariTanggal, selama) {
    const tanggalDari = new Date(dariTanggal);
    const tanggalSampai = new Date(tanggalDari);
    tanggalSampai.setDate(tanggalDari.getDate() + parseInt(selama) - 1);
    
    return tanggalSampai.toISOString().split('T')[0];
}

// Fungsi untuk mengisi dropdown pegawai
async function isiDropdownPegawai() {
    const selectPegawai = document.getElementById('pegawai');

    // Clear existing options except the first one
    while (selectPegawai.children.length > 1) {
        selectPegawai.removeChild(selectPegawai.lastChild);
    }

    try {
        const employees = await db.getAllEmployees();
        if (employees.length === 0) {
            // If database is empty, initialize with default data
            await db.initializeDefaultData();
            const defaultEmployees = await db.getAllEmployees();
            defaultEmployees.forEach((pegawai) => {
                const option = document.createElement('option');
                option.value = pegawai.id;
                option.textContent = pegawai.nama;
                selectPegawai.appendChild(option);
            });
        } else {
            employees.forEach((pegawai) => {
                const option = document.createElement('option');
                option.value = pegawai.id;
                option.textContent = pegawai.nama;
                selectPegawai.appendChild(option);
            });
        }
    } catch (error) {
        console.error('Error loading employees from database:', error);
        // Fallback to static data if database fails
        dataPegawai.forEach((pegawai, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = pegawai.nama;
            selectPegawai.appendChild(option);
        });
    }
}

// Fungsi untuk menampilkan informasi pegawai
async function tampilkanInfoPegawai(employeeId) {
    const pegawaiInfo = document.getElementById('pegawaiInfo');

    // Ensure employeeId is a number for database lookup
    const employeeIdNum = parseInt(employeeId, 10);

    try {
        const pegawai = await db.getEmployeeById(employeeIdNum);
        if (pegawai) {
            document.getElementById('infoNip').textContent = pegawai.nip;
            document.getElementById('infoGol').textContent = pegawai.golongan;
            document.getElementById('infoJabatan').textContent = pegawai.jabatan;

            pegawaiInfo.style.display = 'block';
        }
    } catch (error) {
        console.error('Error loading employee info from database:', error);
        // Fallback: find by name from dropdown selection
        const selectedOption = document.getElementById('pegawai').selectedOptions[0];
        if (selectedOption) {
            const employeeName = selectedOption.textContent;

            try {
                // Try to get all employees from database and find by name
                const employees = await db.getAllEmployees();
                const selectedEmployee = employees.find(emp => emp.nama === employeeName);
                if (selectedEmployee) {
                    document.getElementById('infoNip').textContent = selectedEmployee.nip;
                    document.getElementById('infoGol').textContent = selectedEmployee.golongan;
                    document.getElementById('infoJabatan').textContent = selectedEmployee.jabatan;
                    pegawaiInfo.style.display = 'block';
                }
            } catch (dbError) {
                console.error('Database search by name failed:', dbError);
                // Last resort: search in static data
                const fallbackEmployee = dataPegawai.find(emp => emp.nama === employeeName);
                if (fallbackEmployee) {
                    document.getElementById('infoNip').textContent = fallbackEmployee.nip;
                    document.getElementById('infoGol').textContent = fallbackEmployee.golongan;
                    document.getElementById('infoJabatan').textContent = fallbackEmployee.jabatan;
                    pegawaiInfo.style.display = 'block';
                }
            }
        }
    }
}

// Fungsi untuk generate surat tugas
async function generateSuratTugas() {
    const form = document.getElementById('suratForm');
    const formData = new FormData(form);

    const employeeId = document.getElementById('pegawai').value;
    const selama = document.getElementById('selama').value;
    const dariTanggal = document.getElementById('dariTanggal').value;
    const sampaiTanggal = document.getElementById('sampaiTanggal').value;
    const maksud = document.getElementById('maksud').value;
    const tujuan = document.getElementById('tujuan').value;
    const nomorSurat = document.getElementById('nomorSurat').value;

    let pegawai;

    // Ensure employeeId is a number for database lookup
    const employeeIdNum = parseInt(employeeId, 10);

    try {
        pegawai = await db.getEmployeeById(employeeIdNum);
    } catch (error) {
        console.error('Error loading employee from database:', error);
        // Fallback: find by name from dropdown selection
        const selectedOption = document.getElementById('pegawai').selectedOptions[0];
        if (selectedOption) {
            const employeeName = selectedOption.textContent;

            try {
                // Try to get all employees from database and find by name
                const employees = await db.getAllEmployees();
                pegawai = employees.find(emp => emp.nama === employeeName);
            } catch (dbError) {
                console.error('Database search by name failed:', dbError);
                // Last resort: search in static data
                pegawai = dataPegawai.find(emp => emp.nama === employeeName);
            }
        }
    }

    if (!pegawai) {
        alert('Data pegawai tidak ditemukan!');
        return;
    }

    const tanggalIndonesia = formatTanggalIndonesia(dariTanggal);
    const sampaiTanggalIndonesia = formatTanggalIndonesia(sampaiTanggal);

    // Save trip record to database
    try {
        const tripRecord = {
            employeeId: parseInt(employeeId),
            nomorSurat: nomorSurat,
            maksud: maksud,
            tujuan: tujuan,
            tanggalDari: dariTanggal,
            tanggalSampai: sampaiTanggal,
            selama: parseInt(selama),
            createdAt: new Date().toISOString()
        };
        await db.addTrip(tripRecord);
        console.log('Trip record saved successfully');
    } catch (error) {
        console.error('Error saving trip record:', error);
    }

    const suratHTML = `
        <div class="surat-tugas">
            <div class="header-surat">
                <div class="header-content">
                    <div class="logo-section">
                        <div class="logo-placeholder">
                            <img src="logo.jpg" alt="Logo Dinas Komunikasi dan Informatika" class="logo-image">
                        </div>
                    </div>
                    <div class="header-text">
                        <h2>PEMERINTAH KABUPATEN SUMBA BARAT DAYA</h2>
                        <h3>DINAS KOMUNIKASI DAN INFORMATIKA</h3>
                        <p>Jln.Ir. Soekarno, Kadula, kec. Kota. Tambolaka, Kab. SBD, Prov. NTT</p>
                        <p>Email: @gmail.com Kode pos 87261</p>
                    </div>
                </div>
                <div class="header-line"></div>
            </div>

            <div class="judul-surat">
                <h2>SURAT PERINTAH PERJALANAN DINAS</h2>
                <p><strong>Nomor : ${nomorSurat}</strong></p>
            </div>

            <div class="isi-surat">
                <div class="paragraf-pembuka">
                    <p>Yang bertanda tangan di bawah ini Kepala Dinas Komunikasi dan Informatika memberikan tugas kepada :</p>
                </div>

                <div class="data-pegawai">
                    <table class="table-pegawai">
                        <tr>
                            <td class="label">Nama</td>
                            <td class="separator">:</td>
                            <td class="value">${pegawai.nama}</td>
                        </tr>
                        <tr>
                            <td class="label">NIP</td>
                            <td class="separator">:</td>
                            <td class="value">${pegawai.nip}</td>
                        </tr>
                        <tr>
                            <td class="label">Pangkat/Gol</td>
                            <td class="separator">:</td>
                            <td class="value">${pegawai.golongan}</td>
                        </tr>
                        <tr>
                            <td class="label">Jabatan</td>
                            <td class="separator">:</td>
                            <td class="value">${pegawai.jabatan}</td>
                        </tr>
                    </table>
                </div>

                <div class="tugas-detail">
                    <p><strong>Untuk ${maksud} tanggal ${tanggalIndonesia} sampai dengan tanggal ${sampaiTanggalIndonesia} di ${tujuan}</strong></p>
                </div>
                
                <div class="paragraf-penutup">
                    <p>Demikian surat tugas ini dibuat agar dapat dilaksanakan sebagaimana mestinya dan sesudahnya memberi laporan.</p>
                </div>
                
                <div class="ttd-section">
                    <div class="ttd-content">
                        <p class="ttd-title">Kepala Dinas Komunikasi dan Informatika</p>
                        <p class="ttd-subtitle">Kabupaten Sumba Barat Daya</p>
                        <div class="ttd-space"></div>
                        <p class="ttd-nama">drh. Rihimeha A. Praing, MP</p>
                        <p class="ttd-nip">NIP. 19680523 199803 1 005</p>
                        <p class="ttd-pangkat">Pembina Utama Muda-IV/C</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.getElementById('suratOutput').innerHTML = suratHTML;
    document.getElementById('outputContainer').style.display = 'block';
    
    // Scroll ke output
    document.getElementById('outputContainer').scrollIntoView({ behavior: 'smooth' });
}

// Fungsi untuk reset form
function resetForm() {
    document.getElementById('suratForm').reset();
    document.getElementById('pegawaiInfo').style.display = 'none';
    document.getElementById('outputContainer').style.display = 'none';
}

// Fungsi untuk print surat
function printSurat() {
    const suratContent = document.getElementById('suratOutput').innerHTML;
    const printWindow = window.open('', '_blank');
    
    printWindow.document.write(`
        <html>
        <head>
            <title>Surat Tugas Perjalanan Dinas</title>
            <style>
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Times New Roman', serif;
                    line-height: 1.8;
                    color: #333;
                    background: white;
                    padding: 20px;
                }
                
                .surat-tugas {
                    max-width: 800px;
                    margin: 0 auto;
                    background: white;
                    padding: 0;
                    box-shadow: none;
                }
                
                .header-surat {
                    margin-bottom: 40px;
                    padding-bottom: 20px;
                }
                
                .header-content {
                    display: flex;
                    align-items: flex-start;
                    gap: 20px;
                    margin-bottom: 20px;
                }
                
                .logo-section {
                    flex-shrink: 0;
                }
                
                .logo-placeholder {
                    width: 80px;
                    height: 80px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 2px solid #333;
                    border-radius: 8px;
                    background: white;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                    overflow: hidden;
                }
                
                .logo-image {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    border-radius: 6px;
                    filter: grayscale(100%);
                }
                
                .header-text {
                    flex: 1;
                    text-align: center;
                }
                
                .header-text h2 {
                    font-size: 18px;
                    font-weight: bold;
                    margin-bottom: 10px;
                    color: #2c3e50;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                
                .header-text h3 {
                    font-size: 16px;
                    font-weight: bold;
                    margin-bottom: 10px;
                    color: #2c3e50;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                
                .header-text p {
                    font-size: 14px;
                    margin: 5px 0;
                    color: #555;
                    font-weight: 500;
                }
                
                .header-line {
                    height: 3px;
                    background: #333;
                    border-radius: 2px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                }
                
                .judul-surat {
                    text-align: center;
                    margin: 30px 0;
                }
                
                .judul-surat h2 {
                    font-size: 18px;
                    font-weight: bold;
                    margin-bottom: 10px;
                    color: #2c3e50;
                }
                
                .isi-surat {
                    margin: 30px 0;
                    font-size: 14px;
                    line-height: 1.8;
                }
                
                .paragraf-pembuka {
                    margin: 20px 0;
                    text-align: justify;
                }
                
                .paragraf-pembuka p {
                    margin: 0;
                    font-size: 14px;
                    text-indent: 0;
                }
                
                .data-pegawai {
                    margin: 25px 0;
                    padding: 0;
                }
                
                .table-pegawai {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 15px 0;
                }
                
                .table-pegawai tr {
                    border-bottom: 1px solid #333;
                }
                
                .table-pegawai td {
                    padding: 8px 0;
                    vertical-align: top;
                }
                
                .table-pegawai .label {
                    width: 120px;
                    font-weight: bold;
                    color: #2c3e50;
                }
                
                .table-pegawai .separator {
                    width: 20px;
                    text-align: center;
                    font-weight: bold;
                    color: #2c3e50;
                }
                
                .table-pegawai .value {
                    color: #333;
                    font-weight: 500;
                }
                
                .tugas-detail {
                    margin: 25px 0;
                    padding: 15px;
                    background: #f5f5f5;
                    border-radius: 8px;
                    border-left: 3px solid #333;
                }
                
                .tugas-detail p {
                    margin: 0;
                    font-size: 14px;
                    font-weight: bold;
                    color: #2c3e50;
                }
                
                .paragraf-penutup {
                    margin: 30px 0;
                    text-align: justify;
                }
                
                .paragraf-penutup p {
                    margin: 0;
                    font-size: 14px;
                    text-indent: 0;
                }
                
                .ttd-section {
                    margin-top: 60px;
                    display: flex;
                    justify-content: flex-end;
                }
                
                .ttd-content {
                    text-align: center;
                    min-width: 300px;
                }
                
                .ttd-title {
                    font-weight: bold;
                    font-size: 14px;
                    margin: 0 0 5px 0;
                    color: #2c3e50;
                }
                
                .ttd-subtitle {
                    font-size: 12px;
                    margin: 0 0 20px 0;
                    color: #555;
                }
                
                .ttd-space {
                    height: 60px;
                    border-bottom: 1px solid #333;
                    margin-bottom: 10px;
                }
                
                .ttd-nama {
                    font-weight: bold;
                    font-size: 14px;
                    margin: 5px 0;
                    color: #2c3e50;
                }
                
                .ttd-nip {
                    font-size: 12px;
                    margin: 5px 0;
                    color: #555;
                }
                
                .ttd-pangkat {
                    font-size: 12px;
                    margin: 5px 0;
                    color: #555;
                }
                
                .ttd-tanggal {
                    font-size: 12px;
                    margin: 5px 0;
                    color: #555;
                }
                
                @media print {
                    body {
                        margin: 0;
                        padding: 20px;
                    }
                    
                    .surat-tugas {
                        max-width: none;
                        margin: 0;
                    }
                    
                    .header-content {
                        display: flex;
                        align-items: flex-start;
                        gap: 15px;
                    }
                    
                    .logo-placeholder {
                        border: 2px solid #333 !important;
                        background: white !important;
                    }
                    
                    .logo-image {
                        filter: grayscale(100%);
                    }
                    
                    .header-line {
                        background: #333 !important;
                        height: 2px !important;
                    }
                    
                    .table-pegawai tr {
                        border-bottom: 1px solid #333 !important;
                    }
                    
                    .ttd-space {
                        border-bottom: 1px solid #333 !important;
                    }
                    
                    .tugas-detail {
                        background: #f5f5f5 !important;
                        border-left: 3px solid #333 !important;
                    }
                }
            </style>
        </head>
        <body>
            ${suratContent}
        </body>
        </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
}

// Event listeners
document.addEventListener('DOMContentLoaded', async function() {
    // Initialize database
    try {
        await db.init();
        await db.initializeDefaultData();
        console.log('Database initialized successfully');
    } catch (error) {
        console.error('Database initialization failed:', error);
    }

    // Isi dropdown pegawai saat halaman dimuat
    await isiDropdownPegawai();

    // Event listener untuk perubahan pilihan pegawai
    document.getElementById('pegawai').addEventListener('change', async function() {
        if (this.value !== '') {
            await tampilkanInfoPegawai(this.value);
        } else {
            document.getElementById('pegawaiInfo').style.display = 'none';
        }
    });

    // Event listener untuk perubahan tanggal dari
    document.getElementById('dariTanggal').addEventListener('change', function() {
        const selama = document.getElementById('selama').value;
        if (selama && this.value) {
            const sampaiTanggal = hitungTanggalSampai(this.value, selama);
            document.getElementById('sampaiTanggal').value = sampaiTanggal;
        }
    });

    // Event listener untuk perubahan selama
    document.getElementById('selama').addEventListener('change', function() {
        const dariTanggal = document.getElementById('dariTanggal').value;
        if (dariTanggal && this.value) {
            const sampaiTanggal = hitungTanggalSampai(dariTanggal, this.value);
            document.getElementById('sampaiTanggal').value = sampaiTanggal;
        }
    });

    // Event listener untuk form submit
    document.getElementById('suratForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await generateSuratTugas();
    });

    // Set tanggal default ke hari ini
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('dariTanggal').value = today;
});
