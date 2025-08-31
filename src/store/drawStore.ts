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

      const eraserSize = get().eraserSize;
      const filteredLines = lines.filter(line => {
        return !line.points.some(p => 
          Math.sqrt(
            Math.pow(p.x - point.x, 2) + 
            Math.pow(p.z - point.z, 2)
          ) < eraserSize
        );
      });
      

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
    

    const newLine: Line = {
      points: [point],
      color: currentColor,
    };
    

    const newLines = [...lines, newLine];
    

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
     
      const eraserSize = get().eraserSize;
      const filteredLines = lines.filter(line => {
        return !line.points.some(p => 
          Math.sqrt(
            Math.pow(p.x - point.x, 2) + 
            Math.pow(p.z - point.z, 2)
          ) < eraserSize
        );
      });
      
 
      if (filteredLines.length !== lines.length) {
        set({ lines: filteredLines });
      }
      return;
    }
    

    const currentLineIndex = lines.length - 1;
    const currentLine = lines[currentLineIndex];
    

    const lastPoint = currentLine.points[currentLine.points.length - 1];

    const distance = Math.sqrt(
      Math.pow(lastPoint.x - point.x, 2) + 
      Math.pow(lastPoint.z - point.z, 2)
    );
    

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
    

    const currentLineIndex = lines.length - 1;
    const currentLine = lines[currentLineIndex];
    
    let newLines = [...lines];
    
    if (currentLine.points.length === 1) {

      const point = currentLine.points[0];
      const updatedLine = {
        ...currentLine,
        points: [...currentLine.points, { ...point, x: point.x + 0.01 }],
      };
      
      newLines = [...lines.slice(0, currentLineIndex), updatedLine];
      
 
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
  

  get canUndo() {
    return get().historyIndex > 0;
  },
}));
