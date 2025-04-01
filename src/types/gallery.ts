
// Renommer MobileViewMode en GalleryViewMode pour plus de cohérence
export type GalleryViewMode = 'both' | 'left' | 'right';

// ViewModeType est utilisé pour les calculs de colonnes
export type ViewModeType = 'desktop' | 'desktop-single' | 'mobile-split' | 'mobile-single';

// Interface optimisée pour la réponse API avec tableaux parallèles
export interface MediaListResponse {
  ids: string[];
  dates: number[]; // Timestamps Unix
}

// Media item with date for API response (maintenu pour compatibilité)
export interface MediaItemWithDate {
  id: string;
  createdAt?: string;
}

// Basic media item interface
export interface MediaItem {
  id: string;
  src?: string;
  alt?: string;
  createdAt?: string;
  isVideo?: boolean;
  directory?: string;
  type?: "image" | "video";
}

// Ensure all translation keys are properly typed
export type TranslationKey = 
  | 'date' | 'size' | 'camera' | 'path' | 'hash' | 'duplicates'
  | 'noMediaFound' | 'noDirectories'
  | 'media_gallery' | 'too_many_items_to_select' | 'close_sidebars'
  | 'columns' | 'single_selection' | 'multiple_selection'
  | 'desktop_columns' | 'desktop_single_columns' | 'split_columns' | 'single_columns'
  | 'delete_confirmation_title' | 'delete_confirmation_description' | 'deleting'
  | 'select_all' | 'deselect_all' | 'hide_dates' | 'show_dates' | 'selected' | 'refresh' | 'delete'
  | 'jump_to' | 'no_dates_available' | 'previous' | 'next';

// Nouveau type pour représenter une période (mois/année)
export interface DatePeriod {
  year: number;
  month: number;
  count: number; // Nombre de médias dans cette période
  label: string; // Format "Mai 2023"
}
