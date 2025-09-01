import React, { Suspense, useEffect, useRef } from "react";
import {
  PaletteIcon,
  EraserIcon,
  Trash2Icon,
  EyeIcon,
  EyeOffIcon,
  Rotate3dIcon,
  DownloadIcon,
  ImageIcon,
} from "lucide-react";
import DrawingCanvas, { DrawingCanvasHandle } from "./components/DrawingCanvas";
import ColorPicker from "./components/ColorPicker";
import { useDrawStore } from "./store/drawStore";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter";
import * as THREE from "three";


class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="h-screen w-screen flex flex-col items-center justify-center bg-black text-white p-4">
          <h2 className="text-xl font-bold mb-4">Something went wrong</h2>
          <p className="text-center mb-6">The application has encountered an error.</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700"
          >
            Reload Application
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty("--vh", `${vh}px`);
  document.documentElement.style.setProperty("--svh", `${window.screen.height * 0.01}px`);
}

// Custom hook for mobile Safari fixes
const useMobileSafariFix = () => {
  useEffect(() => {
    // Prevent elastic scrolling without breaking everything
    document.body.style.overscrollBehavior = 'none';
    
    // Only prevent default on canvas elements, not globally
    const handleTouchMove = (e) => {
      if (e.target.closest('.canvas-container') || e.touches.length > 1) {
        e.preventDefault();
      }
    };
    
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    
    return () => {
      document.body.style.overscrollBehavior = '';
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);
};

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
    toggleCamera,
  } = useDrawStore();

  const canvasRef = useRef<DrawingCanvasHandle>(null);


  useMobileSafariFix();

  const handleExportGLB = () => {
    if (!canvasRef.current) return;

 
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      alert("GLB export works best on desktop browsers. For iOS, try the PNG export instead.");
      return;
    }

    const meshes = canvasRef.current.getMeshes();
    if (!meshes.length) {
      alert("Nothing to export!");
      return;
    }

    const exportRoot = new THREE.Group();
    meshes.forEach((mesh) => {
      mesh.updateMatrixWorld(true);
      const clone = mesh.clone(true);
      if (clone.geometry) clone.geometry.computeVertexNormals();
      exportRoot.add(clone);
    });

    const exporter = new GLTFExporter();
    exporter.parse(
      exportRoot,
      (result) => {
        let blob;
        let filename;

        if (result instanceof ArrayBuffer) {
          blob = new Blob([result], { type: "model/gltf-binary" });
          filename = "draw.JesseJesse.glb";
        } else {
          const json = JSON.stringify(result, null, 2);
          blob = new Blob([json], { type: "model/gltf+json" });
          filename = "drawing.gltf";
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      },
      { binary: true },
    );
  };

  const handleExportPNG = () => {
    if (!canvasRef.current) return;


    if (!HTMLCanvasElement.prototype.toBlob) {
      alert("PNG export not supported on this device");
      return;
    }

    const renderer = canvasRef.current.getRenderer?.();
    const scene = canvasRef.current.getScene?.();
    const camera = canvasRef.current.getCamera?.();

    if (!renderer || !scene || !camera) {
      alert("PNG export not available!");
      return;
    }

    const originalWidth = renderer.domElement.width;
    const originalHeight = renderer.domElement.height;
    const originalPixelRatio = renderer.getPixelRatio();

    const scale = Math.min(2, 4096 / Math.max(originalWidth, originalHeight)); 
    renderer.setPixelRatio(window.devicePixelRatio * scale);
    renderer.setSize(originalWidth * scale, originalHeight * scale, false);

    renderer.render(scene, camera);

    renderer.domElement.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "draw.JesseJesse.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      renderer.setPixelRatio(originalPixelRatio);
      renderer.setSize(originalWidth, originalHeight, false);
    }, "image/png");
  };

  useEffect(() => {

    const preventGesture = (e: Event) => e.preventDefault();
    document.addEventListener("gesturestart", preventGesture);
    document.addEventListener("gesturechange", preventGesture);
    document.addEventListener("gestureend", preventGesture);

    setViewportHeight();
    window.addEventListener("resize", setViewportHeight);
    window.addEventListener("orientationchange", setViewportHeight);

    return () => {
      document.removeEventListener("gesturestart", preventGesture);
      document.removeEventListener("gesturechange", preventGesture);
      document.removeEventListener("gestureend", preventGesture);
      window.removeEventListener("resize", setViewportHeight);
      window.removeEventListener("orientationchange", setViewportHeight);
      
      // Clean up Three.js resources
      if (canvasRef.current && canvasRef.current.cleanup) {
        canvasRef.current.cleanup();
      }
    };
  }, []);

  return (
    <ErrorBoundary>
      <div
        className="relative w-screen bg-black text-white overflow-hidden no-select"
        style={{ height: "100vh", height: "calc(var(--vh) * 100)" }}
      >
        <Suspense
          fallback={
            <div className="h-screen w-screen flex items-center justify-center">
              Loading...
            </div>
          }
        >
          <DrawingCanvas ref={canvasRef} />
        </Suspense>

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 p-2 bg-black/50 backdrop-blur-md rounded-full">
          <button
            onClick={toggleColorPicker}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-800"
            aria-label="Color picker"
          >
            <div className="relative">
              <PaletteIcon size={24} />
              <div
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                style={{ backgroundColor: currentColor }}
              />
            </div>
          </button>

          <div className="h-6 w-px bg-gray-700" />

          <button
            onClick={toggleEraser}
            className={`w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-800 relative ${isErasing ? "bg-red-900/50 ring-2 ring-red-500 ring-opacity-50" : ""}`}
            aria-label="Eraser"
          >
            <EraserIcon size={20} />
            {isErasing && (
              <div className="absolute inset-0 rounded-full animate-pulse bg-red-500/20" />
            )}
          </button>

          <div className="h-6 w-px bg-gray-700" />

          <button
            onClick={toggleCamera}
            className={`w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-800 relative ${cameraEnabled ? "bg-blue-900/50 ring-2 ring-blue-500 ring-opacity-50" : ""}`}
            aria-label="Toggle camera controls"
          >
            <Rotate3dIcon size={20} />
            {cameraEnabled && (
              <div className="absolute inset-0 rounded-full animate-pulse bg-blue-500/20" />
            )}
          </button>

          <div className="h-6 w-px bg-gray-700" />

          <button
            onClick={toggleLineVisibility}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-800"
            aria-label={showLines ? "Hide lines" : "Show lines"}
          >
            {showLines ? <EyeIcon size={20} /> : <EyeOffIcon size={20} />}
          </button>

          <div className="h-6 w-px bg-gray-700" />

          <button
            onClick={clearLines}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-red-900"
            aria-label="Clear canvas"
          >
            <Trash2Icon size={20} />
          </button>

          <div className="h-6 w-px bg-gray-700" />

          <button
            onClick={handleExportGLB}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-green-800"
            aria-label="Download GLB"
          >
            <DownloadIcon size={20} />
          </button>

          <div className="h-6 w-px bg-gray-700" />

          <button
            onClick={handleExportPNG}
            className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-green-800"
            aria-label="Download PNG"
          >
            <ImageIcon size={20} />
          </button>
        </div>
        
        <div
          className="absolute bottom-16 left-1/2 transform -translate-x-1/2 text-xs select-none pointer-events-none"
          style={{ color: currentColor }}
        >
          draw.JesseJesse.com
        </div>

        {showColorPicker && (
          <ColorPicker
            currentColor={currentColor}
            onChange={setCurrentColor}
            onClose={toggleColorPicker}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}

export default App;
























































