(function() {
    if (typeof Ext !== "undefined" && Ext.util && Ext.util.CSS) {
        var oldTabStyle = Ext.get("audit-rme-tab-style");
        if (oldTabStyle) {
            try { oldTabStyle.destroy(); } catch (e) {}
        }
        var oldIconStyle = Ext.get("audit-rme-tab-icon-style");
        if (oldIconStyle) {
            try { oldIconStyle.destroy(); } catch (e) {}
        }
        Ext.util.CSS.createStyleSheet(
            '.x-tab-icon-el.fa-clipboard-check { font-size: 20px !important; width: 22px !important; height: 22px !important; line-height: 22px !important; color: #1e40af !important; vertical-align: middle !important; margin-right: 6px !important; }',
            'audit-rme-tab-icon-style'
        );
    }
})();

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
        { name: "STATUS_VERIFIKASI_RM", type: "int", defaultValue: 0 },
        { name: "STATUS_KELENGKAPAN_BERKAS", type: "int", defaultValue: 1 },
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
            fPoli = view.down("[name=poli]"),
            fRanap = view.down("[name=ruangan_ranap]"),
            fDpjp = view.down("[name=dpjp]"),
            fStatus = view.down("[name=status_filter]"),
            fQ = view.down("[name=query_search]");

        var tglAwalVal = fAwal ? Ext.Date.format(fAwal.getValue(), "Y-m-d 00:00:00") : Ext.Date.format(new Date(), "Y-m-d 00:00:00"),
            tglAkhirVal = fAkhir ? Ext.Date.format(fAkhir.getValue(), "Y-m-d 23:59:59") : Ext.Date.format(new Date(), "Y-m-d 23:59:59"),
            jkVal = fJk ? fJk.getValue() : "ALL",
            poliVal = (fPoli && fPoli.isVisible()) ? (fPoli.getValue() || "ALL") : "ALL",
            ranapVal = (fRanap && fRanap.isVisible()) ? (fRanap.getValue() || "ALL") : "ALL",
            dpjpVal = fDpjp ? (fDpjp.getValue() || "ALL") : "ALL",
            statusVal = fStatus ? fStatus.getValue() : "ALL",
            qVal = fQ ? fQ.getValue() : "";

        var ruanganVal = (poliVal && poliVal !== "ALL") ? poliVal : ((ranapVal && ranapVal !== "ALL") ? ranapVal : "ALL");

        store.getProxy().setExtraParams({
            tanggal_awal: tglAwalVal,
            tanggal_akhir: tglAkhirVal,
            jenis_kunjungan: jkVal,
            ruangan: ruanganVal,
            poli: poliVal,
            ruangan_ranap: ranapVal,
            dpjp: dpjpVal,
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
            fPoli = view.down("[name=poli]"),
            fRanap = view.down("[name=ruangan_ranap]"),
            fDpjp = view.down("[name=dpjp]"),
            fStatus = view.down("[name=status_filter]"),
            fQ = view.down("[name=query_search]");

        if (fAwal) fAwal.setValue(new Date());
        if (fAkhir) fAkhir.setValue(new Date());
        if (fJk) fJk.setValue("ALL");
        if (fPoli) {
            fPoli.clearValue();
            if (fPoli.getTriggers && fPoli.getTriggers().clear) fPoli.getTriggers().clear.hide();
            fPoli.show();
        }
        if (fRanap) {
            fRanap.clearValue();
            if (fRanap.getTriggers && fRanap.getTriggers().clear) fRanap.getTriggers().clear.hide();
            fRanap.show();
        }
        if (fDpjp) {
            fDpjp.clearValue();
            if (fDpjp.getTriggers && fDpjp.getTriggers().clear) fDpjp.getTriggers().clear.hide();
        }
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

        if (cardTotal) {
            cardTotal.setHtml(
                '<div class="satusehat-kpi-card-content satusehat-tone-info">' +
                '  <div class="satusehat-kpi-icon"><i class="x-fa fa-users"></i></div>' +
                '  <div class="satusehat-kpi-copy">' +
                '    <div class="satusehat-kpi-label">TOTAL PASIEN</div>' +
                '    <div class="satusehat-kpi-value">' + (summary.total_pasien || 0) + '</div>' +
                '    <div class="satusehat-kpi-description">Kunjungan Terdaftar</div>' +
                '  </div>' +
                '</div>'
            );
        }
        if (cardPersen) {
            cardPersen.setHtml(
                '<div class="satusehat-kpi-card-content satusehat-tone-info">' +
                '  <div class="satusehat-kpi-icon"><i class="x-fa fa-pie-chart"></i></div>' +
                '  <div class="satusehat-kpi-copy">' +
                '    <div class="satusehat-kpi-label">RATA-RATA KELENGKAPAN</div>' +
                '    <div class="satusehat-kpi-value">' + (summary.rata_persentase || 0) + '%</div>' +
                '    <div class="satusehat-kpi-description">Kepatuhan Rekam Medis</div>' +
                '  </div>' +
                '</div>'
            );
        }
        if (cardLengkap) {
            cardLengkap.setHtml(
                '<div class="satusehat-kpi-card-content satusehat-tone-success">' +
                '  <div class="satusehat-kpi-icon"><i class="x-fa fa-check-circle"></i></div>' +
                '  <div class="satusehat-kpi-copy">' +
                '    <div class="satusehat-kpi-label">BERKAS LENGKAP (100%)</div>' +
                '    <div class="satusehat-kpi-value">' + (summary.jumlah_lengkap || 0) + '</div>' +
                '    <div class="satusehat-kpi-description">Dokumen Selesai</div>' +
                '  </div>' +
                '</div>'
            );
        }
        if (cardAnomali) {
            cardAnomali.setHtml(
                '<div class="satusehat-kpi-card-content satusehat-tone-danger">' +
                '  <div class="satusehat-kpi-icon"><i class="x-fa fa-exclamation-triangle"></i></div>' +
                '  <div class="satusehat-kpi-copy">' +
                '    <div class="satusehat-kpi-label">TERDETEKSI ANOMALI</div>' +
                '    <div class="satusehat-kpi-value">' + (summary.jumlah_anomali || 0) + '</div>' +
                '    <div class="satusehat-kpi-description">Perlu Perhatian Petugas RM</div>' +
                '  </div>' +
                '</div>'
            );
        }
    },

    openFastLaneEdit: function(record, docKode) {
        var me = this,
            view = me.getView(),
            docs = record.get("DOCS_STATUS") || {},
            docInfo = docs[docKode] || {},
            targetXtype = docInfo.xtype || "rekammedis-resume-workspace",
            namaDoc = docInfo.nama || "Dokumen Rekam Medis";

        var kjgnModel = Ext.create("data.model.Kunjungan", {
            NOMOR: record.get("KUNJUNGAN"),
            NOPEN: record.get("NOPEN"),
            RUANGAN: record.get("RUANGAN"),
            FINAL_HASIL: record.get("FINAL_HASIL"),
            MASUK: record.get("MASUK"),
            KELUAR: record.get("KELUAR"),
            DPJP: record.get("DPJP"),
            STATUS: record.get("STATUS_KUNJUNGAN") || 1,
            REFERENSI: {
                PENDAFTARAN: {
                    NOMOR: record.get("NOPEN"),
                    NORM: record.get("NORM")
                },
                RUANGAN: {
                    ID: record.get("RUANGAN"),
                    DESKRIPSI: record.get("NAMA_RUANGAN")
                }
            }
        });

        var win = Ext.create("Ext.window.Window", {
            title: '<i class="x-fa fa-edit" style="color: #93c5fd; margin-right: 6px;"></i> ' + namaDoc + ' — ' + record.get("NAMA_PASIEN") + ' (' + record.get("NORM") + ')',
            width: "92%",
            height: "90%",
            modal: true,
            maximizable: true,
            layout: "fit",
            cls: "rme-fastlane-window",
            ui: "window-blue",
            items: [{
                xtype: targetXtype,
                reference: "targetRmeWorkspace"
            }],
            bbar: [
                {
                    xtype: "component",
                    html: '<span style="font-weight: 600; color: #1e293b; font-size: 11px;"><i class="x-fa fa-shield" style="color:#2563eb;"></i> Verifikasi & Kelengkapan:</span>'
                },
                "-",
                {
                    xtype: "combobox",
                    fieldLabel: "Verifikasi RM",
                    labelWidth: 80,
                    width: 175,
                    editable: false,
                    valueField: "id",
                    displayField: "text",
                    store: [
                        [0, "Belum"],
                        [1, "Proses"],
                        [2, "Selesai"]
                    ],
                    value: record.get("STATUS_VERIFIKASI_RM") || 0,
                    reference: "bbarComboVerif"
                },
                {
                    xtype: "combobox",
                    fieldLabel: "Berkas Klaim",
                    labelWidth: 75,
                    width: 185,
                    editable: false,
                    valueField: "id",
                    displayField: "text",
                    store: [
                        [1, "Belum lengkap"],
                        [2, "Lengkap"]
                    ],
                    value: record.get("STATUS_KELENGKAPAN_BERKAS") || 1,
                    reference: "bbarComboBerkas"
                },
                {
                    text: "Simpan Status",
                    iconCls: "x-fa fa-save",
                    ui: "soft-blue",
                    handler: function() {
                        var vVal = win.down("[reference=bbarComboVerif]").getValue();
                        var bVal = win.down("[reference=bbarComboBerkas]").getValue();
                        me.saveVerifikasiStatus(record.get("NOPEN"), vVal, bVal, function() {
                            record.set("STATUS_VERIFIKASI_RM", vVal);
                            record.set("STATUS_KELENGKAPAN_BERKAS", bVal);
                            record.commit();
                        });
                    }
                },
                "->",
                {
                    text: '<i class="x-fa fa-check-circle"></i> <b>Tandai Selesai & Lengkap</b>',
                    ui: "soft-green",
                    tooltip: "Tandai Verifikasi RM Selesai dan Berkas Lengkap sekaligus",
                    handler: function() {
                        win.down("[reference=bbarComboVerif]").setValue(2);
                        win.down("[reference=bbarComboBerkas]").setValue(2);
                        me.saveVerifikasiStatus(record.get("NOPEN"), 2, 2, function() {
                            record.set("STATUS_VERIFIKASI_RM", 2);
                            record.set("STATUS_KELENGKAPAN_BERKAS", 2);
                            record.commit();
                        });
                    }
                }
            ],
            listeners: {
                close: function() {
                    me.onSearch();
                }
            }
        });

        win.show();

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
            title: '<i class="x-fa fa-exclamation-triangle" style="color: #fca5a5; margin-right: 6px;"></i> Deteksi Anomali Rekam Medis: ' + record.get("NAMA_PASIEN") + ' (' + record.get("NORM") + ')',
            width: 650,
            height: 400,
            modal: true,
            layout: "border",
            cls: "rme-fastlane-window",
            ui: "window-blue",
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
    },

    saveVerifikasiStatus: function(nopen, verifVal, berkasVal, callback) {
        var me = this,
            view = me.getView(),
            app = (view && view.app) ? view.app : (Ext.getApplication ? Ext.getApplication() : null),
            petugas = (app && app.usrNm) ? (app.usrNm + "(" + (app.usrid || "") + ")") : "Petugas Rekam Medis";

        view.setLoading("Menyimpan status verifikasi...");
        Ext.Ajax.request({
            url: webservice.location + "auditrekammedis/kelengkapan/" + nopen,
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            jsonData: {
                NOPEN: nopen,
                STATUS_VERIFIKASI_RM: verifVal,
                STATUS_KELENGKAPAN_BERKAS: berkasVal,
                PETUGAS: petugas
            },
            success: function(resp) {
                view.setLoading(false);
                var res = Ext.decode(resp.responseText, true) || {};
                Ext.toast({
                    html: '<i class="x-fa fa-check-circle"></i> Status Verifikasi RM dan Kelengkapan Berkas berhasil diperbarui',
                    align: "t",
                    ui: "soft-green",
                    timeout: 2500
                });
                if (typeof callback === "function") callback(res);
            },
            failure: function(resp) {
                view.setLoading(false);
                var res = Ext.decode(resp.responseText, true) || {};
                Ext.Msg.alert("Gagal", res.message || "Gagal memperbarui status verifikasi");
            }
        });
    },

    onOpenStatusDialog: function(record) {
        var me = this,
            view = me.getView(),
            nopen = record.get("NOPEN"),
            norm = record.get("NORM"),
            nama = record.get("NAMA_PASIEN"),
            kunjungan = record.get("KUNJUNGAN"),
            vCur = record.get("STATUS_VERIFIKASI_RM") !== undefined ? record.get("STATUS_VERIFIKASI_RM") : 0,
            bCur = record.get("STATUS_KELENGKAPAN_BERKAS") !== undefined ? record.get("STATUS_KELENGKAPAN_BERKAS") : 1,
            persen = record.get("PERSENTASE") || 0;

        var dlg = Ext.create("Ext.window.Window", {
            title: '<i class="x-fa fa-check-square-o" style="color: #93c5fd; margin-right: 6px;"></i> Update Status Verifikasi & Berkas Klaim',
            width: 490,
            modal: true,
            ui: "window-blue",
            cls: "rme-fastlane-window",
            bodyPadding: 16,
            layout: "vbox",
            defaults: { width: "100%", margin: "0 0 12 0" },
            items: [
                {
                    xtype: "component",
                    html: '<div style="background: #f1f5f9; border-radius: 6px; padding: 10px 12px; margin-bottom: 6px; border: 1px solid #e2e8f0;">' +
                          '  <div style="font-weight: bold; font-size: 14px; color: #0f172a;">' + nama + ' (' + norm + ')</div>' +
                          '  <div style="font-size: 11px; color: #64748b; margin-top: 3px;">Reg: <b>' + nopen + '</b> | Kunjungan: ' + kunjungan + '</div>' +
                          '  <div style="font-size: 11px; color: #475569; margin-top: 4px;">Kepatuhan RME: <b>' + persen + '%</b> (' + (persen >= 100 ? '<span style="color:#16a34a; font-weight:bold;">Lengkap</span>' : '<span style="color:#dc2626; font-weight:bold;">Belum Lengkap</span>') + ')</div>' +
                          '</div>'
                },
                {
                    xtype: "combobox",
                    fieldLabel: "Status Verifikasi RM",
                    labelWidth: 160,
                    name: "dlg_verif",
                    editable: false,
                    valueField: "id",
                    displayField: "text",
                    store: [
                        [0, "Belum"],
                        [1, "Proses"],
                        [2, "Selesai"]
                    ],
                    value: vCur
                },
                {
                    xtype: "combobox",
                    fieldLabel: "Status Kelengkapan Berkas",
                    labelWidth: 160,
                    name: "dlg_berkas",
                    editable: false,
                    valueField: "id",
                    displayField: "text",
                    store: [
                        [1, "Belum lengkap"],
                        [2, "Lengkap"]
                    ],
                    value: bCur
                }
            ],
            buttons: [
                {
                    text: '<i class="x-fa fa-check-circle"></i> Tandai Selesai & Lengkap',
                    ui: "soft-green",
                    handler: function() {
                        me.saveVerifikasiStatus(nopen, 2, 2, function() {
                            record.set("STATUS_VERIFIKASI_RM", 2);
                            record.set("STATUS_KELENGKAPAN_BERKAS", 2);
                            record.commit();
                            dlg.close();
                        });
                    }
                },
                "->",
                {
                    text: "Simpan",
                    iconCls: "x-fa fa-save",
                    ui: "soft-blue",
                    handler: function() {
                        var vVal = dlg.down("[name=dlg_verif]").getValue();
                        var bVal = dlg.down("[name=dlg_berkas]").getValue();
                        me.saveVerifikasiStatus(nopen, vVal, bVal, function() {
                            record.set("STATUS_VERIFIKASI_RM", vVal);
                            record.set("STATUS_KELENGKAPAN_BERKAS", bVal);
                            record.commit();
                            dlg.close();
                        });
                    }
                },
                {
                    text: "Batal",
                    handler: function() { dlg.close(); }
                }
            ]
        });
        dlg.show();
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

        // Custom style injected for KPI Cards and Badges (Satusehat Theme Revamp)
        var existingCustomStyle = Ext.get("audit-rme-custom-style");
        if (existingCustomStyle) {
            try { existingCustomStyle.destroy(); } catch (e) {}
        }
        Ext.util.CSS.createStyleSheet(
            '.satusehat-kpi-card { border: 1px solid #e3e9f0; border-radius: 10px; box-shadow: 0 3px 12px rgba(31, 52, 73, 0.06); background: #ffffff; overflow: hidden; height: 86px; }' +
            '.satusehat-kpi-card-content { display: flex; align-items: center; padding: 12px 16px; height: 100%; box-sizing: border-box; }' +
            '.satusehat-kpi-icon { width: 44px; height: 44px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; margin-right: 14px; flex-shrink: 0; }' +
            '.satusehat-kpi-copy { min-width: 0; flex: 1; }' +
            '.satusehat-kpi-label { font-size: 11px; font-weight: 700; color: #64748b; letter-spacing: 0.5px; text-transform: uppercase; }' +
            '.satusehat-kpi-value { font-size: 24px; font-weight: 800; line-height: 28px; margin-top: 2px; }' +
            '.satusehat-kpi-description { font-size: 10px; color: #94a3b8; margin-top: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }' +

            '.satusehat-tone-info .satusehat-kpi-icon { background: #eaf2fd; color: #246fc4; }' +
            '.satusehat-tone-info .satusehat-kpi-value { color: #246fc4; }' +
            '.satusehat-tone-info { border-top: 3px solid #2f80ed; }' +

            '.satusehat-tone-success .satusehat-kpi-icon { background: #e8f7f0; color: #16875b; }' +
            '.satusehat-tone-success .satusehat-kpi-value { color: #16875b; }' +
            '.satusehat-tone-success { border-top: 3px solid #16a36a; }' +

            '.satusehat-tone-danger .satusehat-kpi-icon { background: #fdecec; color: #c73b3b; }' +
            '.satusehat-tone-danger .satusehat-kpi-value { color: #c73b3b; }' +
            '.satusehat-tone-danger { border-top: 3px solid #d94a4a; }' +

            '.doc-chip { display: inline-flex; align-items: center; gap: 3px; padding: 3px 7px; margin: 2px 2px; font-size: 10px; border-radius: 4px; font-weight: 600; cursor: pointer; text-decoration: none; transition: all 0.2s; }' +
            '.doc-chip-ok { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }' +
            '.doc-chip-ok:hover { background: #d1fae5; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }' +
            '.doc-chip-empty { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }' +
            '.doc-chip-empty:hover { background: #fee2e2; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }' +
            '.doc-chip-warn { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }' +
            '.doc-chip-warn:hover { background: #fef3c7; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }' +

            '.badge-anomali { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 12px; font-size: 11px; font-weight: 700; cursor: pointer; }' +
            '.badge-anomali-alert { background: #fdeaea; color: #bd3030; border: 1px solid #fca5a5; }' +
            '.badge-anomali-valid { background: #e7f6ef; color: #147a53; border: 1px solid #86efac; }' +
            '.badge-anomali-pending { background: #fff3df; color: #a86600; border: 1px solid #fde68a; }' +

            '.progress-bar-bg { width: 100%; background: #e2e8f0; border-radius: 6px; height: 16px; overflow: hidden; position: relative; }' +
            '.progress-bar-fill { height: 100%; text-align: center; color: #fff; font-size: 10px; font-weight: bold; line-height: 16px; transition: width 0.4s ease; }' +

            // Fast-Lane Modal Styles
            '.rme-fastlane-window { box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35) !important; border: 1px solid #1e3a8a !important; border-radius: 8px !important; overflow: hidden !important; }' +
            '.rme-fastlane-window .x-window-header { background: #1e40af !important; min-height: 48px !important; padding: 10px 16px !important; border: none !important; }' +
            '.rme-fastlane-window .x-window-header-title { font-size: 15px !important; font-weight: 700 !important; color: #ffffff !important; line-height: 26px !important; }' +
            '.rme-fastlane-window .x-window-header-title .x-title-text { color: #ffffff !important; font-size: 15px !important; font-weight: 700 !important; }' +
            '.rme-fastlane-window .x-tool { width: 32px !important; height: 32px !important; margin-left: 8px !important; background: rgba(255, 255, 255, 0.22) !important; border-radius: 6px !important; display: flex !important; align-items: center !important; justify-content: center !important; transition: all 0.2s ease !important; cursor: pointer !important; }' +
            '.rme-fastlane-window .x-tool:hover { background: rgba(255, 255, 255, 0.4) !important; }' +
            '.rme-fastlane-window .x-tool-close { background: rgba(239, 68, 68, 0.85) !important; }' +
            '.rme-fastlane-window .x-tool-close:hover { background: #dc2626 !important; transform: scale(1.08) !important; }' +
            '.rme-fastlane-window .x-tool-img { filter: brightness(0) invert(1) !important; background-color: transparent !important; transform: scale(1.2) !important; }' +
            '.x-tab-icon-el.fa-clipboard-check { font-size: 20px !important; width: 22px !important; height: 22px !important; line-height: 22px !important; color: #1e40af !important; vertical-align: middle !important; margin-right: 6px !important; }' +
            '.x-action-col-icon { font-size: 16px !important; margin: 0 4px !important; }',
            'audit-rme-custom-style'
        );

        var store = Ext.create("auditrekammedis.audit.Store");

        me.items = [
            {
                region: "north",
                border: false,
                style: "background: #f4f7fb; border-bottom: 1px solid #e3e9f0;",
                items: [
                    // Panel Ringkasan KPI (Satusehat Theme Cards)
                    {
                        xtype: "container",
                        layout: { type: "hbox", align: "stretch" },
                        padding: "8 12 8 12",
                        defaults: { flex: 1, margin: "0 6 0 0" },
                        items: [
                            {
                                xtype: "component",
                                itemId: "card-total-pasien",
                                cls: "satusehat-kpi-card",
                                html: '<div class="satusehat-kpi-card-content satusehat-tone-info">' +
                                      '  <div class="satusehat-kpi-icon"><i class="x-fa fa-users"></i></div>' +
                                      '  <div class="satusehat-kpi-copy">' +
                                      '    <div class="satusehat-kpi-label">TOTAL PASIEN</div>' +
                                      '    <div class="satusehat-kpi-value">0</div>' +
                                      '    <div class="satusehat-kpi-description">Kunjungan Terdaftar</div>' +
                                      '  </div>' +
                                      '</div>'
                            },
                            {
                                xtype: "component",
                                itemId: "card-rata-persen",
                                cls: "satusehat-kpi-card",
                                html: '<div class="satusehat-kpi-card-content satusehat-tone-info">' +
                                      '  <div class="satusehat-kpi-icon"><i class="x-fa fa-pie-chart"></i></div>' +
                                      '  <div class="satusehat-kpi-copy">' +
                                      '    <div class="satusehat-kpi-label">RATA-RATA KELENGKAPAN</div>' +
                                      '    <div class="satusehat-kpi-value">0%</div>' +
                                      '    <div class="satusehat-kpi-description">Kepatuhan Rekam Medis</div>' +
                                      '  </div>' +
                                      '</div>'
                            },
                            {
                                xtype: "component",
                                itemId: "card-jumlah-lengkap",
                                cls: "satusehat-kpi-card",
                                html: '<div class="satusehat-kpi-card-content satusehat-tone-success">' +
                                      '  <div class="satusehat-kpi-icon"><i class="x-fa fa-check-circle"></i></div>' +
                                      '  <div class="satusehat-kpi-copy">' +
                                      '    <div class="satusehat-kpi-label">BERKAS LENGKAP (100%)</div>' +
                                      '    <div class="satusehat-kpi-value">0</div>' +
                                      '    <div class="satusehat-kpi-description">Dokumen Selesai</div>' +
                                      '  </div>' +
                                      '</div>'
                            },
                            {
                                xtype: "component",
                                itemId: "card-jumlah-anomali",
                                cls: "satusehat-kpi-card",
                                margin: "0 0 0 0",
                                html: '<div class="satusehat-kpi-card-content satusehat-tone-danger">' +
                                      '  <div class="satusehat-kpi-icon"><i class="x-fa fa-exclamation-triangle"></i></div>' +
                                      '  <div class="satusehat-kpi-copy">' +
                                      '    <div class="satusehat-kpi-label">TERDETEKSI ANOMALI</div>' +
                                      '    <div class="satusehat-kpi-value">0</div>' +
                                      '    <div class="satusehat-kpi-description">Perlu Perhatian Petugas RM</div>' +
                                      '  </div>' +
                                      '</div>'
                            }
                        ]
                    },
                    // Toolbar Filter Modern
                    {
                        xtype: "toolbar",
                        style: "background: #ffffff; border-top: 1px solid #e3e9f0; padding: 8px 14px;",
                        items: [
                            { xtype: "datefield", name: "tgl_awal", fieldLabel: "Dari", labelWidth: 30, width: 155, format: "Y-m-d", value: new Date() },
                            { xtype: "datefield", name: "tgl_akhir", fieldLabel: "s/d", labelWidth: 24, width: 145, format: "Y-m-d", value: new Date() },
                            {
                                xtype: "combobox",
                                name: "jenis_kunjungan",
                                emptyText: "[Jenis Pelayanan]",
                                width: 155,
                                store: [
                                    ["ALL", "Semua Pelayanan"],
                                    ["1", "Rawat Jalan"],
                                    ["2", "Gawat Darurat (IGD)"],
                                    ["3", "Rawat Inap"],
                                    ["7", "Hemodialisa (HD)"]
                                ],
                                value: "ALL",
                                editable: false,
                                listeners: {
                                    select: function(combo) {
                                        var val = combo.getValue(),
                                            fPoli = me.down("[name=poli]"),
                                            fRanap = me.down("[name=ruangan_ranap]");

                                        if (val === "1") {
                                            if (fPoli) fPoli.show();
                                            if (fRanap) {
                                                fRanap.clearValue();
                                                if (fRanap.getTriggers && fRanap.getTriggers().clear) fRanap.getTriggers().clear.hide();
                                                fRanap.hide();
                                            }
                                        } else if (val === "3") {
                                            if (fRanap) fRanap.show();
                                            if (fPoli) {
                                                fPoli.clearValue();
                                                if (fPoli.getTriggers && fPoli.getTriggers().clear) fPoli.getTriggers().clear.hide();
                                                fPoli.hide();
                                            }
                                        } else if (val === "2" || val === "7") {
                                            if (fPoli) {
                                                fPoli.clearValue();
                                                if (fPoli.getTriggers && fPoli.getTriggers().clear) fPoli.getTriggers().clear.hide();
                                                fPoli.hide();
                                            }
                                            if (fRanap) {
                                                fRanap.clearValue();
                                                if (fRanap.getTriggers && fRanap.getTriggers().clear) fRanap.getTriggers().clear.hide();
                                                fRanap.hide();
                                            }
                                        } else {
                                            if (fPoli) fPoli.show();
                                            if (fRanap) fRanap.show();
                                        }
                                        me.getController().onSearch();
                                    }
                                }
                            },
                            {
                                xtype: "ruangan-combo",
                                name: "poli",
                                emptyText: "[Pilih Poli]",
                                width: 165,
                                params: { JENIS: 5, JENIS_KUNJUNGAN: 1, STATUS: 1, limit: 100 },
                                firstLoad: true,
                                triggers: {
                                    clear: {
                                        cls: "x-form-clear-trigger",
                                        hidden: true,
                                        handler: function() {
                                            this.clearValue();
                                            if (this.getTriggers && this.getTriggers().clear) this.getTriggers().clear.hide();
                                            me.getController().onSearch();
                                        }
                                    }
                                },
                                listeners: {
                                    change: function(cmp, val) {
                                        if (cmp.getTriggers && cmp.getTriggers().clear) {
                                            if (val) cmp.getTriggers().clear.show();
                                            else cmp.getTriggers().clear.hide();
                                        }
                                    },
                                    select: function() {
                                        me.getController().onSearch();
                                    }
                                }
                            },
                            {
                                xtype: "ruangan-combo",
                                name: "ruangan_ranap",
                                emptyText: "[Pilih Ruangan Ranap]",
                                width: 180,
                                params: { JENIS: 5, JENIS_KUNJUNGAN: 3, STATUS: 1, limit: 100 },
                                firstLoad: true,
                                triggers: {
                                    clear: {
                                        cls: "x-form-clear-trigger",
                                        hidden: true,
                                        handler: function() {
                                            this.clearValue();
                                            if (this.getTriggers && this.getTriggers().clear) this.getTriggers().clear.hide();
                                            me.getController().onSearch();
                                        }
                                    }
                                },
                                listeners: {
                                    change: function(cmp, val) {
                                        if (cmp.getTriggers && cmp.getTriggers().clear) {
                                            if (val) cmp.getTriggers().clear.show();
                                            else cmp.getTriggers().clear.hide();
                                        }
                                    },
                                    select: function() {
                                        me.getController().onSearch();
                                    }
                                }
                            },
                            {
                                xtype: "dokter-combo",
                                name: "dpjp",
                                emptyText: "[Pilih DPJP]",
                                width: 200,
                                params: { STATUS: 1 },
                                firstLoad: true,
                                triggers: {
                                    clear: {
                                        cls: "x-form-clear-trigger",
                                        hidden: true,
                                        handler: function() {
                                            this.clearValue();
                                            if (this.getTriggers && this.getTriggers().clear) this.getTriggers().clear.hide();
                                            me.getController().onSearch();
                                        }
                                    }
                                },
                                listeners: {
                                    change: function(cmp, val) {
                                        if (cmp.getTriggers && cmp.getTriggers().clear) {
                                            if (val) cmp.getTriggers().clear.show();
                                            else cmp.getTriggers().clear.hide();
                                        }
                                    },
                                    select: function() {
                                        me.getController().onSearch();
                                    }
                                }
                            },
                            {
                                xtype: "combobox",
                                name: "status_filter",
                                emptyText: "[Status Audit]",
                                width: 145,
                                store: [
                                    ["ALL", "Semua Status"],
                                    ["BELUM_LENGKAP", "Belum Lengkap (<100%)"],
                                    ["ANOMALI", "Anomali Data"],
                                    ["LENGKAP", "Lengkap (100%)"]
                                ],
                                value: "ALL",
                                editable: false,
                                listeners: {
                                    select: function() { me.getController().onSearch(); }
                                }
                            },
                            {
                                xtype: "textfield",
                                name: "query_search",
                                emptyText: "Cari NORM / Nama / Nopen...",
                                width: 190,
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
                        width: 175,
                        renderer: function(val, meta, rec) {
                            return '<b>' + (rec.get("NAMA_PASIEN") || "-") + '</b><br>' +
                                   '<span style="color: #64748b; font-size: 11px;">RM: ' + val + ' | ' + rec.get("JENIS_KELAMIN") + ' (' + rec.get("UMUR") + ' th)</span>';
                        }
                    },
                    {
                        text: "Kunjungan & Ruangan",
                        dataIndex: "NOPEN",
                        width: 225,
                        renderer: function(val, meta, rec) {
                            var tgl = rec.get("MASUK") ? Ext.Date.format(rec.get("MASUK"), "d/m/Y H:i") : "-";
                            var nmRuangan = rec.get("NAMA_RUANGAN") || "-";
                            var labelJk = rec.get("LABEL_JENIS_KUNJUNGAN") || "";
                            var isHd = rec.get("JENIS_KUNJUNGAN") == 7 || 
                                       (nmRuangan && nmRuangan.toLowerCase().indexOf("hemodial") !== -1) || 
                                       labelJk.toLowerCase() === "hemodialisa";

                            var titleText = '<b>' + nmRuangan + '</b>';
                            if (!isHd && labelJk) {
                                titleText += ' (' + labelJk + ')';
                            }

                            var vStatus = rec.get("STATUS_VERIFIKASI_RM") !== undefined ? rec.get("STATUS_VERIFIKASI_RM") : 0;
                            var bStatus = rec.get("STATUS_KELENGKAPAN_BERKAS") !== undefined ? rec.get("STATUS_KELENGKAPAN_BERKAS") : 1;

                            var vColors = ["#d11313", "#cb7615", "#15cb69"];
                            var vTexts = ["Belum", "Proses", "Selesai"];
                            var bColors = { 1: "#d11313", 2: "#15cb69" };
                            var bTexts = { 1: "Belum lengkap", 2: "Lengkap" };

                            var vColor = vColors[vStatus] || "#d11313";
                            var vText = vTexts[vStatus] || "Belum";
                            var bColor = bColors[bStatus] || "#d11313";
                            var bText = bTexts[bStatus] || "Belum lengkap";

                            var recId = rec.getId();
                            var clickAction = 'Ext.ComponentQuery.query(\'auditrekammedis-workspace\')[0].getController().onOpenStatusDialog(Ext.ComponentQuery.query(\'auditrekammedis-workspace\')[0].down(\'grid\').getStore().getById(\'' + recId + '\'))';

                            var badgeVerif = '<span style="display:inline-block; border-radius:3px; overflow:hidden; border:1px solid ' + vColor + '; font-size:10px; margin-top:4px; margin-right:4px; vertical-align:middle; cursor:pointer;" onclick="' + clickAction + '" title="Klik untuk ubah status Verifikasi RM">' +
                                             '<span style="background:' + vColor + '; color:#fff; padding:1px 4px; font-weight:600;">Verifikasi RM</span>' +
                                             '<span style="background:#fff; color:' + vColor + '; padding:1px 4px; font-weight:bold;">' + vText + '</span></span>';

                            var badgeBerkas = '<span style="display:inline-block; border-radius:3px; overflow:hidden; border:1px solid ' + bColor + '; font-size:10px; margin-top:4px; vertical-align:middle; cursor:pointer;" onclick="' + clickAction + '" title="Klik untuk ubah status Kelengkapan Berkas">' +
                                              '<span style="background:' + bColor + '; color:#fff; padding:1px 4px; font-weight:600;">Kelengkapan Berkas</span>' +
                                              '<span style="background:#fff; color:' + bColor + '; padding:1px 4px; font-weight:bold;">' + bText + '</span></span>';

                            return titleText + '<br>' +
                                   '<span style="color: #64748b; font-size: 11px;">Reg: ' + val + ' | ' + tgl + '</span><br>' +
                                   badgeVerif + badgeBerkas;
                        }
                    },
                    {
                        text: "DPJP",
                        dataIndex: "NAMA_DPJP",
                        width: 180,
                        renderer: function(val) {
                            return '<span style="font-size: 11px; font-weight: 500;">' + (val || "-") + '</span>';
                        }
                    },
                    {
                        text: "Kelengkapan",
                        dataIndex: "PERSENTASE",
                        width: 130,
                        align: "center",
                        renderer: function(val) {
                            var color = val >= 100 ? "#16a34a" : (val >= 75 ? "#eab308" : (val >= 40 ? "#f97316" : "#dc2626"));
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
                            return '<span class="badge-anomali badge-anomali-pending"><i class="x-fa fa-clock-o"></i> Belum Lengkap</span>';
                        }
                    },
                    {
                        text: "Dokumen Rekam Medis",
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
                        width: 85,
                        align: "center",
                        items: [
                            {
                                iconCls: "x-fa fa-check-square-o x-color-green",
                                tooltip: "Update Status Verifikasi RM & Kelengkapan Berkas",
                                handler: function(grid, rowIndex) {
                                    var rec = grid.getStore().getAt(rowIndex);
                                    me.getController().onOpenStatusDialog(rec);
                                }
                            },
                            {
                                iconCls: "x-fa fa-edit x-color-blue",
                                tooltip: "Edit Resume Medis",
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
