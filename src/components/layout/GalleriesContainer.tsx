
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useIsMobile } from '@/hooks/use-breakpoint';
import { fetchMediaIds, fetchMediaWithDates } from '@/api/imageApi';
import { GalleryViewMode, ViewModeType } from '@/types/gallery';
import { MediaFilter } from '@/components/AppSidebar';
import GalleryContent from '@/components/gallery/GalleryContent';
import DeleteConfirmationDialog from '@/components/gallery/DeleteConfirmationDialog';
import GalleriesView from './GalleriesView';
import MobileViewSwitcher from './MobileViewSwitcher';

interface BaseGalleryProps {
  columnsCountLeft: number;
  columnsCountRight: number;
  selectedDirectoryIdLeft: string;
  selectedDirectoryIdRight: string;
  selectedIdsLeft: string[];
  setSelectedIdsLeft: React.Dispatch<React.SetStateAction<string[]>>;
  selectedIdsRight: string[];
  setSelectedIdsRight: React.Dispatch<React.SetStateAction<string[]>>;
  deleteDialogOpen: boolean;
  setDeleteDialogOpen: React.Dispatch<React.SetStateAction<boolean>>;
  activeSide: 'left' | 'right';
  deleteMutation: any;
  handleDeleteSelected: (side: 'left' | 'right') => void;
  handleDelete: () => void;
  leftFilter?: MediaFilter;
  rightFilter?: MediaFilter;
}

interface SidebarToggleProps {
  onToggleLeftPanel: () => void;
  onToggleRightPanel: () => void;
}

interface GalleriesContainerProps extends BaseGalleryProps, SidebarToggleProps {
  mobileViewMode: GalleryViewMode;
  setMobileViewMode: React.Dispatch<React.SetStateAction<GalleryViewMode>>;
  onColumnsChange?: (side: 'left' | 'right', count: number) => void;
}

