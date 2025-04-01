
import React, { memo } from 'react';
import LazyMediaItem from '@/components/LazyMediaItem';

interface GalleryGridCellProps {
  columnIndex: number;
  rowIndex: number;
  style: React.CSSProperties;
  data: {
    mediaIds: string[];
    selectedIds: string[];
    onSelectId: (id: string, extendSelection: boolean) => void;
    showDates?: boolean;
    updateMediaInfo?: (id: string, info: any) => void;
    position: 'source' | 'destination';
    columnsCount: number;
    gap: number;
    calculateCellStyle: (style: React.CSSProperties, columnIndex: number) => React.CSSProperties;
  };
}

/**
 * A cell component for the virtualized grid that renders a media item
 * With improved positioning calculations
 */
const GalleryGridCell = memo(({ columnIndex, rowIndex, style, data }: GalleryGridCellProps) => {
  // Calculate the index in the flat array based on row and column
  const index = rowIndex * data.columnsCount + columnIndex;
  
  // Return null for out of bounds indices to avoid errors
  if (index >= data.mediaIds.length) return null;
  
  // Get the media ID and check if it's selected
  const id = data.mediaIds[index];
  const isSelected = data.selectedIds.includes(id);
  
  // Calculate the cell style with proper gap adjustments
  const adjustedStyle = data.calculateCellStyle(style, columnIndex);
  
  return (
    <div style={adjustedStyle}>
      <LazyMediaItem
        key={id}
        id={id}
        selected={isSelected}
        onSelect={data.onSelectId}
        index={index}
        showDates={data.showDates}
        updateMediaInfo={data.updateMediaInfo}
        position={data.position}
      />
    </div>
  );
});

// Set display name for debugging
GalleryGridCell.displayName = 'GalleryGridCell';

export default GalleryGridCell;
