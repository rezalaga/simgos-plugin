# Changelog Plugin Audit Rekam Medis Elektronik (RME) SIMGoS2

## [1.0.0-26111807] - 2026-11-18
### Changed & Fixed
- Peningkatan tampilan tab header: pembesaran icon tab audit RME menjadi 21px, opacity penuh, warna biru tegas, dan tombol close tab proporsional.
- Perubahan label dokumen 'Triase (ATS)' menjadi 'Triase' pada seluruh rules klinis, indikator chip, dan deteksi anomali IGD.
- Penambahan filter dinamis Poliklinik (Rawat Jalan) dan Ruangan Rawat Inap (Ranap) yang adaptif terhadap pilihan Jenis Pelayanan.
- Pembersihan teks 'Fast-Lane Edit' pada header kolom dan judul modal editor berkas RME.
- Perbaikan payload referensi Kunjungan pada modal editor untuk mencegah error 414 Request-URI Too Large pada riwayat catatan medis.
- Filter default eksklusi kunjungan penunjang (Farmasi, Lab, Radiologi) dari dashboard audit RME.

## [1.0.0-26111800] - 2026-11-18
### Added
- Inisiasi awal plugin Audit Kelengkapan & Kualitas Rekam Medis Elektronik (RME).
- Backend REST Service `/auditrekammedis/kelengkapan` untuk audit kunjungan real-time.
- Perhitungan dinamis persentase kelengkapan rekam medis per pasien.
- Engine deteksi anomali klinis & administratif (resume belum terisi pada pasien final, koding ICD-10 kosong, ketiadaan CPPT DPJP pada rawat inap > 24 jam, tindakan operasi tanpa laporan/safety checklist).
- Frontend ExtJS SIMpel package `audit-rekam-medis.js` dengan grid interaktif, filter multi-dimensi, ringkasan metrik statistik, dan Fast-Lane Modal Direct Edit.
- Skrip migrasi database dan registrasi modul `9035` di menu aplikasi SIMGoS.