const GalleriesContainer: React.FC<GalleriesContainerProps> = ({
  columnsCountLeft,
  columnsCountRight,
  selectedIdsLeft,
  setSelectedIdsLeft,
  selectedIdsRight,
  setSelectedIdsRight,
  selectedDirectoryIdLeft,
  selectedDirectoryIdRight,
  deleteDialogOpen,
  setDeleteDialogOpen,
  activeSide,
  deleteMutation,
  handleDeleteSelected,
  handleDelete,
  mobileViewMode,
  setMobileViewMode,
  leftFilter,
  rightFilter,
  onToggleLeftPanel,
  onToggleRightPanel,
  onColumnsChange
}) => {
  const isMobile = useIsMobile();

  // Fetch left gallery media IDs
  const { data: leftMediaIds = [], isLoading: isLoadingLeftMediaIds, error: errorLeftMediaIds } = useQuery({
    queryKey: ['leftMediaIds', selectedDirectoryIdLeft, leftFilter],
    queryFn: () => fetchMediaIds(selectedDirectoryIdLeft, 'source', leftFilter as string)
  });
  
  // Fetch right gallery media IDs
  const { data: rightMediaIds = [], isLoading: isLoadingRightMediaIds, error: errorRightMediaIds } = useQuery({
    queryKey: ['rightMediaIds', selectedDirectoryIdRight, rightFilter],
    queryFn: () => fetchMediaIds(selectedDirectoryIdRight, 'destination', rightFilter as string)
  });
  
  // Fetch dates for left gallery
  const { data: leftMediaWithDates, isLoading: isLoadingLeftDates } = useQuery({
    queryKey: ['leftMediaDates', selectedDirectoryIdLeft, leftFilter],
    queryFn: () => fetchMediaWithDates(selectedDirectoryIdLeft, 'source', leftFilter as string),
    enabled: !!selectedDirectoryIdLeft && leftMediaIds.length > 0
  });
  
  // Fetch dates for right gallery
  const { data: rightMediaWithDates, isLoading: isLoadingRightDates } = useQuery({
    queryKey: ['rightMediaDates', selectedDirectoryIdRight, rightFilter],
    queryFn: () => fetchMediaWithDates(selectedDirectoryIdRight, 'destination', rightFilter as string),
    enabled: !!selectedDirectoryIdRight && rightMediaIds.length > 0
  });
  
  // Extraire les timestamps
  const leftDates = React.useMemo(() => {
    if (!leftMediaWithDates) return undefined;
    return leftMediaWithDates.map(item => 
      item.createdAt ? new Date(item.createdAt).getTime() : Date.now()
    );
  }, [leftMediaWithDates]);
  
  const rightDates = React.useMemo(() => {
    if (!rightMediaWithDates) return undefined;
    return rightMediaWithDates.map(item => 
      item.createdAt ? new Date(item.createdAt).getTime() : Date.now()
    );
  }, [rightMediaWithDates]);

  // Handler functions
  const handleSelectIdLeft = (id: string) => setSelectedIdsLeft((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  const handleSelectIdRight = (id: string) => setSelectedIdsRight((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  const handlePreviewItemLeft = (id: string) => console.log(`Previewing item ${id} in source`);
  const handlePreviewItemRight = (id: string) => console.log(`Previewing item ${id} in destination`);
  
  // Function for confirming deletion
  const handleConfirmDelete = (side: 'left' | 'right') => () => handleDeleteSelected(side);
  
  // Function for executing the actual delete operation
  const executeDelete = () => {
    handleDelete();
  };

  // Column change handlers
  const handleLeftColumnsChange = (count: number) => {
    if (onColumnsChange) {
      console.log('Left columns changed to:', count);
      onColumnsChange('left', count);
    }
  };

  const handleRightColumnsChange = (count: number) => {
    if (onColumnsChange) {
      console.log('Right columns changed to:', count);
      onColumnsChange('right', count);
    }
  };

  // Toggle full view handlers
  const handleToggleLeftFullView = () => {
    if (mobileViewMode === 'left') {
      setMobileViewMode('both');
    } else {
      setMobileViewMode('left');
    }
  };

  const handleToggleRightFullView = () => {
    if (mobileViewMode === 'right') {
      setMobileViewMode('both');
    } else {
      setMobileViewMode('right');
    }
  };

  // Prepare content for left and right galleries
  const leftGalleryContent = (
    <GalleryContent
      title="Source"
      mediaIds={leftMediaIds || []}
      selectedIds={selectedIdsLeft}
      onSelectId={handleSelectIdLeft}
      isLoading={isLoadingLeftMediaIds || isLoadingLeftDates}
      isError={!!errorLeftMediaIds}
      error={errorLeftMediaIds}
      columnsCount={columnsCountLeft}
      viewMode={mobileViewMode === 'both' ? 'split' : 'single'}
      onPreviewItem={handlePreviewItemLeft}
      onDeleteSelected={handleConfirmDelete('left')}
      position="source"
      filter={leftFilter}
      onToggleSidebar={onToggleLeftPanel}
      onColumnsChange={handleLeftColumnsChange}
      mobileViewMode={mobileViewMode}
      onToggleFullView={handleToggleLeftFullView}
      dates={leftDates}
    />
  );

  const rightGalleryContent = (
    <GalleryContent
      title="Destination"
      mediaIds={rightMediaIds || []}
      selectedIds={selectedIdsRight}
      onSelectId={handleSelectIdRight}
      isLoading={isLoadingRightMediaIds || isLoadingRightDates}
      isError={!!errorRightMediaIds}
      error={errorRightMediaIds}
      columnsCount={columnsCountRight}
      viewMode={mobileViewMode === 'both' ? 'split' : 'single'}
      onPreviewItem={handlePreviewItemRight}
      onDeleteSelected={handleConfirmDelete('right')}
      position="destination"
      filter={rightFilter}
      onToggleSidebar={onToggleRightPanel}
      onColumnsChange={handleRightColumnsChange}
      mobileViewMode={mobileViewMode}
      onToggleFullView={handleToggleRightFullView}
      dates={rightDates}
    />
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <GalleriesView
        viewMode={mobileViewMode}
        leftContent={leftGalleryContent}
        rightContent={rightGalleryContent}
      />

      <DeleteConfirmationDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={executeDelete}
        selectedIds={activeSide === 'left' ? selectedIdsLeft : selectedIdsRight}
        onCancel={() => setDeleteDialogOpen(false)}
        isPending={deleteMutation.isPending}
      />
    </div>
  );
};

export default GalleriesContainer;
