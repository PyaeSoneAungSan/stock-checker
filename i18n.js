// Multi-language Translation Dictionary (English & Burmese)

export const translations = {
  en: {
    // Branding
    appTitle: "Stock Ranger",
    appSubtitle: "Mini Mart Inventory • Multi-Section Audit",
    badgeCountry: "POS",

    // Header actions
    resetDailyTooltip: "Reset Daily Check",
    settingsTooltip: "Data Backup & Settings",
    manageSectionsTooltip: "Manage Sections & Categories",
    addItemBtn: "Add Item",

    // Daily Summary
    dailyCheckTitle: "Daily Check",
    itemsChecked: "items checked",
    sendToBossBtn: "Send to Boss",
    kpiOutOfStock: "Out",
    kpiLowStock: "Low",
    kpiExpiringSoon: "<90 Days",
    kpiMissingTag: "No Tag",

    // Section Tabs
    tabAll: "All Items",
    btnAddSectionTab: "➕ Add",

    // Search & Filter
    searchPlaceholder: "Search by name, Burmese alias, rack (e.g. Rack D, Panadol)...",
    chipAll: "All",
    chipLowOrOut: "⚠️ Low / Out of Stock",
    chipExpiring: "⏳ Expiring (<90d)",
    chipMissingTag: "🏷️ Missing Price Tag",
    chipUnchecked: "👁️ Unchecked Today",

    // Sorting
    sortDefault: "Default Order",
    sortLocation: "📍 By Shelf Location",
    sortExpiry: "⏳ By Expiry Date",
    sortStatus: "⚠️ By Stock Status",
    sortName: "A-Z Name",

    // Result & Card
    itemsFound: "items found",
    tapToCycleHint: "Tap status button to cycle ↻",
    checkedToday: "Checked Today",
    notChecked: "Not Checked",
    markChecked: "Mark as Checked",
    checkedTime: "Time",
    shelfLocationPrefix: "Shelf",

    // Stock Statuses
    inStock: "IN STOCK",
    lowStock: "LOW STOCK",
    outOfStock: "OUT OF STOCK",

    // Price tag
    tagOk: "Price Tag OK",
    tagMissing: "Tag MISSING",

    // Expiry badges
    expiredBadge: "EXPIRED",
    criticalBadge: "CRITICAL",
    expiringBadge: "EXPIRING",
    safeBadge: "Safe",
    daysLeft: "days left",
    expiredDaysAgo: "expired days ago",

    // Empty state
    noItemsTitle: "No Items Found",
    noItemsDesc: "Try changing your search terms or reset the active filter.",
    resetFilterBtn: "Reset Filters",

    // Bottom Bar
    copyReportBoss: "Copy Boss Report",

    // Form Modal
    addTitle: "Add New Item",
    editTitle: "Edit Item",
    formSubtitle: "Shelf location, price, and expiry tracking",
    labelSection: "Section / Department *",
    btnQuickAddSection: "➕ New Section",
    labelOfficialName: "Official Item Name *",
    namePlaceholder: "e.g. Maggi Noodles, Panadol ActiFast, LED Bulb",
    labelAlias: "Local / Burmese Alias",
    aliasPlaceholder: "e.g. မာဂီ ခေါက်ဆွဲ, ပါရာစီတမော အနီ, ၅၀၂ ကော်",
    labelCategory: "Category / Subcategory",
    labelShelf: "Shelf Location *",
    shelfPlaceholder: "e.g. Rack D - Middle, Aisle 2",
    labelPrice: "Price",
    labelExpiry: "Expiry Date",
    labelStockStatus: "Current Stock Status",
    labelTagCheck: "Shelf Price Tag in Place",
    tagCheckDesc: "Uncheck if the shelf price sticker is missing or damaged",
    labelPhotoRef: "Photo Reference",
    photoUrlPlaceholder: "Paste photo URL (https://...)",
    photoUploadBtn: "📁 Choose Image File",
    labelNotes: "Notes / Supplier Info",
    notesPlaceholder: "e.g. Reorder 2 boxes from supplier.",
    btnCancel: "Cancel",
    btnSave: "Save Item",
    btnDelete: "Delete",

    // Section Manager Modal
    manageSectionsTitle: "Manage Sections & Categories",
    manageSectionsSub: "Add or manage store departments (DIY, Pharmacy, Groceries, Snacks, etc.)",
    secNameEnLabel: "Section Name (English) *",
    secNameMyLabel: "Section Name (Burmese) *",
    secIconLabel: "Icon / Emoji",
    secColorLabel: "Badge Color",
    btnCreateSection: "Create New Section",
    existingSectionsTitle: "Active Store Sections",
    itemsCountLabel: "items",
    toastSectionCreated: "New section created!",
    toastSectionDeleted: "Section removed successfully",
    confirmDeleteSection: "Are you sure you want to delete this section? Items in this section will be reassigned.",

    // WhatsApp Report Modal
    reportTitle: "WhatsApp Report for Manager",
    reportSubtitle: "Clean formatting ready to copy and send",
    reportDesc: "The list below highlights out-of-stock goods, items expiring soon, and missing price tags:",
    btnCopyReport: "📋 Copy Text",
    btnShareWhatsapp: "🚀 Open WhatsApp",

    // Settings Modal
    settingsTitle: "Settings & Backup",
    settingsSubtitle: "LocalStorage management & JSON backup",
    labelManageSections: "Store Departments / Sections",
    descManageSections: "Add custom categories like Groceries, Snacks, Drinks, Stationery, etc.",
    btnOpenSectionMgr: "Manage Sections",
    labelSound: "Sound Effects (Audio FX)",
    soundDesc: "Interactive click sounds when checking shelves",
    soundOn: "🔊 Sound: ON",
    soundOff: "🔇 Sound: OFF",
    labelLanguage: "Language / ဘာသာစကား",
    backupTitle: "Local Data Backup & Restore",
    backupDesc: "Export your inventory to a JSON file or restore anytime onto another device.",
    btnExportJson: "⬇️ Download JSON",
    btnImportJson: "⬆️ Restore JSON",
    resetSampleTitle: "Reset to Default Sample Data",
    resetSampleDesc: "Reload initial sample items with Burmese & English translations.",
    btnResetSample: "Reload Sample Data",
    btnClose: "Close",

    // Toasts & Confirmations
    toastItemSaved: "Item saved successfully!",
    toastItemDeleted: "Item has been removed",
    toastStatusUpdated: "Status updated to",
    toastReportCopied: "📋 Report copied to clipboard!",
    toastBackupSuccess: "JSON backup file downloaded!",
    toastRestoreSuccess: "Backup data restored successfully!",
    toastResetShift: "Daily checks have been reset for the new shift!",
    confirmResetShift: "Start a new shift? This will reset the 'Checked' status for all items.",
    confirmDelete: "Are you sure you want to delete this item?",
    confirmRestore: "Restore items from this backup file? Existing data will be overwritten.",
    confirmResetSample: "Reset back to the default sample goods?",

    // WhatsApp Report Headers
    waReportHeader: "📋 *DAILY AISLE AUDIT REPORT*",
    waStore: "🏪 *Store*: Mini Mart Central",
    waAuditProgress: "📊 *Audit Progress*",
    waCompleted: "Completed",
    waOutOfStockTitle: "🔴 *OUT OF STOCK / NEED REORDER*",
    waLowStockTitle: "🟡 *LOW STOCK*",
    waExpiringTitle: "⚠️ *EXPIRING SOON (<90 DAYS)*:",
    waMissingTagsTitle: "🏷️ *MISSING PRICE TAGS / NEED PRINTING*:",
    waNoOutOfStock: "✅ No out of stock items. All well supplied!",
    waNoLowStock: "✅ No low stock detected.",
    waNoExpiring: "✅ No medicine/items expiring within 90 days.",
    waNoMissingTags: "✅ All price tags present and verified on shelves.",
    waFooter: "_Generated with Stock Ranger Mobile Web App_"
  },

  my: {
    // Branding
    appTitle: "စတော့ စစ်ဆေးရေး",
    appSubtitle: "မီနီမတ် ကုန်ပစ္စည်းစစ်ဆေးမှု • ကဏ္ဍစုံ စစ်ဆေးရေး",
    badgeCountry: "မြန်မာ",

    // Header actions
    resetDailyTooltip: "နေ့စဉ်စစ်ဆေးမှု အသစ်စတင်ရန်",
    settingsTooltip: "ဒေတာသိမ်းဆည်းမှုနှင့် ဆက်တင်များ",
    manageSectionsTooltip: "ကဏ္ဍ/အုပ်စုများ စီမံခန့်ခွဲရန်",
    addItemBtn: "ပစ္စည်းထည့်",

    // Daily Summary
    dailyCheckTitle: "နေ့စဉ် စစ်ဆေးမှု (Daily Check)",
    itemsChecked: "ခု စစ်ဆေးပြီး",
    sendToBossBtn: "မန်နေဂျာထံ ပို့မည်",
    kpiOutOfStock: "ပြတ်လပ်",
    kpiLowStock: "နည်းနေ",
    kpiExpiringSoon: "ရက် ၉၀ အတွင်း",
    kpiMissingTag: "ဈေးနှုန်းကတ်မရှိ",

    // Section Tabs
    tabAll: "အားလုံး",
    btnAddSectionTab: "➕ ကဏ္ဍသစ်",

    // Search & Filter
    searchPlaceholder: "ပစ္စည်းအမည်၊ မြန်မာအမည်၊ စင်နေရာဖြင့် ရှာဖွေပါ...",
    chipAll: "အားလုံး",
    chipLowOrOut: "⚠️ ပြတ်လပ်/နည်းနေ",
    chipExpiring: "⏳ သက်တမ်းကုန်ခါနီး (<၉၀ရက်)",
    chipMissingTag: "🏷️ ဈေးနှုန်းကတ်မရှိ",
    chipUnchecked: "👁️ မစစ်ရသေးသောပစ္စည်း",

    // Sorting
    sortDefault: "မူလအတိုင်း",
    sortLocation: "📍 စင်တည်နေရာအလိုက်",
    sortExpiry: "⏳ သက်တမ်းကုန်ဆုံးရက်အလိုက်",
    sortStatus: "⚠️ စတော့အခြေအနေအလိုက်",
    sortName: "အက္ခရာအလိုက် (A-Z)",

    // Result & Card
    itemsFound: "ခု တွေ့ရှိပါသည်",
    tapToCycleHint: "အခြေအနေပြောင်းရန် ခလုတ်ကို နှိပ်ပါ ↻",
    checkedToday: "ယနေ့ စစ်ပြီး",
    notChecked: "မစစ်ရသေး",
    markChecked: "စစ်ဆေးပြီးကြောင်း မှတ်သားမည်",
    checkedTime: "အချိန်",
    shelfLocationPrefix: "စင်",

    // Stock Statuses
    inStock: "ပစ္စည်းရှိ",
    lowStock: "ပစ္စည်းနည်း",
    outOfStock: "ပစ္စည်းပြတ်",

    // Price tag
    tagOk: "ဈေးနှုန်းကတ် ရှိ",
    tagMissing: "ဈေးနှုန်းကတ် မရှိ",

    // Expiry badges
    expiredBadge: "သက်တမ်းကုန်ပြီ",
    criticalBadge: "အရေးပေါ်",
    expiringBadge: "သက်တမ်းကုန်ခါနီး",
    safeBadge: "စိတ်ချရ",
    daysLeft: "ရက် လိုသေး",
    expiredDaysAgo: "ရက် လွန်သွားပါပြီ",

    // Empty state
    noItemsTitle: "ပစ္စည်း မတွေ့ရှိပါ",
    noItemsDesc: "စာလုံးပေါင်း စစ်ဆေးပါ သို့မဟုတ် စစ်ထုတ်မှုများကို ပြန်လည်သတ်မှတ်ပါ။",
    resetFilterBtn: "စစ်ထုတ်မှု အားလုံးဖျက်မည်",

    // Bottom Bar
    copyReportBoss: "မန်နေဂျာထံ ပို့မည့် အစီရင်ခံစာ",

    // Form Modal
    addTitle: "ပစ္စည်းအသစ် ထည့်သွင်းမည်",
    editTitle: "ပစ္စည်းအချက်အလက် ပြင်ဆင်မည်",
    formSubtitle: "စင်နေရာ၊ ဈေးနှုန်းနှင့် သက်တမ်းကုန်ဆုံးရက် စာရင်းသွင်းခြင်း",
    labelSection: "ကဏ္ဍ အုပ်စု (Section) *",
    btnQuickAddSection: "➕ ကဏ္ဍသစ်ထည့်",
    labelOfficialName: "တရားဝင် ပစ္စည်းအမည် *",
    namePlaceholder: "ဥပမာ - မာဂီခေါက်ဆွဲ၊ Panadol ActiFast၊ LED မီးသီး",
    labelAlias: "မြန်မာအမည် / ခေါ်ဝေါ်ပုံ",
    aliasPlaceholder: "ဥပမာ - ပါရာစီတမော အနီ၊ ၅၀၂ ကော်၊ မာဂီ ခေါက်ဆွဲ",
    labelCategory: "အမျိုးအစားခွဲ (Subcategory)",
    labelShelf: "စင်တည်နေရာ (Shelf Location) *",
    shelfPlaceholder: "ဥပမာ - စင် D - အလယ်ထပ်၊ စင်တန်း ၂",
    labelPrice: "ဈေးနှုန်း (RM)",
    labelExpiry: "သက်တမ်းကုန်ဆုံးရက် (Expiry)",
    labelStockStatus: "လက်ရှိ စတော့အခြေအနေ",
    labelTagCheck: "စင်ပေါ်တွင် ဈေးနှုန်းကတ်ပြား ရှိမရှိ",
    tagCheckDesc: "ဈေးနှုန်းကတ်ပြား မရှိပါက သို့မဟုတ် ပျက်စီးနေပါက အမှန်ခြစ် ဖြုတ်ပါ",
    labelPhotoRef: "ဓာတ်ပုံ မှတ်တမ်း",
    photoUrlPlaceholder: "ဓာတ်ပုံ လင့်ခ် ထည့်ပါ (https://...)",
    photoUploadBtn: "📁 ဖုန်းထဲမှ ဓာတ်ပုံရွေးမည်",
    labelNotes: "မှတ်ချက် / ကုန်သည် သတင်းအချက်အလက်",
    notesPlaceholder: "ဥပမာ - ကုန်သည်ထံမှ ၂ ဖာ ထပ်မှာယူရန်။",
    btnCancel: "မလုပ်တော့ပါ",
    btnSave: "သိမ်းဆည်းမည်",
    btnDelete: "ဖျက်မည်",

    // Section Manager Modal
    manageSectionsTitle: "ကဏ္ဍနှင့် အုပ်စုများ စီမံခန့်ခွဲခြင်း",
    manageSectionsSub: "ဆိုင်တွင်း ကဏ္ဍအသစ်များ ထည့်သွင်းခြင်း (DIY, ဆေးဝါး, ကုန်စုံ, အချိုရည်, စာရေးကိရိယာ စသည်)",
    secNameEnLabel: "ကဏ္ဍအမည် (အင်္ဂလိပ်) *",
    secNameMyLabel: "ကဏ္ဍအမည် (မြန်မာ) *",
    secIconLabel: "အိုင်ကွန် / အီမိုဂျီ (Emoji)",
    secColorLabel: "တံဆိပ် အရောင်",
    btnCreateSection: "ကဏ္ဍအသစ် ဖန်တီးမည်",
    existingSectionsTitle: "လက်ရှိ သတ်မှတ်ထားသော ကဏ္ဍများ",
    itemsCountLabel: "ခု",
    toastSectionCreated: "ကဏ္ဍအသစ် ဖန်တီးပြီးပါပြီ!",
    toastSectionDeleted: "ကဏ္ဍကို ဖျက်ပြီးပါပြီ",
    confirmDeleteSection: "ဤကဏ္ဍကို ဖျက်ရန် သေချာပါသလား? ၎င်းအတွင်းရှိ ပစ္စည်းများကို အခြားကဏ္ဍသို့ ပြောင်းပါမည်။",

    // WhatsApp Report Modal
    reportTitle: "မန်နေဂျာထံ ပို့မည့် WhatsApp အစီရင်ခံစာ",
    reportSubtitle: "WhatsApp သို့ အလွယ်တကူ ကူးယူပေးပို့နိုင်သော ပုံစံ",
    reportDesc: "အောက်ပါစာရင်းတွင် ပစ္စည်းပြတ်လပ်မှုများ၊ သက်တမ်းကုန်ခါနီးများနှင့် ဈေးနှုန်းကတ်ပြား လိုအပ်ချက်များ ပါဝင်ပါသည် -",
    btnCopyReport: "📋 စာသား ကူးယူမည် (Copy)",
    btnShareWhatsapp: "🚀 WhatsApp ဖွင့်မည်",

    // Settings Modal
    settingsTitle: "ဆက်တင်များနှင့် ဒေတာသိမ်းဆည်းမှု",
    settingsSubtitle: "LocalStorage နှင့် JSON Backup စီမံခန့်ခွဲမှု",
    labelManageSections: "ဆိုင်တွင်း ကဏ္ဍများ (Store Sections)",
    descManageSections: "ကုန်စုံ၊ အချိုရည်၊ သရေစာ၊ စာရေးကိရိယာ အစရှိသော ကဏ္ဍအသစ်များ ထည့်ရန်",
    btnOpenSectionMgr: "ကဏ္ဍများ ပြင်ဆင်ရန်",
    labelSound: "အသံစနစ် (Sound FX)",
    soundDesc: "စစ်ဆေးစဉ် ခလုတ်နှိပ်သည့် အသံမြည်ခြင်း",
    soundOn: "🔊 အသံ: ဖွင့်ထားသည်",
    soundOff: "🔇 အသံ: ပိတ်ထားသည်",
    labelLanguage: "Language / ဘာသာစကား",
    backupTitle: "ဒေတာ အရန်သိမ်းခြင်းနှင့် ပြန်လည်ရယူခြင်း",
    backupDesc: "ကုန်ပစ္စည်းစာရင်းများကို JSON ဖိုင်ဖြင့် အရန်သိမ်းဆည်းနိုင်ပြီး အခြားဖုန်းများသို့ အလွယ်တကူ လွှဲပြောင်းနိုင်ပါသည်။",
    btnExportJson: "⬇️ JSON ဒေတာ သိမ်းဆည်းမည်",
    btnImportJson: "⬆️ JSON ဒေတာ ပြန်လည်တင်မည်",
    resetSampleTitle: "မူလနမူနာဒေတာ ပြန်လည်ရယူခြင်း",
    resetSampleDesc: "မြန်မာ/အင်္ဂလိပ် အမည်များနှင့် မူလနမူနာ ပစ္စည်းစာရင်းကို ပြန်လည်ရယူမည်။",
    btnResetSample: "နမူနာဒေတာ ပြန်ယူမည်",
    btnClose: "ပိတ်မည်",

    // Toasts & Confirmations
    toastItemSaved: "ပစ္စည်းအချက်အလက် သိမ်းဆည်းပြီးပါပြီ!",
    toastItemDeleted: "ပစ္စည်းကို စာရင်းမှ ဖျက်ပြီးပါပြီ",
    toastStatusUpdated: "စတော့အခြေအနေ ပြောင်းလဲပြီးပါပြီ -",
    toastReportCopied: "📋 အစီရင်ခံစာကို ကူးယူပြီးပါပြီ (Clipboard)!",
    toastBackupSuccess: "JSON ဒေတာဖိုင်ကို ဒေါင်းလုဒ်ဆွဲပြီးပါပြီ!",
    toastRestoreSuccess: "ဒေတာများကို အောင်မြင်စွာ ပြန်လည်ရယူပြီးပါပြီ!",
    toastResetShift: "အဆိုင်းသစ်အတွက် နေ့စဉ်စစ်ဆေးမှုများ အသစ်ပြန်စတင်ပါပြီ!",
    confirmResetShift: "စစ်ဆေးမှု အသစ်စတင်လိုပါသလား? ၎င်းသည် ပစ္စည်းအားလုံး၏ 'စစ်ပြီး' အမှတ်အသားကို ပြန်လည်ဖျက်ပါမည်။",
    confirmDelete: "ဤပစ္စည်းကို ဖျက်ရန် သေချာပါသလား?",
    confirmRestore: "ဤ JSON ဖိုင်မှ ဒေတာများကို တင်သွင်းလိုပါသလား? လက်ရှိဒေတာများကို အစားထိုးပါမည်။",
    confirmResetSample: "မူလ နမူနာကုန်ပစ္စည်းများသို့ ပြန်လည်သတ်မှတ်လိုပါသလား?",

    // WhatsApp Report Headers
    waReportHeader: "📋 *နေ့စဉ် စင်စစ်ဆေးမှု အစီရင်ခံစာ (DAILY AISLE AUDIT)*",
    waStore: "🏪 *ဆိုင်အမည်*: မီနီမတ် (Mini Mart Central)",
    waAuditProgress: "📊 *စစ်ဆေးမှု ပြီးစီးမှု*",
    waCompleted: "ပြီးစီးပါသည်",
    waOutOfStockTitle: "🔴 *ပစ္စည်းပြတ်လပ်နေသော စာရင်း (OUT OF STOCK)*:",
    waLowStockTitle: "🟡 *ပစ္စည်းနည်းနေသော စာရင်း (LOW STOCK)*:",
    waExpiringTitle: "⚠️ *သက်တမ်းကုန်ခါနီး ဆေးဝါး/ပစ္စည်းများ (<၉၀ ရက်)*:",
    waMissingTagsTitle: "🏷️ *ဈေးနှုန်းကတ်ပြား ပျောက်ဆုံး/ရိုက်နှိပ်ရန် လိုအပ်သော စာရင်း*:",
    waNoOutOfStock: "✅ ပစ္စည်းပြတ်လပ်မှု မရှိပါ။ အားလုံးအပြည့်ရှိပါသည်!",
    waNoLowStock: "✅ ပစ္စည်းနည်းနေမှု မရှိပါ။",
    waNoExpiring: "✅ ရက် ၉၀ အတွင်း သက်တမ်းကုန်မည့် ပစ္စည်းမရှိပါ။",
    waNoMissingTags: "✅ စင်ပေါ်ရှိ ဈေးနှုန်းကတ်ပြားများ အားလုံးပြည့်စုံပါသည်။",
    waFooter: "_စတော့ စစ်ဆေးရေး မိုဘိုင်းအက်ပ်မှ ပေးပို့ပါသည်_"
  }
};
