Name:           simpel-audit-rekam-medis
Version:        1.0.0
Release:        26111802
Summary:        Plugin Audit Kelengkapan dan Kualitas Rekam Medis Elektronik SIMGoS2
License:        GPL
Group:          Applications/Productivity
BuildArch:      x86_64
AutoReqProv:    no

%description
Plugin mandiri (Zero Core Modification) untuk SIMGoS2 yang menyediakan fitur:
- Dashboard Audit Kelengkapan Rekam Medis untuk seluruh pasien (Rawat Jalan, IGD, Rawat Inap).
- Perhitungan persentase kelengkapan (%) formulir klinis secara dinamis.
- Deteksi data anomali dan ketidaksesuaian dokumen medis secara otomatis.
- Fast-Lane Direct Editor untuk melengkapi dokumen rekam medis tanpa perlu membuka dashboard kunjungan pasien.

%pre
pluginName="audit-rekam-medis"
rpm -qa simpel-audit-rekam-medis 2>/dev/null | sed 's/simpel-audit-rekam-medis-//' | sed 's/.x86_64//' > /var/log/simpel-plugins-$pluginName-latest.txt 2>/dev/null || true

%install
# Bersihkan dan buat direktori tujuan buildroot
rm -rf %{buildroot}
mkdir -p %{buildroot}
cp -r %{_sourcedir}/src/* %{buildroot}/

%files
%defattr(-,simgos,simgos,-)
/var/www/html/production/plugins/audit-rekam-medis
/var/www/html/production/plugins/audit-rekam-medis/*
/var/www/html/production/webapps/application/SIMpel/packages/classic/audit-rekam-medis.js
/var/www/html/production/webapps/plugins/audit-rekam-medis
/var/www/html/production/webapps/plugins/audit-rekam-medis/*
/var/www/html/production/webapps/webservice/config/plugins/audit-rekam-medis.config.php
/var/www/html/production/webapps/webservice/config/autoload/plugins/audit-rekam-medis.php.dist
/var/www/html/production/webapps/webservice/plugins/audit-rekam-medis
/var/www/html/production/webapps/webservice/plugins/audit-rekam-medis/*

%post
rm -Rf /var/www/html/production/webapps/webservice/data/cache/*
find /var/www/html/production/plugins/audit-rekam-medis -type f -name "*.sh" | xargs chmod +x 2>/dev/null || true
cd /var/www/html/production/plugins/audit-rekam-medis
if [ -f patch.sh ]; then
    bash patch.sh ""
fi
