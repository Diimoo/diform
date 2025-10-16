import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation resources
const resources = {
  en: {
    translation: {
      // Navigation
      nav: {
        home: 'Home',
        features: 'Features',
        architecture: 'Architecture',
        security: 'Security',
        docs: 'Docs',
        tryDemo: 'Try Demo'
      },
      // Hero Section
      hero: {
        title: 'Work Done, Not Just Assisted',
        subtitle: 'AI that executes your workflow end-to-end. No prompts, no back-and-forth. Just results.',
        cta: 'Get Started',
        learnMore: 'Learn More'
      },
      // Features
      features: {
        title: 'Why Choose DIForM?',
        autonomous: {
          title: 'Autonomous Execution',
          description: 'Tell us what needs to be done. We handle the entire workflow.'
        },
        multiPlatform: {
          title: 'Multi-Platform',
          description: 'Web, Desktop, and Mobile apps - work from anywhere.'
        },
        secure: {
          title: 'Enterprise Security',
          description: 'Bank-level encryption, JWT auth, and comprehensive audit logs.'
        },
        local: {
          title: 'Local-First AI',
          description: 'Your data stays on your infrastructure with Ollama integration.'
        }
      },
      // Security
      security: {
        title: 'Enterprise-Grade Security',
        authentication: 'JWT Authentication',
        encryption: 'End-to-End Encryption',
        compliance: 'GDPR & CCPA Compliant',
        auditing: 'Comprehensive Audit Logs'
      },
      // Demo
      demo: {
        title: 'Try DIForM',
        placeholder: 'Enter your task...',
        submit: 'Execute',
        close: 'Close',
        processing: 'Processing...',
        error: 'An error occurred'
      },
      // Footer
      footer: {
        description: 'Work done, not just assisted. Transforming enterprise productivity through intelligent automation.',
        product: 'Product',
        features: 'Features',
        architecture: 'Architecture',
        security: 'Security',
        documentation: 'Documentation',
        company: 'Company',
        about: 'About',
        blog: 'Blog',
        careers: 'Careers',
        contact: 'Contact',
        legal: 'Legal',
        privacy: 'Privacy',
        terms: 'Terms',
        securityPolicy: 'Security',
        compliance: 'Compliance',
        copyright: '© 2024 DIForM. All rights reserved. Work gets done.'
      },
      // Common
      common: {
        loading: 'Loading...',
        error: 'Error',
        success: 'Success',
        retry: 'Retry',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        close: 'Close',
        back: 'Back',
        next: 'Next',
        submit: 'Submit',
        search: 'Search',
        filter: 'Filter',
        sort: 'Sort',
        export: 'Export',
        import: 'Import'
      }
    }
  },
  de: {
    translation: {
      nav: {
        home: 'Startseite',
        features: 'Funktionen',
        architecture: 'Architektur',
        security: 'Sicherheit',
        docs: 'Dokumentation',
        tryDemo: 'Demo testen'
      },
      hero: {
        title: 'Arbeit wird',
        titleDone: 'Erledigt',
        subtitle: 'DIForM versteht den Kontext, entscheidet über den nächsten logischen Schritt und führt ihn proaktiv aus – sicher, nachverfolgbar und prüfbar.',
        ctaPrimary: 'Interaktive Demo testen',
        ctaSecondary: 'So funktioniert es'
      },
      features: {
        title: 'Warum DIForM wählen?',
        autonomous: {
          title: 'Autonome Ausführung',
          description: 'Sagen Sie uns, was getan werden muss. Wir übernehmen den gesamten Workflow.'
        },
        multiPlatform: {
          title: 'Multi-Plattform',
          description: 'Web-, Desktop- und Mobile-Apps - arbeiten Sie von überall.'
        },
        secure: {
          title: 'Unternehmenssicherheit',
          description: 'Verschlüsselung auf Bankniveau, JWT-Authentifizierung und umfassende Audit-Protokolle.'
        },
        local: {
          title: 'Lokale KI zuerst',
          description: 'Ihre Daten bleiben auf Ihrer Infrastruktur mit Ollama-Integration.'
        }
      },
      security: {
        title: 'Unternehmenssicherheit',
        authentication: 'JWT-Authentifizierung',
        encryption: 'Ende-zu-Ende-Verschlüsselung',
        compliance: 'DSGVO & CCPA konform',
        auditing: 'Umfassende Audit-Protokolle'
      },
      demo: {
        title: 'Interaktive DIForM Demo',
        examplesLabel: 'Probieren Sie diese Beispiele:',
        example1: 'Fassen Sie die Kunden-E-Mails der letzten 48 Stunden für Projekt X zusammen, erstellen Sie Antworten, planen Sie 2 Meetings nächste Woche und aktualisieren Sie die Führungspräsentation.',
        example2: 'Erstellen Sie eine QBR-Präsentation aus diesen Excel-Daten mit Risiken, Chancen und 3 Empfehlungen - maximal 10 Folien.',
        example3: 'Bereiten Sie die Onboarding-Checkliste vor, weisen Sie Aufgaben in Planner zu und laden Sie alle zum Kick-off-Meeting ein.',
        example4: 'Erklären Sie die Q3-Abweichungen, erstellen Sie eine Pivot-Tabelle, generieren Sie ein Diagramm und geben Sie Empfehlungen.',
        placeholder: 'Beschreiben Sie, was DIForM für Sie tun soll...',
        submit: 'Absenden',
        close: 'Schließen',
        processing: 'DIForM verarbeitet Ihre Anfrage...',
        success: 'Aufgabe erfolgreich abgeschlossen',
        error: 'Befehl konnte nicht verarbeitet werden. Bitte versuchen Sie es erneut.',
        completedIn: 'Abgeschlossen in',
        phases: {
          understand: 'VERSTEHEN',
          plan: 'PLANEN',
          execute: 'AUSFÜHREN',
          verify: 'ÜBERPRÜFEN'
        },
        steps: {
          analyzed: 'Ihre Anfrage analysiert',
          analyzedDesc: 'Befehl analysiert und Hauptaufgaben sowie Anforderungen identifiziert.',
          plan: 'Ausführungsplan erstellt',
          planDesc: 'Aufgaben in optimaler Reihenfolge mit Ressourcenzuweisung organisiert.',
          executed: 'Aufgaben ausgeführt',
          executedDesc: 'Alle erforderlichen Aktionen sicher und effizient abgeschlossen.',
          verified: 'Ergebnisse überprüft',
          verifiedDesc: 'Erfolgreiche Fertigstellung und Qualität der Ausgaben bestätigt.',
          actions: {
            extracted: 'Aktionselemente extrahiert',
            identified: 'Abhängigkeiten identifiziert',
            validated: 'Machbarkeit validiert',
            prioritized: 'Schritte priorisiert',
            allocated: 'Ressourcen zugewiesen',
            monitoring: 'Überwachung eingerichtet',
            processed: 'Daten verarbeitet',
            generated: 'Ausgaben generiert',
            applied: 'Validierungen angewendet',
            validatedResults: 'Ergebnisse validiert',
            checked: 'Qualität geprüft',
            logged: 'Abschluss protokolliert'
          }
        }
      },
      footer: {
        description: 'Arbeit erledigt, nicht nur unterstützt. Transformation der Unternehmensproduktivität durch intelligente Automatisierung.',
        product: 'Produkt',
        features: 'Funktionen',
        architecture: 'Architektur',
        security: 'Sicherheit',
        documentation: 'Dokumentation',
        company: 'Unternehmen',
        about: 'Über uns',
        blog: 'Blog',
        careers: 'Karriere',
        contact: 'Kontakt',
        legal: 'Rechtliches',
        privacy: 'Datenschutz',
        terms: 'Nutzungsbedingungen',
        securityPolicy: 'Sicherheit',
        compliance: 'Compliance',
        copyright: '© 2024 DIForM. Alle Rechte vorbehalten. Die Arbeit wird erledigt.'
      },
      common: {
        loading: 'Laden...',
        error: 'Fehler',
        success: 'Erfolg',
        retry: 'Wiederholen',
        cancel: 'Abbrechen',
        save: 'Speichern',
        delete: 'Löschen',
        edit: 'Bearbeiten',
        close: 'Schließen',
        back: 'Zurück',
        next: 'Weiter',
        submit: 'Absenden',
        search: 'Suchen',
        filter: 'Filtern',
        sort: 'Sortieren',
        export: 'Exportieren',
        import: 'Importieren'
      }
    }
  },
  es: {
    translation: {
      nav: {
        home: 'Inicio',
        features: 'Características',
        security: 'Seguridad',
        docs: 'Documentación',
        tryDemo: 'Probar Demo'
      },
      hero: {
        title: 'Trabajo realizado, no solo asistido',
        subtitle: 'IA que ejecuta tu flujo de trabajo de principio a fin. Sin indicaciones, sin ida y vuelta. Solo resultados.',
        cta: 'Comenzar',
        learnMore: 'Aprende más'
      },
      demo: {
        title: 'Probar DIForM',
        placeholder: 'Ingrese su tarea...',
        submit: 'Ejecutar',
        close: 'Cerrar',
        processing: 'Procesando...',
        error: 'Ocurrió un error'
      },
      common: {
        loading: 'Cargando...',
        error: 'Error',
        success: 'Éxito',
        retry: 'Reintentar',
        cancel: 'Cancelar',
        save: 'Guardar',
        delete: 'Eliminar',
        edit: 'Editar',
        close: 'Cerrar',
        back: 'Atrás',
        next: 'Siguiente',
        submit: 'Enviar',
        search: 'Buscar',
        filter: 'Filtrar',
        sort: 'Ordenar',
        export: 'Exportar',
        import: 'Importar'
      }
    }
  },
  fr: {
    translation: {
      nav: {
        home: 'Accueil',
        features: 'Fonctionnalités',
        security: 'Sécurité',
        docs: 'Documentation',
        tryDemo: 'Essayer la démo'
      },
      hero: {
        title: 'Travail accompli, pas seulement assisté',
        subtitle: 'IA qui exécute votre flux de travail de bout en bout. Pas d\'invites, pas d\'allers-retours. Juste des résultats.',
        cta: 'Commencer',
        learnMore: 'En savoir plus'
      },
      demo: {
        title: 'Essayer DIForM',
        placeholder: 'Entrez votre tâche...',
        submit: 'Exécuter',
        close: 'Fermer',
        processing: 'Traitement...',
        error: 'Une erreur s\'est produite'
      },
      common: {
        loading: 'Chargement...',
        error: 'Erreur',
        success: 'Succès',
        retry: 'Réessayer',
        cancel: 'Annuler',
        save: 'Enregistrer',
        delete: 'Supprimer',
        edit: 'Modifier',
        close: 'Fermer',
        back: 'Retour',
        next: 'Suivant',
        submit: 'Soumettre',
        search: 'Rechercher',
        filter: 'Filtrer',
        sort: 'Trier',
        export: 'Exporter',
        import: 'Importer'
      }
    }
  }
};

i18n
  // Detect user language
  .use(LanguageDetector)
  // Pass the i18n instance to react-i18next
  .use(initReactI18next)
  // Initialize i18next
  .init({
    resources,
    fallbackLng: 'en',
    lng: 'en', // Default language
    debug: process.env.NODE_ENV === 'development',
    
    // Language detection
    detection: {
      order: ['querystring', 'cookie', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage', 'cookie'],
    },

    interpolation: {
      escapeValue: false, // React already does escaping
    },

    react: {
      useSuspense: false,
    }
  });

export default i18n;
