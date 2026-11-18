<?php
namespace AuditRekamMedis\V1\Rest\AuditKelengkapan;

use DBService\DatabaseService;
use Laminas\Db\Sql\TableIdentifier;
use DBService\Service as DBService;
use PDO;

class Service extends DBService
{
    private $adapter;

    public function __construct()
    {
        $this->adapter = DatabaseService::get('SIMpel')->getAdapter();
    }

    /**
     * Memuat daftar aturan checklist audit dari tabel konfigurasi
     */
    public function getAuditRules()
    {
        $sql = "SELECT * FROM `medicalrecord`.`audit_rme_rule` WHERE `STATUS` = 1 ORDER BY `BOBOT` DESC";
        try {
            $stmt = $this->adapter->query($sql);
            $results = $stmt->execute();
            $rules = [];
            foreach ($results as $row) {
                $rules[$row['ID']] = $row;
            }
            if (!empty($rules)) {
                return $rules;
            }
        } catch (\Exception $e) {
            // Fallback default rules jika tabel belum tersedia
        }

        return [
            'RESUME' => ['ID' => 'RESUME', 'NAMA' => 'Resume Medis', 'BOBOT' => 20, 'JENIS_KUNJUNGAN' => 'ALL', 'TARGET_XTYPE' => 'rekammedis-resume-workspace'],
            'DIAGNOSA' => ['ID' => 'DIAGNOSA', 'NAMA' => 'Diagnosa ICD-10', 'BOBOT' => 15, 'JENIS_KUNJUNGAN' => 'ALL', 'TARGET_XTYPE' => 'diagnosa-workspace'],
            'ANAMNESIS' => ['ID' => 'ANAMNESIS', 'NAMA' => 'Anamnesis', 'BOBOT' => 10, 'JENIS_KUNJUNGAN' => 'ALL', 'TARGET_XTYPE' => 'rekammedis-anamnesis-workspace'],
            'TTV' => ['ID' => 'TTV', 'NAMA' => 'Tanda Vital', 'BOBOT' => 10, 'JENIS_KUNJUNGAN' => 'ALL', 'TARGET_XTYPE' => 'rekammedis-anamnesis-workspace'],
            'CPPT' => ['ID' => 'CPPT', 'NAMA' => 'CPPT DPJP', 'BOBOT' => 15, 'JENIS_KUNJUNGAN' => '3', 'TARGET_XTYPE' => 'rekammedis-cppt-workspace'],
            'TRIAGE' => ['ID' => 'TRIAGE', 'NAMA' => 'Triase ATS', 'BOBOT' => 15, 'JENIS_KUNJUNGAN' => '2', 'TARGET_XTYPE' => 'rekammedis-triage-workspace'],
            'OPERASI' => ['ID' => 'OPERASI', 'NAMA' => 'Laporan Operasi', 'BOBOT' => 15, 'JENIS_KUNJUNGAN' => 'ALL', 'TRIGGER_CONDITION' => 'HAS_SURGERY', 'TARGET_XTYPE' => 'laporan-operasi-workspace'],
            'SSC' => ['ID' => 'SSC', 'NAMA' => 'Surgical Safety Checklist', 'BOBOT' => 10, 'JENIS_KUNJUNGAN' => 'ALL', 'TRIGGER_CONDITION' => 'HAS_SURGERY', 'TARGET_XTYPE' => 'laporan-operasi-workspace'],
            'GENERAL_CONSENT' => ['ID' => 'GENERAL_CONSENT', 'NAMA' => 'General Consent', 'BOBOT' => 5, 'JENIS_KUNJUNGAN' => 'ALL', 'TARGET_XTYPE' => 'rekammedis-uploaddocument-workspace'],
            'INFORMED_CONSENT' => ['ID' => 'INFORMED_CONSENT', 'NAMA' => 'Informed Consent', 'BOBOT' => 10, 'JENIS_KUNJUNGAN' => 'ALL', 'TRIGGER_CONDITION' => 'HAS_SURGERY', 'TARGET_XTYPE' => 'rekammedis-anamnesis-edukasi-workspace'],
            'EDUKASI' => ['ID' => 'EDUKASI', 'NAMA' => 'Edukasi Pasien', 'BOBOT' => 5, 'JENIS_KUNJUNGAN' => '3', 'TARGET_XTYPE' => 'rekammedis-anamnesis-edukasi-workspace'],
            'REKONSILIASI_OBAT' => ['ID' => 'REKONSILIASI_OBAT', 'NAMA' => 'Rekonsiliasi Obat', 'BOBOT' => 5, 'JENIS_KUNJUNGAN' => '3', 'TRIGGER_CONDITION' => 'IS_FINAL', 'TARGET_XTYPE' => 'rekammedis-rekonsiliasiobat-admisi-form'],
        ];
    }

