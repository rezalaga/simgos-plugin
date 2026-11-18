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
    `PACKAGE_NAME` = VALUES(`PACKAGE_NAME`), 
    `MENU_HOME` = VALUES(`MENU_HOME`);

-- Berikan hak akses menu secara otomatis ke grup pengguna Rekam Medis / Admin
INSERT INTO `aplikasi`.`group_pengguna_akses_module` (`GROUP_PENGGUNA`, `MODUL`, `STATUS`)
SELECT DISTINCT `GROUP_PENGGUNA`, '9035', 1
FROM `aplikasi`.`group_pengguna_akses_module`
WHERE `MODUL` IN ('13', '9033', '1928')
  AND NOT EXISTS (
      SELECT 1 FROM `aplikasi`.`group_pengguna_akses_module` gpam2 
      WHERE gpam2.GROUP_PENGGUNA = `aplikasi`.`group_pengguna_akses_module`.GROUP_PENGGUNA 
        AND gpam2.MODUL = '9035'
  );
