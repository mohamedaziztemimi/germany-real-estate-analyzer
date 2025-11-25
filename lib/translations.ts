export type TranslationKeys =
  | "home"
  | "dashboard"
  | "analyses"
  | "discussions"
  | "users"
  | "signIn"
  | "signUp"
  | "language"
  | "brand"
  | "dashboardTitle"
  | "askAI"
  | "totalRequests"
  | "avgConfidence"
  | "buyRate"
  | "avgRoi"
  | "noAnalyses"
  | "dashboardPrompt"
  | "lastUpdated"
  | "heroTitle"
  | "heroSubtitle"
  | "heroCta"
  | "feature1Title"
  | "feature1Description"
  | "feature2Title"
  | "feature2Description"
  | "feature3Title"
  | "feature3Description"
  | "dataTitle1"
  | "dataTitle2"
  | "dataList1Item1"
  | "dataList1Item2"
  | "dataList1Item3"
  | "dataList1Item4"
  | "dataList2Item1"
  | "dataList2Item2"
  | "dataList2Item3"
  | "dataList2Item4"
  | "analysisTitle"
  | "analysisSuccess"
  | "analysisEmpty"
  | "runAnalysis"
  | "newAnalysis"
  | "saveAnalysis"
  | "back"
  | "next"
  | "dialogSaveTitle"
  | "dialogSaveNotes"
  | "dialogCancel"
  | "dialogSaveCta"
  | "stepLocation"
  | "stepProperty"
  | "stepListing"
  | "stepFinancing"
  | "plz"
  | "city"
  | "district"
  | "propertyType"
  | "condition"
  | "energyClass"
  | "surface"
  | "rooms"
  | "yearBuilt"
  | "floor"
  | "elevator"
  | "balcony"
  | "listingYear"
  | "listingQuarter"
  | "priceBuy"
  | "renoCost"
  | "greixIndex"
  | "hpiIndex"
  | "mortgageRate"
  | "pricePerM2"
  | "renoPerM2"
  | "rentMonth"
  | "holdingMonths"
  | "financingTitle"
  | "feesTitle"
  | "ltv"
  | "fixYears"
  | "grunderwerb"
  | "notaryFee"
  | "agentFee"
  | "otherFees"
  | "selectDistrict"
  | "selectCondition"
  | "selectEnergy"
  | "selectPropertyType"
  | "analysesTitle"
  | "analysesNew"
  | "analysesEmpty"
  | "analysesCta"
  | "analysesDecision"
  | "analysesROI"
  | "analysesConfidence"
  | "analysesFailed"
  | "analysesSigninTitle"
  | "analysesSigninDesc"
  | "analysesSignin"
  | "analysesSignup"
  | "paginationPrev"
  | "paginationNext"
  | "discussionsTitle"
  | "discussionsSubtitle"
  | "discussionsEmpty"
  | "discussionsFailed"
  | "discussionsView"
  | "discussionsSharedBy"
  | "usersTitle"
  | "usersAdd"
  | "usersClose"
  | "usersCreate"
  | "usersCreating"
  | "usersCancel"
  | "usersFailed"
  | "usersEmail"
  | "usersPassword"
  | "usersRole"
  | "usersAdmin"
  | "usersUser"
  | "investmentDecision"
  | "confidenceLevel"
  | "decisionBuy"
  | "decisionDontBuy"
  | "estimatedROI"
  | "capRate"
  | "capRateNA"
  | "pricePerM2PostReno"
  | "kpiRoiDetail"
  | "kpiCapDetail"
  | "kpiPriceDetail"
  | "summaryTitle"
  | "summaryPara1"
  | "summaryPara2"
  | "summaryPara3"
  | "chartProjected"
  | "chartInvest"
  | "chartInvestPurchase"
  | "chartInvestRenovation"
  | "chartInvestFees"
  | "chartDrivers"
  | "chartRoiScenarios"
  | "chartPessimistic"
  | "chartBase"
  | "chartOptimistic"
  | "driverGreix"
  | "driverHpi"
  | "driverUplift"
  | "driverCostIntensity"
  | "chartYearUnit"
  | "chartToday"
  | "chartFuture"

