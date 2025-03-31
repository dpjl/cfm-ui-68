
import { useState, useEffect, useCallback, useRef } from 'react';
import { DetailedMediaInfo } from '@/api/imageApi';
import { MediaItemWithDate } from '@/api/imageApi';

interface UseGalleryVisibleDateOptions {
  mediaInfoMap: Map<string, DetailedMediaInfo | null>;
  mediaItemsWithDates?: MediaItemWithDate[];
  scrollingElementRef?: React.RefObject<HTMLElement>;
  isEnabled?: boolean;
}

export function useGalleryVisibleDate({
  mediaInfoMap,
  mediaItemsWithDates = [],
  scrollingElementRef,
  isEnabled = true
}: UseGalleryVisibleDateOptions) {
  const [visibleDate, setVisibleDate] = useState<string | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isScrollingRef = useRef(false);
  
  // Créer une map d'ID à date pour un accès rapide
  const idToDateMap = useRef(new Map<string, string>());
  
  // Mettre à jour la map d'ID à date quand mediaItemsWithDates change
  useEffect(() => {
    const newMap = new Map<string, string>();
    mediaItemsWithDates.forEach(item => {
      if (item.createdAt) {
        newMap.set(item.id, item.createdAt);
      }
    });
    idToDateMap.current = newMap;
  }, [mediaItemsWithDates]);
  
  // Fonction pour détecter les éléments visibles et leur date
  const checkVisibleElements = useCallback(() => {
    if (!isEnabled) return;
    
    // Obtenir l'élément conteneur pour le scroll
    const scrollElement = scrollingElementRef?.current;
    if (!scrollElement) return;
    
    // Obtenir les dimensions de la fenêtre visible
    const containerRect = scrollElement.getBoundingClientRect();
    const containerTop = containerRect.top;
    const containerBottom = containerRect.bottom;
    
    // Trouver tous les éléments média dans le conteneur
    const mediaElements = scrollElement.querySelectorAll('[data-media-id]');
    if (mediaElements.length === 0) return;
    
    // Trouver le premier élément visible
    let firstVisibleElement: Element | null = null;
    
    for (let i = 0; i < mediaElements.length; i++) {
      const element = mediaElements[i];
      const rect = element.getBoundingClientRect();
      
      // Vérifier si l'élément est visible
      const isVisible = (
        rect.top >= containerTop &&
        rect.top <= containerBottom
      );
      
      if (isVisible) {
        firstVisibleElement = element;
        break;
      }
    }
    
    // Si nous avons trouvé un élément visible, obtenir sa date
    if (firstVisibleElement) {
      const mediaId = firstVisibleElement.getAttribute('data-media-id');
      if (mediaId) {
        // Essayer d'abord la map d'ID à date pour une recherche plus rapide
        const cachedDate = idToDateMap.current.get(mediaId);
        if (cachedDate) {
          setVisibleDate(cachedDate);
          return;
        }
        
        // Fallback à mediaInfoMap
        const mediaInfo = mediaInfoMap.get(mediaId);
        if (mediaInfo && mediaInfo.createdAt) {
          setVisibleDate(mediaInfo.createdAt);
        }
      }
    } else {
      // Aucun élément visible dans la vue
      setVisibleDate(null);
    }
  }, [mediaInfoMap, scrollingElementRef, isEnabled]);
  
  // Gérer le scroll
  useEffect(() => {
    if (!isEnabled) return;
    
    const scrollElement = scrollingElementRef?.current;
    if (!scrollElement) return;
    
    const handleScroll = () => {
      // Marquer comme en cours de défilement
      isScrollingRef.current = true;
      
      // Annuler tout timeout précédent
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      // Vérifier les éléments visibles
      checkVisibleElements();
      
      // Réinitialiser après un délai
      scrollTimeoutRef.current = setTimeout(() => {
        isScrollingRef.current = false;
        checkVisibleElements();
      }, 150);
    };
    
    // Vérifier immédiatement les éléments visibles
    checkVisibleElements();
    
    // Ajouter l'écouteur de défilement
    scrollElement.addEventListener('scroll', handleScroll, { passive: true });
    
    // Observer les changements de taille de l'élément
    const resizeObserver = new ResizeObserver(() => {
      checkVisibleElements();
    });
    
    resizeObserver.observe(scrollElement);
    
    // Nettoyer
    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
      resizeObserver.disconnect();
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [checkVisibleElements, scrollingElementRef, isEnabled]);
  
  // Fonction pour naviguer à une date spécifique
  const navigateToDate = useCallback((targetDate: string) => {
    if (!scrollingElementRef?.current) return;
    
    const scrollElement = scrollingElementRef.current;
    const mediaElements = scrollElement.querySelectorAll('[data-media-id]');
    if (mediaElements.length === 0) return;
    
    const targetTimestamp = new Date(targetDate).getTime();
    
    // Trouver l'élément le plus proche de la date cible
    let closestElement: Element | null = null;
    let closestTimeDiff = Infinity;
    
    for (let i = 0; i < mediaElements.length; i++) {
      const element = mediaElements[i];
      const mediaId = element.getAttribute('data-media-id');
      
      if (mediaId) {
        // Vérifier d'abord dans idToDateMap
        let mediaDate: string | null = null;
        
        if (idToDateMap.current.has(mediaId)) {
          mediaDate = idToDateMap.current.get(mediaId) || null;
        } else {
          const mediaInfo = mediaInfoMap.get(mediaId);
          mediaDate = mediaInfo?.createdAt || null;
        }
        
        if (mediaDate) {
          const timestamp = new Date(mediaDate).getTime();
          const timeDiff = Math.abs(timestamp - targetTimestamp);
          
          if (timeDiff < closestTimeDiff) {
            closestTimeDiff = timeDiff;
            closestElement = element;
          }
        }
      }
    }
    
    // Scroll vers l'élément le plus proche
    if (closestElement) {
      const containerRect = scrollElement.getBoundingClientRect();
      const elementRect = closestElement.getBoundingClientRect();
      
      const scrollTop = elementRect.top - containerRect.top + scrollElement.scrollTop - 20;
      
      scrollElement.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
    }
  }, [scrollingElementRef, mediaInfoMap]);
  
  return { visibleDate, navigateToDate };
}
