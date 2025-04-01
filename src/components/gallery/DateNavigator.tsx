
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DatePeriod } from '@/types/gallery';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/hooks/use-language';

interface DateNavigatorProps {
  periods: DatePeriod[];
  currentPeriod: DatePeriod | null;
  onSelectPeriod: (period: DatePeriod) => void;
  onPrevious: () => void;
  onNext: () => void;
  canNavigatePrevious: boolean;
  canNavigateNext: boolean;
}

const DateNavigator: React.FC<DateNavigatorProps> = ({
  periods,
  currentPeriod,
  onSelectPeriod,
  onPrevious,
  onNext,
  canNavigatePrevious,
  canNavigateNext
}) => {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const { t } = useLanguage();
  
  // Si aucune période n'est disponible, afficher un message
  if (periods.length === 0) {
    return null;
  }
  
  const handleSelectPeriod = (period: DatePeriod) => {
    onSelectPeriod(period);
    setOpen(false);
  };
  
  // Grouper les périodes par année pour une meilleure organisation
  const periodsByYear = periods.reduce((acc, period) => {
    if (!acc[period.year]) {
      acc[period.year] = [];
    }
    acc[period.year].push(period);
    return acc;
  }, {} as Record<number, DatePeriod[]>);
  
  // Trier les années par ordre décroissant (plus récent en premier)
  const sortedYears = Object.keys(periodsByYear)
    .map(year => parseInt(year))
    .sort((a, b) => b - a);
  
  return (
    <div className="flex items-center gap-1 px-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={onPrevious}
        disabled={!canNavigatePrevious}
        className="h-8 w-8 opacity-75 hover:opacity-100"
      >
        <ChevronLeft className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
      </Button>
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size={isMobile ? "sm" : "default"}
            className={`text-xs sm:text-sm font-medium ${isMobile ? 'px-2 py-1 h-7' : ''}`}
          >
            <Calendar className="mr-1 h-3 w-3 sm:h-4 sm:w-4" />
            {currentPeriod ? currentPeriod.label : t('jump_to')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-1" align="center">
          <ScrollArea className="h-60 rounded-md">
            {periods.length === 0 ? (
              <div className="text-sm text-center py-2 text-muted-foreground">
                {t('no_dates_available')}
              </div>
            ) : (
              <div className="p-1">
                {sortedYears.map(year => (
                  <div key={year} className="mb-2">
                    <div className="text-sm font-semibold py-1 px-2 bg-secondary/40 rounded-sm">
                      {year}
                    </div>
                    <div className="grid grid-cols-2 gap-1 mt-1">
                      {periodsByYear[year]
                        .sort((a, b) => b.month - a.month)
                        .map(period => (
                          <Button
                            key={`${period.year}-${period.month}`}
                            variant={currentPeriod && 
                              currentPeriod.year === period.year && 
                              currentPeriod.month === period.month
                              ? "default"
                              : "outline"
                            }
                            size="sm"
                            className="h-8 justify-start text-xs"
                            onClick={() => handleSelectPeriod(period)}
                          >
                            <span className="truncate">
                              {new Date(period.year, period.month).toLocaleDateString(
                                navigator.language || 'fr-FR', 
                                { month: 'short' }
                              )}
                            </span>
                            <span className="ml-auto text-muted-foreground text-[10px]">
                              {period.count}
                            </span>
                          </Button>
                        ))
                      }
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </PopoverContent>
      </Popover>
      
      <Button
        variant="ghost"
        size="icon"
        onClick={onNext}
        disabled={!canNavigateNext}
        className="h-8 w-8 opacity-75 hover:opacity-100"
      >
        <ChevronRight className={isMobile ? "h-4 w-4" : "h-5 w-5"} />
      </Button>
    </div>
  );
};

export default DateNavigator;
