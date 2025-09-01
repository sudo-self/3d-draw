import React from 'react';

interface ColorPickerProps {
  currentColor: string;
  onChange: (color: string) => void;
  onClose: () => void;
}

const colors = [
  '#e60000', // Vivid Red
  '#ff4500', // Orange Red
  '#ff9900', // Bright Orange
  '#ffeb00', // Vivid Yellow
  '#a3ff00', // Lime Green
  '#00b300', // Vivid Green
  '#00cccc', // Vivid Cyan
  '#0066ff', // Vivid Blue
  '#9933ff', // Bright Purple
  '#cc00cc', // Vivid Magenta
  '#ff66cc', // Pink
  '#ffcc99', // Peach
  '#f2f2f2', // Soft White
  '#cccccc', // Light Gray
  '#666666', // Medium Gray
  '#333333', // Dark Gray
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
