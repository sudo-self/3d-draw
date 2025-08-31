import React, { Suspense, useEffect, useRef } from 'react';
import {
  PaletteIcon,
  EraserIcon,
  Trash2Icon,
  EyeIcon,
  EyeOffIcon,
  Rotate3dIcon,
  DownloadIcon
} from 'lucide-react';
import DrawingCanvas, { DrawingCanvasHandle } from './components/DrawingCanvas';
import ColorPicker from './components/ColorPicker';
import { useDrawStore } from './store/drawStore';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter';
import * as THREE from 'three';

function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

function App() {
  const {
    currentColor,
    setCurrentColor,
    clearLines,
    showColorPicker,
    toggleColorPicker,
    showLines,
    toggleLineVisibility,
    isErasing,
    toggleEraser,
    cameraEnabled,
    toggleCamera
  } = useDrawStore();

  // Correctly typed ref to DrawingCanvas
  const canvasRef = useRef<DrawingCanvasHandle>(null);

  const handleExportGLB = () => {
    if (!canvasRef.current) return;

    const meshes = canvasRef.current.getMeshes();
    if (!meshes.length) {
      alert('Nothing to export!');
      return;
    }

    // Create a temporary scene and add all meshes
    const exportScene = new THREE.Scene();
    meshes.forEach((mesh) => exportScene.add(mesh.clone()));

    const exporter = new GLTFExporter();
    exporter.parse(
      exportScene,
      (result) => {
        const blob = new Blob(
          [result instanceof ArrayBuffer ? result : JSON.stringify(result)],
          { type: 'model/gltf-binary' }
        );
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'drawing.glb';
        link.click();
      },
      { binary: true }
    );
  };

  useEffect(() => {
    const preventDefault = (e: Event) => e.preventDefault();
    document.addEventListener('touchmove', preventDefault, { passive: false });
    document.addEventListener('gesturestart', preventDefault);
    document.addEventListener('gesturechange', preventDefault);
    document.addEventListener('gestureend', preventDefault);
    setViewportHeight();
    window.addEventListener('resize', setViewportHeight);
    window.addEventListener('orientationchange', setViewportHeight);
    return () => {
      document.removeEventListener('touchmove', preventDefault);
      document.removeEventListener('gesturestart', preventDefault);
      document.removeEventListener('gesturechange', preventDefault);
      document.removeEventListener('gestureend', preventDefault);
      window.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('orientationchange', setViewportHeight);
    };
  }, []);

  return (
    <div
      className="relative w-screen bg-black text-white overflow-hidden"
      style={{ height: 'calc(var(--vh) * 100)' }}
    >
      <Suspense fallback={<div className="h-screen w-screen flex items-center justify-center">Loading...</div>}>
        <DrawingCanvas ref={canvasRef} />
      </Suspense>

      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 p-2 bg-black/50 backdrop-blur-md rounded-full">
        {/* Color Picker */}
        <button onClick={toggleColorPicker} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-800" aria-label="Color picker">
          <div className="relative">
            <PaletteIcon size={24} />
            <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full" style={{ backgroundColor: currentColor }} />
          </div>
        </button>

        <div className="h-6 w-px bg-gray-700" />

        {/* Eraser */}
        <button onClick={toggleEraser} className={`w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-800 relative ${isErasing ? 'bg-red-900/50 ring-2 ring-red-500 ring-opacity-50' : ''}`} aria-label="Eraser">
          <EraserIcon size={20} />
          {isErasing && <div className="absolute inset-0 rounded-full animate-pulse bg-red-500/20" />}
        </button>

        <div className="h-6 w-px bg-gray-700" />

        {/* Camera */}
        <button onClick={toggleCamera} className={`w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-800 relative ${cameraEnabled ? 'bg-blue-900/50 ring-2 ring-blue-500 ring-opacity-50' : ''}`} aria-label="Toggle camera controls">
          <Rotate3dIcon size={20} />
          {cameraEnabled && <div className="absolute inset-0 rounded-full animate-pulse bg-blue-500/20" />}
        </button>

        <div className="h-6 w-px bg-gray-700" />

        {/* Toggle lines */}
        <button onClick={toggleLineVisibility} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-800" aria-label={showLines ? "Hide lines" : "Show lines"}>
          {showLines ? <EyeIcon size={20} /> : <EyeOffIcon size={20} />}
        </button>

        <div className="h-6 w-px bg-gray-700" />

        {/* Clear canvas */}
        <button onClick={clearLines} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-900" aria-label="Clear canvas">
          <Trash2Icon size={20} />
        </button>

        <div className="h-6 w-px bg-gray-700" />

        {/* Download GLB */}
        <button onClick={handleExportGLB} className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-green-800" aria-label="Download GLB">
          <DownloadIcon size={20} />
        </button>
      </div>

      {showColorPicker && <ColorPicker currentColor={currentColor} onChange={setCurrentColor} onClose={toggleColorPicker} />}
    </div>
  );
}

export default App;





