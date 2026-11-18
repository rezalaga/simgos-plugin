# Plugin Audit Kelengkapan & Kualitas Rekam Medis Elektronik (RME) SIMGoS2

Plugin mandiri (*Zero Core Modification*) untuk sistem SIMGoS2 yang dirancang khusus untuk memonitor, mengaudit, dan mengoreksi kelengkapan formulir medis seluruh pasien secara cepat, akurat, dan terintegrasi.

---

## 🌟 Fitur Utama

1. **Audit Terpadu Seluruh Pasien**:
   - Mendukung seluruh jenis kunjungan: **Rawat Jalan**, **Gawat Darurat (IGD)**, dan **Rawat Inap**.
   - Menampilkan skor kelengkapan dalam bentuk **persentase (%) visual** (indikator progress bar hijau, kuning, merah).
2. **Matriks Dokumen Klinis Lengkap (7 Klaster / 12 Dokumen Utama)**:
   - Resume Medis Pulang (Discharge Summary)
   - Koding Diagnosa ICD-10 & Prosedur ICD-9-CM
   - Anamnesis & Keluhan Utama
   - Tanda-Tanda Vital (TTV)
   - Catatan Perkembangan Pasien Terintegrasi (CPPT & Verifikasi DPJP)
   - Triase ATS (Australasian Triage Scale)
   - Laporan Operasi & Pembedahan
   - Surgical Safety Checklist (Sign-In, Time-Out, Sign-Out)
   - General Consent Admisi
   - Informed Consent Tindakan Kedokteran
   - Catatan Edukasi Pasien dan Keluarga Terintegrasi
   - Rekonsiliasi Obat Pulang/Admisi
3. **Mesin Deteksi Data Anomali Otomatis**:
   - Mendeteksi pasien yang sudah dinyatakan Pulang/Final Hasil tetapi belum memiliki Resume Medis Pulang.
   - Mendeteksi pasien yang memiliki tindakan medis/resep tetapi koding ICD-10 belum diisi atau belum di-mapping.
   - Mendeteksi pasien rawat inap $> 24$ jam tanpa CPPT DPJP.
   - Mendeteksi riwayat operasi tanpa lembar Laporan Operasi atau Surgical Safety Checklist.
   - Mendeteksi pasien IGD tanpa lembar Triase ATS.
4. **Fast-Lane Direct Editor (Tanpa Buka Dashboard Kunjungan)**:
   - Petugas Rekam Medis (Coder / Verifikator) dapat langsung mengklik indikator dokumen (misal: `[Resume Medis]`, `[ICD-10]`, dll.) di tabel audit.
   - Sistem akan langsung membuka **modal pop-up editor form bawaan SIMGoS** secara instan.
   - Setelah selesai disimpan, status kelengkapan dan persentase di grid audit langsung ter-update secara *real-time*.
5. **Ekspor Laporan Audit ke CSV / Excel**:
   - Memudahkan pelaporan berkala kepatuhan kelengkapan RME ke manajemen rumah sakit dan Komite Mutu/Rekam Medis.

---

## 📦 Metode Instalasi

### Opsi 1: Instalasi Menggunakan Paket RPM (Rekomendasi untuk Server Lain)
```bash
# 1. Bangun paket RPM di server pengembangan
bash build_rpm.sh

# 2. Salin file RPM yang dihasilkan ke server tujuan
scp simpel-audit-rekam-medis-1.0.0-26111800.x86_64.rpm user@server-tujuan:/tmp/

# 3. Di server tujuan, jalankan instalasi RPM:
sudo rpm -ivh /tmp/simpel-audit-rekam-medis-1.0.0-26111800.x86_64.rpm

# Untuk update di masa mendatang:
sudo rpm -Uvh /tmp/simpel-audit-rekam-medis-1.0.0-26111800.x86_64.rpm
```

### Opsi 2: Instalasi Menggunakan Shell Script (`install.sh`)
```bash
sudo bash install.sh
```

---

## 🔒 Standar Keamanan & Regulasi
- **Zero Core Modification**: Tidak menimpa (*overwrite*) file inti SIMGoS (`classic/app.js`, `modules.config.php`, `MedicalRecord`, dll.), sehingga kebal terhadap update resmi dari Kemenkes/SIMGoS.
- **Audit Trail (Permenkes 24/2022)**: Seluruh pengeditan tetap menggunakan komponen native form SIMGoS sehingga identitas akun petugas yang mengedit (`OLEH` dan timestamp) tercatat resmi di database transaksi.