export type Language = "en" | "de"

export const translations: Record<Language, Record<TranslationKeys, string>> = {
  en: {
    home: "Home",
    dashboard: "Dashboard",
    analyses: "Analysis",
    discussions: "Discussions",
    users: "Users",
    signIn: "Sign In",
    signUp: "Sign Up",
    language: "Language",
    brand: "RealEstate.AI",
    dashboardTitle: "Analytics Dashboard",
    askAI: "Ask AI",
    totalRequests: "Total Requests",
    avgConfidence: "Avg Confidence",
    buyRate: "Buy Rate",
    avgRoi: "Average ROI",
    noAnalyses: "You haven’t run any analysis yet.",
    dashboardPrompt: "Sign in to view your analytics dashboard.",
    lastUpdated: "Last updated",
    heroTitle: "Germany Real Estate Investment Intelligence",
    heroSubtitle:
      "AI-powered analysis to make smarter real estate investment decisions. Get instant ROI estimates, confidence scores, and detailed value drivers.",
    heroCta: "Start Analysis",
    feature1Title: "Instant ROI Analysis",
    feature1Description: "Get estimated ROI, cap rate, and post-renovation valuations in seconds.",
    feature2Title: "ML-Powered Insights",
    feature2Description: "Machine learning model trained on real German market data and trends.",
    feature3Title: "Decision Confidence",
    feature3Description: "Confidence scores and detailed value drivers for informed decisions.",
    dataTitle1: "Real Market Data",
    dataTitle2: "What You Get",
    dataList1Item1: "Bundesbank mortgage rates",
    dataList1Item2: "Destatis property price indices",
    dataList1Item3: "Berlin Mietspiegel data",
    dataList1Item4: "Location & transport accessibility scoring",
    dataList2Item1: "Buy/Don't buy recommendation",
    dataList2Item2: "ROI and cap rate calculations",
    dataList2Item3: "Feature importance analysis",
    dataList2Item4: "Market assumption transparency",
    analysisTitle: "Property Analyzer",
    analysisSuccess: "Analysis completed successFuelly.",
    analysisEmpty: "Fuell out the form and submit to see analysis results here.",
    runAnalysis: "Run Analysis",
    newAnalysis: "New Analysis",
    saveAnalysis: "Save Analysis",
    back: "Back",
    next: "Next",
    dialogSaveTitle: "Save Analysis",
    dialogSaveNotes: "Notes (optional)",
    dialogCancel: "Cancel",
    dialogSaveCta: "Save",
    stepLocation: "Location",
    stepProperty: "Property & Condition",
    stepListing: "Listing & Market",
    stepFinancing: "Financing & Fees",
    plz: "PLZ (Postal Code)",
    city: "City",
    district: "District",
    propertyType: "Property Type",
    condition: "Condition",
    energyClass: "Energy Efficiency Class",
    surface: "Surface Area (m²)",
    rooms: "Number of Rooms",
    yearBuilt: "Year Built",
    floor: "Floor",
    elevator: "Elevator in building",
    balcony: "Balcony / Terrace",
    listingYear: "Listing Year",
    listingQuarter: "Listing Quarter (1-4)",
    priceBuy: "Purchase Price (EUR)",
    renoCost: "Renovation Cost (EUR)",
    greixIndex: "GREIX Index",
    hpiIndex: "HPI Index",
    mortgageRate: "Mortgage Rate 10y",
    pricePerM2: "Price per m²",
    renoPerM2: "Renovation cost per m²",
    rentMonth: "Expected Rent/Month (EUR) [optional]",
    holdingMonths: "Holding Period (months)",
    financingTitle: "Financing",
    feesTitle: "Fees",
    ltv: "Loan-to-Value (LTV)",
    fixYears: "Fixed Rate Period",
    grunderwerb: "Ground Acquisition Tax (%)",
    notaryFee: "Notary Fee (%)",
    agentFee: "Agent Fee (%) [optional]",
    otherFees: "Other Fees (€) [optional]",
    selectDistrict: "Choose district",
    selectCondition: "Select condition",
    selectEnergy: "Select class",
    selectPropertyType: "Select property type",
    analysesTitle: "My Analysis",
    analysesNew: "New Analysis",
    analysesEmpty: "No analysis available yet.",
    analysesCta: "Analyze Property",
    analysesDecision: "Decision",
    analysesROI: "ROI",
    analysesConfidence: "Confidence",
    analysesFailed: "Failed to load analysis data",
    analysesSigninTitle: "My Analysis",
    analysesSigninDesc: "Sign in to view and manage your saved analysis.",
    analysesSignin: "Sign In",
    analysesSignup: "Sign Up",
    paginationPrev: "Previous",
    paginationNext: "Next",
    discussionsTitle: "Discussion Board",
    discussionsSubtitle: "See what your teammates are evaluating and jump into the discussion.",
    discussionsEmpty: "No discussions yet.",
    discussionsFailed: "Unable to load discussion threads. Please try again in a moment.",
    discussionsView: "View & Comment",
    discussionsSharedBy: "Shared by",
    usersTitle: "Users Management",
    usersAdd: "Add User",
    usersClose: "Close",
    usersCreate: "Create",
    usersCreating: "Creating...",
    usersCancel: "Cancel",
    usersFailed: "Failed to load users",
    usersEmail: "Email",
    usersPassword: "Password",
    usersRole: "Role",
    usersAdmin: "Admin",
    usersUser: "User",
    investmentDecision: "Investment Decision",
    confidenceLevel: "Confidence Level",
    decisionBuy: "Buy",
    decisionDontBuy: "Don't buy",
    estimatedROI: "Estimated ROI",
    capRate: "Cap Rate",
    capRateNA: "N/A",
    pricePerM2PostReno: "Price per m² (post-reno)",
    kpiRoiDetail: "Net gain relative to the capital deployed.",
    kpiCapDetail: "Annual rent divided by the invested amount.",
    kpiPriceDetail: "Projected resale value per square metre after works.",
    summaryTitle: "Summary & Assumptions",
    summaryPara1:
      "We expect the renovated place to be worth about {postReno} today, and roughly {futureSale} after the planned hold.",
    summaryPara2:
      "Your outlay (purchase, renovation, and fees) is around {totalCost}. The projected return is {roiTotal}, driven by the gap between your total spend and the resale value after some market growth.",
    summaryPara3:
      "If the uplift after works and the expected appreciation hold, the property can make sense; if not, consider lowering renovation spend or negotiating the purchase price. Longer holds or stronger market growth improve the outcome; higher costs or flat prices reduce it.",
    chartProjected: "Projected value over holding period",
    chartInvest: "Investment breakdown",
    chartInvestPurchase: "Purchase price",
    chartInvestRenovation: "Renovation",
    chartInvestFees: "Acquisition fees",
    chartDrivers: "Value drivers",
    chartRoiScenarios: "ROI scenarios",
    chartPessimistic: "Pessimistic",
    chartBase: "Base",
    chartOptimistic: "Optimistic",
    driverGreix: "GREIX momentum",
    driverHpi: "HPI trend",
    driverUplift: "Renovation uplift",
    driverCostIntensity: "Renovation cost intensity",
    chartYearUnit: "yr",
    chartToday: "Today",
    chartFuture: "In {years} {unit}",
  },
  de: {
    home: "Startseite",
    dashboard: "Dashboard",
    analyses: "Analysen",
    discussions: "Diskussionen",
    users: "Benutzer",
    signIn: "Anmelden",
    signUp: "Registrieren",
    language: "Sprache",
    brand: "RealEstate.AI",
    dashboardTitle: "Analyse Dashboard",
    askAI: "KI anfragen",
    totalRequests: "Anfragen gesamt",
    avgConfidence: "Durchschnittliches Vertrauen",
    buyRate: "Kaufquote",
    avgRoi: "Durchschnittlicher ROI",
    noAnalyses: "Noch keine Analyse gespeichert.",
    dashboardPrompt: "Melde dich an, um dein Dashboard zu sehen.",
    lastUpdated: "Zuletzt aktualisiert",
    heroTitle: "Intelligenz fuer Immobilieninvestitionen in Deutschland",
    heroSubtitle:
      "KI-gestützte Analysen für smartere Immobilienentscheidungen. Erhalte sofortige ROI-Schätzungen, Vertrauenswerte und detaillierte Werttreiber.",
    heroCta: "Analyse starten",
    feature1Title: "Schnelle ROI-Analyse",
    feature1Description: "Erhalte in Sekunden eine Einschaetzung von Rendite, Cap Rate und Wert nach der Sanierung.",
    feature2Title: "Marktorientierte Einschaetzung",
    feature2Description: "Ausgerichtet auf deutsche Marktpreise, Finanzierung und Mietniveaus – praxisnah statt theoretisch.",
    feature3Title: "Sichere Entscheidung",
    feature3Description: "Klare Empfehlung mit den wichtigsten Gruenden fuer oder gegen den Kauf.",
    dataTitle1: "Reale Marktdaten",
    dataTitle2: "Dein Mehrwert",
    dataList1Item1: "Aktuelle Hypothekenzinsen (Bundesbank)",
    dataList1Item2: "Preisindizes (Destatis)",
    dataList1Item3: "Mietspiegel und regionale Benchmarks",
    dataList1Item4: "Lagebewertung inkl. Erreichbarkeit",
    dataList2Item1: "Kauf- bzw. Nicht-Kauf-Empfehlung",
    dataList2Item2: "Berechnete Rendite und Cap Rate",
    dataList2Item3: "Wichtigste Einflussfaktoren",
    dataList2Item4: "Transparente Annahmen zum Markt",
    analysisTitle: "Objektanalyse",
    analysisSuccess: "Analyse erfolgreich abgeschlossen.",
    analysisEmpty: "Fuelle das Formular aus und starte die Analyse, um Ergebnisse zu sehen.",
    runAnalysis: "Analyse starten",
    newAnalysis: "Neue Analyse",
    saveAnalysis: "Analyse speichern",
    back: "Zurueck",
    next: "Weiter",
    dialogSaveTitle: "Analyse speichern",
    dialogSaveNotes: "Notizen (optional)",
    dialogCancel: "Abbrechen",
    dialogSaveCta: "Speichern",
    stepLocation: "Lage",
    stepProperty: "Objekt & Zustand",
    stepListing: "Inserat & Markt",
    stepFinancing: "Finanzierung & Kosten",
    plz: "PLZ",
    city: "Stadt",
    district: "Stadtteil",
    propertyType: "Objektart",
    condition: "Zustand",
    energyClass: "Energieeffizienzklasse",
    surface: "Wohnfläche (m²)",
    rooms: "Zimmer",
    yearBuilt: "Baujahr",
    floor: "Etage",
    elevator: "Aufzug im Gebäude",
    balcony: "Balkon / Terrasse",
    listingYear: "Inseratsjahr",
    listingQuarter: "Inseratsquartal (1-4)",
    priceBuy: "Kaufpreis (EUR)",
    renoCost: "Sanierungskosten (EUR)",
    greixIndex: "GREIX-Index",
    hpiIndex: "HPI-Index",
    mortgageRate: "Hypothekenzins 10J",
    pricePerM2: "Preis pro m²",
    renoPerM2: "Sanierungskosten pro m²",
    rentMonth: "Erwartete Monatsmiete (EUR) [optional]",
    holdingMonths: "Haltezeit (Monate)",
    financingTitle: "Finanzierung",
    feesTitle: "Kaufnebenkosten",
    ltv: "Beleihungsauslauf (LTV)",
    fixYears: "Zinsbindung",
    grunderwerb: "Grunderwerbsteuer (%)",
    notaryFee: "Notar & Grundbuch (%)",
    agentFee: "Maklercourtage (%) [optional]",
    otherFees: "Weitere Kosten (€) [optional]",
    selectDistrict: "Stadtteil wählen",
    selectCondition: "Zustand wählen",
    selectEnergy: "Energieklasse wählen",
    selectPropertyType: "Objektart wählen",
    analysesTitle: "Meine Analysen",
    analysesNew: "Neue Analyse",
    analysesEmpty: "Noch keine Analyse vorhanden.",
    analysesCta: "Objekt analysieren",
    analysesDecision: "Entscheidung",
    analysesROI: "Rendite",
    analysesConfidence: "Vertrauen",
    analysesFailed: "Analysedaten konnten nicht geladen werden",
    analysesSigninTitle: "Meine Analysen",
    analysesSigninDesc: "Melde dich an, um deine gespeicherten Analysen zu sehen und zu verwalten.",
    analysesSignin: "Anmelden",
    analysesSignup: "Registrieren",
    paginationPrev: "Zurueck",
    paginationNext: "Weiter",
    discussionsTitle: "Austausch",
    discussionsSubtitle: "Sieh dir an, was dein Team bewertet, und steige in die Diskussion ein.",
    discussionsEmpty: "Noch keine Diskussionen.",
    discussionsFailed: "Diskussionen konnten nicht geladen werden. Bitte versuche es später erneut.",
    discussionsView: "Ansehen & Kommentieren",
    discussionsSharedBy: "Geteilt von",
    usersTitle: "Benutzerverwaltung",
    usersAdd: "Benutzer hinzufügen",
    usersClose: "Schließen",
    usersCreate: "Anlegen",
    usersCreating: "Wird angelegt...",
    usersCancel: "Abbrechen",
    usersFailed: "Benutzer konnten nicht geladen werden",
    usersEmail: "E-Mail",
    usersPassword: "Passwort",
    usersRole: "Rolle",
    usersAdmin: "Admin",
    usersUser: "User",
    investmentDecision: "Investitionsentscheidung",
    confidenceLevel: "Vertrauensniveau",
    decisionBuy: "Kaufen",
    decisionDontBuy: "Nicht kaufen",
    estimatedROI: "Erwartete Rendite",
    capRate: "Kapitalrendite (Cap Rate)",
    capRateNA: "k.A.",
    pricePerM2PostReno: "Preis pro m² (nach Sanierung)",
    kpiRoiDetail: "Netto-Ertrag im Verhältnis zum eingesetzten Kapital.",
    kpiCapDetail: "Jahresmiete dividiert durch die Investitionssumme.",
    kpiPriceDetail: "Prognostizierter Wiederverkaufswert pro Quadratmeter nach Sanierung.",
    summaryTitle: "Zusammenfassung & Annahmen",
    summaryPara1:
      "Nach der Sanierung erwarten wir einen Wert von rund {postReno} und nach der geplanten Haltedauer etwa {futureSale}.",
    summaryPara2:
      "Ihre Gesamtausgaben (Kaufpreis, Sanierung, Gebühren) liegen bei ungefähr {totalCost}. Die erwartete Rendite beträgt {roiTotal} und ergibt sich aus der Differenz zwischen Gesamtaufwand und künftigem Verkaufspreis bei moderatem Marktwachstum.",
    summaryPara3:
      "Wenn Sanierungsaufwertung und erwartete Wertsteigerung eintreffen, kann der Deal sinnvoll sein; sonst sollten Kaufpreis oder Sanierungskosten gesenkt werden. Längere Haltedauer oder stärkeres Marktwachstum verbessern das Ergebnis, höhere Kosten oder stagnierende Preise verschlechtern es.",
    chartProjected: "Wertentwicklung über die Haltedauer",
    chartInvest: "Investitionsaufteilung",
    chartInvestPurchase: "Kaufpreis",
    chartInvestRenovation: "Sanierung",
    chartInvestFees: "Nebenkosten",
    chartDrivers: "Werttreiber",
    chartRoiScenarios: "ROI-Szenarien",
    chartPessimistic: "Pessimistisch",
    chartBase: "Basis",
    chartOptimistic: "Optimistisch",
    driverGreix: "GREIX-Momentum",
    driverHpi: "HPI-Trend",
    driverUplift: "Sanierungs-Uplift",
    driverCostIntensity: "Sanierungskosten-Intensität",
    chartYearUnit: "J",
    chartToday: "Heute",
    chartFuture: "In {years} {unit}",
  },
}


