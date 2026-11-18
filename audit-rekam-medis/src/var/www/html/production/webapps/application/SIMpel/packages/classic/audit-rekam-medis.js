Ext.define("auditrekammedis.audit.Model", {
    extend: "data.model.Model",
    serviceName: "auditrekammedis/kelengkapan",
    fields: [
        { name: "KUNJUNGAN", type: "string" },
        { name: "NOPEN", type: "string" },
        { name: "NORM", type: "int" },
        { name: "NAMA_PASIEN", type: "string" },
        { name: "JENIS_KELAMIN", type: "string" },
        { name: "UMUR", type: "int" },
        { name: "RUANGAN", type: "string" },
        { name: "NAMA_RUANGAN", type: "string" },
        { name: "JENIS_KUNJUNGAN", type: "int" },
        { name: "LABEL_JENIS_KUNJUNGAN", type: "string" },
        { name: "MASUK", type: "date", dateFormat: "Y-m-d H:i:s" },
        { name: "KELUAR", type: "date", dateFormat: "Y-m-d H:i:s" },
        { name: "FINAL_HASIL", type: "int" },
        { name: "STATUS_KUNJUNGAN", type: "int" },
        { name: "DPJP", type: "int" },
        { name: "NAMA_DPJP", type: "string" },
        { name: "PERSENTASE", type: "int" },
        { name: "DOCS_STATUS" },
        { name: "ANOMALI_LIST" },
        { name: "JUMLAH_ANOMALI", type: "int" },
        { name: "STATUS_LABEL", type: "string" }
    ],
    idProperty: "KUNJUNGAN"
});

Ext.define("auditrekammedis.audit.Store", {
    extend: "data.store.Store",
    model: "auditrekammedis.audit.Model",
    alias: "store.auditrekammedis-audit-store",
    pageSize: 25,
    remoteFilter: true,
    autoLoad: false
});

