# Changelog Plugin Audit Rekam Medis Elektronik (RME) SIMGoS2

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
