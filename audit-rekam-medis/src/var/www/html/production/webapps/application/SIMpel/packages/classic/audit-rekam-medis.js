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
    selectedRecord: null,

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

        var prevSelKjgn = me.selectedRecord ? me.selectedRecord.get("KUNJUNGAN") : null;

        view.setLoading(true);
        store.loadPage(1, {
            callback: function(records, operation, success) {
                view.setLoading(false);
                if (success) {
                    var raw = operation.getResponse() ? Ext.JSON.decode(operation.getResponse().responseText) : null;
                    if (raw && raw.summary) {
                        me.updateSummaryKPI(raw.summary);
                    }
                    var masterGrid = view.down("#master-patient-grid") || view.down("grid");
                    if (records && records.length > 0) {
                        var recToSelect = null;
                        if (prevSelKjgn) {
                            recToSelect = store.getById(prevSelKjgn);
                        }
                        if (!recToSelect) recToSelect = records[0];
                        if (masterGrid) {
                            masterGrid.getSelectionModel().select(recToSelect);
                        }
                    } else {
                        me.clearDetailPasien();
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

        me.selectedRecord = null;
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
                            me.onSelectPatient(record);
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
                            me.onSelectPatient(record);
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
                            me.onSelectPatient(record);
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
                            me.onSelectPatient(record);
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
    },
onSelectPatient: function(record) {
        var me = this,
            view = me.getView();

        if (!record) {
            me.clearDetailPasien();
            return;
        }

        me.selectedRecord = record;

        var btnQuick = view.down("#btn-quick-complete"),
            btnStatus = view.down("#btn-open-status"),
            btnAnomali = view.down("#btn-show-anomali"),
            headerInfo = view.down("#detail-header-info"),
            detailContainer = view.down("#detail-scroll-container");

        if (btnQuick) btnQuick.setDisabled(false);
        if (btnStatus) btnStatus.setDisabled(false);
        if (btnAnomali) {
            var anomaliCount = record.get("JUMLAH_ANOMALI") || 0;
            btnAnomali.setDisabled(anomaliCount === 0);
            btnAnomali.setText('<i class="x-fa fa-exclamation-triangle"></i> Anomali (' + anomaliCount + ')');
        }

        if (headerInfo) {
            var pName = Ext.String.htmlEncode(record.get("NAMA_PASIEN") || "-");
            var normVal = record.get("NORM") || "-";
            var nopenVal = record.get("NOPEN") || "-";
            headerInfo.setHtml(
                '<span style="font-weight: 700; color: #0f172a; font-size: 13px;">' + pName + '</span> ' +
                '<span style="color: #64748b; font-size: 11px;">(RM: <b style="color: #1e40af;">' + normVal + '</b> | Reg: <b>' + nopenVal + '</b>)</span>'
            );
        }

        if (detailContainer) {
            detailContainer.update(me.buildDetailHtml(record));
        }
    },

    clearDetailPasien: function() {
        var me = this,
            view = me.getView();

        me.selectedRecord = null;

        var btnQuick = view.down("#btn-quick-complete"),
            btnStatus = view.down("#btn-open-status"),
            btnAnomali = view.down("#btn-show-anomali"),
            headerInfo = view.down("#detail-header-info"),
            detailContainer = view.down("#detail-scroll-container");

        if (btnQuick) btnQuick.setDisabled(true);
        if (btnStatus) btnStatus.setDisabled(true);
        if (btnAnomali) {
            btnAnomali.setDisabled(true);
            btnAnomali.setText('<i class="x-fa fa-exclamation-triangle"></i> Anomali');
        }
        if (headerInfo) {
            headerInfo.setHtml('<span style="color: #64748b; font-size: 12px; font-weight: 500;">Pilih pasien di sebelah kiri</span>');
        }
        if (detailContainer && typeof view.getEmptyDetailHtml === "function") {
            detailContainer.update(view.getEmptyDetailHtml());
        }
    },

    onQuickCompleteCurrent: function() {
        var me = this;
        if (!me.selectedRecord) return;
        var nopen = me.selectedRecord.get("NOPEN");
        me.saveVerifikasiStatus(nopen, 2, 2, function() {
            me.selectedRecord.set("STATUS_VERIFIKASI_RM", 2);
            me.selectedRecord.set("STATUS_KELENGKAPAN_BERKAS", 2);
            me.selectedRecord.commit();
            me.onSelectPatient(me.selectedRecord);
        });
    },

    onOpenStatusDialogCurrent: function() {
        var me = this;
        if (!me.selectedRecord) return;
        me.onOpenStatusDialog(me.selectedRecord);
    },

    onShowAnomaliModalCurrent: function() {
        var me = this;
        if (!me.selectedRecord) return;
        me.onShowAnomaliModal(me.selectedRecord);
    },

    onFastLaneDocClick: function(docKode) {
        var me = this;
        if (!me.selectedRecord) return;
        me.openFastLaneEdit(me.selectedRecord, docKode);
    },

    buildDetailHtml: function(rec) {
        var me = this,
            norm = rec.get("NORM") || "-",
            nama = Ext.String.htmlEncode(rec.get("NAMA_PASIEN") || "-"),
            jk = (rec.get("JENIS_KELAMIN") == 1 || rec.get("JENIS_KELAMIN") == "L") ? "Laki-laki" : "Perempuan",
            umur = rec.get("UMUR") || 0,
            nopen = rec.get("NOPEN") || "-",
            kunjungan = rec.get("KUNJUNGAN") || "-",
            ruangan = Ext.String.htmlEncode(rec.get("NAMA_RUANGAN") || "-"),
            dpjp = Ext.String.htmlEncode(rec.get("NAMA_DPJP") || "-"),
            jenisLayanan = Ext.String.htmlEncode(rec.get("LABEL_JENIS_KUNJUNGAN") || "-"),
            masuk = rec.get("MASUK") ? Ext.Date.format(rec.get("MASUK"), "d/m/Y H:i") : "-",
            keluar = rec.get("KELUAR") ? Ext.Date.format(rec.get("KELUAR"), "d/m/Y H:i") : null,
            persen = rec.get("PERSENTASE") || 0,
            statusVerif = rec.get("STATUS_VERIFIKASI_RM") !== undefined ? rec.get("STATUS_VERIFIKASI_RM") : 0,
            statusBerkas = rec.get("STATUS_KELENGKAPAN_BERKAS") !== undefined ? rec.get("STATUS_KELENGKAPAN_BERKAS") : 1,
            anomalis = rec.get("ANOMALI_LIST") || [],
            docs = rec.get("DOCS_STATUS") || {};

        var pColor = persen >= 100 ? "#16a34a" : (persen >= 75 ? "#eab308" : (persen >= 40 ? "#f97316" : "#dc2626"));
        var pStatusText = (persen >= 100 && anomalis.length === 0) ? "Lengkap" : (anomalis.length > 0 ? "Anomali" : "Belum Lengkap");

        var vText = statusVerif === 2 ? "Selesai" : (statusVerif === 1 ? "Proses" : "Belum");
        var vCls = statusVerif === 2 ? "val-selesai" : (statusVerif === 1 ? "val-proses" : "val-belum");

        var bText = statusBerkas === 2 ? "Lengkap" : "Belum Lengkap";
        var bCls = statusBerkas === 2 ? "val-selesai" : "val-belum";

        var docMeta = {
            RESUME: { icon: "fa-file-text-o", desc: "Ringkasan perawatan pulang, diagnosa akhir, komorbiditas & terapi keluar" },
            DIAGNOSA: { icon: "fa-stethoscope", desc: "Koding diagnosa primer/sekunder ICD-10 & tindakan medis ICD-9-CM" },
            ANAMNESIS: { icon: "fa-user-md", desc: "Keluhan utama, riwayat penyakit, alergi, dan pengkajian awal klinis" },
            TTV: { icon: "fa-heartbeat", desc: "Pemeriksaan tanda vital: Tekanan darah, nadi, suhu, nafas & SpO2" },
            CPPT: { icon: "fa-pencil-square-o", desc: "Catatan Perkembangan Pasien Terintegrasi format SOAP DPJP" },
            TRIAGE: { icon: "fa-ambulance", desc: "Skrining & penilaian kegawatdaruratan triase Instalasi Gawat Darurat" },
            OPERASI: { icon: "fa-scissors", desc: "Laporan tindakan pembedahan intra-operatif, operator & anastesi" },
            SSC: { icon: "fa-shield", desc: "Surgical Safety Checklist (Sign-in, Time-out, Sign-out kamar operasi)" },
            GENERAL_CONSENT: { icon: "fa-check-square-o", desc: "Persetujuan umum perawatan pasien dan hak & kewajiban pasien" },
            EDUKASI: { icon: "fa-comments-o", desc: "Formulir pemberian edukasi terintegrasi kepada pasien / keluarga" }
        };

        var html = "";

        // 1. Patient Summary Card
        html += '<div class="audit-detail-card audit-detail-patient-box">' +
                '  <div class="audit-detail-avatar"><i class="x-fa fa-user"></i></div>' +
                '  <div class="audit-detail-pinfo">' +
                '    <div class="audit-detail-pname">' +
                '      <span>' + nama + '</span>' +
                '      <span class="audit-pill-tag audit-pill-blue">' + jk + ', ' + umur + ' th</span>' +
                '      <span class="audit-pill-tag audit-pill-green">' + jenisLayanan + '</span>' +
                '    </div>' +
                '    <div class="audit-detail-meta-grid">' +
                '      <div><i class="x-fa fa-id-card-o" style="color:#2563eb; width:16px;"></i> No. RM: <b>' + norm + '</b></div>' +
                '      <div><i class="x-fa fa-hashtag" style="color:#2563eb; width:16px;"></i> No. Reg: <b>' + nopen + '</b></div>' +
                '      <div><i class="x-fa fa-exchange" style="color:#2563eb; width:16px;"></i> Kunjungan: <b>' + kunjungan + '</b></div>' +
                '      <div><i class="x-fa fa-hospital-o" style="color:#2563eb; width:16px;"></i> Ruangan: <b>' + ruangan + '</b></div>' +
                '      <div><i class="x-fa fa-user-md" style="color:#2563eb; width:16px;"></i> DPJP: <b>' + dpjp + '</b></div>' +
                '      <div><i class="x-fa fa-calendar-check-o" style="color:#2563eb; width:16px;"></i> Masuk: <b>' + masuk + '</b>' + (keluar ? ' | Keluar: <b>' + keluar + '</b>' : '') + '</div>' +
                '    </div>' +
                '  </div>' +
                '  <div class="audit-detail-score">' +
                '    <div class="audit-score-num" style="color: ' + pColor + ';">' + persen + '%</div>' +
                '    <div class="audit-score-lbl" style="color: ' + pColor + ';">' + pStatusText + '</div>' +
                '  </div>' +
                '</div>';

        // 2. Status & Fast-Lane Verification Strip
        html += '<div class="audit-status-strip">' +
                '  <div class="audit-status-indicators">' +
                '    <div class="audit-status-item">' +
                '      <i class="x-fa fa-shield" style="color: #2563eb;"></i> Status Verifikasi RM:' +
                '      <span class="audit-status-val ' + vCls + '">' + vText + '</span>' +
                '    </div>' +
                '    <div class="audit-status-item">' +
                '      <i class="x-fa fa-file-archive-o" style="color: #16a34a;"></i> Kelengkapan Berkas Klaim:' +
                '      <span class="audit-status-val ' + bCls + '">' + bText + '</span>' +
                '    </div>' +
                '  </div>' +
                '  <div class="audit-status-btns">' +
                '    <button type="button" class="btn-act-quick" onclick="Ext.ComponentQuery.query(\'auditrekammedis-workspace\')[0].getController().onQuickCompleteCurrent()" title="Tandai Selesai & Lengkap Sekaligus">' +
                '      <i class="x-fa fa-check-circle"></i> Tandai Selesai & Lengkap' +
                '    </button>' +
                '    <button type="button" class="btn-act-update" onclick="Ext.ComponentQuery.query(\'auditrekammedis-workspace\')[0].getController().onOpenStatusDialogCurrent()" title="Buka dialog pemilihan status">' +
                '      <i class="x-fa fa-sliders"></i> Ubah Status' +
                '    </button>' +
                '  </div>' +
                '</div>';

        // 3. Anomaly Alert Box (if any)
        if (anomalis.length > 0) {
            html += '<div class="audit-anomali-alert">' +
                    '  <div class="audit-anomali-alert-title">' +
                    '    <i class="x-fa fa-exclamation-triangle"></i>' +
                    '    <span>Ditemukan <b>' + anomalis.length + ' catatan anomali / ketidaksesuaian</b> pada rekam medis kunjungan ini:</span>' +
                    '  </div>' +
                    '  <ul class="audit-anomali-alert-list">';
            Ext.each(anomalis, function(item) {
                html += '<li>' + Ext.String.htmlEncode(item) + '</li>';
            });
            html += '  </ul>' +
                    '</div>';
        }

        // 4. Checklist Documents List
        var docKeys = Ext.Object.getKeys(docs);
        var totalDocs = docKeys.length;
        var countLengkap = 0;
        Ext.Object.each(docs, function(k, v) {
            if (v.status === 1) countLengkap++;
        });

        html += '<div class="audit-checklist-header">' +
                '  <div class="audit-checklist-title">' +
                '    <i class="x-fa fa-tasks" style="color: #2563eb;"></i>' +
                '    <span>Checklist Kelengkapan Dokumen Rekam Medis Elektronik</span>' +
                '  </div>' +
                '  <span class="audit-checklist-count">' + countLengkap + ' dari ' + totalDocs + ' Dokumen Lengkap</span>' +
                '</div>';

        html += '<div class="audit-docs-list">';
        Ext.Object.each(docs, function(k, v) {
            var m = docMeta[k] || { icon: "fa-file-text-o", desc: "Dokumen Rekam Medis Klinis Pasien" };
            var iconCls = v.status === 1 ? "doc-icon-ok" : (v.status === 2 ? "doc-icon-warn" : "doc-icon-empty");
            var pillCls = v.status === 1 ? "doc-pill-ok" : (v.status === 2 ? "doc-pill-warn" : "doc-pill-empty");
            var pillText = v.status === 1 ? '<i class="x-fa fa-check"></i> Lengkap' : (v.status === 2 ? '<i class="x-fa fa-exclamation"></i> Perlu Ditinjau' : '<i class="x-fa fa-times"></i> Belum Ada');
            var btnCls = v.status === 1 ? "" : (v.status === 2 ? "btn-doc-edit-warn" : "btn-doc-edit-empty");
            var btnText = v.status === 1 ? '<i class="x-fa fa-folder-open-o"></i> Buka Dokumen' : (v.status === 2 ? '<i class="x-fa fa-pencil-square-o"></i> Koreksi Form' : '<i class="x-fa fa-plus-circle"></i> Lengkapi Form');

            html += '<div class="audit-doc-row">' +
                    '  <div class="doc-row-left">' +
                    '    <div class="doc-row-icon ' + iconCls + '"><i class="x-fa ' + m.icon + '"></i></div>' +
                    '    <div class="doc-row-meta">' +
                    '      <div class="doc-row-name">' + Ext.String.htmlEncode(v.nama || k) + '</div>' +
                    '      <div class="doc-row-desc">' + m.desc + '</div>' +
                    '    </div>' +
                    '  </div>' +
                    '  <div class="doc-row-right">' +
                    '    <span class="doc-pill-status ' + pillCls + '">' + pillText + '</span>' +
                    '    <button type="button" class="btn-doc-edit ' + btnCls + '" onclick="Ext.ComponentQuery.query(\'auditrekammedis-workspace\')[0].getController().onFastLaneDocClick(\'' + k + '\')">' +
                    '      ' + btnText +
                    '    </button>' +
                    '  </div>' +
                    '</div>';
        });
        html += '</div>';

        return html;
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

    getEmptyDetailHtml: function() {
        return '<div class="audit-empty-view">' +
               '  <div class="audit-empty-icon"><i class="x-fa fa-id-card-o"></i></div>' +
               '  <div class="audit-empty-title">Pilih Pasien untuk Melihat Detail Audit</div>' +
               '  <div class="audit-empty-desc">Klik salah satu baris pasien pada daftar di sebelah kiri untuk melihat checklist kelengkapan berkas rekam medis, status verifikasi klaim, deteksi anomali, serta aksi melengkapi form dokumen secara langsung.</div>' +
               '</div>';
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
            '.x-action-col-icon { font-size: 16px !important; margin: 0 4px !important; }' +
            // Master Grid styling
            '.audit-master-grid .x-grid-item-selected { background-color: #e0f2fe !important; border-color: #7dd3fc !important; }' +
            '.audit-master-grid .x-grid-item:hover { background-color: #f1f5f9 !important; cursor: pointer !important; }' +

            // Detail Panel Styling
            '.audit-detail-card { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 1px 4px rgba(0,0,0,0.04); margin-bottom: 12px; }' +
            '.audit-detail-patient-box { padding: 14px 18px; display: flex; align-items: flex-start; gap: 16px; background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%); border-radius: 8px; border: 1px solid #e2e8f0; }' +
            '.audit-detail-avatar { width: 48px; height: 48px; border-radius: 50%; background: #e0e7ff; color: #3730a3; display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; }' +
            '.audit-detail-pinfo { flex: 1; min-width: 0; }' +
            '.audit-detail-pname { font-size: 17px; font-weight: 700; color: #0f172a; margin-bottom: 4px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }' +
            '.audit-pill-tag { display: inline-block; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 4px; }' +
            '.audit-pill-blue { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }' +
            '.audit-pill-green { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }' +
            '.audit-pill-amber { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }' +
            '.audit-detail-meta-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 6px 14px; font-size: 12px; color: #475569; margin-top: 8px; }' +
            '.audit-detail-meta-grid b { color: #1e293b; }' +
            '.audit-detail-score { text-align: center; padding: 6px 14px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; min-width: 90px; }' +
            '.audit-score-num { font-size: 26px; font-weight: 800; line-height: 30px; }' +
            '.audit-score-lbl { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; }' +

            // Status Action Strip
            '.audit-status-strip { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 18px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.03); }' +
            '.audit-status-indicators { display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }' +
            '.audit-status-item { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: #334155; }' +
            '.audit-status-val { padding: 3px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; }' +
            '.val-selesai { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }' +
            '.val-proses { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }' +
            '.val-belum { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }' +
            '.audit-status-btns { display: flex; align-items: center; gap: 8px; }' +
            '.btn-act-quick { background: #16a34a; color: #ffffff; border: none; padding: 7px 14px; border-radius: 6px; font-weight: 600; font-size: 12px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: background 0.2s; }' +
            '.btn-act-quick:hover { background: #15803d; }' +
            '.btn-act-update { background: #0284c7; color: #ffffff; border: none; padding: 7px 14px; border-radius: 6px; font-weight: 600; font-size: 12px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: background 0.2s; }' +
            '.btn-act-update:hover { background: #0369a1; }' +

            // Anomaly Alert Box
            '.audit-anomali-alert { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 8px; padding: 12px 16px; margin-bottom: 12px; }' +
            '.audit-anomali-alert-title { font-size: 13px; font-weight: 700; color: #b91c1c; display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }' +
            '.audit-anomali-alert-list { margin: 0; padding-left: 24px; color: #991b1b; font-size: 12px; line-height: 1.6; }' +

            // Checklist Section
            '.audit-checklist-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px; padding: 0 4px; }' +
            '.audit-checklist-title { font-size: 14px; font-weight: 700; color: #1e293b; display: flex; align-items: center; gap: 8px; }' +
            '.audit-checklist-count { font-size: 12px; font-weight: 600; color: #2563eb; background: #eff6ff; padding: 3px 10px; border-radius: 12px; border: 1px solid #bfdbfe; }' +
            '.audit-docs-list { display: flex; flex-direction: column; gap: 8px; }' +
            '.audit-doc-row { background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; gap: 12px; transition: all 0.2s ease; }' +
            '.audit-doc-row:hover { border-color: #cbd5e1; box-shadow: 0 2px 6px rgba(0,0,0,0.05); }' +
            '.doc-row-left { display: flex; align-items: center; gap: 12px; min-width: 0; flex: 1; }' +
            '.doc-row-icon { width: 34px; height: 34px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 15px; flex-shrink: 0; }' +
            '.doc-icon-ok { background: #ecfdf5; color: #059669; }' +
            '.doc-icon-warn { background: #fffbeb; color: #d97706; }' +
            '.doc-icon-empty { background: #fef2f2; color: #dc2626; }' +
            '.doc-row-meta { min-width: 0; flex: 1; }' +
            '.doc-row-name { font-size: 13px; font-weight: 600; color: #0f172a; }' +
            '.doc-row-desc { font-size: 11px; color: #64748b; margin-top: 1px; }' +
            '.doc-row-right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }' +
            '.doc-pill-status { padding: 4px 10px; border-radius: 12px; font-size: 11px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; }' +
            '.doc-pill-ok { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }' +
            '.doc-pill-warn { background: #fef3c7; color: #b45309; border: 1px solid #fde68a; }' +
            '.doc-pill-empty { background: #fee2e2; color: #b91c1c; border: 1px solid #fca5a5; }' +
            '.btn-doc-edit { border: 1px solid #cbd5e1; background: #f8fafc; color: #1e293b; padding: 6px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s; }' +
            '.btn-doc-edit:hover { background: #2563eb; color: #ffffff; border-color: #2563eb; }' +
            '.btn-doc-edit-warn { border-color: #fde68a; background: #fffbeb; color: #b45309; }' +
            '.btn-doc-edit-warn:hover { background: #d97706; color: #ffffff; border-color: #d97706; }' +
            '.btn-doc-edit-empty { border-color: #fca5a5; background: #fef2f2; color: #b91c1c; }' +
            '.btn-doc-edit-empty:hover { background: #dc2626; color: #ffffff; border-color: #dc2626; }' +

            // Empty state
            '.audit-empty-view { text-align: center; padding: 60px 20px; color: #94a3b8; }' +
            '.audit-empty-icon { font-size: 48px; color: #cbd5e1; margin-bottom: 12px; }' +
            '.audit-empty-title { font-size: 16px; font-weight: 700; color: #475569; margin-bottom: 6px; }' +
            '.audit-empty-desc { font-size: 13px; color: #64748b; max-width: 400px; margin: 0 auto; line-height: 1.5; }',
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
                region: "west",
                xtype: "grid",
                itemId: "master-patient-grid",
                cls: "audit-master-grid",
                title: '<i class="x-fa fa-users" style="color: #2563eb; margin-right: 6px;"></i> Daftar Pasien Audit',
                width: 530,
                minWidth: 420,
                maxWidth: 750,
                split: true,
                collapsible: true,
                collapseDirection: "left",
                store: store,
                border: true,
                columnLines: true,
                viewConfig: {
                    stripeRows: true,
                    enableTextSelection: true
                },
                columns: [
                    {
                        text: "Pasien",
                        dataIndex: "NORM",
                        width: 165,
                        renderer: function(val, meta, rec) {
                            var nm = Ext.String.htmlEncode(rec.get("NAMA_PASIEN") || "-");
                            var jk = rec.get("JENIS_KELAMIN") || "-";
                            var umur = rec.get("UMUR") || 0;
                            return '<div style="line-height: 1.35;">' +
                                   '  <b style="color: #0f172a; font-size: 13px;">' + nm + '</b><br>' +
                                   '  <span style="color: #64748b; font-size: 11px;">RM: <b style="color: #1e40af;">' + val + '</b> | ' + jk + ' (' + umur + ' th)</span>' +
                                   '</div>';
                        }
                    },
                    {
                        text: "Kunjungan & Ruang",
                        dataIndex: "NOPEN",
                        width: 175,
                        renderer: function(val, meta, rec) {
                            var tgl = rec.get("MASUK") ? Ext.Date.format(rec.get("MASUK"), "d/m/Y H:i") : "-";
                            var nmRuangan = Ext.String.htmlEncode(rec.get("NAMA_RUANGAN") || "-");
                            var vVal = rec.get("STATUS_VERIFIKASI_RM");
                            var bVal = rec.get("STATUS_KELENGKAPAN_BERKAS");
                            
                            var vLabel = vVal === 2 ? "Selesai" : (vVal === 1 ? "Proses" : "Belum");
                            var vBg = vVal === 2 ? "#dcfce7" : (vVal === 1 ? "#fef3c7" : "#fee2e2");
                            var vColor = vVal === 2 ? "#15803d" : (vVal === 1 ? "#b45309" : "#b91c1c");
                            
                            var bLabel = bVal === 2 ? "Lengkap" : "Belum";
                            var bBg = bVal === 2 ? "#dcfce7" : "#fee2e2";
                            var bColor = bVal === 2 ? "#15803d" : "#b91c1c";

                            return '<div style="line-height: 1.35;">' +
                                   '  <b style="color: #1e293b; font-size: 11px;">' + nmRuangan + '</b><br>' +
                                   '  <span style="color: #64748b; font-size: 10px;">Reg: ' + val + ' | ' + tgl + '</span><br>' +
                                   '  <div style="margin-top: 3px; display: flex; gap: 4px; flex-wrap: wrap;">' +
                                   '    <span style="font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 3px; background:' + vBg + '; color:' + vColor + '; border:1px solid ' + vColor + ';">VRM: ' + vLabel + '</span>' +
                                   '    <span style="font-size: 9px; font-weight: 700; padding: 1px 5px; border-radius: 3px; background:' + bBg + '; color:' + bColor + '; border:1px solid ' + bColor + ';">Klaim: ' + bLabel + '</span>' +
                                   '  </div>' +
                                   '</div>';
                        }
                    },
                    {
                        text: "DPJP",
                        dataIndex: "NAMA_DPJP",
                        width: 105,
                        renderer: function(val) {
                            return '<span style="font-size: 11px; color: #334155; font-weight: 500;">' + Ext.String.htmlEncode(val || "-") + '</span>';
                        }
                    },
                    {
                        text: "Kepatuhan",
                        dataIndex: "PERSENTASE",
                        flex: 1,
                        minWidth: 80,
                        align: "center",
                        renderer: function(val, meta, rec) {
                            var color = val >= 100 ? "#16a34a" : (val >= 75 ? "#eab308" : (val >= 40 ? "#f97316" : "#dc2626"));
                            var anomali = rec.get("JUMLAH_ANOMALI") || 0;
                            var anomaliBadge = "";
                            if (anomali > 0) {
                                anomaliBadge = '<div style="margin-top: 3px;"><span class="badge-anomali badge-anomali-alert" style="padding: 1px 6px; font-size: 9px;"><i class="x-fa fa-exclamation-triangle"></i> ' + anomali + '</span></div>';
                            }
                            return '<div class="progress-bar-bg" style="height: 14px; margin-top: 2px;">' +
                                   '  <div class="progress-bar-fill" style="width: ' + val + '%; background: ' + color + '; line-height: 14px; font-size: 9px;">' + val + '%</div>' +
                                   '</div>' + anomaliBadge;
                        }
                    }
                ],
                bbar: {
                    xtype: "pagingtoolbar",
                    store: store,
                    displayInfo: true,
                    displayMsg: "{0}-{1} dari {2}",
                    emptyMsg: "Tidak ada data"
                },
                listeners: {
                    selectionchange: function(sm, selected) {
                        if (selected && selected.length > 0) {
                            me.getController().onSelectPatient(selected[0]);
                        }
                    },
                    rowclick: function(grid, record) {
                        me.getController().onSelectPatient(record);
                    }
                }
            },
            {
                region: "center",
                xtype: "panel",
                itemId: "detail-audit-panel",
                title: '<i class="x-fa fa-clipboard-check" style="color: #2563eb; margin-right: 6px;"></i> Detail Kelengkapan Rekam Medis & Fast-Lane Verifikasi',
                border: true,
                layout: "fit",
                bodyStyle: "background: #f8fafc;",
                tbar: [
                    {
                        xtype: "component",
                        itemId: "detail-header-info",
                        html: '<span style="color: #64748b; font-size: 12px; font-weight: 500;">Pilih pasien di sebelah kiri</span>'
                    },
                    "->",
                    {
                        text: '<i class="x-fa fa-check-circle"></i> <b>Tandai Selesai & Lengkap</b>',
                        itemId: "btn-quick-complete",
                        ui: "soft-green",
                        disabled: true,
                        tooltip: "Tandai Verifikasi RM Selesai dan Berkas Lengkap sekaligus",
                        handler: function() {
                            me.getController().onQuickCompleteCurrent();
                        }
                    },
                    {
                        text: "Update Status",
                        itemId: "btn-open-status",
                        iconCls: "x-fa fa-check-square-o",
                        ui: "soft-blue",
                        disabled: true,
                        tooltip: "Buka dialog penyesuaian Status Verifikasi & Berkas",
                        handler: function() {
                            me.getController().onOpenStatusDialogCurrent();
                        }
                    },
                    {
                        text: "Anomali",
                        itemId: "btn-show-anomali",
                        iconCls: "x-fa fa-exclamation-triangle",
                        ui: "soft-red",
                        disabled: true,
                        tooltip: "Lihat rincian catatan anomali pasien",
                        handler: function() {
                            me.getController().onShowAnomaliModalCurrent();
                        }
                    }
                ],
                items: [
                    {
                        xtype: "container",
                        itemId: "detail-scroll-container",
                        scrollable: "y",
                        padding: 16,
                        html: me.getEmptyDetailHtml()
                    }
                ]
            }
        ];

        me.callParent(arguments);
    }
});
