
import { useGalleryContext } from '@/contexts/GalleryContext';

/**
 * Hook principal pour accéder à toutes les fonctionnalités de la galerie
 * Sert de point d'entrée unifié à l'état de l'application
 */
export function useGalleryState() {
  // Récupérer toutes les valeurs et méthodes du contexte
  const context = useGalleryContext();
  
  return {
    // Exposer toutes les fonctionnalités du contexte
    ...context,
    
    // Méthodes composées pour des cas d'utilisations courants
    selectAndPreviewLeft: (id: string) => {
      if (!context.selectedIdsLeft.includes(id)) {
        context.setSelectedIdsLeft(prev => [...prev, id]);
      }
      context.setActiveSide('left');
    },
    
    selectAndPreviewRight: (id: string) => {
      if (!context.selectedIdsRight.includes(id)) {
        context.setSelectedIdsRight(prev => [...prev, id]);
      }
      context.setActiveSide('right');
    }
  };
}