Ext.define("auditrekammedis.WorkspaceController", {
    extend: "Ext.app.ViewController",
    alias: "controller.auditrekammedis-workspace",

    init: function() {
        var me = this;
        Ext.defer(function() {
            me.onSearch();
        }, 300);
    },

    onSearch: function() {
        var me = this,
            view = me.getView(),
            grid = view.down("grid"),
            store = grid ? grid.getStore() : null;

        if (!store) return;

        var fAwal = view.down("[name=tgl_awal]"),
            fAkhir = view.down("[name=tgl_akhir]"),
            fJk = view.down("[name=jenis_kunjungan]"),
            fStatus = view.down("[name=status_filter]"),
            fQ = view.down("[name=query_search]");

        var tglAwalVal = fAwal ? Ext.Date.format(fAwal.getValue(), "Y-m-d 00:00:00") : Ext.Date.format(new Date(), "Y-m-d 00:00:00"),
            tglAkhirVal = fAkhir ? Ext.Date.format(fAkhir.getValue(), "Y-m-d 23:59:59") : Ext.Date.format(new Date(), "Y-m-d 23:59:59"),
            jkVal = fJk ? fJk.getValue() : "ALL",
            statusVal = fStatus ? fStatus.getValue() : "ALL",
            qVal = fQ ? fQ.getValue() : "";

        store.getProxy().setExtraParams({
            tanggal_awal: tglAwalVal,
            tanggal_akhir: tglAkhirVal,
            jenis_kunjungan: jkVal,
            status_filter: statusVal,
            query: qVal
        });

        view.setLoading(true);
        store.loadPage(1, {
            callback: function(records, operation, success) {
                view.setLoading(false);
                if (success) {
                    var raw = operation.getResponse() ? Ext.JSON.decode(operation.getResponse().responseText) : null;
                    if (raw && raw.summary) {
                        me.updateSummaryKPI(raw.summary);
                    }
                }
            }
        });
    },

    onReset: function() {
        var me = this,
            view = me.getView();

        var fAwal = view.down("[name=tgl_awal]"),
            fAkhir = view.down("[name=tgl_akhir]"),
            fJk = view.down("[name=jenis_kunjungan]"),
            fStatus = view.down("[name=status_filter]"),
            fQ = view.down("[name=query_search]");

        if (fAwal) fAwal.setValue(new Date());
        if (fAkhir) fAkhir.setValue(new Date());
        if (fJk) fJk.setValue("ALL");
        if (fStatus) fStatus.setValue("ALL");
        if (fQ) fQ.setValue("");

        me.onSearch();
    },

    updateSummaryKPI: function(summary) {
        var me = this,
            view = me.getView();

        var cardTotal = view.down("#card-total-pasien"),
            cardPersen = view.down("#card-rata-persen"),
            cardLengkap = view.down("#card-jumlah-lengkap"),
            cardAnomali = view.down("#card-jumlah-anomali");

        if (cardTotal) cardTotal.setHtml('<div class="kpi-box"><span class="kpi-num">' + (summary.total_pasien || 0) + '</span><span class="kpi-lbl">Total Pasien</span></div>');
        if (cardPersen) cardPersen.setHtml('<div class="kpi-box"><span class="kpi-num x-color-blue">' + (summary.rata_persentase || 0) + '%</span><span class="kpi-lbl">Rata-rata Kelengkapan</span></div>');
        if (cardLengkap) cardLengkap.setHtml('<div class="kpi-box"><span class="kpi-num x-color-green">' + (summary.jumlah_lengkap || 0) + '</span><span class="kpi-lbl">Berkas Lengkap (100%)</span></div>');
        if (cardAnomali) cardAnomali.setHtml('<div class="kpi-box"><span class="kpi-num x-color-red">' + (summary.jumlah_anomali || 0) + '</span><span class="kpi-lbl">Terdeteksi Anomali</span></div>');
    },

    openFastLaneEdit: function(record, docKode) {
        var me = this,
            view = me.getView(),
            docs = record.get("DOCS_STATUS") || {},
            docInfo = docs[docKode] || {},
            targetXtype = docInfo.xtype || "rekammedis-resume-workspace",
            namaDoc = docInfo.nama || "Dokumen Rekam Medis";

        // Buat record kunjungan kompatibel dengan RME workspace SIMGoS
        var kjgnModel = Ext.create("data.model.Model", {
            NOMOR: record.get("KUNJUNGAN"),
            NOPEN: record.get("NOPEN"),
            NORM: record.get("NORM"),
            RUANGAN: record.get("RUANGAN"),
            FINAL_HASIL: record.get("FINAL_HASIL"),
            MASUK: record.get("MASUK"),
            KELUAR: record.get("KELUAR"),
            DPJP: record.get("DPJP")
        });

        // Inisialisasi pop-up window modal langsung ke form target
        var win = Ext.create("Ext.window.Window", {
            title: '<i class="x-fa fa-edit"></i> [Fast-Lane RME] ' + namaDoc + ' — ' + record.get("NAMA_PASIEN") + ' (' + record.get("NORM") + ')',
            width: "88%",
            height: "88%",
            modal: true,
            maximizable: true,
            layout: "fit",
            ui: "panel-blue",
            items: [{
                xtype: targetXtype,
                reference: "targetRmeWorkspace"
            }],
            listeners: {
                close: function() {
                    me.onSearch();
                }
            }
        });

        win.show();

        // Panggil metode .load() bawaan komponen RME SIMGoS
        Ext.defer(function() {
            var comp = win.down(targetXtype);
            if (comp) {
                if (typeof comp.load === "function") {
                    comp.load(kjgnModel);
                } else if (comp.getController() && typeof comp.getController().load === "function") {
                    comp.getController().load(kjgnModel);
                }
            }
        }, 150);
    },

    onShowAnomaliModal: function(record) {
        var me = this,
            anomalis = record.get("ANOMALI_LIST") || [];

        if (anomalis.length === 0) {
            Ext.Msg.alert("Status Valid", "Tidak ditemukan data anomali klinis maupun administratif pada kunjungan pasien ini.");
            return;
        }

        var htmlList = '<ul style="margin: 10px 0; padding-left: 20px; line-height: 1.8;">';
        Ext.each(anomalis, function(item) {
            htmlList += '<li style="color: #c0392b; font-weight: 500;">' + item + '</li>';
        });
        htmlList += '</ul>';

        var win = Ext.create("Ext.window.Window", {
            title: '<i class="x-fa fa-exclamation-triangle" style="color: #e74c3c;"></i> Deteksi Anomali Rekam Medis: ' + record.get("NAMA_PASIEN") + ' (' + record.get("NORM") + ')',
            width: 650,
            height: 380,
            modal: true,
            layout: "border",
            ui: "panel-red",
            items: [
                {
                    region: "north",
                    bodyPadding: 12,
                    html: '<div style="font-size: 13px; color: #555;">Ditemukan <b>' + anomalis.length + ' catatan anomali/ketidaksesuaian</b> pada rekam medis kunjungan <b>' + record.get("KUNJUNGAN") + '</b>:</div>'
                },
                {
                    region: "center",
                    scrollable: "y",
                    bodyPadding: 12,
                    html: htmlList
                }
            ],
            buttons: [
                {
                    text: "Lengkapi Resume Medis",
                    iconCls: "x-fa fa-file-text-o",
                    ui: "soft-blue",
                    handler: function() {
                        win.close();
                        me.openFastLaneEdit(record, "RESUME");
                    }
                },
                {
                    text: "Koreksi Diagnosa ICD-10",
                    iconCls: "x-fa fa-stethoscope",
                    ui: "soft-green",
                    handler: function() {
                        win.close();
                        me.openFastLaneEdit(record, "DIAGNOSA");
                    }
                },
                {
                    text: "Tutup",
                    handler: function() { win.close(); }
                }
            ]
        });
        win.show();
    },

    onExportExcel: function() {
        var me = this,
            view = me.getView(),
            grid = view.down("grid"),
            store = grid ? grid.getStore() : null;

        if (!store || store.getCount() === 0) {
            Ext.Msg.alert("Peringatan", "Tidak ada data audit yang dapat diexport.");
            return;
        }

        var csv = "No,Kunjungan,No Reg,NORM,Nama Pasien,JK,Umur,Ruangan,Jenis,Tanggal Masuk,DPJP,Persentase,Jumlah Anomali,Status\n";
        store.each(function(rec, idx) {
            csv += [
                idx + 1,
                '"' + rec.get("KUNJUNGAN") + '"',
                '"' + rec.get("NOPEN") + '"',
                rec.get("NORM"),
                '"' + (rec.get("NAMA_PASIEN") || "").split('"').join('""') + '"',
                rec.get("JENIS_KELAMIN"),
                rec.get("UMUR"),
                '"' + (rec.get("NAMA_RUANGAN") || "").split('"').join('""') + '"',
                '"' + rec.get("LABEL_JENIS_KUNJUNGAN") + '"',
                rec.get("MASUK") ? Ext.Date.format(rec.get("MASUK"), "Y-m-d H:i") : "",
                '"' + (rec.get("NAMA_DPJP") || "").split('"').join('""') + '"',
                rec.get("PERSENTASE") + "%",
                rec.get("JUMLAH_ANOMALI"),
                rec.get("STATUS_LABEL")
            ].join(",") + "\n";
        });

        var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        var link = document.createElement("a");
        var url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "Audit_Kelengkapan_RME_" + Ext.Date.format(new Date(), "Ymd_His") + ".csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
});

Ext.define("auditrekammedis.Workspace", {
    extend: "com.Form",
    alias: "widget.auditrekammedis-workspace",
    controller: "auditrekammedis-workspace",
    layout: "border",
    bodyPadding: 0,
    ui: "panel-blue",

    load: function() {
        var ctrl = this.getController();
        if (ctrl && typeof ctrl.onSearch === "function") {
            ctrl.onSearch();
        }
    },

    initComponent: function() {
        var me = this;

        // Custom style injected for KPI Cards and Badges
        if (!Ext.get("audit-rme-custom-style")) {
            Ext.util.CSS.createStyleSheet(
                '.kpi-container { display: flex; gap: 10px; padding: 10px 15px; background: #f8fafc; border-bottom: 1px solid #e2e8f0; }' +
                '.kpi-card { flex: 1; background: #ffffff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }' +
                '.kpi-box { text-align: center; }' +
                '.kpi-num { display: block; font-size: 22px; font-weight: bold; color: #1e293b; }' +
                '.kpi-lbl { font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; color: #64748b; }' +
                '.doc-chip { display: inline-block; padding: 2px 6px; margin: 1px; font-size: 10px; border-radius: 3px; font-weight: bold; cursor: pointer; text-decoration: none; }' +
                '.doc-chip-ok { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }' +
                '.doc-chip-empty { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }' +
                '.doc-chip-warn { background: #fef3c7; color: #b45309; border: 1px solid #fcd34d; }' +
                '.badge-anomali { display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; cursor: pointer; }' +
                '.badge-anomali-alert { background: #fee2e2; color: #dc2626; border: 1px solid #f87171; animation: pulse 2s infinite; }' +
                '.badge-anomali-valid { background: #dcfce7; color: #16a34a; border: 1px solid #4ade80; }' +
                '.progress-bar-bg { width: 100%; background: #e2e8f0; border-radius: 4px; height: 16px; overflow: hidden; position: relative; }' +
                '.progress-bar-fill { height: 100%; text-align: center; color: #fff; font-size: 10px; font-weight: bold; line-height: 16px; }',
                'audit-rme-custom-style'
            );
        }

        var store = Ext.create("auditrekammedis.audit.Store");

        me.items = [
            {
                region: "north",
                border: false,
                items: [
                    // Panel Ringkasan KPI
                    {
                        xtype: "container",
                        layout: { type: "hbox", align: "stretch" },
                        padding: "8 12",
                        style: "background: #f1f5f9; border-bottom: 1px solid #cbd5e1;",
                        defaults: { flex: 1, margin: "0 6 0 0", style: "background: #fff; border: 1px solid #cbd5e1; border-radius: 6px; padding: 8px 12px;" },
                        items: [
                            { xtype: "component", itemId: "card-total-pasien", html: '<div class="kpi-box"><span class="kpi-num">0</span><span class="kpi-lbl">Total Pasien</span></div>' },
                            { xtype: "component", itemId: "card-rata-persen", html: '<div class="kpi-box"><span class="kpi-num" style="color: #2563eb;">0%</span><span class="kpi-lbl">Rata-rata Kelengkapan</span></div>' },
                            { xtype: "component", itemId: "card-jumlah-lengkap", html: '<div class="kpi-box"><span class="kpi-num" style="color: #16a34a;">0</span><span class="kpi-lbl">Lengkap (100%)</span></div>' },
                            { xtype: "component", itemId: "card-jumlah-anomali", html: '<div class="kpi-box"><span class="kpi-num" style="color: #dc2626;">0</span><span class="kpi-lbl">Terdeteksi Anomali</span></div>', margin: "0 0 0 0" }
                        ]
                    },
                    // Toolbar Filter
                    {
                        xtype: "toolbar",
                        style: "background: #ffffff; border-bottom: 1px solid #e2e8f0; padding: 6px 12px;",
                        items: [
                            { xtype: "datefield", name: "tgl_awal", fieldLabel: "Dari", labelWidth: 32, width: 155, format: "Y-m-d", value: new Date() },
                            { xtype: "datefield", name: "tgl_akhir", fieldLabel: "s/d", labelWidth: 24, width: 145, format: "Y-m-d", value: new Date() },
                            {
                                xtype: "combobox",
                                name: "jenis_kunjungan",
                                emptyText: "[Jenis Pelayanan]",
                                width: 140,
                                store: [
                                    ["ALL", "Semua Pelayanan"],
                                    ["1", "Rawat Jalan"],
                                    ["2", "Gawat Darurat (IGD)"],
                                    ["3", "Rawat Inap"]
                                ],
                                value: "ALL",
                                editable: false
                            },
                            {
                                xtype: "combobox",
                                name: "status_filter",
                                emptyText: "[Status Audit]",
                                width: 140,
                                store: [
                                    ["ALL", "Semua Status"],
                                    ["BELUM_LENGKAP", "Belum Lengkap (<100%)"],
                                    ["ANOMALI", "Anomali Data"],
                                    ["LENGKAP", "Lengkap (100%)"]
                                ],
                                value: "ALL",
                                editable: false
                            },
                            {
                                xtype: "textfield",
                                name: "query_search",
                                emptyText: "Cari NORM / Nama / Nopen...",
                                width: 200,
                                enableKeyEvents: true,
                                listeners: {
                                    specialkey: function(field, e) {
                                        if (e.getKey() === e.ENTER) {
                                            me.getController().onSearch();
                                        }
                                    }
                                }
                            },
                            {
                                xtype: "button",
                                text: "Filter",
                                iconCls: "x-fa fa-filter",
                                ui: "soft-blue",
                                handler: "onSearch"
                            },
                            {
                                xtype: "button",
                                text: "Reset",
                                iconCls: "x-fa fa-refresh",
                                handler: "onReset"
                            },
                            "->",
                            {
                                xtype: "button",
                                text: "Export CSV",
                                iconCls: "x-fa fa-file-excel-o",
                                ui: "soft-green",
                                handler: "onExportExcel"
                            }
                        ]
                    }
                ]
            },
            {
                region: "center",
                xtype: "grid",
                store: store,
                border: false,
                columnLines: true,
                columns: [
                    {
                        text: "Pasien",
                        dataIndex: "NORM",
                        width: 170,
                        renderer: function(val, meta, rec) {
                            return '<b>' + (rec.get("NAMA_PASIEN") || "-") + '</b><br>' +
                                   '<span style="color: #64748b; font-size: 11px;">RM: ' + val + ' | ' + rec.get("JENIS_KELAMIN") + ' (' + rec.get("UMUR") + ' th)</span>';
                        }
                    },
                    {
                        text: "Kunjungan & Ruangan",
                        dataIndex: "NOPEN",
                        width: 190,
                        renderer: function(val, meta, rec) {
                            var tgl = rec.get("MASUK") ? Ext.Date.format(rec.get("MASUK"), "d/m/Y H:i") : "-";
                            return '<b>' + (rec.get("NAMA_RUANGAN") || "-") + '</b> (' + rec.get("LABEL_JENIS_KUNJUNGAN") + ')<br>' +
                                   '<span style="color: #64748b; font-size: 11px;">Reg: ' + val + ' | ' + tgl + '</span>';
                        }
                    },
                    {
                        text: "DPJP",
                        dataIndex: "NAMA_DPJP",
                        width: 160,
                        renderer: function(val) {
                            return '<span style="font-size: 11px;">' + (val || "-") + '</span>';
                        }
                    },
                    {
                        text: "Kelengkapan",
                        dataIndex: "PERSENTASE",
                        width: 130,
                        align: "center",
                        renderer: function(val) {
                            var color = val >= 100 ? "#16a34a" : (val >= 75 ? "#eab308" : "#dc2626");
                            return '<div class="progress-bar-bg">' +
                                   '<div class="progress-bar-fill" style="width: ' + val + '%; background: ' + color + ';">' + val + '%</div>' +
                                   '</div>';
                        }
                    },
                    {
                        text: "Status & Anomali",
                        dataIndex: "JUMLAH_ANOMALI",
                        width: 140,
                        align: "center",
                        renderer: function(val, meta, rec) {
                            if (val > 0) {
                                return '<span class="badge-anomali badge-anomali-alert" onclick="Ext.ComponentQuery.query(\'auditrekammedis-workspace\')[0].getController().onShowAnomaliModal(Ext.ComponentQuery.query(\'auditrekammedis-workspace\')[0].down(\'grid\').getStore().getById(\'' + rec.getId() + '\'))">' +
                                       '<i class="x-fa fa-exclamation-triangle"></i> ' + val + ' Anomali</span>';
                            }
                            if (rec.get("PERSENTASE") >= 100) {
                                return '<span class="badge-anomali badge-anomali-valid"><i class="x-fa fa-check"></i> Lengkap</span>';
                            }
                            return '<span style="color: #64748b; font-size: 11px;">Belum Lengkap</span>';
                        }
                    },
                    {
                        text: "Dokumen Rekam Medis (Klik untuk Fast-Lane Edit)",
                        dataIndex: "DOCS_STATUS",
                        flex: 1,
                        renderer: function(val, meta, rec) {
                            if (!val) return "-";
                            var html = "";
                            var ctrlName = "Ext.ComponentQuery.query('auditrekammedis-workspace')[0].getController()";
                            var recId = rec.getId();

                            Ext.Object.each(val, function(k, v) {
                                var cls = v.status === 1 ? "doc-chip-ok" : (v.status === 2 ? "doc-chip-warn" : "doc-chip-empty");
                                var icon = v.status === 1 ? "fa-check" : (v.status === 2 ? "fa-exclamation" : "fa-times");
                                html += '<span class="doc-chip ' + cls + '" onclick="' + ctrlName + '.openFastLaneEdit(Ext.ComponentQuery.query(\'auditrekammedis-workspace\')[0].down(\'grid\').getStore().getById(\'' + recId + '\'), \'' + k + '\')" title="Klik untuk melengkapi/koreksi ' + v.nama + '">' +
                                        '<i class="x-fa ' + icon + '"></i> ' + v.nama + '</span> ';
                            });
                            return html;
                        }
                    },
                    {
                        xtype: "actioncolumn",
                        text: "Aksi",
                        width: 60,
                        align: "center",
                        items: [
                            {
                                iconCls: "x-fa fa-edit x-color-blue",
                                tooltip: "Fast-Lane Edit Resume Medis",
                                handler: function(grid, rowIndex) {
                                    var rec = grid.getStore().getAt(rowIndex);
                                    me.getController().openFastLaneEdit(rec, "RESUME");
                                }
                            },
                            {
                                iconCls: "x-fa fa-exclamation-circle x-color-red",
                                tooltip: "Lihat Detail Anomali",
                                isDisabled: function(view, rowIdx, colIdx, item, rec) {
                                    return (rec.get("JUMLAH_ANOMALI") || 0) === 0;
                                },
                                handler: function(grid, rowIndex) {
                                    var rec = grid.getStore().getAt(rowIndex);
                                    me.getController().onShowAnomaliModal(rec);
                                }
                            }
                        ]
                    }
                ],
                bbar: {
                    xtype: "pagingtoolbar",
                    store: store,
                    displayInfo: true,
                    displayMsg: "Menampilkan data {0} - {1} dari total {2} kunjungan",
                    emptyMsg: "Tidak ada data audit untuk kriteria filter ini"
                }
            }
        ];

        me.callParent(arguments);
    }
});
