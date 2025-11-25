export type TranslationKeys =
  | "home"
  | "dashboard"
  | "analyze"
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
  | "heroGuestNote"
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
  | "analysisGuestNote"
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
    analyze: "Analyze",
    analyses: "Analyses",
    discussions: "Discussions",
    users: "Users",
    signIn: "Sign In",
    signUp: "Sign Up",
    language: "Language",
    brand: "RealEstate.AI",
    dashboardTitle: "Analytics Dashboard",
    askAI: "Ask AI",
    totalRequests: "Total requests",
    avgConfidence: "Avg confidence",
    buyRate: "Buy rate",
    avgRoi: "Average ROI",
    noAnalyses: "You have not saved any analyses yet.",
    dashboardPrompt: "Sign in to view your analytics dashboard.",
    lastUpdated: "Last updated",
    heroTitle: "Germany Real Estate Investment Intelligence",
    heroSubtitle:
      "AI-powered analysis to make smarter real estate investment decisions. Get instant ROI estimates, confidence scores, and clear value drivers.",
    heroGuestNote: "Run analyses without an account. Sign in or create one to save and revisit them.",
    heroCta: "Start analysis",
    feature1Title: "Instant ROI analysis",
    feature1Description: "Get estimated ROI, cap rate, and post-renovation valuations in seconds.",
    feature2Title: "Market-grounded insights",
    feature2Description: "Built for German market prices, financing, and rent levels.",
    feature3Title: "Decision confidence",
    feature3Description: "Recommendation with the key reasons to buy or pass.",
    dataTitle1: "Real market data",
    dataTitle2: "What you get",
    dataList1Item1: "Bundesbank mortgage rates",
    dataList1Item2: "Destatis price indices",
    dataList1Item3: "Rent benchmarks and comps",
    dataList1Item4: "Location and access scoring",
    dataList2Item1: "Buy or do not buy recommendation",
    dataList2Item2: "ROI and cap rate calculations",
    dataList2Item3: "Feature importance highlights",
    dataList2Item4: "Transparent market assumptions",
    analysisTitle: "Property analyzer",
    analysisGuestNote: "Analysis is open to everyone. Sign in or create an account to save and organize your results.",
    analysisSuccess: "Analysis completed successfully.",
    analysisEmpty: "Fill out the form and submit to see analysis results here.",
    runAnalysis: "Run analysis",
    newAnalysis: "New analysis",
    saveAnalysis: "Save analysis",
    back: "Back",
    next: "Next",
    dialogSaveTitle: "Save analysis",
    dialogSaveNotes: "Notes (optional)",
    dialogCancel: "Cancel",
    dialogSaveCta: "Save",
    stepLocation: "Location",
    stepProperty: "Property and condition",
    stepListing: "Listing and market",
    stepFinancing: "Financing and fees",
    plz: "PLZ (postal code)",
    city: "City",
    district: "District",
    propertyType: "Property type",
    condition: "Condition",
    energyClass: "Energy efficiency class",
    surface: "Surface area (sqm)",
    rooms: "Rooms",
    yearBuilt: "Year built",
    floor: "Floor",
    elevator: "Elevator in building",
    balcony: "Balcony / Terrace",
    listingYear: "Listing year",
    listingQuarter: "Listing quarter (1-4)",
    priceBuy: "Purchase price (EUR)",
    renoCost: "Renovation cost (EUR)",
    greixIndex: "GREIX index",
    hpiIndex: "HPI index",
    mortgageRate: "Mortgage rate 10y",
    pricePerM2: "Price per sqm",
    renoPerM2: "Renovation cost per sqm",
    rentMonth: "Expected rent per month (EUR, optional)",
    holdingMonths: "Holding period (months)",
    financingTitle: "Financing",
    feesTitle: "Fees",
    ltv: "Loan-to-value (LTV)",
    fixYears: "Fixed rate period",
    grunderwerb: "Land transfer tax (%)",
    notaryFee: "Notary fee (%)",
    agentFee: "Agent fee (%) (optional)",
    otherFees: "Other fees (optional)",
    selectDistrict: "Choose district",
    selectCondition: "Select condition",
    selectEnergy: "Select class",
    selectPropertyType: "Select property type",
    analysesTitle: "My analyses",
    analysesNew: "New analysis",
    analysesEmpty: "No analyses available yet.",
    analysesCta: "Analyze property",
    analysesDecision: "Decision",
    analysesROI: "ROI",
    analysesConfidence: "Confidence",
    analysesFailed: "Failed to load analysis data.",
    analysesSigninTitle: "My analyses",
    analysesSigninDesc: "Sign in to view and manage your saved analyses.",
    analysesSignin: "Sign in",
    analysesSignup: "Sign up",
    paginationPrev: "Previous",
    paginationNext: "Next",
    discussionsTitle: "Discussion board",
    discussionsSubtitle: "See what your teammates are evaluating and jump into the discussion.",
    discussionsEmpty: "No discussions yet.",
    discussionsFailed: "Unable to load discussion threads. Please try again in a moment.",
    discussionsView: "View and comment",
    discussionsSharedBy: "Shared by",
    usersTitle: "User management",
    usersAdd: "Add user",
    usersClose: "Close",
    usersCreate: "Create",
    usersCreating: "Creating...",
    usersCancel: "Cancel",
    usersFailed: "Failed to load users.",
    usersEmail: "Email",
    usersPassword: "Password",
    usersRole: "Role",
    usersAdmin: "Admin",
    usersUser: "User",
    investmentDecision: "Investment decision",
    confidenceLevel: "Confidence level",
    decisionBuy: "Buy",
    decisionDontBuy: "Do not buy",
    estimatedROI: "Estimated ROI",
    capRate: "Cap rate",
    capRateNA: "N/A",
    pricePerM2PostReno: "Price per sqm (post-reno)",
    kpiRoiDetail: "Net gain relative to the capital deployed.",
    kpiCapDetail: "Annual rent divided by the invested amount.",
    kpiPriceDetail: "Projected resale value per square metre after works.",
    summaryTitle: "Summary and assumptions",
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
    analyze: "Analysieren",
    analyses: "Analysen",
    discussions: "Diskussionen",
    users: "Benutzer",
    signIn: "Anmelden",
    signUp: "Registrieren",
    language: "Sprache",
    brand: "RealEstate.AI",
    dashboardTitle: "Analyse-Dashboard",
    askAI: "KI fragen",
    totalRequests: "Anfragen gesamt",
    avgConfidence: "Durchschnittliches Vertrauen",
    buyRate: "Kaufquote",
    avgRoi: "Durchschnittlicher ROI",
    noAnalyses: "Noch keine Analysen gespeichert.",
    dashboardPrompt: "Bitte anmelden, um das Dashboard zu sehen.",
    lastUpdated: "Zuletzt aktualisiert",
    heroTitle: "Intelligenz fuer Immobilieninvestitionen in Deutschland",
    heroSubtitle:
      "KI-gestuetzte Analysen fuer bessere Entscheidungen. Sofortige Rendite, Vertrauenswert und klare Werttreiber.",
    heroGuestNote: "Analysen lassen sich ohne Konto starten. Zum Speichern und Teilen bitte anmelden oder registrieren.",
    heroCta: "Analyse starten",
    feature1Title: "Schnelle ROI-Analyse",
    feature1Description: "Rendite, Cap Rate und Wert nach Sanierung in Sekunden.",
    feature2Title: "Marktorientierte Insights",
    feature2Description: "Ausgelegt auf deutsche Preise, Finanzierung und Mietniveaus.",
    feature3Title: "Sichere Entscheidung",
    feature3Description: "Empfehlung mit den wichtigsten Gruenden fuer Kauf oder Absage.",
    dataTitle1: "Reale Marktdaten",
    dataTitle2: "Dein Mehrwert",
    dataList1Item1: "Aktuelle Hypothekenzinsen (Bundesbank)",
    dataList1Item2: "Preisindizes (Destatis)",
    dataList1Item3: "Mietspiegel und regionale Benchmarks",
    dataList1Item4: "Lage- und Erreichbarkeits-Score",
    dataList2Item1: "Kauf- oder Nicht-Kauf-Empfehlung",
    dataList2Item2: "Berechnete Rendite und Cap Rate",
    dataList2Item3: "Wichtigste Einflussfaktoren",
    dataList2Item4: "Transparente Marktannahmen",
    analysisTitle: "Objektanalyse",
    analysisGuestNote: "Analysen sind ohne Konto moeglich. Zum Speichern bitte anmelden oder ein Konto anlegen.",
    analysisSuccess: "Analyse erfolgreich abgeschlossen.",
    analysisEmpty: "Formular ausfuellen und senden, um Ergebnisse zu sehen.",
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
    stepProperty: "Objekt und Zustand",
    stepListing: "Inserat und Markt",
    stepFinancing: "Finanzierung und Kosten",
    plz: "PLZ",
    city: "Stadt",
    district: "Stadtteil",
    propertyType: "Objektart",
    condition: "Zustand",
    energyClass: "Energieeffizienzklasse",
    surface: "Flaeche (qm)",
    rooms: "Zimmer",
    yearBuilt: "Baujahr",
    floor: "Etage",
    elevator: "Aufzug im Gebaeude",
    balcony: "Balkon / Terrasse",
    listingYear: "Inseratsjahr",
    listingQuarter: "Inseratsquartal (1-4)",
    priceBuy: "Kaufpreis (EUR)",
    renoCost: "Sanierungskosten (EUR)",
    greixIndex: "GREIX-Index",
    hpiIndex: "HPI-Index",
    mortgageRate: "Hypothekenzins 10J",
    pricePerM2: "Preis pro qm",
    renoPerM2: "Sanierungskosten pro qm",
    rentMonth: "Erwartete Monatsmiete (EUR, optional)",
    holdingMonths: "Haltezeit (Monate)",
    financingTitle: "Finanzierung",
    feesTitle: "Kaufnebenkosten",
    ltv: "Beleihungsauslauf (LTV)",
    fixYears: "Zinsbindung",
    grunderwerb: "Grunderwerbsteuer (%)",
    notaryFee: "Notar- und Grundbuch (%)",
    agentFee: "Maklercourtage (%) (optional)",
    otherFees: "Weitere Kosten (optional)",
    selectDistrict: "Stadtteil waehlen",
    selectCondition: "Zustand waehlen",
    selectEnergy: "Energieklasse waehlen",
    selectPropertyType: "Objektart waehlen",
    analysesTitle: "Meine Analysen",
    analysesNew: "Neue Analyse",
    analysesEmpty: "Noch keine Analysen vorhanden.",
    analysesCta: "Objekt analysieren",
    analysesDecision: "Entscheidung",
    analysesROI: "Rendite",
    analysesConfidence: "Vertrauen",
    analysesFailed: "Analysedaten konnten nicht geladen werden.",
    analysesSigninTitle: "Meine Analysen",
    analysesSigninDesc: "Bitte anmelden, um gespeicherte Analysen zu sehen und zu verwalten.",
    analysesSignin: "Anmelden",
    analysesSignup: "Registrieren",
    paginationPrev: "Zurueck",
    paginationNext: "Weiter",
    discussionsTitle: "Austausch",
    discussionsSubtitle: "Sieh dir an, was dein Team bewertet, und steige in die Diskussion ein.",
    discussionsEmpty: "Noch keine Diskussionen.",
    discussionsFailed: "Diskussionen konnten nicht geladen werden. Bitte spaeter erneut versuchen.",
    discussionsView: "Ansehen und kommentieren",
    discussionsSharedBy: "Geteilt von",
    usersTitle: "Benutzerverwaltung",
    usersAdd: "Benutzer hinzufuegen",
    usersClose: "Schliessen",
    usersCreate: "Anlegen",
    usersCreating: "Wird angelegt...",
    usersCancel: "Abbrechen",
    usersFailed: "Benutzer konnten nicht geladen werden.",
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
    capRateNA: "k. A.",
    pricePerM2PostReno: "Preis pro qm (nach Sanierung)",
    kpiRoiDetail: "Netto-Ertrag im Verhaeltnis zum eingesetzten Kapital.",
    kpiCapDetail: "Jahresmiete geteilt durch die Investitionssumme.",
    kpiPriceDetail: "Erwarteter Wiederverkaufswert pro Quadratmeter nach der Sanierung.",
    summaryTitle: "Zusammenfassung und Annahmen",
    summaryPara1:
      "Nach der Sanierung erwarten wir einen Wert von rund {postReno} und nach der geplanten Haltedauer etwa {futureSale}.",
    summaryPara2:
      "Ihre Gesamtausgaben (Kaufpreis, Sanierung, Gebuehren) liegen bei etwa {totalCost}. Die erwartete Rendite betraegt {roiTotal} und ergibt sich aus der Differenz zwischen Gesamtaufwand und zukuenftigen Verkaufspreis.",
    summaryPara3:
      "Wenn Aufwertung und erwartete Wertsteigerung eintreffen, kann der Deal sinnvoll sein. Ansonsten Kaufpreis oder Sanierungskosten senken. Laengere Haltedauer oder staerkeres Marktwachstum verbessern das Ergebnis.",
    chartProjected: "Wertentwicklung ueber die Haltedauer",
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
    driverCostIntensity: "Kostenintensitaet Sanierung",
    chartYearUnit: "J",
    chartToday: "Heute",
    chartFuture: "In {years} {unit}",
  },
}
