
import { useEffect, useMemo, useRef } from 'react';
import type { FixedSizeGrid } from 'react-window';
import { MediaItemWithDate } from '@/types/gallery';

/**
 * Interface pour les entrées dans l'index de la timeline
 */
export interface TimelineEntry {
  label: string; // Label formaté de la date (ex: "Jan 2023")
  fullDate: string; // Date complète (format ISO)
  firstIndex: number; // Index du premier média pour cette date
}

/**
 * Hook pour créer et gérer une timeline basée sur les dates des médias
 */
export function useMediaTimeline(
  mediaWithDates: MediaItemWithDate[],
  columnsCount: number,
  gridRef: React.RefObject<FixedSizeGrid>
) {
  // Référence pour stocker l'entrée de timeline active
  const activeEntryRef = useRef<string | null>(null);
  
  // Créer l'index de timeline basé sur les dates des médias
  const timelineEntries = useMemo(() => {
    if (!mediaWithDates || mediaWithDates.length === 0) return [];

    const entries: TimelineEntry[] = [];
    const dateMap = new Map<string, number>();

    // Parcourir tous les médias pour extraire leurs dates et positions
    mediaWithDates.forEach((item, index) => {
      if (!item.createdAt) return;
      
      const date = new Date(item.createdAt);
      // Formater la date en format YYYY-MM (pour regrouper par mois)
      const monthKey = date.toISOString().substring(0, 7);
      
      // Si c'est le premier média de ce mois, enregistrer son index
      if (!dateMap.has(monthKey)) {
        dateMap.set(monthKey, index);
        
        // Formater le libellé du mois (ex: "Jan 2023")
        const label = date.toLocaleDateString(undefined, { 
          month: 'short', 
          year: 'numeric' 
        });
        
        entries.push({
          label,
          fullDate: date.toISOString(),
          firstIndex: index,
        });
      }
    });

    return entries.sort((a, b) => 
      new Date(a.fullDate).getTime() - new Date(b.fullDate).getTime()
    );
  }, [mediaWithDates]);

  // Fonction pour sauter à une entrée spécifique de la timeline
  const jumpToDate = (entry: TimelineEntry) => {
    if (!gridRef.current) return;
    
    // Calculer la rangée basée sur l'index et le nombre de colonnes
    const row = Math.floor(entry.firstIndex / columnsCount);
    
    // Faire défiler la grille jusqu'à cette rangée
    gridRef.current.scrollToItem({
      rowIndex: row,
      align: 'start',
    });
    
    // Mettre à jour l'entrée active
    activeEntryRef.current = entry.fullDate;
  };
  
  // Fonction pour obtenir l'entrée la plus proche d'une position
  const getClosestEntry = (position: number): TimelineEntry | null => {
    if (timelineEntries.length === 0) return null;
    
    // Convertir la position en indice d'élément
    const totalItems = mediaWithDates.length;
    const itemIndex = Math.floor(position * totalItems);
    
    // Trouver l'entrée la plus proche
    let closestEntry = timelineEntries[0];
    let minDistance = Math.abs(closestEntry.firstIndex - itemIndex);
    
    for (const entry of timelineEntries) {
      const distance = Math.abs(entry.firstIndex - itemIndex);
      if (distance < minDistance) {
        minDistance = distance;
        closestEntry = entry;
      }
    }
    
    return closestEntry;
  };

  return {
    timelineEntries,
    jumpToDate,
    getClosestEntry,
    activeEntry: activeEntryRef.current
  };
}
