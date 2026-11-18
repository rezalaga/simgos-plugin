-- -------------------------------------------------------------
-- Tabel Konfigurasi Rule Audit Kelengkapan Rekam Medis Elektronik
-- Database: medicalrecord
-- -------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `medicalrecord`.`audit_rme_rule` (
    `ID` varchar(30) NOT NULL,
    `NAMA` varchar(100) NOT NULL,
    `DESKRIPSI` text DEFAULT NULL,
    `JENIS_KUNJUNGAN` varchar(50) NOT NULL DEFAULT 'ALL' COMMENT 'ALL, 1=RJ, 2=IGD, 3=RI, 4=BEDAH',
    `IS_MANDATORY` tinyint(1) NOT NULL DEFAULT 1,
    `BOBOT` int(11) NOT NULL DEFAULT 10,
    `TRIGGER_CONDITION` varchar(100) NOT NULL DEFAULT 'NONE' COMMENT 'NONE, HAS_SURGERY, STAY_GT_24H, IS_FINAL, HAS_PRESCRIPTION',
    `TARGET_XTYPE` varchar(100) NOT NULL DEFAULT '',
    `TABEL_REF` varchar(100) NOT NULL DEFAULT '',
    `STATUS` tinyint(1) NOT NULL DEFAULT 1,
    PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- Data default 12 dokumen klinis rekam medis
INSERT INTO `medicalrecord`.`audit_rme_rule` (`ID`, `NAMA`, `DESKRIPSI`, `JENIS_KUNJUNGAN`, `IS_MANDATORY`, `BOBOT`, `TRIGGER_CONDITION`, `TARGET_XTYPE`, `TABEL_REF`, `STATUS`) VALUES
('RESUME', 'Resume Medis (Discharge Summary)', 'Ringkasan pulang rawat jalan, gawat darurat, atau rawat inap', 'ALL', 1, 20, 'IS_FINAL', 'rekammedis-resume-workspace', 'medicalrecord.resume', 1),
('DIAGNOSA', 'Diagnosa & Koding ICD-10', 'Diagnosa utama/sekunder dengan kode ICD-10 resmi', 'ALL', 1, 15, 'NONE', 'diagnosa-workspace', 'medicalrecord.diagnosa', 1),
('ANAMNESIS', 'Anamnesis & Keluhan Utama', 'Anamnesis, keluhan utama, riwayat penyakit sekarang/dahulu', 'ALL', 1, 10, 'NONE', 'rekammedis-anamnesis-workspace', 'medicalrecord.anamnesis', 1),
('TTV', 'Tanda-Tanda Vital', 'Pemeriksaan tekanan darah, nadi, suhu, pernapasan', 'ALL', 1, 10, 'NONE', 'rekammedis-anamnesis-workspace', 'medicalrecord.tanda_vital', 1),
('CPPT', 'CPPT & Catatan Terintegrasi', 'Catatan perkembangan pasien terintegrasi (SOAP/ADIME)', '3', 1, 15, 'NONE', 'rekammedis-cppt-workspace', 'medicalrecord.cppt', 1),
('TRIAGE', 'Triase ATS Gawat Darurat', 'Penilaian kegawatdaruratan Australasian Triage Scale', '2', 1, 15, 'NONE', 'rekammedis-triage-workspace', 'medicalrecord.triage_ats', 1),
('OPERASI', 'Laporan Operasi & Pembedahan', 'Laporan pembedahan/operasi oleh dokter operator', 'ALL', 0, 15, 'HAS_SURGERY', 'laporan-operasi-workspace', 'medicalrecord.operasi', 1),
('SSC', 'Surgical Safety Checklist', 'Sign-in, Time-out, dan Sign-out keselamatan bedah', 'ALL', 0, 10, 'HAS_SURGERY', 'laporan-operasi-workspace', 'medicalrecord.surgical_safety_checklist_signin', 1),
('GENERAL_CONSENT', 'General Consent Admisi', 'Persetujuan umum hak & kewajiban saat pendaftaran/admisi', 'ALL', 1, 5, 'NONE', 'rekammedis-uploaddocument-workspace', 'medicalrecord.general_consent', 1),
('INFORMED_CONSENT', 'Informed Consent Tindakan', 'Persetujuan/penolakan tindakan medis/operasi/transfusi', 'ALL', 0, 10, 'HAS_SURGERY', 'rekammedis-anamnesis-edukasi-workspace', 'medicalrecord.persetujuan_tindakan_dokter', 1),
('EDUKASI', 'Edukasi Pasien & Keluarga', 'Catatan edukasi terintegrasi mengenai penyakit & perawatan', '3', 1, 5, 'STAY_GT_24H', 'rekammedis-anamnesis-edukasi-workspace', 'medicalrecord.edukasi_pasien_keluarga', 1),
('REKONSILIASI_OBAT', 'Rekonsiliasi Obat Pulang/Admisi', 'Kajian rekonsiliasi obat oleh farmasi klinis', '3', 1, 5, 'IS_FINAL', 'rekammedis-rekonsiliasiobat-admisi-form', 'medicalrecord.rekonsiliasi_discharge', 1)
ON DUPLICATE KEY UPDATE 
    `NAMA` = VALUES(`NAMA`), 
    `DESKRIPSI` = VALUES(`DESKRIPSI`), 
    `BOBOT` = VALUES(`BOBOT`), 
    `TARGET_XTYPE` = VALUES(`TARGET_XTYPE`), 
    `STATUS` = VALUES(`STATUS`);