    /**
     * Memuat data audit seluruh kunjungan pasien berdasarkan filter
     */
    public function loadAuditData($params = [])
    {
        $tglAwal = isset($params['tanggal_awal']) && !empty($params['tanggal_awal']) ? $params['tanggal_awal'] : date('Y-m-d 00:00:00');
        $tglAkhir = isset($params['tanggal_akhir']) && !empty($params['tanggal_akhir']) ? $params['tanggal_akhir'] : date('Y-m-d 23:59:59');
        $jenisKunjungan = isset($params['jenis_kunjungan']) ? $params['jenis_kunjungan'] : 'ALL';
        $ruangan = isset($params['ruangan']) ? $params['ruangan'] : '';
        $statusFilter = isset($params['status_filter']) ? $params['status_filter'] : 'ALL';
        $querySearch = isset($params['query']) ? trim($params['query']) : '';
        
        $start = isset($params['start']) ? (int) $params['start'] : 0;
        $limit = isset($params['limit']) ? (int) $params['limit'] : 25;
        if ($limit <= 0) $limit = 25;

        // Normalisasi format datetime
        if (strlen($tglAwal) == 10) $tglAwal .= ' 00:00:00';
        if (strlen($tglAkhir) == 10) $tglAkhir .= ' 23:59:59';

        $whereClauses = ["k.STATUS = 1", "k.MASUK >= '$tglAwal'", "k.MASUK <= '$tglAkhir'"];

        if ($jenisKunjungan !== 'ALL' && $jenisKunjungan !== '') {
            $jkVal = (int) $jenisKunjungan;
            $whereClauses[] = "r.JENIS_KUNJUNGAN = $jkVal";
        }

        if (!empty($ruangan)) {
            $cleanRuangan = addslashes($ruangan);
            $whereClauses[] = "k.RUANGAN = '$cleanRuangan'";
        }

        if (!empty($querySearch)) {
            $cleanQ = addslashes($querySearch);
            $whereClauses[] = "(p.NORM LIKE '%$cleanQ%' OR pas.NAMA LIKE '%$cleanQ%' OR k.NOPEN LIKE '%$cleanQ%')";
        }

        $whereSql = implode(' AND ', $whereClauses);

        // Kueri utama menghitung status keberadaan berkas RME
        $sql = "
            SELECT 
                k.NOMOR AS KUNJUNGAN,
                k.NOPEN,
                p.NORM,
                pas.NAMA AS NAMA_PASIEN,
                pas.TANGGAL_LAHIR,
                pas.JENIS_KELAMIN,
                TIMESTAMPDIFF(YEAR, pas.TANGGAL_LAHIR, CURDATE()) AS UMUR,
                k.RUANGAN,
                IFNULL(r.DESKRIPSI, '-') AS NAMA_RUANGAN,
                r.JENIS_KUNJUNGAN,
                k.MASUK,
                k.KELUAR,
                k.STATUS AS STATUS_KUNJUNGAN,
                k.FINAL_HASIL,
                k.DPJP,
                IFNULL(peg.NAMA, '-') AS NAMA_DPJP,
                TIMESTAMPDIFF(HOUR, k.MASUK, IFNULL(k.KELUAR, NOW())) AS DURASI_RAWAT_JAM,
                -- Pengecekan Dokumen
                (SELECT COUNT(*) FROM `medicalrecord`.`resume` res WHERE res.NOPEN = k.NOPEN AND res.STATUS = 1) AS C_RESUME,
                (SELECT COUNT(*) FROM `medicalrecord`.`diagnosa` diag WHERE diag.NOPEN = k.NOPEN AND diag.STATUS = 1) AS C_DIAGNOSA,
                (SELECT COUNT(*) FROM `medicalrecord`.`diagnosa` diag WHERE diag.NOPEN = k.NOPEN AND diag.STATUS = 1 AND diag.KODE != '-' AND diag.KODE != '') AS C_DIAGNOSA_ICD,
                (SELECT COUNT(*) FROM `medicalrecord`.`anamnesis` anam WHERE anam.KUNJUNGAN = k.NOMOR AND anam.STATUS = 1) AS C_ANAMNESIS,
                (SELECT COUNT(*) FROM `medicalrecord`.`tanda_vital` ttv WHERE ttv.KUNJUNGAN = k.NOMOR AND ttv.STATUS = 1) AS C_TTV,
                (SELECT COUNT(*) FROM `medicalrecord`.`cppt` cppt WHERE cppt.KUNJUNGAN = k.NOMOR AND cppt.STATUS = 1) AS C_CPPT,
                (SELECT COUNT(*) FROM `medicalrecord`.`cppt` cppt WHERE cppt.KUNJUNGAN = k.NOMOR AND cppt.STATUS = 1 AND (cppt.TENAGA_MEDIS = k.DPJP OR cppt.VERIFIKASI = 1)) AS C_CPPT_DPJP,
                (SELECT COUNT(*) FROM `medicalrecord`.`triage_ats` tri WHERE (tri.KUNJUNGAN = k.NOMOR OR tri.NOPEN = k.NOPEN) AND tri.STATUS = 1) AS C_TRIAGE,
                (SELECT COUNT(*) FROM `medicalrecord`.`operasi` op WHERE op.KUNJUNGAN = k.NOMOR AND op.STATUS = 1) AS C_OPERASI,
                (SELECT COUNT(*) FROM `medicalrecord`.`surgical_safety_checklist_signin` ssc WHERE ssc.KUNJUNGAN = k.NOMOR AND ssc.STATUS = 1) AS C_SSC,
                (SELECT COUNT(*) FROM `medicalrecord`.`general_consent` gc WHERE (gc.NOPEN = k.NOPEN OR gc.NORM = p.NORM) AND gc.STATUS = 1) AS C_GC,
                (SELECT COUNT(*) FROM `medicalrecord`.`persetujuan_tindakan_dokter` ptd WHERE ptd.KUNJUNGAN = k.NOMOR AND ptd.STATUS = 1) AS C_PTD,
                (SELECT COUNT(*) FROM `medicalrecord`.`edukasi_pasien_keluarga` edu WHERE edu.KUNJUNGAN = k.NOMOR AND edu.STATUS = 1) AS C_EDUKASI,
                (SELECT COUNT(*) FROM `medicalrecord`.`rekonsiliasi_discharge` rk WHERE (rk.PENDAFTARAN = k.NOPEN OR rk.KUNJUNGAN = k.NOMOR) AND rk.STATUS = 1) AS C_REKONSILIASI
            FROM `pendaftaran`.`kunjungan` k
            JOIN `pendaftaran`.`pendaftaran` p ON p.NOMOR = k.NOPEN AND p.STATUS = 1
            JOIN `master`.`pasien` pas ON pas.NORM = p.NORM
            LEFT JOIN `master`.`ruangan` r ON r.ID = k.RUANGAN
            LEFT JOIN `master`.`pegawai` peg ON peg.ID = k.DPJP
            WHERE $whereSql
            ORDER BY k.MASUK DESC
        ";

        $stmt = $this->adapter->query($sql);
        $rawRecords = $stmt->execute();

        $rules = $this->getAuditRules();
        $processedList = [];

        $totalPasien = 0;
        $totalPersentase = 0;
        $countLengkap = 0;
        $countAnomali = 0;

        foreach ($rawRecords as $row) {
            $evaluated = $this->evaluatePatientAudit($row, $rules);

            // Filter status jika dipilih di frontend
            if ($statusFilter === 'LENGKAP' && ($evaluated['PERSENTASE'] < 100 || $evaluated['JUMLAH_ANOMALI'] > 0)) {
                continue;
            }
            if ($statusFilter === 'BELUM_LENGKAP' && $evaluated['PERSENTASE'] >= 100) {
                continue;
            }
            if ($statusFilter === 'ANOMALI' && $evaluated['JUMLAH_ANOMALI'] == 0) {
                continue;
            }

            $totalPasien++;
            $totalPersentase += $evaluated['PERSENTASE'];
            if ($evaluated['PERSENTASE'] >= 100 && $evaluated['JUMLAH_ANOMALI'] == 0) {
                $countLengkap++;
            }
            if ($evaluated['JUMLAH_ANOMALI'] > 0) {
                $countAnomali++;
            }

            $processedList[] = $evaluated;
        }

        // Paging manual atas filtered collection
        $pagedData = array_slice($processedList, $start, $limit);
        $avgPersentase = $totalPasien > 0 ? round($totalPersentase / $totalPasien, 1) : 0;

        return [
            'total' => $totalPasien,
            'data' => $pagedData,
            'summary' => [
                'total_pasien' => $totalPasien,
                'rata_persentase' => $avgPersentase,
                'jumlah_lengkap' => $countLengkap,
                'jumlah_anomali' => $countAnomali,
                'jumlah_belum_lengkap' => ($totalPasien - $countLengkap)
            ]
        ];
    }

