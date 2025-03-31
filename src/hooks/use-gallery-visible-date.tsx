
import { useState, useEffect, useCallback, useRef } from 'react';
import { DetailedMediaInfo } from '@/api/imageApi';

interface UseGalleryVisibleDateOptions {
  mediaInfoMap: Map<string, DetailedMediaInfo | null>;
  scrollingElementRef?: React.RefObject<HTMLElement>;
  isEnabled?: boolean;
}

export function useGalleryVisibleDate({
  mediaInfoMap,
  scrollingElementRef,
  isEnabled = true
}: UseGalleryVisibleDateOptions) {
  const [visibleDate, setVisibleDate] = useState<string | null>(null);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isScrollingRef = useRef(false);
  
  // Fonction pour détecter les éléments visibles et leur date
  const checkVisibleElements = useCallback(() => {
    if (!isEnabled) return;
    
    // Si nous n'avons pas d'information sur les médias, ne rien faire
    if (mediaInfoMap.size === 0) return;
    
    // Obtenir l'élément conteneur pour le scroll
    const scrollElement = scrollingElementRef?.current || document.querySelector('.gallery-container');
    
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
    let firstVisibleElementDate: string | null = null;
    
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
        const mediaInfo = mediaInfoMap.get(mediaId);
        if (mediaInfo && mediaInfo.createdAt) {
          firstVisibleElementDate = mediaInfo.createdAt;
        }
      }
    }
    
    // Mettre à jour la date visible
    setVisibleDate(firstVisibleElementDate);
  }, [mediaInfoMap, scrollingElementRef, isEnabled]);
  
  // Gérer le scroll
  useEffect(() => {
    if (!isEnabled) return;
    
    const scrollElement = scrollingElementRef?.current || document.querySelector('.gallery-container');
    
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
    window.addEventListener('resize', checkVisibleElements, { passive: true });
    
    // Nettoyer
    return () => {
      scrollElement.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkVisibleElements);
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [checkVisibleElements, scrollingElementRef, isEnabled]);
  
  return { visibleDate };
}
