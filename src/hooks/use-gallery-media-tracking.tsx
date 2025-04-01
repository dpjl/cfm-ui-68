
import { useEffect, useRef, useState } from 'react';
import type { FixedSizeGrid } from 'react-window';
import { MediaItemWithDate } from '@/types/gallery';
import { fetchMediaWithDates } from '@/api/imageApi';

/**
 * Hook pour gérer le suivi des médias dans la galerie et leur affichage
 * Optimisé pour éviter les réinitialisations inutiles du défilement
 */
export function useGalleryMediaTracking(
  mediaIds: string[], 
  gridRef: React.RefObject<FixedSizeGrid>
) {
  const prevMediaIdsRef = useRef<string[]>([]);
  
  // Détecter uniquement les changements importants dans les médias
  useEffect(() => {
    const prevMediaIds = prevMediaIdsRef.current;
    
    // Vérifier s'il y a eu un changement significatif dans les médias
    const significantMediaChange = Math.abs(mediaIds.length - prevMediaIds.length) > 20;
    
    if (significantMediaChange && gridRef.current) {
      // Stocker la liste actuelle comme référence
      prevMediaIdsRef.current = [...mediaIds];
      
      // Faire remonter la grille vers le haut
      gridRef.current.scrollTo({ scrollTop: 0 });
    }
  }, [mediaIds, gridRef]);
}

/**
 * Hook pour récupérer les médias avec leurs dates de création
 * Cette fonction est destinée à être utilisée pour implémenter des fonctionnalités 
 * de navigation basées sur les dates ultérieurement
 */
export function useMediaWithDates(
  directory: string,
  position: 'source' | 'destination',
  filter: string = 'all'
) {
  const [mediaWithDates, setMediaWithDates] = useState<MediaItemWithDate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    
    async function loadMediaWithDates() {
      if (!directory) return;
      
      setLoading(true);
      try {
        const data = await fetchMediaWithDates(directory, position, filter);
        if (isMounted) {
          setMediaWithDates(data);
          setError(null);
        }
      } catch (err) {
        console.error('Error fetching media with dates:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to fetch media with dates'));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }
    
    loadMediaWithDates();
    
    return () => {
      isMounted = false;
    };
  }, [directory, position, filter]);

  return {
    mediaWithDates,
    loading,
    error,
    // Fonction utilitaire pour obtenir les dates uniques (pour une future implémentation de navigateur de dates)
    getUniqueDates: (): string[] => {
      const dates = mediaWithDates
        .filter(item => item.createdAt)
        .map(item => {
          const date = new Date(item.createdAt as string);
          return date.toISOString().split('T')[0]; // Format YYYY-MM-DD
        });
      
      return [...new Set(dates)].sort();
    },
    // Fonction pour obtenir les médias d'une date spécifique
    getMediaForDate: (date: string): string[] => {
      return mediaWithDates
        .filter(item => item.createdAt && item.createdAt.startsWith(date))
        .map(item => item.id);
    }
  };
}
