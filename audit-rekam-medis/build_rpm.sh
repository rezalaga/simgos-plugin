#!/bin/bash
set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
RPM_TOPDIR="$DIR/build_rpm_workspace"

echo "=========================================================="
echo " Building RPM: simpel-audit-rekam-medis-1.0.0-26111800"
echo "=========================================================="

rm -rf "$RPM_TOPDIR"
mkdir -p "$RPM_TOPDIR"/{BUILD,RPMS,SOURCES,SPECS,SRPMS,BUILDROOT}

# Copy source tree to SOURCES
cp -r "$DIR/src" "$RPM_TOPDIR/SOURCES/"
cp "$DIR/SPECS/simpel-audit-rekam-medis.spec" "$RPM_TOPDIR/SPECS/"

# Build RPM
rpmbuild --define "_topdir $RPM_TOPDIR" \
         --define "_sourcedir $RPM_TOPDIR/SOURCES" \
         -bb "$RPM_TOPDIR/SPECS/simpel-audit-rekam-medis.spec"

# Copy generated RPM back to plugin root
GENERATED_RPM=$(find "$RPM_TOPDIR/RPMS" -name "*.rpm" | head -n 1)
if [ -f "$GENERATED_RPM" ]; then
    cp "$GENERATED_RPM" "$DIR/"
    RPM_BASENAME=$(basename "$GENERATED_RPM")
    echo ""
    echo "=========================================================="
    echo " [SUCCESS] RPM successfully created:"
    echo " $DIR/$RPM_BASENAME"
    echo "=========================================================="
    ls -lh "$DIR/$RPM_BASENAME"
else
    echo "[ERROR] RPM generation failed."
    exit 1
fi
