
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { format, parse, differenceInDays, subMonths } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { useDebounce } from '@/hooks/use-debounce';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { MediaItemWithDate } from '@/api/imageApi';

interface MiniTimelineProps {
  mediaItems: MediaItemWithDate[];
  onNavigateTo: (date: string) => void;
  isVisible?: boolean;
  position?: 'left' | 'right';
}

const MiniTimeline: React.FC<MiniTimelineProps> = ({
  mediaItems,
  onNavigateTo,
  isVisible = true,
  position = 'right'
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const debouncedSelectedDate = useDebounce(selectedDate, 300);
  const isMobile = useIsMobile();
  
  // Calculer les dates min et max
  const { minDate, maxDate, dateGroups } = React.useMemo(() => {
    // Filtrer les éléments sans date
    const itemsWithDates = mediaItems.filter(item => item.createdAt);
    
    if (itemsWithDates.length === 0) {
      return { minDate: null, maxDate: null, dateGroups: [] };
    }
    
    // Trier par date
    const sortedItems = [...itemsWithDates].sort((a, b) => 
      new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime()
    );
    
    const minDate = sortedItems[0].createdAt;
    const maxDate = sortedItems[sortedItems.length - 1].createdAt;
    
    // Créer des groupes par mois
    const groups: Record<string, number> = {};
    
    itemsWithDates.forEach(item => {
      if (item.createdAt) {
        try {
          const date = new Date(item.createdAt);
          const monthKey = format(date, 'yyyy-MM');
          
          if (!groups[monthKey]) {
            groups[monthKey] = 0;
          }
          
          groups[monthKey]++;
        } catch (error) {
          console.error('Error grouping date:', error);
        }
      }
    });
    
    // Convertir en tableau trié
    const dateGroups = Object.entries(groups)
      .map(([month, count]) => ({ month, count }))
      .sort((a, b) => a.month.localeCompare(b.month));
    
    return { minDate, maxDate, dateGroups };
  }, [mediaItems]);
  
  // Calculer la hauteur de la timeline
  const timelineHeight = isMobile ? 150 : 250;
  
  // Gérer le clic sur la timeline
  const handleTimelineClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current || !minDate || !maxDate) return;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const relativeY = e.clientY - rect.top;
    const percentage = 1 - (relativeY / rect.height);
    
    const minDateTime = new Date(minDate).getTime();
    const maxDateTime = new Date(maxDate).getTime();
    const range = maxDateTime - minDateTime;
    
    const targetTime = minDateTime + (range * percentage);
    const targetDate = new Date(targetTime).toISOString();
    
    setSelectedDate(targetDate);
    onNavigateTo(targetDate);
  }, [minDate, maxDate, onNavigateTo]);
  
  // Naviguer vers la date sélectionnée (debounced)
  useEffect(() => {
    if (debouncedSelectedDate) {
      onNavigateTo(debouncedSelectedDate);
    }
  }, [debouncedSelectedDate, onNavigateTo]);
  
  // Si pas de dates ou pas visible, ne rien afficher
  if (!minDate || !maxDate || !isVisible || mediaItems.length < 20) {
    return null;
  }
  
  // Calculer la largeur du contrôle en fonction de l'état
  const controlWidth = isExpanded ? (isMobile ? 80 : 120) : (isMobile ? 20 : 30);
  
  return (
    <motion.div 
      className={`mini-timeline fixed ${position === 'left' ? 'left-2' : 'right-2'} top-1/2 -translate-y-1/2 z-30`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1, width: controlWidth }}
      transition={{ duration: 0.3 }}
    >
      <div 
        className={`relative h-[${timelineHeight}px] rounded-full bg-background/80 backdrop-blur-lg shadow-md flex flex-col items-center ${
          isExpanded ? 'p-2' : 'p-1'
        } border border-border`}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        onClick={isExpanded ? undefined : () => setIsExpanded(true)}
      >
        {/* Barre de la timeline */}
        <div 
          ref={timelineRef}
          className="relative w-3 h-full rounded-full bg-muted overflow-hidden"
          onClick={handleTimelineClick}
        >
          {/* Zones de densité */}
          {dateGroups.map(({ month, count }, index) => {
            // Calculer la position relative
            try {
              const date = parse(month, 'yyyy-MM', new Date());
              const minDateTime = new Date(minDate).getTime();
              const maxDateTime = new Date(maxDate).getTime();
              const currentDateTime = date.getTime();
              
              const range = maxDateTime - minDateTime;
              const position = 1 - ((currentDateTime - minDateTime) / range);
              
              // Calculer l'intensité en fonction du nombre d'images
              const maxCount = Math.max(...dateGroups.map(g => g.count));
              const intensity = count / maxCount;
              
              // Hauteur approximative d'un mois
              const totalDays = differenceInDays(new Date(maxDate), new Date(minDate)) || 1;
              const monthDays = 30; // approximation
              const heightPercentage = (monthDays / totalDays) * 100;
              
              return (
                <div 
                  key={month}
                  className="absolute left-0 right-0"
                  style={{
                    top: `${position * 100}%`,
                    height: `${heightPercentage}%`,
                    backgroundColor: `rgba(var(--primary), ${0.2 + intensity * 0.8})`,
                    transform: 'translateY(-50%)'
                  }}
                  title={`${format(date, 'MMM yyyy')}: ${count} photos`}
                />
              );
            } catch (error) {
              console.error('Error rendering date group:', error);
              return null;
            }
          })}
        </div>
        
        {/* Marqueurs de temps (visibles uniquement en mode étendu) */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div 
              className="absolute right-full mr-1 h-full flex flex-col justify-between text-2xs"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
            >
              <span>{format(new Date(maxDate), 'MMM yyyy')}</span>
              <span>{format(new Date(minDate), 'MMM yyyy')}</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default MiniTimeline;
