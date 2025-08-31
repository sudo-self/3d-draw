import React from 'react';

interface ColorPickerProps {
  currentColor: string;
  onChange: (color: string) => void;
  onClose: () => void;
}

const colors = [
  '#ff0000', // Bright Red
  '#ffff00', // Bright Yellow
  '#00ff00', // Bright Green
  '#00ffff', // Bright Cyan
  '#0088ff', // Bright Blue
  '#ff00ff', // Bright Magenta
  '#ff8800', // Bright Orange
  '#ffffff', // White
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