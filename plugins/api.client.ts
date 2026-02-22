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
    menuGroupsAll: () => `${apiBase}/menu-groups-all`,
    menuDetails: () => `${apiBase}/menu-details`,

    // Approval Workflows (Admin)
    approvalWorkflows     : () => `${apiBase}/approval-workflows`,
    approvalWorkflowShow  : (id: number | string) => `${apiBase}/approval-workflows/${id}`,
    approvalWorkflowSteps : (id: number | string) => `${apiBase}/approval-workflows/${id}/steps`,
    approvalWorkflowStepsStore: () => `${apiBase}/approval-workflow-steps`,
    approvalWorkflowStepsUpdate: (id: number | string) => `${apiBase}/approval-workflow-steps/${id}`,
    approvalWorkflowStepsDelete: (id: number | string) => `${apiBase}/approval-workflow-steps/${id}`,

    // Jabatan, Perusahaan, Cabang, Divisi, Departemen, Cuti, Pegawai
    jabatan              : () => `${apiBase}/jabatan`,
    countPegawaiByJabatan: () => `${apiBase}/jabatan/countPegawaiByJabatan`,
    perusahaan           : () => `${apiBase}/perusahaan`,
    cabang               : () => `${apiBase}/cabang`,
    divisi               : () => `${apiBase}/divisi`,
    departemen           : () => `${apiBase}/departemen`,
    cuti                 : () => `${apiBase}/cuti`,
    pegawai              : () => `${apiBase}/pegawai`,
    pegawaiUpdate        : (id: number | string) => `${apiBase}/pegawai/update/${id}`,
    pegawaiDelete        : (id: number | string) => `${apiBase}/pegawai/delete/${id}`,
    pegawaiCountByStatus : () => `${apiBase}/pegawai/countByStatus`,
    pegawaiAvailableUsers: () => `${apiBase}/pegawai/available-users`,

    // Purchase Order
    purchaseOrder          : () => `${apiBase}/purchase-order`,
    submitPurchaseOrder    : (id: number | string) => `${apiBase}/purchase-order/submitPurchaseOrder/${id}`,
    approvePurchaseOrder   : (id: number | string) => `${apiBase}/purchase-order/approvePurchaseOrder/${id}`,
    rejectPurchaseOrder    : (id: number | string) => `${apiBase}/purchase-order/rejectPurchaseOrder/${id}`,
    purchaseOrderUpdate    : (id: number | string) => `${apiBase}/purchase-order/update/${id}`,
    getPurchaseOrderDetails: (id: number | string) => `${apiBase}/purchase-order/getPurchaseOrderDetails/${id}`,
    countPurchaseOrderByStatus: () => `${apiBase}/purchase-order/countByStatus`,

    // Purchase Invoice
    purchaseInvoice: () => `${apiBase}/purchase-invoice`,
    purchaseInvoiceShow: (id: number | string) => `${apiBase}/purchase-invoice/${id}`,
    purchaseInvoiceStatistics: () => `${apiBase}/purchase-invoice/statistics`,
    
    // Purchase Request
    purchaseRequest: () => `${apiBase}/purchase-request`,
    countPurchaseRequestByStatus: () => `${apiBase}/purchase-request/countByStatus`,
    approvePurchaseRequest: (id: number | string) => `${apiBase}/purchase-request/${id}/approvePurchaseRequest`,
    rejectPurchaseRequest: (id: number | string) => `${apiBase}/purchase-request/${id}/rejectPurchaseRequest`,
    submitPurchaseRequest: (id: number | string) => `${apiBase}/purchase-request/${id}/submitPurchaseRequest`,
    
    // ARF (Asset Request Form)
    arf: () => `${apiBase}/arf`,
    countArfByStatus: () => `${apiBase}/arf/countByStatus`,
    submitArf: (id: number | string) => `${apiBase}/arf/${id}/submitArf`,
    approveArf: (id: number | string) => `${apiBase}/arf/${id}/approveArf`,
    rejectArf: (id: number | string) => `${apiBase}/arf/${id}/rejectArf`,
    disburseArf: (id: number | string) => `${apiBase}/arf/${id}/disburseArf`,
    settleArf: (id: number | string) => `${apiBase}/arf/${id}/settleArf`,
    cancelArf: (id: number | string) => `${apiBase}/arf/${id}/cancelArf`,
    
    // Purchase Order Item
    purchaseOrderItemUpdateStatusPartial: (id: number | string) => `${apiBase}/purchase-order-item/updateStatusPartial/${id}`,
    receiveAllPurchaseOrderItems: (id: number | string) => `${apiBase}/purchase-order/receiveAllItems/${id}`,

    // Finance Dashboard
    financeDashboard: () => `${apiBase}/finance/dashboard`,
    financeCashFlow: () => `${apiBase}/finance/cash-flow`,
    financeTaxReport: () => `${apiBase}/finance/tax-report`,

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
    
    // AR Receipts
    arReceipts: () => `${apiBase}/accounting/ar-receipts`,
    arReceiptsStore: () => `${apiBase}/accounting/ar-receipts/store`,
    arReceiptsUpdate: (id: number | string) => `${apiBase}/accounting/ar-receipts/update/${id}`,
    arReceiptsShow: (id: number | string) => `${apiBase}/accounting/ar-receipts/${id}`,
    arReceiptsDelete: (id: number | string) => `${apiBase}/accounting/ar-receipts/delete/${id}`,
    arReceiptsSummary: () => `${apiBase}/accounting/ar-receipts/summary`,
    
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

    // Taxes
    taxes: () => `${apiBase}/accounting/taxes`,
    taxesStore: () => `${apiBase}/accounting/taxes`,
    taxesUpdate: (id: number | string) => `${apiBase}/accounting/taxes/${id}`,
    taxesShow: (id: number | string) => `${apiBase}/accounting/taxes/${id}`,
    taxesDelete: (id: number | string) => `${apiBase}/accounting/taxes/${id}`,
    taxesActive: () => `${apiBase}/accounting/taxes/active`,

    // Journal Entries
    journals: () => `${apiBase}/accounting/journals`,
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
    productExportExcel: () => `${apiBase}/product/export-excel`,

    // DID (Delivery, Installation, dll)
    did: () => `${apiBase}/did`,
    totalDids: () => `${apiBase}/did/totalDids`,
    exportExcelDids: () => `${apiBase}/did/export-excel`,

    // Service
    service: () => `${apiBase}/service`,
    serviceExportExcel: () => `${apiBase}/service/export-excel`,

    // Service Type (Business, Personal - untuk filter & dropdown Service Plan)
    serviceType: () => `${apiBase}/service-type`,

    // Service Plan
    servicePlan: () => `${apiBase}/service-plan`,
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

    // Quotation
    quotation: () => `${apiBase}/quotation`,
    quotationExpiringSoon: () => `${apiBase}/quotation/expiring-soon`,
    approveQuotation: (id: number | string) => `${apiBase}/quotation/approveQuotation/${id}`,
    rejectQuotation: (id: number | string) => `${apiBase}/quotation/rejectQuotation/${id}`,
    submitQuotation: (id: number | string) => `${apiBase}/quotation/submitQuotation/${id}`,
    getQuotationDetails: (id: number | string) => `${apiBase}/quotation/getQuotationDetails/${id}`,

    // IRO (Installation Request Order)
    iro: () => `${apiBase}/iro`,
    getIroDetails: (id: string) => `${apiBase}/iro/getIroDetails/${id}`,
    iroStatistics: () => `${apiBase}/iro/statistics`,
    approveIro: (id: string) => `${apiBase}/iro/approveIro/${id}`,
    rejectIro: (id: string) => `${apiBase}/iro/rejectIro/${id}`,
    submitIro: (id: string) => `${apiBase}/iro/submitIro/${id}`,

    // MGRF (Material Good Request Form)
    mgrf: () => `${apiBase}/mgrf`,
    countMgrfByStatus: () => `${apiBase}/mgrf/countByStatus`,
    approveMgrf: (id: string) => `${apiBase}/mgrf/approveMgrf/${id}`,
    rejectMgrf: (id: string) => `${apiBase}/mgrf/rejectMgrf/${id}`,
    submitMgrf: (id: string) => `${apiBase}/mgrf/submitMgrf/${id}`,

    // Legal-Tech Review
    leTechReview: () => `${apiBase}/le-tech-review`,
    leTechReviewShow: (id: number | string) => `${apiBase}/le-tech-review/${id}`,
    leTechReviewStatistics: () => `${apiBase}/le-tech-review/statistics`,
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
    siteInvestmentPriceListLines: (priceableType: string) => `${apiBase}/site-investment/price-list-lines?priceableType=${priceableType}`,
    countSiteInvestByStatus: () => `${apiBase}/site-investment/countByStatus`,
    approveSiteInvestment: (id: string) => `${apiBase}/site-investment/approveSiteInvestment/${id}`,
    rejectSiteInvestment: (id: string) => `${apiBase}/site-investment/rejectSiteInvestment/${id}`,
    submitSiteInvestment: (id: string) => `${apiBase}/site-investment/submitSiteInvestment/${id}`,
    cancelSiteInvestment: (id: string) => `${apiBase}/site-investment/cancelSiteInvestment/${id}`,

    // Subscription
    subscription: () => `${apiBase}/subscription`,
    subscriptionStatistics: () => `${apiBase}/subscription/statistics`,
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
    customerVerifApprovedIros: () => `${apiBase}/customer-verif/approved-iros`,
    customerVerifIroCustomer: (iroId: string) => `${apiBase}/customer-verif/iro/${iroId}/customer`,
    submitCustomerVerif: (id: number | string) => `${apiBase}/customer-verif/submitCustomerVerif/${id}`,
    verifyCustomerVerif: (id: number | string) => `${apiBase}/customer-verif/verifyCustomerVerif/${id}`,
    unverifyCustomerVerif: (id: number | string) => `${apiBase}/customer-verif/unverifyCustomerVerif/${id}`,

    // Data Access - untuk akses data tanpa permission menu
    dataPerusahaan: () => `${apiBase}/data/perusahaan`,
    dataCabang: () => `${apiBase}/data/cabang`,
    dataWarehouse: () => `${apiBase}/data/warehouse`,
    dataProduct: () => `${apiBase}/data/product`,
    dataCustomer: () => `${apiBase}/data/customer`,
    dataVendor: () => `${apiBase}/data/vendor`,
    dataDepartemen: () => `${apiBase}/data/departemen`,

    // User Sessions
    userSessionsActiveUsers: () => `${apiBase}/user-sessions/active-users`,
    userSessionsUserSessions: (id: number | string) => `${apiBase}/user-sessions/user/${id}/sessions`,
    userSessionsForceLogout: (sessionId: string) => `${apiBase}/user-sessions/force-logout/${sessionId}`,
    userSessionsCleanupExpired: () => `${apiBase}/user-sessions/cleanup-expired`,
  };

  // Inject ke context Nuxt
  return {
    provide: {
      api,
    },
  };
});
