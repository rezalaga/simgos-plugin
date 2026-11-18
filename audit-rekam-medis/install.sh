#!/bin/bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "=========================================================="
echo " Installing Plugin: Audit Rekam Medis Elektronik (SIMGoS2)"
echo "=========================================================="

# 1. Salin seluruh file ke target direktori webapps
echo "-> Menyalin file plugin ke /var/www/html/production/..."
mkdir -p /var/www/html/production/plugins/audit-rekam-medis
mkdir -p /var/www/html/production/webapps/application/SIMpel/packages/classic
mkdir -p /var/www/html/production/webapps/plugins/audit-rekam-medis
mkdir -p /var/www/html/production/webapps/webservice/config/plugins
mkdir -p /var/www/html/production/webapps/webservice/config/autoload/plugins
mkdir -p /var/www/html/production/webapps/webservice/plugins/audit-rekam-medis

cp -r "$DIR/src/var/www/html/production/"* /var/www/html/production/

# 2. Atur kepemilikan dan hak akses
echo "-> Mengatur hak akses file (chown simgos:simgos)..."
chown -R simgos:simgos /var/www/html/production/plugins/audit-rekam-medis
chown -R simgos:simgos /var/www/html/production/webapps/plugins/audit-rekam-medis
chown -R simgos:simgos /var/www/html/production/webapps/webservice/plugins/audit-rekam-medis
chown simgos:simgos /var/www/html/production/webapps/application/SIMpel/packages/classic/audit-rekam-medis.js
chown simgos:simgos /var/www/html/production/webapps/webservice/config/plugins/audit-rekam-medis.config.php
chown simgos:simgos /var/www/html/production/webapps/webservice/config/autoload/plugins/audit-rekam-medis.php.dist

chmod +x /var/www/html/production/plugins/audit-rekam-medis/patch.sh

# 3. Jalankan migrasi database
echo "-> Menjalankan migrasi database via patch.sh..."
cd /var/www/html/production/plugins/audit-rekam-medis
bash patch.sh ""

# 4. Bersihkan cache backend Laminas
echo "-> Membersihkan cache Laminas API Tools..."
rm -Rf /var/www/html/production/webapps/webservice/data/cache/*

echo ""
echo "=========================================================="
echo " [SELESAI] Plugin Audit Rekam Medis berhasil diinstall!"
echo " Silakan login ke aplikasi SIMpel dan buka menu:"
echo " AUDIT KELENGKAPAN RME (ID Modul: 9035)"
echo "=========================================================="
