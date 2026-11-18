-- -------------------------------------------------------------
-- Registrasi Modul Menu Audit Kelengkapan RME
-- Database: aplikasi
-- -------------------------------------------------------------

INSERT INTO `aplikasi`.`modules` (
    `ID`, `NAMA`, `LEVEL`, `DESKRIPSI`, `STATUS`, `CLASS`, `CONFIG`, `ICON_CLS`, `HAVE_CHILD`, `MENU_HOME`, `MENU_MASTER`, `PACKAGE_NAME`, `INTERNAL_PACKAGE`, `CRUD`, `C`, `R`, `U`, `D`, `IDX`
) VALUES (
    '9035', 'AUDIT KELENGKAPAN RME', 1, 'Audit Kelengkapan & Kualitas Rekam Medis Pasien', 1, 'auditrekammedis.Workspace', NULL, 'fa fa-clipboard-check', 0, 1, 0, 'audit-rekam-medis', 0, 1, 1, 1, 1, 1, 35
) ON DUPLICATE KEY UPDATE 
    `NAMA` = VALUES(`NAMA`), 
    `CLASS` = VALUES(`CLASS`), 
    `STATUS` = VALUES(`STATUS`), 
    `ICON_CLS` = VALUES(`ICON_CLS`), 
    `PACKAGE_NAME` = VALUES(`PACKAGE_NAME`), 
    `MENU_HOME` = VALUES(`MENU_HOME`);

-- 1. Berikan hak akses modul ke group pengguna Rekam Medis / Admin
INSERT INTO `aplikasi`.`group_pengguna_akses_module` (`GROUP_PENGGUNA`, `MODUL`, `STATUS`)
SELECT DISTINCT `GROUP_PENGGUNA`, '9035', 1
FROM `aplikasi`.`group_pengguna_akses_module`
WHERE `MODUL` IN ('13', '9033', '1928')
  AND NOT EXISTS (
      SELECT 1 FROM `aplikasi`.`group_pengguna_akses_module` gpam2 
      WHERE gpam2.GROUP_PENGGUNA = `aplikasi`.`group_pengguna_akses_module`.GROUP_PENGGUNA 
        AND gpam2.MODUL = '9035'
  );

-- 2. Tambahkan hak akses modul ke akun pengguna aktif (pengguna_akses)
INSERT INTO `aplikasi`.`pengguna_akses` (`PENGGUNA`, `GROUP_PENGGUNA_AKSES_MODULE`, `STATUS`)
SELECT DISTINCT pa.PENGGUNA, gpam_9035.ID, 1
FROM `aplikasi`.`pengguna_akses` pa
JOIN `aplikasi`.`group_pengguna_akses_module` gpam_existing ON gpam_existing.ID = pa.GROUP_PENGGUNA_AKSES_MODULE
JOIN `aplikasi`.`group_pengguna_akses_module` gpam_9035 ON gpam_9035.GROUP_PENGGUNA = gpam_existing.GROUP_PENGGUNA AND gpam_9035.MODUL = '9035'
WHERE NOT EXISTS (
    SELECT 1 FROM `aplikasi`.`pengguna_akses` pa2 
    WHERE pa2.PENGGUNA = pa.PENGGUNA AND pa2.GROUP_PENGGUNA_AKSES_MODULE = gpam_9035.ID
);
