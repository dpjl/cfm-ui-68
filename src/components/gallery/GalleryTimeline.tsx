
import React, { useCallback, useRef, useState } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Button } from '../ui/button';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import { TimelineEntry } from '@/hooks/use-media-timeline';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-breakpoint';

interface GalleryTimelineProps {
  timelineEntries: any[];
  onJumpToDate: (entry: any) => void;
  position: 'source' | 'destination';
  viewMode?: 'single' | 'split';
}

const GalleryTimeline: React.FC<GalleryTimelineProps> = ({
  timelineEntries,
  onJumpToDate,
  position,
  viewMode = 'single'
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [showTimeline, setShowTimeline] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartXRef = useRef<number | null>(null);
  const lastTouchXRef = useRef<number | null>(null);
  const isMobile = useIsMobile();
  const isCompact = viewMode === 'split' || isMobile;
  
  // Basculer l'affichage de la timeline
  const toggleTimeline = useCallback(() => {
    setShowTimeline(prev => !prev);
  }, []);
  
  // Gérer le scroll de la timeline avec les boutons de navigation
  const handleScroll = useCallback((direction: 'left' | 'right') => {
    if (!timelineRef.current) return;
    
    const scrollAmount = direction === 'left' ? -150 : 150;
    timelineRef.current.scrollBy({ 
      left: scrollAmount, 
      behavior: 'smooth' 
    });
  }, []);
  
  // Gérer le début du glissement tactile
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartXRef.current = e.touches[0].clientX;
    lastTouchXRef.current = e.touches[0].clientX;
    setIsDragging(true);
  }, []);
  
  // Gérer le glissement tactile
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!isDragging || !timelineRef.current || lastTouchXRef.current === null) return;
    
    const touchX = e.touches[0].clientX;
    const diff = lastTouchXRef.current - touchX;
    
    timelineRef.current.scrollBy({ left: diff });
    lastTouchXRef.current = touchX;
    
    e.preventDefault(); // Empêcher le défilement de la page
  }, [isDragging]);
  
  // Gérer la fin du glissement tactile
  const handleTouchEnd = useCallback(() => {
    dragStartXRef.current = null;
    lastTouchXRef.current = null;
    setIsDragging(false);
  }, []);
  
  // Si aucune entrée de timeline, ne rien afficher
  if (timelineEntries.length === 0) return null;
  
  // Classes pour le conteneur principal basées sur la position et le mode de vue
  const containerClasses = `gallery-timeline-container ${position === 'source' ? 'timeline-left' : 'timeline-right'} ${
    isCompact ? 'timeline-compact' : ''
  }`;
  
  return (
    <div className={containerClasses}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="timeline-toggle-button"
              onClick={toggleTimeline}
            >
              <CalendarDays size={isMobile ? 16 : 20} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Timeline</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      {showTimeline && (
        <div className="timeline-wrapper">
          <Button
            variant="ghost"
            size="icon"
            className="timeline-nav-button left"
            onClick={() => handleScroll('left')}
          >
            <ChevronLeft size={16} />
          </Button>
          
          <div
            ref={timelineRef}
            className="timeline-scrollable"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {timelineEntries.map((entry, index) => (
              <TooltipProvider key={entry.fullDate}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      className="timeline-date-item"
                      onClick={() => onJumpToDate(entry)}
                    >
                      {entry.label}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {new Date(entry.fullDate).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'long'
                    })}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
          
          <Button
            variant="ghost"
            size="icon"
            className="timeline-nav-button right"
            onClick={() => handleScroll('right')}
          >
            <ChevronRight size={16} />
          </Button>
        </div>
      )}
    </div>
  );
};

export default GalleryTimeline;
