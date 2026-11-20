# Changelog Plugin Audit Rekam Medis Elektronik (RME) SIMGoS2

## [1.0.0-26111818] - 2026-11-20
### Removed
- Menghilangkan bilah toolbar atas (tbar) pada panel detail yang memuat teks nama/RM pasien dan tombol duplikat (Tandai Selesai, Update Status, Anomali) untuk mengeliminasi dobel menu dan memperluas area kerja vertikal dokumen RME.

## [1.0.0-26111817] - 2026-11-20
### Added
- Tata letak 2 jendela (Master-Detail Split View) dengan pembagian layar:
  - Panel Kiri (Master): Daftar pasien audit ringkas (Pasien, Kunjungan & Ruang, DPJP, Progress Bar Kepatuhan & Badge Anomali) dengan splitter yang dapat di-resize dan dilipat (collapsible).
  - Panel Kanan (Detail): Penampil detail komprehensif pasien terpilih berisi:
    1. Kartu Ringkasan Pasien (Identitas, RM, Reg, Kunjungan, Ruangan, DPJP, Tanggal, dan Skor Kepatuhan RME).
    2. Bilah Interaktif Status & Aksi Verifikasi Cepat (Status Verifikasi RM, Kelengkapan Berkas, tombol "Tandai Selesai & Lengkap", dan "Ubah Status").
    3. Kotak Peringatan Anomali Klinis (menampilkan rincian anomali dan panduan tindak lanjut jika terdeteksi anomali pada pasien).
    4. Checklist Dokumen Rekam Medis Elektronik Vertikal: Rincian status per dokumen (Resume Medis, Diagnosa ICD-10, Anamnesis, TTV, CPPT, Triase, Operasi, SSC, General Consent, Edukasi) lengkap dengan tombol langsung "Buka Dokumen / Koreksi / Lengkapi Form" (Fast-Lane Editor).
- Fitur auto-select baris pertama pada saat data selesai dimuat dan re-selection otomatis pasien aktif setelah jendela editor ditutup.

## [1.0.0-26111816] - 2026-11-18
### Removed
- Menghilangkan banner header statis pada bagian atas modul Audit Rekam Medis untuk memberikan ruang vertikal yang lebih luas bagi tabel data pasien dan metrik KPI.

## [1.0.0-26111815] - 2026-11-18
### Added
- Integrasi pembaruan status Verifikasi RM (inacbg.grouping) dan Kelengkapan Berkas (berkas_klaim.kelengkapan) langsung dari modul Audit Rekam Medis.
- Tampilan badge indikator Verifikasi RM dan Kelengkapan Berkas di kolom Kunjungan & Ruangan pada grid audit.
- Dialog aksi cepat 'Update Status Verifikasi & Berkas Klaim' dari tombol baris grid maupun saat mengklik badge.
- Bilah aksi verifikasi dan tombol cepat 'Tandai Selesai & Lengkap' pada bottom toolbar modal editor berkas RME.
- Endpoint REST API PUT/POST pada webservice Audit Kelengkapan untuk sinkronisasi otomatis status verifikasi dan berkas ke tabel inacbg dan berkas_klaim.

## [1.0.0-26111814] - 2026-11-18
### Changed
- Menghilangkan tombol ekstra 'Tutup' pada bilah header jendela modal Deteksi Anomali Rekam Medis, menyisakan tombol kontrol standar window (close) di header dan tombol navigasi di footer.

## [1.0.0-26111813] - 2026-11-18
### Changed
- Menghilangkan tombol ekstra 'Tutup Form' pada bilah header modal editor berkas RME, menyisakan tombol kontrol standar window (maximize & close).

## [1.0.0-26111812] - 2026-11-18
### Changed
- Penyesuaian ukuran icon tab header audit RME menjadi 20px (proporsional dan berwarna biru rekam medis) yang terisolasi khusus pada elemen `.x-tab-icon-el.fa-clipboard-check` tanpa mengganggu struktur/layout ukuran tab ExtJS.

## [1.0.0-26111811] - 2026-11-18
### Changed & Fixed
- Mengembalikan ukuran tab header Audit RME ke ukuran standar bawaan ExtJS/SIMpel (menghapus CSS paksaan tab yang menyebabkan tab melebar hingga 100%).
- Menghilangkan keterangan teks jenis kunjungan `(Hemodialisa)` pada kolom grid Kunjungan & Ruangan untuk pasien Hemodialisis sehingga hanya menampilkan nama ruangan secara bersih.

## [1.0.0-26111810] - 2026-11-18
### Changed & Fixed
- Penyesuaian jenis kunjungan Hemodialisa: label kunjungan diset secara khusus menjadi 'Hemodialisa' (bukan 'Penunjang' dan bukan 'Rawat Jalan') dengan tetap mempertahankan dropdown filter Hemodialisa (HD).
- Penataan posisi tombol close tab (tanda silang `×`) pada sudut kanan atas header tab (`position: absolute; top: 2px; right: 3px;`) agar rapi, sejajar, dan tidak turun ke bawah judul/icon tab.

## [1.0.0-26111809] - 2026-11-18
### Fixed
- Menghilangkan teks "Tutup tab" yang bocor/tampil pada tab header modul Audit Rekam Medis melalui sanitasi text node DOM, `closeText: ""`, dan isolasi styling font/pseudo-elemen ikon FontAwesome.

## [1.0.0-26111808] - 2026-11-18
### Fixed
- Perbaikan filter status kunjungan & pendaftaran (`k.STATUS != 0` dan `p.STATUS != 0`) agar mencakup pasien aktif maupun yang sudah selesai diperiksa dokter (`STATUS = 2`), mencegah data kosong saat memfilter poli atau tanggal lampau.
- Penambahan kapabilitas *dual-matching* pada filter ruangan (ID dan Deskripsi nama ruangan) untuk menjamin akurasi pemilihan poli dan bangsal ranap.

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
