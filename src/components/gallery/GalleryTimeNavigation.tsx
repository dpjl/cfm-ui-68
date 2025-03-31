
import React, { useState, useMemo, useCallback } from 'react';
import { format, parse, startOfMonth, endOfMonth } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DetailedMediaInfo } from '@/api/imageApi';

interface MonthData {
  month: string; // Format: "2023-01"
  label: string; // Format: "Jan 2023"
  count: number;
}

interface GalleryTimeNavigationProps {
  mediaInfoMap: Map<string, DetailedMediaInfo | null>;
  scrollElementRef: React.RefObject<HTMLElement>;
}

const GalleryTimeNavigation: React.FC<GalleryTimeNavigationProps> = ({
  mediaInfoMap,
  scrollElementRef
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Générer une liste des mois disponibles à partir des données des médias
  const monthsData = useMemo(() => {
    const months: Record<string, { count: number; dates: Date[] }> = {};
    
    // Parcourir tous les médias pour extraire les dates
    mediaInfoMap.forEach((info) => {
      if (info?.createdAt) {
        try {
          const date = new Date(info.createdAt);
          if (!isNaN(date.getTime())) {
            // Format: "2023-01"
            const monthKey = format(date, 'yyyy-MM');
            
            if (!months[monthKey]) {
              months[monthKey] = {
                count: 0,
                dates: []
              };
            }
            
            months[monthKey].count += 1;
            months[monthKey].dates.push(date);
          }
        } catch (error) {
          console.error('Error parsing date:', error);
        }
      }
    });
    
    // Convertir en tableau et trier par date (du plus récent au plus ancien)
    return Object.entries(months)
      .map(([month, data]): MonthData => ({
        month,
        label: format(parse(month, 'yyyy-MM', new Date()), 'MMM yyyy'),
        count: data.count
      }))
      .sort((a, b) => b.month.localeCompare(a.month));
  }, [mediaInfoMap]);
  
  // Scroll vers une date spécifique
  const scrollToMonth = useCallback((monthKey: string) => {
    if (!scrollElementRef.current || !mediaInfoMap.size) return;
    
    // Convertir la clé de mois en Date (débuter au 1er jour du mois)
    const targetDate = parse(monthKey, 'yyyy-MM', new Date());
    const startDate = startOfMonth(targetDate);
    const endDate = endOfMonth(targetDate);
    
    // Trouver le premier média dans ce mois
    const mediaElements = scrollElementRef.current.querySelectorAll('[data-media-id]');
    let targetElement: Element | null = null;
    
    // Parcourir tous les éléments médias
    for (let i = 0; i < mediaElements.length; i++) {
      const element = mediaElements[i];
      const mediaId = element.getAttribute('data-media-id');
      
      if (mediaId) {
        const mediaInfo = mediaInfoMap.get(mediaId);
        if (mediaInfo?.createdAt) {
          try {
            const date = new Date(mediaInfo.createdAt);
            if (!isNaN(date.getTime())) {
              // Vérifier si la date est dans le mois cible
              if (date >= startDate && date <= endDate) {
                targetElement = element;
                break;
              }
            }
          } catch (error) {
            console.error('Error checking date:', error);
          }
        }
      }
    }
    
    // Scroll vers l'élément trouvé
    if (targetElement) {
      const containerRect = scrollElementRef.current.getBoundingClientRect();
      const elementRect = targetElement.getBoundingClientRect();
      
      // Calculer la position de défilement
      const scrollTop = elementRect.top - containerRect.top + scrollElementRef.current.scrollTop - 20;
      
      // Animation de défilement fluide
      scrollElementRef.current.scrollTo({
        top: scrollTop,
        behavior: 'smooth'
      });
      
      // Fermer le popover après la sélection
      setIsOpen(false);
    }
  }, [scrollElementRef, mediaInfoMap]);
  
  // Scroll rapide vers le haut
  const scrollToTop = useCallback(() => {
    if (scrollElementRef.current) {
      scrollElementRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  }, [scrollElementRef]);
  
  // Scroll rapide vers le bas
  const scrollToBottom = useCallback(() => {
    if (scrollElementRef.current) {
      scrollElementRef.current.scrollTo({
        top: scrollElementRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [scrollElementRef]);
  
  if (monthsData.length === 0) {
    return null;
  }
  
  return (
    <div className="gallery-time-navigation absolute bottom-4 right-4 z-30 flex flex-col gap-2">
      {/* Contrôles de navigation rapide */}
      <motion.div 
        className="flex flex-col gap-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-md shadow-md"
          onClick={scrollToTop}
          title="Go to newest"
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
        
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              size="icon"
              variant="outline"
              className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-md shadow-md"
              title="Navigate by month"
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-[200px] p-0" 
            side={isMobile ? "left" : "left"}
            align="end"
          >
            <div className="p-2 border-b">
              <h4 className="font-medium text-sm">Navigation par mois</h4>
            </div>
            <ScrollArea className="h-60 overflow-y-auto py-1">
              <div className="grid grid-cols-1 gap-1 p-1">
                {monthsData.map((month) => (
                  <Button
                    key={month.month}
                    variant="ghost"
                    className="justify-start text-xs h-7 px-2"
                    onClick={() => scrollToMonth(month.month)}
                  >
                    <span>{month.label}</span>
                    <span className="ml-auto text-muted-foreground">{month.count}</span>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </PopoverContent>
        </Popover>
        
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8 rounded-full bg-background/80 backdrop-blur-md shadow-md"
          onClick={scrollToBottom}
          title="Go to oldest"
        >
          <ChevronDown className="h-4 w-4" />
        </Button>
      </motion.div>
    </div>
  );
};

export default GalleryTimeNavigation;
