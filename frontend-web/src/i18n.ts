import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: "en",
    debug: false,
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    backend: {
      loadPath: "/locales/{{lng}}/{{ns}}.json",
    },
    ns: ["common", "auth", "nav", "dashboard", "inventory", "sales", "purchases", "suppliers", "clients", "team", "returns", "expenses", "billing", "settings", "ai", "community", "home", "invoices", "fiscal", "reports", "quality", "admin", "audit", "jobs", "stockLedger", "production", "restock", "tasks", "errors", "landing", "translation"],
    defaultNS: "translation",
    fallbackNS: "translation",
    load: "languageOnly",
    detection: {
      order: ["localStorage", "cookie", "navigator"],
      caches: ["localStorage", "cookie"],
    },
    react: {
      useSuspense: true,
    }
  });

const syncLanguage = (lng?: string) => {
  const currentLng = lng || i18n.language || "en";
  const dir = currentLng === "ar" ? "rtl" : "ltr";
  
  // 1. Update DOM attributes
  document.documentElement.dir = dir;
  document.documentElement.lang = currentLng;
  document.body.dir = dir;
  
  // 2. Inject Language-Specific Classes
  document.body.classList.remove("lang-en", "lang-fr", "lang-ar");
  document.body.classList.add(`lang-${currentLng}`);

  // 3. Dynamic Font Loading
  if (currentLng === "ar") {
    document.body.style.fontFamily = "'Inter', 'IBM Plex Sans Arabic', sans-serif";
  } else {
    document.body.style.fontFamily = "'Inter', sans-serif";
  }

  // 4. Persistence Guard
  localStorage.setItem("i18nextLng", currentLng);
};

// --- INITIAL SYNCHRONIZATION ---
i18n.on("initialized", () => syncLanguage());
i18n.on("languageChanged", (lng) => syncLanguage(lng));

export default i18n;
