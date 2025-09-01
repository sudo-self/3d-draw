import React from 'react';

interface ColorPickerProps {
  currentColor: string;
  onChange: (color: string) => void;
  onClose: () => void;
}

const colors = [
  '#e60000', // Vivid Red
  '#ffeb00', // Vivid Yellow
  '#00b300', // Vivid Green
  '#00cccc', // Vivid Cyan
  '#0066ff', // Vivid Blue
  '#cc00cc', // Vivid Magenta
  '#ff6600', // Vivid Orange
  '#f2f2f2', // Soft White
  '#990000', // Dark Red
  '#999900', // Dark Yellow
  '#009900', // Dark Green
  '#009999', // Dark Cyan
  '#000099', // Dark Blue
  '#990099', // Dark Magenta
  '#ff9933', // Light Orange
  '#cccccc', // Light Gray
];



const ColorPicker: React.FC<ColorPickerProps> = ({ currentColor, onChange, onClose }) => {
  return (
    <>
      <div 
        className="fixed inset-0" 
        onClick={onClose}
      />
      <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 bg-black/30 backdrop-blur-sm p-4 rounded-2xl shadow-2xl z-10 w-72 border border-white/10">
      <div className="grid grid-cols-4 gap-3">
        {colors.map((color) => (
          <button
            key={color}
            onClick={() => {
              onChange(color);
              onClose();
            }}
            className={`w-14 h-14 rounded-full transition-transform ${
              currentColor === color ? 'ring-2 ring-white/20 scale-110' : 'hover:scale-105'
            }`}
            style={{ 
              backgroundColor: color,
              boxShadow: `0 0 20px ${color}20`
            }}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>
    </div>
    </>
  );
};

export default ColorPicker;
