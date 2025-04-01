
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DatePeriod } from '@/types/gallery';

// Formatteur de dates pour les étiquettes
const monthFormatter = new Intl.DateTimeFormat(navigator.language || 'fr-FR', { month: 'long', year: 'numeric' });

/**
 * Hook pour gérer la navigation par date dans la galerie
 */
export function useGalleryDateNavigation(
  mediaIds: string[],
  dates: number[] | undefined,
  gridRef: React.RefObject<any>
) {
  // État local pour suivre la période actuelle
  const [currentPeriod, setCurrentPeriod] = useState<DatePeriod | null>(null);
  
  // Extraire les périodes uniques à partir des timestamps
  const periods = useMemo(() => {
    if (!dates || !mediaIds || dates.length !== mediaIds.length) {
      return [];
    }
    
    // Map pour regrouper les médias par période (année-mois)
    const periodMap = new Map<string, { count: number, timestamp: number }>();
    
    // Remplir la map avec les périodes et leurs comptes
    dates.forEach((timestamp) => {
      const date = new Date(timestamp);
      const year = date.getFullYear();
      const month = date.getMonth(); // 0-11
      const key = `${year}-${month}`;
      
      if (periodMap.has(key)) {
        const period = periodMap.get(key)!;
        period.count += 1;
      } else {
        periodMap.set(key, { count: 1, timestamp });
      }
    });
    
    // Convertir la map en tableau de périodes
    const result: DatePeriod[] = Array.from(periodMap.entries()).map(([key, data]) => {
      const [yearStr, monthStr] = key.split('-');
      const year = parseInt(yearStr);
      const month = parseInt(monthStr);
      const date = new Date(year, month, 1);
      
      return {
        year,
        month,
        count: data.count,
        label: monthFormatter.format(date)
      };
    });
    
    // Trier par date, du plus récent au plus ancien
    return result.sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  }, [dates, mediaIds]);
  
  // Initialiser la période courante avec la plus récente
  useEffect(() => {
    if (periods.length > 0 && !currentPeriod) {
      setCurrentPeriod(periods[0]);
    }
  }, [periods, currentPeriod]);
  
  // Trouver l'index de la période courante
  const currentPeriodIndex = useMemo(() => {
    if (!currentPeriod) return -1;
    return periods.findIndex(
      p => p.year === currentPeriod.year && p.month === currentPeriod.month
    );
  }, [periods, currentPeriod]);
  
  // Vérifier si on peut naviguer vers la période précédente/suivante
  const canNavigatePrevious = currentPeriodIndex > 0;
  const canNavigateNext = currentPeriodIndex < periods.length - 1 && currentPeriodIndex !== -1;
  
  // Fonction pour trouver le premier média d'une période
  const findFirstMediaIndexForPeriod = useCallback((period: DatePeriod) => {
    if (!dates || !mediaIds) return -1;
    
    const targetYear = period.year;
    const targetMonth = period.month;
    
    for (let i = 0; i < dates.length; i++) {
      const date = new Date(dates[i]);
      if (date.getFullYear() === targetYear && date.getMonth() === targetMonth) {
        return i;
      }
    }
    
    return -1;
  }, [dates, mediaIds]);
  
  // Naviguer vers une période spécifique
  const navigateToPeriod = useCallback((period: DatePeriod) => {
    if (!gridRef.current) return;
    
    setCurrentPeriod(period);
    
    // Trouver le premier média de cette période
    const mediaIndex = findFirstMediaIndexForPeriod(period);
    if (mediaIndex >= 0) {
      // Calculer la ligne approximative dans la grille virtuelle
      const rowIndex = Math.floor(mediaIndex / gridRef.current.props.columnCount);
      // Faire défiler jusqu'à cette ligne (avec un petit décalage pour la visibilité)
      gridRef.current.scrollToItem({
        align: 'start',
        rowIndex: Math.max(0, rowIndex - 1)
      });
    }
  }, [findFirstMediaIndexForPeriod, gridRef]);
  
  // Naviguer vers la période précédente
  const navigateToPrevious = useCallback(() => {
    if (canNavigatePrevious) {
      navigateToPeriod(periods[currentPeriodIndex - 1]);
    }
  }, [canNavigatePrevious, currentPeriodIndex, navigateToPeriod, periods]);
  
  // Naviguer vers la période suivante
  const navigateToNext = useCallback(() => {
    if (canNavigateNext) {
      navigateToPeriod(periods[currentPeriodIndex + 1]);
    }
  }, [canNavigateNext, currentPeriodIndex, navigateToPeriod, periods]);
  
  return {
    periods,
    currentPeriod,
    navigateToPeriod,
    navigateToPrevious,
    navigateToNext,
    canNavigatePrevious,
    canNavigateNext,
    hasDateData: periods.length > 0
  };
}