    /**
     * Evaluasi kelengkapan berkas dan deteksi anomali untuk 1 baris kunjungan
     */
    private function evaluatePatientAudit($row, $rules)
    {
        $jk = (int) $row['JENIS_KUNJUNGAN']; // 1=Rajal, 2=IGD, 3=Ranap
        $isFinal = (int) $row['FINAL_HASIL'] === 1 || !empty($row['KELUAR']);
        $durasiJam = (int) $row['DURASI_RAWAT_JAM'];
        $hasSurgery = (int) $row['C_OPERASI'] > 0 || (int) $row['C_SSC'] > 0;

        $totalBobotWajib = 0;
        $totalBobotTerisi = 0;
        $docsStatus = [];
        $anomaliList = [];

        // 1. RESUME MEDIS
        $resumeTerisi = (int) $row['C_RESUME'] > 0;
        $docsStatus['RESUME'] = [
            'kode' => 'RESUME',
            'nama' => 'Resume Medis',
            'status' => $resumeTerisi ? 1 : 0,
            'xtype' => 'rekammedis-resume-workspace'
        ];
        $totalBobotWajib += 20;
        if ($resumeTerisi) $totalBobotTerisi += 20;
        if ($isFinal && !$resumeTerisi) {
            $anomaliList[] = 'Pasien sudah dinyatakan Keluar/Final, tetapi Resume Medis Pulang belum dibuat.';
        }

        // 2. DIAGNOSA ICD-10
        $diagTerisi = (int) $row['C_DIAGNOSA'] > 0;
        $diagIcdTerisi = (int) $row['C_DIAGNOSA_ICD'] > 0;
        $docsStatus['DIAGNOSA'] = [
            'kode' => 'DIAGNOSA',
            'nama' => 'Diagnosa ICD-10',
            'status' => $diagIcdTerisi ? 1 : ($diagTerisi ? 2 : 0), // 2 = ada teks tapi belum ICD
            'xtype' => 'diagnosa-workspace'
        ];
        $totalBobotWajib += 15;
        if ($diagIcdTerisi) {
            $totalBobotTerisi += 15;
        } elseif ($diagTerisi) {
            $totalBobotTerisi += 5;
            $anomaliList[] = 'Diagnosa dokter sudah diisi namun belum di-mapping ke kode ICD-10 resmi.';
        } else {
            if ($isFinal) {
                $anomaliList[] = 'Diagnosa utama pasien masih kosong.';
            }
        }

        // 3. ANAMNESIS
        $anamTerisi = (int) $row['C_ANAMNESIS'] > 0;
        $docsStatus['ANAMNESIS'] = [
            'kode' => 'ANAMNESIS',
            'nama' => 'Anamnesis',
            'status' => $anamTerisi ? 1 : 0,
            'xtype' => 'rekammedis-anamnesis-workspace'
        ];
        $totalBobotWajib += 10;
        if ($anamTerisi) $totalBobotTerisi += 10;

        // 4. TANDA VITAL
        $ttvTerisi = (int) $row['C_TTV'] > 0;
        $docsStatus['TTV'] = [
            'kode' => 'TTV',
            'nama' => 'Tanda Vital',
            'status' => $ttvTerisi ? 1 : 0,
            'xtype' => 'rekammedis-anamnesis-workspace'
        ];
        $totalBobotWajib += 10;
        if ($ttvTerisi) $totalBobotTerisi += 10;

        // 5. CPPT & VERIFIKASI DPJP (Terutama Rawat Inap)
        if ($jk === 3) {
            $cpptTerisi = (int) $row['C_CPPT'] > 0;
            $cpptDpjpTerisi = (int) $row['C_CPPT_DPJP'] > 0;
            $docsStatus['CPPT'] = [
                'kode' => 'CPPT',
                'nama' => 'CPPT',
                'status' => $cpptDpjpTerisi ? 1 : ($cpptTerisi ? 2 : 0),
                'xtype' => 'rekammedis-cppt-workspace'
            ];
            $totalBobotWajib += 15;
            if ($cpptDpjpTerisi) {
                $totalBobotTerisi += 15;
            } elseif ($cpptTerisi) {
                $totalBobotTerisi += 8;
                $anomaliList[] = 'Terdapat CPPT masuk tetapi belum diverifikasi/diisi oleh DPJP.';
            } else {
                if ($durasiJam >= 24) {
                    $anomaliList[] = 'Pasien dirawat inap lebih dari 24 jam tanpa ada CPPT harian DPJP.';
                }
            }
        }

        // 6. TRIASE ATS (Khusus IGD)
        if ($jk === 2) {
            $triageTerisi = (int) $row['C_TRIAGE'] > 0;
            $docsStatus['TRIAGE'] = [
                'kode' => 'TRIAGE',
                'nama' => 'Triase ATS',
                'status' => $triageTerisi ? 1 : 0,
                'xtype' => 'rekammedis-triage-workspace'
            ];
            $totalBobotWajib += 15;
            if ($triageTerisi) {
                $totalBobotTerisi += 15;
            } else {
                $anomaliList[] = 'Kunjungan Gawat Darurat (IGD) tanpa formulir Triase ATS.';
            }
        }

        // 7. OPERASI & SURGICAL SAFETY CHECKLIST (Jika ada tindakan bedah)
        if ($hasSurgery) {
            $opTerisi = (int) $row['C_OPERASI'] > 0;
            $sscTerisi = (int) $row['C_SSC'] > 0;

            $docsStatus['OPERASI'] = [
                'kode' => 'OPERASI',
                'nama' => 'Lap. Operasi',
                'status' => $opTerisi ? 1 : 0,
                'xtype' => 'laporan-operasi-workspace'
            ];
            $docsStatus['SSC'] = [
                'kode' => 'SSC',
                'nama' => 'Safety Checklist',
                'status' => $sscTerisi ? 1 : 0,
                'xtype' => 'laporan-operasi-workspace'
            ];

            $totalBobotWajib += 20;
            if ($opTerisi) $totalBobotTerisi += 10;
            if ($sscTerisi) $totalBobotTerisi += 10;

            if (!$opTerisi) {
                $anomaliList[] = 'Terdapat riwayat tindakan pembedahan tetapi Laporan Operasi belum diisi.';
            }
            if (!$sscTerisi) {
                $anomaliList[] = 'Tindakan bedah tanpa Surgical Safety Checklist (Sign-in/Timeout/Signout).';
            }
        }

        // 8. GENERAL CONSENT
        $gcTerisi = (int) $row['C_GC'] > 0;
        $docsStatus['GENERAL_CONSENT'] = [
            'kode' => 'GENERAL_CONSENT',
            'nama' => 'General Consent',
            'status' => $gcTerisi ? 1 : 0,
            'xtype' => 'rekammedis-uploaddocument-workspace'
        ];
        $totalBobotWajib += 5;
        if ($gcTerisi) $totalBobotTerisi += 5;

        // 9. EDUKASI TERINTEGRASI (Rawat Inap)
        if ($jk === 3) {
            $eduTerisi = (int) $row['C_EDUKASI'] > 0;
            $docsStatus['EDUKASI'] = [
                'kode' => 'EDUKASI',
                'nama' => 'Edukasi Pasien',
                'status' => $eduTerisi ? 1 : 0,
                'xtype' => 'rekammedis-anamnesis-edukasi-workspace'
            ];
            $totalBobotWajib += 5;
            if ($eduTerisi) $totalBobotTerisi += 5;
        }

        // Kalkulasi Persentase
        $persentase = $totalBobotWajib > 0 ? round(($totalBobotTerisi / $totalBobotWajib) * 100) : 100;
        if ($persentase > 100) $persentase = 100;

        return [
            'KUNJUNGAN' => $row['KUNJUNGAN'],
            'NOPEN' => $row['NOPEN'],
            'NORM' => $row['NORM'],
            'NAMA_PASIEN' => $row['NAMA_PASIEN'],
            'JENIS_KELAMIN' => $row['JENIS_KELAMIN'] == 1 ? 'L' : 'P',
            'UMUR' => $row['UMUR'],
            'RUANGAN' => $row['RUANGAN'],
            'NAMA_RUANGAN' => $row['NAMA_RUANGAN'],
            'JENIS_KUNJUNGAN' => $jk,
            'LABEL_JENIS_KUNJUNGAN' => $jk == 1 ? 'Rawat Jalan' : ($jk == 2 ? 'IGD' : ($jk == 3 ? 'Rawat Inap' : 'Penunjang')),
            'MASUK' => $row['MASUK'],
            'KELUAR' => $row['KELUAR'],
            'FINAL_HASIL' => (int) $row['FINAL_HASIL'],
            'STATUS_KUNJUNGAN' => $row['STATUS_KUNJUNGAN'],
            'DPJP' => $row['DPJP'],
            'NAMA_DPJP' => $row['NAMA_DPJP'],
            'PERSENTASE' => $persentase,
            'DOCS_STATUS' => $docsStatus,
            'ANOMALI_LIST' => $anomaliList,
            'JUMLAH_ANOMALI' => count($anomaliList),
            'STATUS_LABEL' => ($persentase >= 100 && count($anomaliList) == 0) ? 'LENGKAP' : (count($anomaliList) > 0 ? 'ANOMALI' : 'BELUM LENGKAP')
        ];
    }

