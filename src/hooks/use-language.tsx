
import { createContext, useContext, useState, ReactNode } from 'react';

// Define the supported languages
export type Language = 'en' | 'fr';

// Define the translations
const translations = {
  en: {
    selected: 'selected',
    select_all: 'Select all',
    deselect_all: 'Deselect all',
    show_dates: 'Show dates',
    hide_dates: 'Hide dates',
    gallery_settings: 'Gallery settings',
    preview: 'Preview',
    download: 'Download',
    delete: 'Delete',
    confirm_delete: 'Confirm delete',
    cancel: 'Cancel',
    media_gallery: 'Media Gallery',
    columns: 'Columns:',
    refresh: 'Refresh',
    close_sidebars: 'Close sidebars',
    multiple_selection: 'Enable multiple selection',
    single_selection: 'Switch to single selection',
    too_many_items_to_select: 'Too many items to select (>100)',
    // Add missing translations
    desktop_columns: 'Desktop columns',
    desktop_single_columns: 'Desktop full view columns',
    split_columns: 'Split view columns',
    single_columns: 'Single view columns',
    noDirectories: 'No directories',
    date: 'Date',
    size: 'Size',
    camera: 'Camera',
    path: 'Path',
    hash: 'Hash',
    duplicates: 'Duplicates',
    delete_confirmation_title: 'Delete selected media?',
    delete_confirmation_description: 'This will permanently delete the selected media. This action cannot be undone.',
    deleting: 'Deleting...',
    noMediaFound: 'No media found',
    errorLoadingMedia: 'Error loading media'
  },
  fr: {
    selected: 'sélectionné(s)',
    select_all: 'Tout sélectionner',
    deselect_all: 'Tout désélectionner',
    show_dates: 'Afficher les dates',
    hide_dates: 'Masquer les dates',
    gallery_settings: 'Paramètres de la galerie',
    preview: 'Aperçu',
    download: 'Télécharger',
    delete: 'Supprimer',
    confirm_delete: 'Confirmer la suppression',
    cancel: 'Annuler',
    media_gallery: 'Galerie médias',
    columns: 'Colonnes:',
    refresh: 'Actualiser',
    close_sidebars: 'Fermer les panneaux',
    multiple_selection: 'Activer la sélection multiple',
    single_selection: 'Passer à la sélection simple',
    too_many_items_to_select: 'Trop d\'éléments à sélectionner (>100)',
    // Add missing translations
    desktop_columns: 'Colonnes bureau',
    desktop_single_columns: 'Colonnes plein écran',
    split_columns: 'Colonnes vue partagée',
    single_columns: 'Colonnes vue unique',
    noDirectories: 'Aucun répertoire',
    date: 'Date',
    size: 'Taille',
    camera: 'Appareil photo',
    path: 'Chemin',
    hash: 'Hash',
    duplicates: 'Doublons',
    delete_confirmation_title: 'Supprimer les médias sélectionnés ?',
    delete_confirmation_description: 'Cette action supprimera définitivement les médias sélectionnés. Cette action est irréversible.',
    deleting: 'Suppression...',
    noMediaFound: 'Aucun média trouvé',
    errorLoadingMedia: 'Erreur lors du chargement des médias'
  }
};

// Now update the type for the translation keys to fix type checking
export type TranslationKey = keyof typeof translations.en;

// Create the context
type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, any>) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Create provider component
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('fr');

  const t = (key: TranslationKey, params?: Record<string, any>): string => {
    let text = translations[language][key] || key;
    
    // Handle interpolation if params are provided
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        text = text.replace(`{${paramKey}}`, String(paramValue));
      });
    }
    
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Create hook for using the language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
};
