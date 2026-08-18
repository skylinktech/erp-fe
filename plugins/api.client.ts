// plugins/api.client.ts

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  // Sinkronkan dengan .env dan nuxt.config.ts
  const apiBase = config.public.apiBase || '';
  const authBase = config.public.authBase || '';
  
  // Endpoint helper
  const api = {
    // Auth
    csrfToken   : () => `${authBase}/csrf-token`,
    login       : () => `${authBase}/login`,
    register    : () => `${authBase}/register`,
    logout      : () => `${authBase}/logout`,
    me          : () => `${authBase}/me`,
    meProfile   : () => `${authBase}/me/profile`,
    refreshToken: () => `${authBase}/refresh-token`,
    
    // SSO Auth (direct to SSO server)
    ssoToken    : () => {
      const ssoUrl = config.public.ssoUrl || 'http://localhost:8000'
      return `${ssoUrl}/api/oauth/token`
    },
    ssoUser     : () => {
      const ssoUrl = config.public.ssoUrl || 'http://localhost:8000'
      return `${ssoUrl}/api/oauth/user`
    },
    ssoLogout   : () => {
      const ssoUrl = config.public.ssoUrl || 'http://localhost:8000'
      return `${ssoUrl}/api/oauth/logout`
    },

    // Dashboard
    associations: () => `${apiBase}/associations`,

    // Dashboard Framework (Layout + Widget Engine)
    dashboards      : () => `${apiBase}/dashboards`,
    dashboardShow   : (code: string) => `${apiBase}/dashboards/${code}`,
    dashboardPreferences: (code: string) => `${apiBase}/dashboards/${code}/preferences`,
    dashboardStore  : () => `${apiBase}/dashboards`,
    dashboardUpdate : (id: number | string) => `${apiBase}/dashboards/${id}`,
    dashboardDelete : (id: number | string) => `${apiBase}/dashboards/${id}`,
    dashboardWidgets      : () => `${apiBase}/admin/dashboard-widgets`,
    dashboardWidgetStore  : () => `${apiBase}/admin/dashboard-widgets`,
    dashboardWidgetUpdate : (id: number | string) => `${apiBase}/admin/dashboard-widgets/${id}`,
    dashboardWidgetDelete : (id: number | string) => `${apiBase}/admin/dashboard-widgets/${id}`,

    // Dashboard Framework — Fase 3 (versioning + admin layout builder)
    dashboardShowAdmin        : (id: number | string) => `${apiBase}/admin/dashboards/${id}`,
    dashboardLayouts          : (dashboardId: number | string) => `${apiBase}/admin/dashboards/${dashboardId}/layouts`,
    dashboardLayoutCreate     : (dashboardId: number | string) => `${apiBase}/admin/dashboards/${dashboardId}/layouts`,
    dashboardLayoutDetail     : (dashboardId: number | string, layoutId: number | string) => `${apiBase}/admin/dashboards/${dashboardId}/layouts/${layoutId}`,
    dashboardLayoutUpdate     : (dashboardId: number | string, layoutId: number | string) => `${apiBase}/admin/dashboards/${dashboardId}/layouts/${layoutId}`,
    dashboardLayoutDelete     : (dashboardId: number | string, layoutId: number | string) => `${apiBase}/admin/dashboards/${dashboardId}/layouts/${layoutId}`,
    dashboardLayoutUpdateWidgets: (dashboardId: number | string, layoutId: number | string) => `${apiBase}/admin/dashboards/${dashboardId}/layouts/${layoutId}/widgets`,
    dashboardLayoutPublish    : (dashboardId: number | string, layoutId: number | string) => `${apiBase}/admin/dashboards/${dashboardId}/layouts/${layoutId}/publish`,
    dashboardLayoutArchive    : (dashboardId: number | string, layoutId: number | string) => `${apiBase}/admin/dashboards/${dashboardId}/layouts/${layoutId}/archive`,

    // Widget & Dashboard Analytics
    dashboardEvents          : (code: string) => `${apiBase}/dashboards/${code}/events`,
    dashboardAnalyticsOverview: () => `${apiBase}/admin/dashboards-analytics/overview`,
    dashboardAnalyticsShow    : (id: number | string) => `${apiBase}/admin/dashboards/${id}/analytics`,
    dashboardWidgetAnalyticsShow: (id: number | string) => `${apiBase}/admin/dashboard-widgets/${id}/analytics`,

    // Personal dashboard (Main + Settings)
    myDashboard              : () => `${apiBase}/my-dashboard`,
    myDashboardWidgetCatalog : () => `${apiBase}/my-dashboard/widget-catalog`,
    myDashboardUpdateWidgets : () => `${apiBase}/my-dashboard/widgets`,

    // Roles & Permissions
    roles             : () => `${apiBase}/roles`,
    roleStore         : () => `${apiBase}/roles/store`,
    roleUpdate        : (id: number | string) => `${apiBase}/roles/update/${id}`,
    roleShow          : (id: number | string) => `${apiBase}/roles/${id}`,
    roleDelete        : (id: number | string) => `${apiBase}/roles/delete/${id}`,
    getPermissions    : () => `${apiBase}/getPermissions`,
    permissions       : () => `${apiBase}/permissions`,
    permissionOptions : () => `${apiBase}/permissions/options`,
    permissionsBatch  : () => `${apiBase}/permissions/batch`,
    permissionStore   : () => `${apiBase}/permissions`,
    permissionUpdate  : (id: number | string) => `${apiBase}/permissions/${id}`,
    permissionShow    : (id: number | string) => `${apiBase}/permissions/${id}`,
    permissionDelete  : (id: number | string) => `${apiBase}/permissions/${id}`,
    getMenuDetails    : (id: number | string) => `${apiBase}/permissions/getMenuGroupDetails/${id}`,
    getTotalPermission: () => `${apiBase}/permissions/getTotalPermission`,

    // Users
    users          : () => `${apiBase}/users`,
    countTotalUsers: () => `${apiBase}/users/countTotalUsers`,

    // Menu
    menuGroups : () => `${apiBase}/menu-groups`,
    menuGroupsOptions: () => `${apiBase}/menu-groups/options`,
    menuGroupsAll: () => `${apiBase}/menu-groups-all`,
    menuDetails: () => `${apiBase}/menu-details`,
    menuDetailParentOptions: () => `${apiBase}/menu-details/parent-options`,

    // Access Requests (permintaan akses modul/menu)
    accessRequests: () => `${apiBase}/access-requests`,
    accessRequestsCountByStatus: () => `${apiBase}/access-requests/countByStatus`,
    accessRequestShow: (id: number | string) => `${apiBase}/access-requests/${id}`,
    accessRequestSubmit: (id: number | string) => `${apiBase}/access-requests/${id}/submit`,
    accessRequestApprove: (id: number | string) => `${apiBase}/access-requests/${id}/approve`,
    accessRequestReject: (id: number | string) => `${apiBase}/access-requests/${id}/reject`,
    accessRequestCancel: (id: number | string) => `${apiBase}/access-requests/${id}/cancel`,

    // Approval Workflows (Admin)
    approvalWorkflows     : () => `${apiBase}/approval-workflows`,
    approvalWorkflowStats : () => `${apiBase}/approval-workflows/stats`,
    approvalWorkflowShow  : (id: number | string) => `${apiBase}/approval-workflows/${id}`,
    approvalWorkflowSteps : (id: number | string) => `${apiBase}/approval-workflows/${id}/steps`,
    approvalWorkflowStepsStore: () => `${apiBase}/approval-workflow-steps`,
    approvalWorkflowStepsUpdate: (id: number | string) => `${apiBase}/approval-workflow-steps/${id}`,
    approvalWorkflowStepsDelete: (id: number | string) => `${apiBase}/approval-workflow-steps/${id}`,
    approvalWorkflowEntities: () => `${apiBase}/approval-workflow-entities`,
    approvalWorkflowEntityShow: (id: number | string) => `${apiBase}/approval-workflow-entities/${id}`,

    // Jabatan, Perusahaan, Cabang, Divisi, Departemen, Cuti, Pegawai
    jabatan              : () => `${apiBase}/jabatan`,
    countPegawaiByJabatan: () => `${apiBase}/jabatan/countPegawaiByJabatan`,
    perusahaan           : () => `${apiBase}/perusahaan`,
    perusahaanStatistics : () => `${apiBase}/perusahaan/statistics`,
    cabang               : () => `${apiBase}/cabang`,
    cabangStatistics     : () => `${apiBase}/cabang/statistics`,
    divisi               : () => `${apiBase}/divisi`,
    departemen           : () => `${apiBase}/departemen`,
    cuti                 : () => `${apiBase}/cuti`,
    cutiShow             : (id: number | string) => `${apiBase}/cuti/${id}`,
    cutiCetak            : (id: number | string) => `${apiBase}/cuti/${id}/cetak`,
    cutiStore            : () => `${apiBase}/cuti`,
    cutiUpdate           : (id: number | string) => `${apiBase}/cuti/${id}`,
    cutiDelete           : (id: number | string) => `${apiBase}/cuti/${id}`,
    cutiByPegawai        : (pegawaiId: number | string) => `${apiBase}/pegawai/${pegawaiId}/cuti`,
    cutiSubmitApproval   : (id: number | string) => `${apiBase}/cuti/${id}/submit-for-approval`,
    cutiApprove          : (id: number | string) => `${apiBase}/cuti/${id}/approve`,
    cutiReject           : (id: number | string) => `${apiBase}/cuti/${id}/reject`,
    cutiCancelPending    : (id: number | string) => `${apiBase}/cuti/${id}/cancel-pending`,
    cutiCancel           : (id: number | string) => `${apiBase}/cuti/${id}/cancel`,
    cutiBalance          : (pegawaiId: number | string) => `${apiBase}/cuti/balance/${pegawaiId}`,
    cutiBalanceMe        : () => `${apiBase}/cuti/balance/me`,
    cutiTahunanSummaryMe : () => `${apiBase}/cuti/cuti-tahunan/summary/me`,
    cutiTahunanSummary   : (pegawaiId: number | string) => `${apiBase}/cuti/cuti-tahunan/summary/${pegawaiId}`,
    cutiTypes            : () => `${apiBase}/cuti/type`,
    cutiStats            : () => `${apiBase}/cuti/stats`,
    cutiBalanceList      : () => `${apiBase}/cuti-balance`,
    cutiBalanceShow      : (id: number | string) => `${apiBase}/cuti-balance/${id}`,
    lembur               : () => `${apiBase}/lembur`,
    lemburShow           : (id: number | string) => `${apiBase}/lembur/${id}`,
    lemburCetak          : (id: number | string) => `${apiBase}/lembur/${id}/cetak`,
    lemburStore          : () => `${apiBase}/lembur`,
    lemburUpdate         : (id: number | string) => `${apiBase}/lembur/${id}`,
    lemburDelete         : (id: number | string) => `${apiBase}/lembur/${id}`,
    lemburSubmitApproval : (id: number | string) => `${apiBase}/lembur/${id}/submit-for-approval`,
    lemburApprove        : (id: number | string) => `${apiBase}/lembur/${id}/approve`,
    lemburReject         : (id: number | string) => `${apiBase}/lembur/${id}/reject`,
    lemburCancelPending  : (id: number | string) => `${apiBase}/lembur/${id}/cancel-pending`,
    lemburStats          : () => `${apiBase}/lembur/stats`,
    lemburSummaryMe      : () => `${apiBase}/lembur/summary/me`,
    kehadiranPeriods     : () => `${apiBase}/kehadiran/periods`,
    kehadiranPeriodShow  : (id: number | string) => `${apiBase}/kehadiran/periods/${id}`,
    kehadiranPeriodStore : () => `${apiBase}/kehadiran/periods`,
    kehadiranPeriodCalculate: (id: number | string) => `${apiBase}/kehadiran/periods/${id}/calculate`,
    kehadiranPeriodRecalculate: (id: number | string) => `${apiBase}/kehadiran/periods/${id}/recalculate`,
    kehadiranPeriodFinalize: (id: number | string) => `${apiBase}/kehadiran/periods/${id}/finalize`,
    kehadiranPeriodReopen: (id: number | string) => `${apiBase}/kehadiran/periods/${id}/reopen`,
    kehadiranSummary     : () => `${apiBase}/kehadiran/summary`,
    kehadiranStats       : () => `${apiBase}/kehadiran/stats`,
    kehadiranRecords     : () => `${apiBase}/kehadiran/records`,
    kehadiranPegawaiRecords: (pegawaiId: number | string) => `${apiBase}/kehadiran/pegawai/${pegawaiId}/records`,
    kehadiranMe          : () => `${apiBase}/kehadiran/me`,
    kehadiranMeSummary   : () => `${apiBase}/kehadiran/me/summary`,
    kehadiranSchedules   : () => `${apiBase}/kehadiran/schedules`,
    kehadiranScheduleShow: (id: number | string) => `${apiBase}/kehadiran/schedules/${id}`,
    kehadiranScheduleStore: () => `${apiBase}/kehadiran/schedules`,
    kehadiranScheduleAssignments: () => `${apiBase}/kehadiran/schedule-assignments`,
    kehadiranPunches     : () => `${apiBase}/kehadiran/punches`,
    kehadiranPunchesImport: () => `${apiBase}/kehadiran/punches/import`,
    kehadiranAdjustments : () => `${apiBase}/kehadiran/adjustments`,
    kehadiranAdjustmentSubmit: (id: number | string) => `${apiBase}/kehadiran/adjustments/${id}/submit-for-approval`,
    kehadiranAdjustmentApprove: (id: number | string) => `${apiBase}/kehadiran/adjustments/${id}/approve`,
    kehadiranAdjustmentReject: (id: number | string) => `${apiBase}/kehadiran/adjustments/${id}/reject`,
    perjalananDinas               : () => `${apiBase}/perjalanan-dinas`,
    perjalananDinasShow           : (id: string) => `${apiBase}/perjalanan-dinas/${id}`,
    perjalananDinasCetak          : (id: string) => `${apiBase}/perjalanan-dinas/${id}/cetak`,
    perjalananDinasStore          : () => `${apiBase}/perjalanan-dinas`,
    perjalananDinasUpdate         : (id: string) => `${apiBase}/perjalanan-dinas/${id}`,
    perjalananDinasDelete         : (id: string) => `${apiBase}/perjalanan-dinas/${id}`,
    perjalananDinasSubmitApproval : (id: string) => `${apiBase}/perjalanan-dinas/${id}/submit-for-approval`,
    perjalananDinasApprove        : (id: string) => `${apiBase}/perjalanan-dinas/${id}/approve`,
    perjalananDinasReject         : (id: string) => `${apiBase}/perjalanan-dinas/${id}/reject`,
    perjalananDinasCancelPending  : (id: string) => `${apiBase}/perjalanan-dinas/${id}/cancel-pending`,
    perjalananDinasStats          : () => `${apiBase}/perjalanan-dinas/stats`,
    hrKalender           : () => `${apiBase}/hr-kalender`,
    hrKalenderCalendar   : () => `${apiBase}/hr-kalender/calendar`,
    hrKalenderShow       : (id: number | string) => `${apiBase}/hr-kalender/${id}`,
    hrStrukturOrganisasi : () => `${apiBase}/hr/struktur-organisasi`,
    pegawai              : () => `${apiBase}/pegawai`,
    pegawaiShow          : (id: number | string) => `${apiBase}/pegawai/${id}`,
    pegawaiProfile       : (id: number | string) => `${apiBase}/pegawai/${id}/profile`,
    pegawaiUpdate        : (id: number | string) => `${apiBase}/pegawai/update/${id}`,
    pegawaiDelete        : (id: number | string) => `${apiBase}/pegawai/delete/${id}`,
    pegawaiCountByStatus : () => `${apiBase}/pegawai/countByStatus`,
    pegawaiAvailableUsers: () => `${apiBase}/pegawai/available-users`,
    pegawaiBirthdaysToday: () => `${apiBase}/pegawai/birthdays/today`,
    pegawaiKontrakList: (pegawaiId: number | string) => `${apiBase}/pegawai/${pegawaiId}/kontrak`,
    pegawaiKontrakStore: (pegawaiId: number | string) => `${apiBase}/pegawai/${pegawaiId}/kontrak`,
    pegawaiKontrakUpdate: (id: number | string) => `${apiBase}/pegawai-kontrak/${id}/update`,
    pegawaiKontrakActivate: (id: number | string) => `${apiBase}/pegawai-kontrak/${id}/activate`,
    pegawaiKontrakCancel: (id: number | string) => `${apiBase}/pegawai-kontrak/${id}/cancel`,
    pegawaiKontrakSubmitApproval: (id: number | string) => `${apiBase}/pegawai-kontrak/${id}/submit-for-approval`,
    pegawaiKontrakApprove: (id: number | string) => `${apiBase}/pegawai-kontrak/${id}/approve`,
    pegawaiKontrakReject: (id: number | string) => `${apiBase}/pegawai-kontrak/${id}/reject`,
    pegawaiKontrakCancelPending: (id: number | string) => `${apiBase}/pegawai-kontrak/${id}/cancel-pending`,
    pegawaiKontrakDelete: (id: number | string) => `${apiBase}/pegawai-kontrak/${id}`,

    // Purchase Order
    purchaseOrder          : () => `${apiBase}/purchase-order`,
    submitPurchaseOrder    : (id: number | string) => `${apiBase}/purchase-order/submitPurchaseOrder/${id}`,
    approvePurchaseOrder   : (id: number | string) => `${apiBase}/purchase-order/approvePurchaseOrder/${id}`,
    rejectPurchaseOrder    : (id: number | string) => `${apiBase}/purchase-order/rejectPurchaseOrder/${id}`,
    purchaseOrderCancel    : (id: number | string) => `${apiBase}/purchase-order/cancelPurchaseOrder/${id}`,
    purchaseOrderUpdate    : (id: number | string) => `${apiBase}/purchase-order/update/${id}`,
    getPurchaseOrderDetails: (id: number | string) => `${apiBase}/purchase-order/getPurchaseOrderDetails/${id}`,
    countPurchaseOrderByStatus: () => `${apiBase}/purchase-order/countByStatus`,

    // Purchase Invoice
    purchaseInvoice: () => `${apiBase}/purchase-invoice`,
    purchaseInvoiceShow: (id: number | string) => `${apiBase}/purchase-invoice/${id}`,
    purchaseInvoiceStatistics: () => `${apiBase}/purchase-invoice/statistics`,
    purchaseInvoiceSubmit: (id: number | string) => `${apiBase}/purchase-invoice/${id}/submit`,
    purchaseInvoiceApprove: (id: number | string) => `${apiBase}/purchase-invoice/${id}/approve`,
    purchaseInvoiceReject: (id: number | string) => `${apiBase}/purchase-invoice/${id}/reject`,
    purchaseInvoicePost: (id: number | string) => `${apiBase}/purchase-invoice/${id}/post`,
    purchaseInvoiceCancel: (id: number | string) => `${apiBase}/purchase-invoice/${id}/cancel`,
    
    // Purchase Request
    purchaseRequest: () => `${apiBase}/purchase-request`,
    purchaseRequestShow: (id: number | string) => `${apiBase}/purchase-request/${id}`,
    getPurchaseRequestDetails: (id: number | string) => `${apiBase}/purchase-request/getPurchaseRequestDetails/${id}`,
    purchaseRequestStockAvailability: (id: number | string) => `${apiBase}/purchase-request/${id}/stock-availability`,
    countPurchaseRequestByStatus: () => `${apiBase}/purchase-request/countByStatus`,
    purchaseRequestStatistics: () => `${apiBase}/purchase-request/countByStatus`,
    approvePurchaseRequest: (id: number | string) => `${apiBase}/purchase-request/${id}/approvePurchaseRequest`,
    rejectPurchaseRequest: (id: number | string) => `${apiBase}/purchase-request/${id}/rejectPurchaseRequest`,
    submitPurchaseRequest: (id: number | string) => `${apiBase}/purchase-request/${id}/submitPurchaseRequest`,

    // Material Request Form — Purchasing (project / SI materials)
    materialRequest: () => `${apiBase}/material-request`,
    materialRequestShow: (id: string) => `${apiBase}/material-request/${id}`,
    getMaterialRequestDetails: (id: string) => `${apiBase}/material-request/getMaterialRequestDetails/${id}`,
    materialRequestSiteInvestmentItems: (siteInvestmentId: string) =>
      `${apiBase}/material-request/site-investment/${siteInvestmentId}/items`,
    materialRequestStatistics: () => `${apiBase}/material-request/countByStatus`,
    approveMaterialRequest: (id: string) => `${apiBase}/material-request/${id}/approveMaterialRequest`,
    rejectMaterialRequest: (id: string) => `${apiBase}/material-request/${id}/rejectMaterialRequest`,
    submitMaterialRequest: (id: string) => `${apiBase}/material-request/${id}/submitMaterialRequest`,

    // ARF (Advanced Request Form) — Implementation
    arf: () => `${apiBase}/arf`,
    arfShow: (id: number | string) => `${apiBase}/arf/${id}`,
    getArfDetails: (id: number | string) => `${apiBase}/arf/getArfDetails/${id}`,
    arfCetak: (id: number | string) => `${apiBase}/arf/${id}/cetak`,
    countArfByStatus: () => `${apiBase}/arf/countByStatus`,
    approveArf: (id: number | string) => `${apiBase}/arf/${id}/approveArf`,
    rejectArf: (id: number | string) => `${apiBase}/arf/${id}/rejectArf`,
    submitArf: (id: number | string) => `${apiBase}/arf/${id}/submitArf`,

    // Work Order Request — Operations
    workOrderRequest: () => `${apiBase}/work-order-request`,
    workOrderRequestShow: (id: number | string) => `${apiBase}/work-order-request/${id}`,
    getWorkOrderRequestDetails: (id: number | string) => `${apiBase}/work-order-request/getDetails/${id}`,
    workOrderRequestStatistics: () => `${apiBase}/work-order-request/statistics`,
    submitWorkOrderRequest: (id: number | string) => `${apiBase}/work-order-request/${id}/submit`,
    approveWorkOrderRequest: (id: number | string) => `${apiBase}/work-order-request/${id}/approve`,
    rejectWorkOrderRequest: (id: number | string) => `${apiBase}/work-order-request/${id}/reject`,
    completeWorkOrderRequest: (id: number | string) => `${apiBase}/work-order-request/${id}/complete`,

    // Request Activation — Operations
    requestActivation: () => `${apiBase}/request-activation`,
    requestActivationShow: (id: number | string) => `${apiBase}/request-activation/${id}`,
    getRequestActivationDetails: (id: number | string) => `${apiBase}/request-activation/getDetails/${id}`,
    requestActivationStatistics: () => `${apiBase}/request-activation/statistics`,
    submitRequestActivation: (id: number | string) => `${apiBase}/request-activation/${id}/submit`,
    approveRequestActivation: (id: number | string) => `${apiBase}/request-activation/${id}/approve`,
    rejectRequestActivation: (id: number | string) => `${apiBase}/request-activation/${id}/reject`,
    completeRequestActivation: (id: number | string) => `${apiBase}/request-activation/${id}/complete`,

    // Berita Acara — Operations
    beritaAcara: () => `${apiBase}/berita-acara`,
    beritaAcaraShow: (id: number | string) => `${apiBase}/berita-acara/${id}`,
    getBeritaAcaraDetails: (id: number | string) => `${apiBase}/berita-acara/getDetails/${id}`,
    beritaAcaraStatistics: () => `${apiBase}/berita-acara/statistics`,
    submitBeritaAcara: (id: number | string) => `${apiBase}/berita-acara/${id}/submit`,
    approveBeritaAcara: (id: number | string) => `${apiBase}/berita-acara/${id}/approve`,
    rejectBeritaAcara: (id: number | string) => `${apiBase}/berita-acara/${id}/reject`,
    completeBeritaAcara: (id: number | string) => `${apiBase}/berita-acara/${id}/complete`,
    beritaAcaraSend: (id: number | string) => `${apiBase}/berita-acara/${id}/send`,
    beritaAcaraSendBulk: () => `${apiBase}/berita-acara/send-bulk`,

    // Progress Tracker — Implementation
    progressTracker: () => `${apiBase}/progress-tracker`,
    progressTrackerShow: (id: string) => `${apiBase}/progress-tracker/${id}`,
    getProgressTrackerDetails: (id: string) => `${apiBase}/progress-tracker/getDetails/${id}`,
    countProgressTrackerByStatus: () => `${apiBase}/progress-tracker/countByStatus`,
    updateProgressTrackerNodeStatus: (nodeId: string) =>
      `${apiBase}/progress-tracker/nodes/${nodeId}/updateStatus`,
    uploadProgressTrackerAttachments: (nodeId: string) =>
      `${apiBase}/progress-tracker/nodes/${nodeId}/attachments`,
    deleteProgressTrackerAttachment: (attachmentId: string) =>
      `${apiBase}/progress-tracker/attachments/${attachmentId}`,
    submitProgressTracker: (id: string) => `${apiBase}/progress-tracker/${id}/submit`,
    approveProgressTracker: (id: string) => `${apiBase}/progress-tracker/${id}/approve`,
    rejectProgressTracker: (id: string) => `${apiBase}/progress-tracker/${id}/reject`,
    
    // Purchase Order Item
    purchaseOrderItemUpdateStatusPartial: (id: number | string) => `${apiBase}/purchase-order-item/updateStatusPartial/${id}`,
    receiveAllPurchaseOrderItems: (id: number | string) => `${apiBase}/purchase-order/receiveAllItems/${id}`,

    // Finance Dashboard
    financeDashboard: () => `${apiBase}/finance/dashboard`,
    financeCashFlow: () => `${apiBase}/finance/cash-flow`,
    financeTaxReport: () => `${apiBase}/finance/tax-report`,
    financeRevenue: () => `${apiBase}/finance/revenue`,

    // Finance Invoices (billing perangkat aktif — Finance module)
    financeInvoices             : () => `${apiBase}/finance/invoices`,
    financeInvoicesShow         : (id: string) => `${apiBase}/finance/invoices/${id}`,
    financeInvoicesUpdate       : (id: string) => `${apiBase}/finance/invoices/${id}`,
    financeInvoicesDelete       : (id: string) => `${apiBase}/finance/invoices/${id}`,
    financeInvoicesSend         : (id: string) => `${apiBase}/finance/invoices/${id}/send`,
    financeInvoicesSendBulk     : () => `${apiBase}/finance/invoices/send-bulk`,
    financeInvoicesSubmit       : (id: string) => `${apiBase}/finance/invoices/${id}/submit`,
    financeInvoicesApprove      : (id: string) => `${apiBase}/finance/invoices/${id}/approve`,
    financeInvoicesReject       : (id: string) => `${apiBase}/finance/invoices/${id}/reject`,
    financeInvoicesStatistics   : () => `${apiBase}/finance/invoices/statistics`,
    financeInvoicesAlerts       : () => `${apiBase}/finance/invoices/alerts`,
    financeInvoicesBillableItems: () => `${apiBase}/finance/invoices/billable-items`,
    creditNotes                 : () => `${apiBase}/finance/credit-notes`,
    creditNotesShow             : (id: string) => `${apiBase}/finance/credit-notes/${id}`,
    creditNotesIssue            : (id: string) => `${apiBase}/finance/credit-notes/${id}/issue`,
    creditNotesCancel           : (id: string) => `${apiBase}/finance/credit-notes/${id}/cancel`,
    documentTimeline            : (entityType: string, entityId: string | number) =>
      `${apiBase}/documents/${entityType}/${entityId}/timeline`,

    // Service Management — Service Instances
    serviceInstances            : () => `${apiBase}/service-instances`,
    serviceInstancesShow        : (id: string) => `${apiBase}/service-instances/${id}`,
    serviceInstancesEvents      : (id: string) => `${apiBase}/service-instances/${id}/events`,
    serviceInstancesGlobalEvents: () => `${apiBase}/service-instances/events`,
    serviceInstancesDashboard   : () => `${apiBase}/service-instances/dashboard/summary`,
    serviceInstancesMonitoring  : () => `${apiBase}/service-instances/monitoring`,
    serviceInstancesActivate    : (id: string) => `${apiBase}/service-instances/${id}/activate`,
    serviceInstancesSuspend     : (id: string) => `${apiBase}/service-instances/${id}/suspend`,
    serviceInstancesResume      : (id: string) => `${apiBase}/service-instances/${id}/resume`,
    serviceInstancesTerminate   : (id: string) => `${apiBase}/service-instances/${id}/terminate`,
    serviceInstancesArchive     : (id: string) => `${apiBase}/service-instances/${id}/archive`,
    customerServiceInstances    : (customerId: string | number) =>
      `${apiBase}/customers/${customerId}/service-instances`,
    serviceManagementRules      : () => `${apiBase}/service-management/rules`,

    // Billing Adjustments
    billingAdjustments          : () => `${apiBase}/finance/billing-adjustments`,
    billingAdjustmentsStatistics: () => `${apiBase}/finance/billing-adjustments/statistics`,
    billingAdjustmentsShow      : (id: string) => `${apiBase}/finance/billing-adjustments/${id}`,
    billingAdjustmentsApprove   : (id: string) => `${apiBase}/finance/billing-adjustments/${id}/approve`,

    // Tax Masters
    taxMasters                  : () => `${apiBase}/finance/tax-masters`,
    taxMastersStatistics        : () => `${apiBase}/finance/tax-masters/statistics`,
    taxMastersActive            : () => `${apiBase}/finance/tax-masters/active`,
    taxMastersShow              : (id: string) => `${apiBase}/finance/tax-masters/${id}`,
    taxMastersEffectiveRate     : (id: string) => `${apiBase}/finance/tax-masters/${id}/effective-rate`,
    taxMastersRates             : (id: string) => `${apiBase}/finance/tax-masters/${id}/rates`,
    taxMastersRateUpdate        : (id: string, rateId: string) => `${apiBase}/finance/tax-masters/${id}/rates/${rateId}`,

    // Billing Preparations
    billingPreparations         : () => `${apiBase}/finance/billing-preparations`,
    billingPreparationsStatistics: () => `${apiBase}/finance/billing-preparations/statistics`,
    billingPreparationsPreviewSources: () => `${apiBase}/finance/billing-preparations/preview-sources`,
    billingPreparationsShow     : (id: string) => `${apiBase}/finance/billing-preparations/${id}`,
    billingPreparationsRebuild  : (id: string) => `${apiBase}/finance/billing-preparations/${id}/rebuild-items`,
    billingPreparationsReady    : (id: string) => `${apiBase}/finance/billing-preparations/${id}/ready`,

    // Payment Requests — pengajuan dana ke Direktur Utama
    paymentRequests             : () => `${apiBase}/finance/payment-requests`,
    paymentRequestsShow         : (id: string) => `${apiBase}/finance/payment-requests/${id}`,
    paymentRequestsStatistics   : () => `${apiBase}/finance/payment-requests/statistics`,
    paymentRequestsSources      : () => `${apiBase}/finance/payment-requests/sources`,
    paymentRequestsLoadSource   : (type: string, id: string) =>
      `${apiBase}/finance/payment-requests/sources/${type}/${id}`,
    paymentRequestsSubmit       : (id: string) => `${apiBase}/finance/payment-requests/${id}/submit`,
    paymentRequestsApprove      : (id: string) => `${apiBase}/finance/payment-requests/${id}/approve`,
    paymentRequestsReject       : (id: string) => `${apiBase}/finance/payment-requests/${id}/reject`,
    paymentRequestsSettlements  : (id: string) => `${apiBase}/finance/payment-requests/${id}/settlements`,
    paymentRequestsSettlementUpdate: (id: string, settlementId: string) =>
      `${apiBase}/finance/payment-requests/${id}/settlements/${settlementId}`,
    paymentRequestsSettlementSubmit: (id: string, settlementId: string) =>
      `${apiBase}/finance/payment-requests/${id}/settlements/${settlementId}/submit`,
    paymentRequestsSettlementApprove: (id: string, settlementId: string) =>
      `${apiBase}/finance/payment-requests/${id}/settlements/${settlementId}/approve`,
    paymentRequestsSettlementReject: (id: string, settlementId: string) =>
      `${apiBase}/finance/payment-requests/${id}/settlements/${settlementId}/reject`,
    paymentRequestsSettlementSettle: (id: string, settlementId: string) =>
      `${apiBase}/finance/payment-requests/${id}/settlements/${settlementId}/settle`,

    // Bank Accounts
    bankAccounts: () => `${apiBase}/accounting/bank-accounts`,
    bankAccountsStore: () => `${apiBase}/accounting/bank-accounts/store`,
    bankAccountsUpdate: (id: number | string) => `${apiBase}/accounting/bank-accounts/update/${id}`,
    bankAccountsShow: (id: number | string) => `${apiBase}/accounting/bank-accounts/${id}`,
    bankAccountsDelete: (id: number | string) => `${apiBase}/accounting/bank-accounts/delete/${id}`,
    
    // Expenses
    expenses: () => `${apiBase}/accounting/expenses`,
    expensesStore: () => `${apiBase}/accounting/expenses/store`,
    expensesUpdate: (id: number | string) => `${apiBase}/accounting/expenses/update/${id}`,
    expensesShow: (id: number | string) => `${apiBase}/accounting/expenses/${id}`,
    expensesDelete: (id: number | string) => `${apiBase}/accounting/expenses/delete/${id}`,  
    expensesSummary: () => `${apiBase}/accounting/expenses/summary`,
    
    // AP Payments
    apPayments: () => `${apiBase}/accounting/ap-payments`,
    apPaymentsStore: () => `${apiBase}/accounting/ap-payments/store`,
    apPaymentsUpdate: (id: number | string) => `${apiBase}/accounting/ap-payments/update/${id}`,
    apPaymentsShow: (id: number | string) => `${apiBase}/accounting/ap-payments/${id}`,
    apPaymentsDelete: (id: number | string) => `${apiBase}/accounting/ap-payments/delete/${id}`,
    apPaymentsSummary: () => `${apiBase}/accounting/ap-payments/summary`,
    apPaymentsConfirm: (id: number | string) => `${apiBase}/accounting/ap-payments/${id}/confirm`,
    apPaymentsSubmit: (id: number | string) => `${apiBase}/accounting/ap-payments/${id}/submit`,
    apPaymentsApprove: (id: number | string) => `${apiBase}/accounting/ap-payments/${id}/approve`,
    apPaymentsReject: (id: number | string) => `${apiBase}/accounting/ap-payments/${id}/reject`,
    apPaymentsCancel: (id: number | string) => `${apiBase}/accounting/ap-payments/${id}/cancel`,
    
    // AR Receipts
    arReceipts: () => `${apiBase}/accounting/ar-receipts`,
    arReceiptsStore: () => `${apiBase}/accounting/ar-receipts/store`,
    arReceiptsUpdate: (id: number | string) => `${apiBase}/accounting/ar-receipts/update/${id}`,
    arReceiptsShow: (id: number | string) => `${apiBase}/accounting/ar-receipts/${id}`,
    arReceiptsDelete: (id: number | string) => `${apiBase}/accounting/ar-receipts/delete/${id}`,
    arReceiptsSummary: () => `${apiBase}/accounting/ar-receipts/summary`,
    arReceiptsConfirm: (id: number | string) => `${apiBase}/accounting/ar-receipts/${id}/confirm`,
    arReceiptsCancel: (id: number | string) => `${apiBase}/accounting/ar-receipts/${id}/cancel`,
    
    // Assets
    assets: () => `${apiBase}/accounting/assets`,
    assetsStore: () => `${apiBase}/accounting/assets`,
    assetsUpdate: (id: number | string) => `${apiBase}/accounting/assets/${id}`,
    assetsShow: (id: number | string) => `${apiBase}/accounting/assets/${id}`,
    assetsDelete: (id: number | string) => `${apiBase}/accounting/assets/${id}`,
    assetsSummary: () => `${apiBase}/accounting/assets/summary`,
    assetsCategories: () => `${apiBase}/accounting/assets/categories`,
    
    // Accounts
    accounts: () => `${apiBase}/accounting/accounts`,
    accountsChartOfAccounts: () => `${apiBase}/accounting/accounts/chart-of-accounts`,
    accountsParentAccounts: () => `${apiBase}/accounting/accounts/parent-accounts`,
    accountsByCategory: (category: string) => `${apiBase}/accounting/accounts/category/${category}`,
    accountsSummary: () => `${apiBase}/accounting/accounts/summary`,

    // Cost Centers
    costCenters: () => `${apiBase}/accounting/cost-centers`,
    costCentersTotal: () => `${apiBase}/accounting/cost-centers/total`,
    costCentersExportExcel: () => `${apiBase}/accounting/cost-centers/export-excel`,

    // Journal Entries
    journals: () => `${apiBase}/accounting/journals`,
    journalsSubmit: (id: number | string) => `${apiBase}/accounting/journals/${id}/submit`,
    journalsApprove: (id: number | string) => `${apiBase}/accounting/journals/${id}/approve`,
    journalsReject: (id: number | string) => `${apiBase}/accounting/journals/${id}/reject`,
    journalsPost: (id: number | string) => `${apiBase}/accounting/journals/${id}/post`,
    journalsReverse: (id: number | string) => `${apiBase}/accounting/journals/${id}/reverse`,
    journalsCancel: (id: number | string) => `${apiBase}/accounting/journals/${id}/cancel`,
    journalsTrialBalance: (params?: string) =>
      `${apiBase}/accounting/journals/trial-balance${params ? `?${params}` : ''}`,
    fiscalPeriods: () => `${apiBase}/accounting/fiscal-periods`,
    fiscalPeriodsCurrent: () => `${apiBase}/accounting/fiscal-periods/current`,
    fiscalPeriodsClose: () => `${apiBase}/accounting/fiscal-periods/close`,
    fiscalPeriodsReopen: () => `${apiBase}/accounting/fiscal-periods/reopen`,
    // Financial reports (GL-derived)
    arAgingReport: (params?: string) =>
      `${apiBase}/accounting/reports/ar-aging${params ? `?${params}` : ''}`,
    apAgingReport: (params?: string) =>
      `${apiBase}/accounting/reports/ap-aging${params ? `?${params}` : ''}`,
    trialBalance: (params?: string) =>
      `${apiBase}/accounting/reports/trial-balance${params ? `?${params}` : ''}`,
    profitLoss: (params?: string) =>
      `${apiBase}/accounting/reports/profit-loss${params ? `?${params}` : ''}`,
    balanceSheet: (params?: string) =>
      `${apiBase}/accounting/reports/balance-sheet${params ? `?${params}` : ''}`,
    cashFlowGl: (params?: string) =>
      `${apiBase}/accounting/reports/cash-flow${params ? `?${params}` : ''}`,
    generalLedger: (params?: string) =>
      `${apiBase}/accounting/reports/general-ledger${params ? `?${params}` : ''}`,
    // Reconciliation
    reconciliationAp: (params?: string) =>
      `${apiBase}/accounting/reconciliation/ap${params ? `?${params}` : ''}`,
    reconciliationAr: (params?: string) =>
      `${apiBase}/accounting/reconciliation/ar${params ? `?${params}` : ''}`,
    reconciliationBank: (params?: string) =>
      `${apiBase}/accounting/reconciliation/bank${params ? `?${params}` : ''}`,
    reconciliationAsset: (params?: string) =>
      `${apiBase}/accounting/reconciliation/assets${params ? `?${params}` : ''}`,
    reconciliationTax: (params?: string) =>
      `${apiBase}/accounting/reconciliation/tax${params ? `?${params}` : ''}`,
    reconciliationInventory: (params?: string) =>
      `${apiBase}/accounting/reconciliation/inventory${params ? `?${params}` : ''}`,
    bankStatements: () => `${apiBase}/accounting/bank-statements`,
    bankStatementShow: (id: number | string) => `${apiBase}/accounting/bank-statements/${id}`,
    bankStatementImportLines: (id: number | string) =>
      `${apiBase}/accounting/bank-statements/${id}/import-lines`,
    bankStatementSuggest: (id: number | string) =>
      `${apiBase}/accounting/bank-statements/${id}/suggest-matches`,
    bankStatementLineConfirmMatch: (lineId: number | string) =>
      `${apiBase}/accounting/bank-statement-lines/${lineId}/confirm-match`,
    bankStatementLineIgnore: (lineId: number | string) =>
      `${apiBase}/accounting/bank-statement-lines/${lineId}/ignore`,
    bankStatementLineUnmatch: (lineId: number | string) =>
      `${apiBase}/accounting/bank-statement-lines/${lineId}/unmatch`,
    purchaseOrderThreeWayMatch: (id: number | string) =>
      `${apiBase}/purchase-order/${id}/three-way-match`,
    journalEntries: () => `${apiBase}/accounting/journals`,
    journalEntriesStore: () => `${apiBase}/accounting/journals/store`,
    journalEntriesUpdate: (id: number | string) => `${apiBase}/accounting/journals/update/${id}`,
    journalEntriesShow: (id: number | string) => `${apiBase}/accounting/journals/${id}`,
    journalEntriesDelete: (id: number | string) => `${apiBase}/accounting/journals/delete/${id}`,
    journalEntriesSummary: () => `${apiBase}/accounting/journals/summary`,

    // Sales Order
    salesOrder             : () => `${apiBase}/sales-order`,
    countSalesOrderByStatus: () => `${apiBase}/sales-order/countByStatus`,
    salesOrderStatistics   : () => `${apiBase}/sales-order/statistics`,
    salesOrderSalesByCustomer: () => `${apiBase}/sales-order/salesByCustomer`,
    salesOrderTopProducts  : () => `${apiBase}/sales-order/topProducts`,
    submitSalesOrder       : (id: number | string) => `${apiBase}/sales-order/submitSalesOrder/${id}`,
    approveSalesOrder      : (id: number | string) => `${apiBase}/sales-order/approveSalesOrder/${id}`,
    rejectSalesOrder       : (id: number | string) => `${apiBase}/sales-order/rejectSalesOrder/${id}`,
    salesOrderUpdate       : (id: number | string) => `${apiBase}/sales-order/update/${id}`,
    getSalesOrderDetails   : (id: number | string) => `${apiBase}/sales-order/getSalesOrderDetails/${id}`,

    // Sales Invoice
    salesInvoice          : () => `${apiBase}/sales-invoices`,
    salesInvoiceShow      : (id: number | string) => `${apiBase}/sales-invoices/${id}`,
    salesInvoiceStatistics: () => `${apiBase}/sales-invoices/statistics`,

    // Surat Jalan
    suratJalan          : () => `${apiBase}/surat-jalan`,
    suratJalanShow      : (id: number | string) => `${apiBase}/surat-jalan/${id}`,

    // Sales Order Item
    salesOrderItemUpdateStatusPartial: (id: number | string) => `${apiBase}/sales-order-item/updateStatusPartial/${id}`,
    deliverAllSalesOrderItems: (id: number | string) => `${apiBase}/sales-order/deliverAllItems/${id}`,

    // Sales Return
    salesReturn          : () => `${apiBase}/sales-return`,
    approveSalesReturn   : (id: number | string) => `${apiBase}/sales-return/approveSalesReturn/${id}`,
    rejectSalesReturn    : (id: number | string) => `${apiBase}/sales-return/rejectSalesReturn/${id}`,
    salesReturnUpdate    : (id: number | string) => `${apiBase}/sales-return/update/${id}`,
    getSalesReturnDetails: (id: number | string) => `${apiBase}/sales-return/getSalesReturnDetails/${id}`,
    getSalesOrderForSalesReturn: (id: number | string) => `${apiBase}/sales-return/get-sales-order/${id}`,

    // Sales Report
    salesReport: () => `${apiBase}/sales-report`,

    // Product
    product: () => `${apiBase}/product`,
    productStatistics: () => `${apiBase}/product/statistics`,
    productExportExcel: () => `${apiBase}/product/export-excel`,

    // DID (Delivery, Installation, dll)
    did: () => `${apiBase}/did`,
    didStatistics: () => `${apiBase}/did/statistics`,
    totalDids: () => `${apiBase}/did/totalDids`,
    exportExcelDids: () => `${apiBase}/did/export-excel`,

    // Service
    service: () => `${apiBase}/service`,
    serviceStatistics: () => `${apiBase}/service/statistics`,
    serviceExportExcel: () => `${apiBase}/service/export-excel`,

    // Service Type (Business, Personal - untuk filter & dropdown Service Plan)
    serviceType: () => `${apiBase}/service-type`,

    // Service Plan
    servicePlan: () => `${apiBase}/service-plan`,
    servicePlanStatistics: () => `${apiBase}/service-plan/statistics`,
    servicePlanExportExcel: () => `${apiBase}/service-plan/export-excel`,

    // Price List
    priceList: () => `${apiBase}/price-list`,
    priceListShow: (id: number | string) => `${apiBase}/price-list/${id}`,
    getProductPrice: () => `${apiBase}/site-investment/product-price`,
    getProductStock: () => `${apiBase}/site-investment/product-stock`,
    getServicePrice: () => `${apiBase}/site-investment/service-price`,
    getDidPrice: () => `${apiBase}/site-investment/did-price`,

    // Price Adjustment Requests
    priceAdjustmentRequests: () => `${apiBase}/price-adjustment-requests`,
    priceAdjustmentStatistics: () => `${apiBase}/price-adjustment-requests/statistics`,
    priceAdjustmentSubmit: (id: number | string) => `${apiBase}/price-adjustment-requests/${id}/submit`,
    priceAdjustmentApprove: (id: number | string) => `${apiBase}/price-adjustment-requests/${id}/approve`,
    priceAdjustmentReject: (id: number | string) => `${apiBase}/price-adjustment-requests/${id}/reject`,

    // Site
    sites: () => `${apiBase}/company/site`,
    sitesTotal: () => `${apiBase}/company/site/totalSites`,
    sitesExportExcel: () => `${apiBase}/company/site/export-excel`,

    // Site Invest
    siteInvest: () => `${apiBase}/site-invest`,
    siteInvestTotal: () => `${apiBase}/site-invest/totalSiteInvests`,
    siteInvestExportExcel: () => `${apiBase}/site-invest/export-excel`,

    // Budget
    budgets: () => `${apiBase}/accounting/budgets`,
    budgetStatistics: () => `${apiBase}/accounting/budgets/statistics`,
    budgetExportExcel: () => `${apiBase}/accounting/budgets/export-excel`,

    // Import
    import: () => `${apiBase}/import`,

    // Stock In & Stock Out
    stockIn                : () => `${apiBase}/stock-in`,
    stockInExport          : () => `${apiBase}/stock-in/export`,
    stockInNotifications   : () => `${apiBase}/stock-in/notifications`,
    stockOut               : () => `${apiBase}/stock-out`,
    stockOutExport         : () => `${apiBase}/stock-out/export`,
    stockOutNotifications  : () => `${apiBase}/stock-out/notifications`,
    
    // Notifications (UI)
    notifications: () => `${apiBase}/notifications`,
    notificationMarkAsRead: (id: number | string) => `${apiBase}/notifications/${id}/read`,
    notificationMarkAllRead: () => `${apiBase}/notifications/mark-all-read`,
    
    // Purchase Order Notifications
    purchaseOrderNotifications: () => `${apiBase}/purchase-order/notifications`,
    
    // Sales Order Notifications  
    salesOrderNotifications: () => `${apiBase}/sales-order/notifications`,
    stock                  : () => `${apiBase}/stock`,
    stockExportExcel       : () => `${apiBase}/stock/export-excel`,
    validateStockBatch     : () => `${apiBase}/stock/validate-batch`,
    getTotalStock          : () => `${apiBase}/stock/getTotalStock`,
    getStockInDetails      : (id: number | string) => `${apiBase}/stock-in/getStockInDetails/${id}`,
    postStockIn            : (id: number | string) => `${apiBase}/stock-in/postStockIn/${id}`,
    postAllStockIn         : () => `${apiBase}/stock-in/postAllStockIn`,
    countStockIn           : () => `${apiBase}/stock-in/getTotalStockIn`,
    getStockOutDetails     : (id: number | string) => `${apiBase}/stock-out/getStockOutDetails/${id}`,
    postStockOut           : (id: number | string) => `${apiBase}/stock-out/postStockOut/${id}`,
    postAllStockOut        : () => `${apiBase}/stock-out/postAllStockOut`,
    countStockOut          : () => `${apiBase}/stock-out/getTotalStockOut`,
    stockInDetail          : () => `${apiBase}/stock-in-detail`,
    stockOutDetail         : () => `${apiBase}/stock-out-detail`,
    stockTransfer          : () => `${apiBase}/stock-transfer`,
    countStockTransfer     : () => `${apiBase}/stock-transfer/getTotalStockTransfer`,
    getStockTransferDetails: (id: number | string) => `${apiBase}/stock-transfer/getStockTransferDetails/${id}`,
    cetakStockTransfer     : (id: number | string) => `${apiBase}/stock-transfer/getStockTransferDetails/${id}`,
    postStockTransfer      : (id: number | string) => `${apiBase}/stock-transfer/postStockTransfer/${id}`,
    approveStockTransfer   : (id: number | string) => `${apiBase}/stock-transfer/approveStockTransfer/${id}`,
    rejectStockTransfer    : (id: number | string) => `${apiBase}/stock-transfer/rejectStockTransfer/${id}`,

    // Phase 12C — inventory control
    purchaseReturn         : () => `${apiBase}/purchase-return`,
    purchaseReturnEligible : () => `${apiBase}/purchase-return/eligible`,
    submitPurchaseReturn   : (id: number | string) => `${apiBase}/purchase-return/${id}/submit`,
    approvePurchaseReturn  : (id: number | string) => `${apiBase}/purchase-return/${id}/approve`,
    rejectPurchaseReturn   : (id: number | string) => `${apiBase}/purchase-return/${id}/reject`,
    postPurchaseReturn     : (id: number | string) => `${apiBase}/purchase-return/${id}/post`,
    reversePurchaseReturn  : (id: number | string) => `${apiBase}/purchase-return/${id}/reverse`,
    inventoryAdjustment    : () => `${apiBase}/inventory-adjustment`,
    inventoryAdjustmentReasons: () => `${apiBase}/inventory-adjustment/reasons`,
    submitInventoryAdjustment: (id: number | string) => `${apiBase}/inventory-adjustment/${id}/submit`,
    approveInventoryAdjustment: (id: number | string) => `${apiBase}/inventory-adjustment/${id}/approve`,
    rejectInventoryAdjustment: (id: number | string) => `${apiBase}/inventory-adjustment/${id}/reject`,
    postInventoryAdjustment: (id: number | string) => `${apiBase}/inventory-adjustment/${id}/post`,
    reverseInventoryAdjustment: (id: number | string) => `${apiBase}/inventory-adjustment/${id}/reverse`,
    stockMovements         : () => `${apiBase}/stock-movements`,
    stockMovementShow      : (id: number | string) => `${apiBase}/stock-movements/${id}`,
    stockCard              : () => `${apiBase}/stock-movements/stock-card`,
    stockReconcile         : () => `${apiBase}/stock-movements/reconcile`,
    reverseStockMovement   : (id: number | string) => `${apiBase}/stock-movements/${id}/reverse`,
    inventoryCutover       : () => `${apiBase}/inventory-cutover`,

    // Phase 17 — inventory accounting visibility (VIEW ONLY)
    inventoryValuation     : () => `${apiBase}/inventory-valuation`,
    inventoryValuationShow : (id: number | string) => `${apiBase}/inventory-valuation/${id}`,
    inventoryCostBalances  : () => `${apiBase}/inventory-cost-balances`,
    inventoryAccountingEvents: () => `${apiBase}/inventory-accounting-events`,
    inventoryAccountingEventShow: (id: number | string) => `${apiBase}/inventory-accounting-events/${id}`,
    accountingOutbox       : () => `${apiBase}/accounting/outbox`,
    accountingOutboxShow   : (id: number | string) => `${apiBase}/accounting/outbox/${id}`,
    inventoryGrni          : () => `${apiBase}/inventory-grni`,
    inventoryGrniReconcile : () => `${apiBase}/inventory-grni/reconcile`,
    inventoryGrniAging     : () => `${apiBase}/inventory-grni/aging`,
    inventoryCogs          : () => `${apiBase}/inventory-accounting/cogs`,
    inventoryPpv           : () => `${apiBase}/inventory-accounting/ppv`,
    inventoryNrv           : () => `${apiBase}/inventory-accounting/nrv`,
    inventoryNrvAssessments: () => `${apiBase}/inventory-accounting/nrv/assessments`,
    inventoryAccountingExceptions: () => `${apiBase}/inventory-accounting/exceptions`,
    inventoryAccountingReconcileInventoryGl: () => `${apiBase}/inventory-accounting/reconcile/inventory-gl`,
    inventoryAccountingReconcileValuation: () => `${apiBase}/inventory-accounting/reconcile/valuation`,

    // Kategori
    categories            : () => `${apiBase}/categories`,
    countProductByCategory: () => `${apiBase}/categories/countProductByCategory`,

    // Documentations (dokumentasi aplikasi)
    documentations       : () => `${apiBase}/documentations`,
    documentationShow    : (id: number | string) => `${apiBase}/documentations/${id}`,
    documentationUpdate  : (id: number | string) => `${apiBase}/documentations/${id}`,
    documentationDelete  : (id: number | string) => `${apiBase}/documentations/${id}`,

    // Unit
    unit: () => `${apiBase}/unit`,

    // Province
    province: () => `${apiBase}/province`,

    // Regency
    regency: () => `${apiBase}/regency`,

    // Customer
    customer          : () => `${apiBase}/customer`,
    getCustomerDetails: (id: number | string) => `${apiBase}/customer/getCustomerDetails/${id}`,

    // Warehouse
    warehouse        : () => `${apiBase}/warehouse`,
    getTotalWarehouse: () => `${apiBase}/warehouse/getTotalWarehouse`,

    // Vendor
    vendor: () => `${apiBase}/vendor`,
    vendorStatistics: () => `${apiBase}/vendor/statistics`,

    // Quotation
    quotation: () => `${apiBase}/quotation`,
    quotationExpiringSoon: () => `${apiBase}/quotation/expiring-soon`,
    quotationPrefillFromSiteInvestment: (id: string) => `${apiBase}/quotation/prefill-from-site-investment/${id}`,
    approveQuotation: (id: number | string) => `${apiBase}/quotation/approveQuotation/${id}`,
    rejectQuotation: (id: number | string) => `${apiBase}/quotation/rejectQuotation/${id}`,
    submitQuotation: (id: number | string) => `${apiBase}/quotation/submitQuotation/${id}`,
    getQuotationDetails: (id: number | string) => `${apiBase}/quotation/getQuotationDetails/${id}`,

    // Legal-Tech Review
    leTechReview: () => `${apiBase}/le-tech-review`,
    leTechReviewShow: (id: number | string) => `${apiBase}/le-tech-review/${id}`,
    leTechReviewStatistics: () => `${apiBase}/le-tech-review/statistics`,
    leTechReviewExternalPurchaseOrders: () => `${apiBase}/le-tech-review/external-purchase-orders`,
    submitLeTechReview: (id: number | string) => `${apiBase}/le-tech-review/submitLeTechReview/${id}`,
    approveLeTechReview: (id: number | string) => `${apiBase}/le-tech-review/approveLeTechReview/${id}`,
    rejectLeTechReview: (id: number | string) => `${apiBase}/le-tech-review/rejectLeTechReview/${id}`,

    // Business Schemes (untuk dropdown Site Investment)
    businessSchemes: () => `${apiBase}/business-schemes`,

    // FDR
    fdr: () => `${apiBase}/fdr`,
    fdrPriceListLines: (priceableType: string) => `${apiBase}/fdr/price-list-lines?priceableType=${priceableType}`,
    countFdrByStatus: () => `${apiBase}/fdr/countByStatus`,
    approveFdr: (id: string) => `${apiBase}/fdr/approveFdr/${id}`,
    rejectFdr: (id: string) => `${apiBase}/fdr/rejectFdr/${id}`,
    submitFdr: (id: string) => `${apiBase}/fdr/submitFdr/${id}`,
    cancelFdr: (id: string) => `${apiBase}/fdr/cancelFdr/${id}`,
    fdrProductPrice: () => `${apiBase}/fdr/product-price`,
    fdrProductStock: () => `${apiBase}/fdr/product-stock`,
    fdrServicePrice: () => `${apiBase}/fdr/service-price`,
    fdrDidPrice: () => `${apiBase}/fdr/did-price`,

    // Site Investment
    siteInvestment: () => `${apiBase}/site-investment`,
    siteInvestmentShow: (id: string) => `${apiBase}/site-investment/${id}`,
    siteInvestmentPreparedByOptions: () => `${apiBase}/site-investment/prepared-by-options`,
    siteInvestmentPriceListLines: (priceableType: string) => `${apiBase}/site-investment/price-list-lines?priceableType=${priceableType}`,
    countSiteInvestByStatus: () => `${apiBase}/site-investment/countByStatus`,
    approveSiteInvestment: (id: string) => `${apiBase}/site-investment/approveSiteInvestment/${id}`,
    rejectSiteInvestment: (id: string) => `${apiBase}/site-investment/rejectSiteInvestment/${id}`,
    submitSiteInvestment: (id: string) => `${apiBase}/site-investment/submitSiteInvestment/${id}`,
    cancelSiteInvestment: (id: string) => `${apiBase}/site-investment/cancelSiteInvestment/${id}`,

    // Subscription
    subscription: () => `${apiBase}/subscription`,
    subscriptionStatistics: () => `${apiBase}/subscription/statistics`,
    subscriptionExpiringSoon: () => `${apiBase}/subscription/expiring-soon`,
    approveSubscription: (id: string) => `${apiBase}/subscription/approveSubscription/${id}`,
    rejectSubscription: (id: string) => `${apiBase}/subscription/rejectSubscription/${id}`,
    submitSubscription: (id: string) => `${apiBase}/subscription/submitSubscription/${id}`,
    activateSubscription: (id: string) => `${apiBase}/subscription/activateSubscription/${id}`,
    cancelSubscription: (id: string) => `${apiBase}/subscription/cancelSubscription/${id}`,

    // Sales Pipeline
    salesPipelineStage: () => `${apiBase}/sales-pipeline-stage`,
    salesOpportunity: () => `${apiBase}/sales-opportunity`,
    salesOpportunityForecast: () => `${apiBase}/sales-opportunity/forecast`,
    salesOpportunityMoveStage: (id: number | string) => `${apiBase}/sales-opportunity/${id}/move-stage`,
    salesOpportunityAddActivity: (id: number | string) => `${apiBase}/sales-opportunity/${id}/add-activity`,

    // PKS
    pks: () => `${apiBase}/pks`,
    pksStatistics: () => `${apiBase}/pks/statistics`,
    submitPks: (id: string) => `${apiBase}/pks/submitPks/${id}`,

    // Customer Verification
    customerVerif: () => `${apiBase}/customer-verif`,
    customerVerifShow: (id: number | string) => `${apiBase}/customer-verif/${id}`,
    customerVerifCountByStatus: () => `${apiBase}/customer-verif/countByStatus`,
    customerVerifApprovedSiteInvestments: () => `${apiBase}/customer-verif/approved-site-investments`,
    customerVerifSiteInvestmentCustomer: (siteInvestmentId: string) => `${apiBase}/customer-verif/site-investment/${siteInvestmentId}/customer`,
    submitCustomerVerif: (id: number | string) => `${apiBase}/customer-verif/submitCustomerVerif/${id}`,
    verifyCustomerVerif: (id: number | string) => `${apiBase}/customer-verif/verifyCustomerVerif/${id}`,
    unverifyCustomerVerif: (id: number | string) => `${apiBase}/customer-verif/unverifyCustomerVerif/${id}`,

    // Data Access - untuk akses data tanpa permission menu
    dataPerusahaan: () => `${apiBase}/data/perusahaan`,
    dataCabang: () => `${apiBase}/data/cabang`,
    dataWarehouse: () => `${apiBase}/data/warehouse`,
    dataProduct: (scope?: 'internal' | 'external') => {
      const url = `${apiBase}/data/product`
      if (!scope) return url
      return `${url}?scope=${encodeURIComponent(scope)}`
    },
    dataCustomer: () => `${apiBase}/data/customer`,
    dataVendor: () => `${apiBase}/data/vendor`,
    dataDepartemen: () => `${apiBase}/data/departemen`,
    dataBudget: () => `${apiBase}/data/budget`,
    dataPurchaseOrder: (status?: string) => {
      const url = `${apiBase}/data/purchase-order`
      if (!status) return url
      return `${url}?status=${encodeURIComponent(status)}`
    },
    dataPegawai: (statusPegawai?: number | string) => {
      const url = `${apiBase}/data/pegawai`
      if (statusPegawai === undefined || statusPegawai === null || statusPegawai === '') return url
      return `${url}?status_pegawai=${encodeURIComponent(String(statusPegawai))}`
    },
    dataStock: () => `${apiBase}/data/stock`,

    // User Sessions
    userSessionsLoginActivity: () => `${apiBase}/user-sessions/login-activity`,
    userSessionsActiveUsers: () => `${apiBase}/user-sessions/active-users`,
    userSessionsUserSessions: (id: number | string) => `${apiBase}/user-sessions/user/${id}/sessions`,
    userSessionsForceLogout: (sessionId: string) => `${apiBase}/user-sessions/force-logout/${sessionId}`,
    userSessionsCleanupExpired: () => `${apiBase}/user-sessions/cleanup-expired`,

    // System stats (infrastructure)
    systemStats: () => `${apiBase}/system-stats`,

    // Activity logs
    activityLogsFeed: (limit = 15, page = 1) =>
      `${apiBase}/activity-logs/feed?limit=${limit}&page=${page}`,
    activityLogs: () => `${apiBase}/activity-logs`,
  };

  const token = useCookie('access_token')

  const apiFetch = $fetch.create({
    credentials: 'include',
    onRequest({ options }) {
      if (token.value) {
        options.headers = {
          ...options.headers,
          Authorization: `Bearer ${token.value}`
        }
      }
    }
  })

  // Inject ke context Nuxt
  return {
    provide: {
      api,
      apiFetch
    },
  }
});