    /**
     * Memuat audit detail untuk satu kunjungan spesifik
     */
    public function loadSingleVisitAudit($kunjunganNomor)
    {
        $cleanKjgn = addslashes($kunjunganNomor);
        $sql = "
            SELECT 
                k.NOMOR AS KUNJUNGAN,
                k.NOPEN,
                p.NORM,
                pas.NAMA AS NAMA_PASIEN,
                pas.TANGGAL_LAHIR,
                pas.JENIS_KELAMIN,
                TIMESTAMPDIFF(YEAR, pas.TANGGAL_LAHIR, CURDATE()) AS UMUR,
                k.RUANGAN,
                IFNULL(r.DESKRIPSI, '-') AS NAMA_RUANGAN,
                r.JENIS_KUNJUNGAN,
                k.MASUK,
                k.KELUAR,
                k.STATUS AS STATUS_KUNJUNGAN,
                k.FINAL_HASIL,
                k.DPJP,
                IFNULL(peg.NAMA, '-') AS NAMA_DPJP,
                TIMESTAMPDIFF(HOUR, k.MASUK, IFNULL(k.KELUAR, NOW())) AS DURASI_RAWAT_JAM,
                (SELECT COUNT(*) FROM `medicalrecord`.`resume` res WHERE res.NOPEN = k.NOPEN AND res.STATUS = 1) AS C_RESUME,
                (SELECT COUNT(*) FROM `medicalrecord`.`diagnosa` diag WHERE diag.NOPEN = k.NOPEN AND diag.STATUS = 1) AS C_DIAGNOSA,
                (SELECT COUNT(*) FROM `medicalrecord`.`diagnosa` diag WHERE diag.NOPEN = k.NOPEN AND diag.STATUS = 1 AND diag.KODE != '-' AND diag.KODE != '') AS C_DIAGNOSA_ICD,
                (SELECT COUNT(*) FROM `medicalrecord`.`anamnesis` anam WHERE anam.KUNJUNGAN = k.NOMOR AND anam.STATUS = 1) AS C_ANAMNESIS,
                (SELECT COUNT(*) FROM `medicalrecord`.`tanda_vital` ttv WHERE ttv.KUNJUNGAN = k.NOMOR AND ttv.STATUS = 1) AS C_TTV,
                (SELECT COUNT(*) FROM `medicalrecord`.`cppt` cppt WHERE cppt.KUNJUNGAN = k.NOMOR AND cppt.STATUS = 1) AS C_CPPT,
                (SELECT COUNT(*) FROM `medicalrecord`.`cppt` cppt WHERE cppt.KUNJUNGAN = k.NOMOR AND cppt.STATUS = 1 AND (cppt.TENAGA_MEDIS = k.DPJP OR cppt.VERIFIKASI = 1)) AS C_CPPT_DPJP,
                (SELECT COUNT(*) FROM `medicalrecord`.`triage_ats` tri WHERE (tri.KUNJUNGAN = k.NOMOR OR tri.NOPEN = k.NOPEN) AND tri.STATUS = 1) AS C_TRIAGE,
                (SELECT COUNT(*) FROM `medicalrecord`.`operasi` op WHERE op.KUNJUNGAN = k.NOMOR AND op.STATUS = 1) AS C_OPERASI,
                (SELECT COUNT(*) FROM `medicalrecord`.`surgical_safety_checklist_signin` ssc WHERE ssc.KUNJUNGAN = k.NOMOR AND ssc.STATUS = 1) AS C_SSC,
                (SELECT COUNT(*) FROM `medicalrecord`.`general_consent` gc WHERE (gc.NOPEN = k.NOPEN OR gc.NORM = p.NORM) AND gc.STATUS = 1) AS C_GC,
                (SELECT COUNT(*) FROM `medicalrecord`.`persetujuan_tindakan_dokter` ptd WHERE ptd.KUNJUNGAN = k.NOMOR AND ptd.STATUS = 1) AS C_PTD,
                (SELECT COUNT(*) FROM `medicalrecord`.`edukasi_pasien_keluarga` edu WHERE edu.KUNJUNGAN = k.NOMOR AND edu.STATUS = 1) AS C_EDUKASI,
                (SELECT COUNT(*) FROM `medicalrecord`.`rekonsiliasi_discharge` rk WHERE (rk.PENDAFTARAN = k.NOPEN OR rk.KUNJUNGAN = k.NOMOR) AND rk.STATUS = 1) AS C_REKONSILIASI
            FROM `pendaftaran`.`kunjungan` k
            JOIN `pendaftaran`.`pendaftaran` p ON p.NOMOR = k.NOPEN AND p.STATUS = 1
            JOIN `master`.`pasien` pas ON pas.NORM = p.NORM
            LEFT JOIN `master`.`ruangan` r ON r.ID = k.RUANGAN
            LEFT JOIN `master`.`pegawai` peg ON peg.ID = k.DPJP
            WHERE k.NOMOR = '$cleanKjgn'
            LIMIT 1
        ";

        $stmt = $this->adapter->query($sql);
        $res = $stmt->execute();
        $row = $res->current();
        if (!$row) return null;

        $rules = $this->getAuditRules();
        return $this->evaluatePatientAudit($row, $rules);
    }
}
