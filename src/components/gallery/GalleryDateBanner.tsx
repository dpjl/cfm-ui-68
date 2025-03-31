
import React, { memo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { useLanguage } from '@/hooks/use-language';

interface GalleryDateBannerProps {
  visibleDate?: string | null;
  isEnabled?: boolean;
}

const GalleryDateBanner = memo(({ 
  visibleDate, 
  isEnabled = true 
}: GalleryDateBannerProps) => {
  const [showBanner, setShowBanner] = useState(false);
  const { t } = useLanguage();
  
  // Gérer l'affichage du bandeau
  useEffect(() => {
    if (visibleDate && isEnabled) {
      setShowBanner(true);
      
      // Masquer le bandeau après un délai si le scroll s'arrête
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    } else {
      setShowBanner(false);
    }
  }, [visibleDate, isEnabled]);
  
  // Ne rien afficher si aucune date ou si désactivé
  if (!visibleDate || !isEnabled) {
    return null;
  }
  
  // Formatter la date
  let formattedDate = '';
  try {
    const dateObj = new Date(visibleDate);
    if (!isNaN(dateObj.getTime())) {
      formattedDate = format(dateObj, 'dd/MM/yyyy');
    }
  } catch (error) {
    console.error('Error formatting date:', error);
  }
  
  if (!formattedDate) {
    return null;
  }
  
  return (
    <AnimatePresence>
      {showBanner && (
        <motion.div 
          className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          <div className="bg-background/80 backdrop-blur-md px-4 py-2 rounded-full shadow-md border border-border">
            <span className="text-sm font-medium">
              {formattedDate}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
});

GalleryDateBanner.displayName = 'GalleryDateBanner';

export default GalleryDateBanner;
