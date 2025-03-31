
import React, { useState, useCallback, useRef } from 'react';
import { useLanguage } from '@/hooks/use-language';
import VirtualizedGalleryGrid from './VirtualizedGalleryGrid';
import GalleryEmptyState from './GalleryEmptyState';
import GallerySkeletons from './GallerySkeletons';
import MediaPreview from '../MediaPreview';
import { DetailedMediaInfo, MediaItemWithDate } from '@/api/imageApi';
import { useGallerySelection } from '@/hooks/use-gallery-selection';
import { useGalleryPreviewHandler } from '@/hooks/use-gallery-preview-handler';
import GalleryToolbar from './GalleryToolbar';
import { useGalleryMediaHandler } from '@/hooks/use-gallery-media-handler';
import MediaInfoPanel from '../media/MediaInfoPanel';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { GalleryViewMode } from '@/types/gallery';
import GalleryDateBanner from './GalleryDateBanner';
import { useGalleryVisibleDate } from '@/hooks/use-gallery-visible-date';
import GalleryTimeNavigation from './GalleryTimeNavigation';
import MiniTimeline from './MiniTimeline';

interface GalleryProps {
  title: string;
  mediaIds: string[] | MediaItemWithDate[];
  selectedIds: string[];
  onSelectId: (id: string) => void;
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  columnsCount: number;
  onPreviewMedia?: (id: string) => void;
  viewMode?: 'single' | 'split';
  onDeleteSelected: () => void;
  position?: 'source' | 'destination';
  filter?: string;
  onToggleSidebar?: () => void;
  gap?: number;
  mobileViewMode?: GalleryViewMode;
  onToggleFullView?: () => void;
}

