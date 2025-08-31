import { create } from 'zustand';
import { Point, Line } from '../types';

interface DrawState {
  lines: Line[];
  lineHistory: Line[][];
  historyIndex: number;
  currentColor: string;
  eraserSize: number;
  isDrawing: boolean;
  showLines: boolean;
  showColorPicker: boolean;
  isErasing: boolean;
  cameraEnabled: boolean;
  
  // Actions
  startNewLine: (point: Point, color: string) => void;
  addPointToCurrentLine: (point: Point) => void;
  endCurrentLine: () => void;
  undoLine: () => void;
  clearLines: () => void;
  setCurrentColor: (color: string) => void;
  toggleColorPicker: () => void;
  toggleLineVisibility: () => void;
  toggleEraser: () => void;
  toggleCamera: () => void;
  
  // Computed
  canUndo: boolean;
}

export const useDrawStore = create<DrawState>((set, get) => ({
  lines: [],
  lineHistory: [[]],
  historyIndex: 0,
  currentColor: '#ffffff',
  eraserSize: 0.15,
  isDrawing: false,
  showLines: true,
  showColorPicker: false,
  isErasing: false,
  cameraEnabled: false,
  
  startNewLine: (point: Point, _color: string) => {
    const { currentColor, lines, historyIndex, isErasing } = get();
    
    if (isErasing) {
      // Find and remove lines that intersect with the eraser
      const eraserSize = get().eraserSize;
      const filteredLines = lines.filter(line => {
        return !line.points.some(p => 
          Math.sqrt(
            Math.pow(p.x - point.x, 2) + 
            Math.pow(p.z - point.z, 2)
          ) < eraserSize
        );
      });
      
      // Only update if lines were actually erased
      if (filteredLines.length !== lines.length) {
        const newHistory = get().lineHistory.slice(0, historyIndex + 1);
        newHistory.push(filteredLines);
        
        set({
          lines: filteredLines,
          lineHistory: newHistory,
          historyIndex: historyIndex + 1,
          isDrawing: true,
        });
      }
      return;
    }
    
    // Create a new line with the current color
    const newLine: Line = {
      points: [point],
      color: currentColor,
    };
    
    // Add this line to the current lines
    const newLines = [...lines, newLine];
    
    // Update history by removing any future history and adding this as the latest state
    const newHistory = get().lineHistory.slice(0, historyIndex + 1);
    newHistory.push(newLines);
    
    set({
      lines: newLines,
      lineHistory: newHistory,
      historyIndex: historyIndex + 1,
      isDrawing: true,
    });
  },
  
  addPointToCurrentLine: (point: Point) => {
    const { lines, isDrawing, isErasing } = get();
    
    if (!isDrawing || lines.length === 0) return;
    
    if (isErasing) {
      // Continue erasing lines that intersect with the eraser
      const eraserSize = get().eraserSize;
      const filteredLines = lines.filter(line => {
        return !line.points.some(p => 
          Math.sqrt(
            Math.pow(p.x - point.x, 2) + 
            Math.pow(p.z - point.z, 2)
          ) < eraserSize
        );
      });
      
      // Only update if lines were actually erased
      if (filteredLines.length !== lines.length) {
        set({ lines: filteredLines });
      }
      return;
    }
    
    // Add the point to the current line
    const currentLineIndex = lines.length - 1;
    const currentLine = lines[currentLineIndex];
    
    // Get the last point to check if we need to add the new point
    const lastPoint = currentLine.points[currentLine.points.length - 1];
    
    // Calculate distance to avoid adding points that are too close
    const distance = Math.sqrt(
      Math.pow(lastPoint.x - point.x, 2) + 
      Math.pow(lastPoint.z - point.z, 2)
    );
    
    // Only add point if it's far enough from the last point (prevents too many points)
    if (distance > 0.05) {
      const updatedLine = {
        ...currentLine,
        points: [...currentLine.points, point],
      };
      
      const newLines = [...lines.slice(0, currentLineIndex), updatedLine];
      
      set({ lines: newLines });
    }
  },
  
  endCurrentLine: () => {
    const { lines, historyIndex } = get();
    
    if (lines.length === 0) return;
    
    // Handle case where a line has only one point (make it a dot)
    const currentLineIndex = lines.length - 1;
    const currentLine = lines[currentLineIndex];
    
    let newLines = [...lines];
    
    if (currentLine.points.length === 1) {
      // Add the same point to make it a visible dot
      const point = currentLine.points[0];
      const updatedLine = {
        ...currentLine,
        points: [...currentLine.points, { ...point, x: point.x + 0.01 }],
      };
      
      newLines = [...lines.slice(0, currentLineIndex), updatedLine];
      
      // Update history
      const newHistory = get().lineHistory.slice(0, historyIndex + 1);
      newHistory[historyIndex] = newLines;
      
      set({
        lines: newLines,
        lineHistory: newHistory,
        isDrawing: false,
      });
    } else {
      set({ isDrawing: false });
    }
  },
  
  undoLine: () => {
    const { historyIndex, lineHistory } = get();
    
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({
        lines: lineHistory[newIndex],
        historyIndex: newIndex,
      });
    }
  },
  
  toggleEraser: () => {
    set((state) => ({ isErasing: !state.isErasing }));
  },

  toggleCamera: () => {
    set((state) => ({ cameraEnabled: !state.cameraEnabled }));
  },
  
  clearLines: () => {
    // Clear all lines and reset history
    set({
      lines: [],
      lineHistory: [[]],
      historyIndex: 0,
    });
  },
  
  setCurrentColor: (color: string) => {
    set({ currentColor: color });
  },
  
  toggleColorPicker: () => {
    set((state) => ({ showColorPicker: !state.showColorPicker }));
  },

  toggleLineVisibility: () => {
    set((state) => ({ showLines: !state.showLines }));
  },
  
  // Computed properties
  get canUndo() {
    return get().historyIndex > 0;
  },
}));