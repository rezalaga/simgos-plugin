#!/bin/sh

pluginName="audit-rekam-medis"
version="$1"

if [ "$version" = "" ]; then	
	if [ -f /var/log/simpel-plugins-$pluginName-latest.txt ]; then
		version=`cat /var/log/simpel-plugins-$pluginName-latest.txt`
	fi	
fi

if [ "$version" = "test" ]; then
	if [ -f /var/log/simpel-plugins-$pluginName-test.txt ]; then
		version=`cat /var/log/simpel-plugins-$pluginName-test.txt`
	else
		version=""
	fi
fi

if [ "$version" = "" ]; then
	version="1.0.0-26111800"
fi

echo "Latest Version: $version"

lastVersion=`echo $version | cut -d \- -f 1`
mayor=`echo $lastVersion | cut -d \. -f 1`
minor=`echo $lastVersion | cut -d \. -f 2`
patch=`echo $lastVersion | cut -d \. -f 3`
lastBuild=`echo $version | cut -d \- -f 2`

pass="S!MRSGos2"
if [ -f /var/tmp/simgos2/db/pass.new ]; then
	pass=`cat /var/tmp/simgos2/db/pass.new`
elif [ -f ../../pass.new ]; then
	pass=`cat ../../pass.new`
elif [ -f ../../../db/pass.new ]; then
	pass=`cat ../../../db/pass.new`
fi

cat > /var/tmp/my.cnf <<-EOF
[client]
host=127.0.0.1
port=3306
user=simgos
password=S!MGos2@kemkes.go.id
EOF

isConnect=`mysql --defaults-extra-file=/var/tmp/my.cnf < test.sql 2>/dev/null`
if ! echo "$isConnect" | grep -q 'OK'; then
    # Coba dengan root password jika simgos gagal
    cat > /var/tmp/my.cnf <<-EOF
[client]
host=127.0.0.1
port=3306
user=root
password=$pass
EOF
    isConnect=`mysql --defaults-extra-file=/var/tmp/my.cnf < test.sql 2>/dev/null`
    if ! echo "$isConnect" | grep -q 'OK'; then
        echo "Database connection failed. Exiting patch."
        rm -f /var/tmp/my.cnf
        exit 0
    fi
fi

versionLatest="$lastVersion"
buildLatest="$lastBuild"

mayors=`ls -vd [0-9]* 2>/dev/null`
for may in $mayors; do
	if [ -f "$may" ]; then continue; fi
	if [ "$may" -ge "$mayor" ]; then
		cd "$may" || continue
		minors=`ls -vd [0-9]* 2>/dev/null`
		for min in $minors; do
			if [ -f "$min" ]; then continue; fi
			if [ "$min" -ge "$minor" ]; then
				cd "$min" || continue
				patchs=`ls -vd [0-9]* 2>/dev/null`
				for p in $patchs; do
					if [ -f "$p" ]; then continue; fi
					if [ "$p" -ge "$patch" ]; then
						versionLatest="$may.$min.$p"
						echo "========================================"
						echo "Version: $versionLatest"
						echo "========================================" 
						cd "$p" || continue
						builds=`ls -vd [0-9]* 2>/dev/null`
						for b in $builds; do
							if [ -f "$b" ]; then continue; fi
							if [ "$b" -gt "$lastBuild" ] || [ "$b" = "$lastBuild" ]; then
								buildLatest="$b"
								echo "## Build: $b"
								cd "$b" || continue
								sqls=`ls *.sql 2>/dev/null | sort`
								for sql in $sqls; do
									echo "--------> SQL: $sql"
									mysql --defaults-extra-file=/var/tmp/my.cnf < "$sql"
								done
								cd ..
							fi
						done
						echo ""
						cd ..
					fi
				done
				cd ..
			fi
		done
		cd ..
	fi
done

cat > /var/log/simpel-plugins-$pluginName-test.txt <<-EOF
$versionLatest-$buildLatest
EOF

rm -f /var/tmp/my.cnf
echo "Patch complete for $pluginName: $versionLatest-$buildLatest"