const Gallery: React.FC<GalleryProps> = ({
  title,
  mediaIds,
  selectedIds,
  onSelectId,
  isLoading = false,
  isError = false,
  error,
  columnsCount,
  onPreviewMedia,
  viewMode = 'single',
  onDeleteSelected,
  position = 'source',
  filter = 'all',
  onToggleSidebar,
  gap = 8,
  mobileViewMode,
  onToggleFullView
}) => {
  const [mediaInfoMap, setMediaInfoMap] = useState<Map<string, DetailedMediaInfo | null>>(new Map());
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const gridContainerRef = useRef<HTMLDivElement>(null);
  
  // Normaliser les IDs de médias et extraire les objets MediaItemWithDate si nécessaire
  const normalizedIds = React.useMemo(() => {
    if (mediaIds.length === 0) return [];
    
    // Vérifier si nous avons des MediaItemWithDate ou juste des IDs
    if (typeof mediaIds[0] === 'string') {
      return mediaIds as string[];
    } else {
      return (mediaIds as MediaItemWithDate[]).map(item => item.id);
    }
  }, [mediaIds]);
  
  // Extraire les dates des MediaItemWithDate si disponibles
  const mediaItemsWithDates = React.useMemo(() => {
    if (mediaIds.length === 0) return [];
    
    if (typeof mediaIds[0] === 'string') {
      return []; // Pas de dates disponibles au départ
    } else {
      return mediaIds as MediaItemWithDate[];
    }
  }, [mediaIds]);
  
  const selection = useGallerySelection({
    mediaIds: normalizedIds,
    selectedIds,
    onSelectId
  });
  
  const preview = useGalleryPreviewHandler({
    mediaIds: normalizedIds,
    onPreviewMedia
  });
  
  const mediaHandler = useGalleryMediaHandler(
    selectedIds,
    position
  );

  const updateMediaInfo = useCallback((id: string, info: DetailedMediaInfo | null) => {
    setMediaInfoMap(prev => {
      const newMap = new Map(prev);
      newMap.set(id, info);
      return newMap;
    });
  }, []);

  // Mise à jour pour utiliser mediaItemsWithDates
  const { visibleDate, navigateToDate } = useGalleryVisibleDate({
    mediaInfoMap,
    mediaItemsWithDates,
    scrollingElementRef: gridContainerRef,
    isEnabled: normalizedIds.length > 0 && !isLoading && !isError
  });

  const shouldShowInfoPanel = selectedIds.length > 0;
  
  const handleCloseInfoPanel = useCallback(() => {
    selectedIds.forEach(id => onSelectId(id));
  }, [selectedIds, onSelectId]);
  
  // Gérer la navigation vers une date spécifique
  const handleNavigateToDate = useCallback((date: string) => {
    if (navigateToDate) {
      navigateToDate(date);
    }
  }, [navigateToDate]);
  
  if (isLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="mt-2">
          <GallerySkeletons columnsCount={columnsCount} />
        </div>
      </div>
    );
  }
  
  if (isError) {
    return (
      <div className="flex flex-col h-full p-4">
        <div className="text-destructive">Error loading gallery: {String(error)}</div>
      </div>
    );
  }

  const isVideoPreview = (id: string): boolean => {
    const info = mediaInfoMap.get(id);
    if (info) {
      const fileName = info.alt?.toLowerCase() || '';
      return fileName.endsWith('.mp4') || fileName.endsWith('.mov');
    }
    return false;
  };
  
  const shouldShowTimeNavigation = normalizedIds.length > 20;
  const shouldShowMiniTimeline = normalizedIds.length > 30 && isMobile;
  
  return (
    <div className="flex flex-col h-full relative" ref={containerRef}>
      <GalleryToolbar
        mediaIds={normalizedIds}
        selectedIds={selectedIds}
        onSelectAll={selection.handleSelectAll}
        onDeselectAll={selection.handleDeselectAll}
        viewMode={viewMode}
        position={position}
        onToggleSidebar={onToggleSidebar}
        selectionMode={selection.selectionMode}
        onToggleSelectionMode={selection.toggleSelectionMode}
        mobileViewMode={mobileViewMode}
        onToggleFullView={onToggleFullView}
      />
      
      <div className="flex-1 overflow-hidden relative scrollbar-vertical" ref={gridContainerRef}>
        <GalleryDateBanner 
          visibleDate={visibleDate} 
          isEnabled={normalizedIds.length > 10}
        />
        
        {shouldShowInfoPanel && (
          <div className="absolute top-2 left-0 right-0 z-10 flex justify-center">
            <MediaInfoPanel
              selectedIds={selectedIds}
              onOpenPreview={preview.handleOpenPreview}
              onDeleteSelected={onDeleteSelected}
              onDownloadSelected={mediaHandler.handleDownloadSelected}
              mediaInfoMap={mediaInfoMap}
              selectionMode={selection.selectionMode}
              position={position}
              onClose={handleCloseInfoPanel}
            />
          </div>
        )}
        
        {normalizedIds.length === 0 ? (
          <GalleryEmptyState />
        ) : (
          <VirtualizedGalleryGrid
            mediaIds={normalizedIds}
            selectedIds={selectedIds}
            onSelectId={selection.handleSelectItem}
            columnsCount={columnsCount}
            viewMode={viewMode}
            updateMediaInfo={updateMediaInfo}
            position={position}
            gap={gap}
          />
        )}
        
        {shouldShowTimeNavigation && normalizedIds.length > 0 && (
          <GalleryTimeNavigation 
            mediaInfoMap={mediaInfoMap}
            scrollElementRef={gridContainerRef}
            mediaItemsWithDates={mediaItemsWithDates}
            onNavigateToDate={handleNavigateToDate}
          />
        )}
        
        {shouldShowMiniTimeline && (
          <MiniTimeline 
            mediaItems={mediaItemsWithDates}
            onNavigateTo={handleNavigateToDate}
            position={position === 'source' ? 'left' : 'right'}
          />
        )}
      </div>
      
      {preview.previewMediaId && (
        <MediaPreview 
          mediaId={preview.previewMediaId}
          isVideo={isVideoPreview(preview.previewMediaId)}
          onClose={preview.handleClosePreview}
          onNext={normalizedIds.length > 1 ? () => preview.handleNavigatePreview('next') : undefined}
          onPrevious={normalizedIds.length > 1 ? () => preview.handleNavigatePreview('prev') : undefined}
          hasNext={normalizedIds.length > 1}
          hasPrevious={normalizedIds.length > 1}
          position={position}
        />
      )}
    </div>
  );
};

export default Gallery;
