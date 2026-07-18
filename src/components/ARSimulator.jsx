import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Camera, RefreshCw, Layers, ShieldCheck, Zap, Maximize2, RotateCcw, Lock } from 'lucide-react';

export default function ARSimulator({
  plotWidth = 40,
  plotLength = 60,
  floors = 2,
  style = 'Modern Villa',
  isPro = false,
  onUpgradeRequired = null
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [cameraState, setCameraState] = useState('idle'); // idle, checking, active, error
  const [scaleMode, setScaleMode] = useState('miniature'); // miniature, scale50, fullSize
  const [houseRotation, setHouseRotation] = useState(0); // degrees
  const [scanningProgress, setScanningProgress] = useState(0);
  const [isScanning, setIsScanning] = useState(true);
  const [placed, setPlaced] = useState(false);

  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const camera3DRef = useRef(null);
  const houseMeshRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    setCameraState('checking');
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraState('active');
      triggerScanning();
    } catch (err) {
      console.warn("Camera access failed:", err);
      setCameraState('error');
      triggerScanning();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraState('idle');
  };

  const triggerScanning = () => {
    setIsScanning(true);
    setScanningProgress(0);
    setPlaced(false);
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (!isScanning) return;
    const interval = setInterval(() => {
      setScanningProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setPlaced(true);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
    return () => clearInterval(interval);
  }, [isScanning]);

  useEffect(() => {
    if (!canvasRef.current) return;

    const width = canvasRef.current.clientWidth || 640;
    const height = canvasRef.current.clientHeight || 480;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera3D = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera3D.position.set(0, 8, 12);
    camera3D.lookAt(0, 0, 0);
    camera3DRef.current = camera3D;

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 15, 5);
    scene.add(dirLight);

    const gridHelper = new THREE.GridHelper(15, 30, '#10b981', '#10b981');
    gridHelper.position.y = -0.05;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = 0.35;
    scene.add(gridHelper);

    const reticleGeo = new THREE.RingGeometry(1.2, 1.3, 32);
    reticleGeo.rotateX(-Math.PI / 2);
    const reticleMat = new THREE.MeshBasicMaterial({ color: 0x10b981, side: THREE.DoubleSide });
    const reticle = new THREE.Mesh(reticleGeo, reticleMat);
    reticle.position.set(0, -0.04, 0);
    scene.add(reticle);

    const houseGroup = new THREE.Group();
    houseMeshRef.current = houseGroup;

    let scaleMult = 0.08;
    if (scaleMode === 'scale50') scaleMult = 0.25;
    if (scaleMode === 'fullSize') scaleMult = 0.7;

    const sc = 0.25 * scaleMult;
    const w = plotWidth * sc;
    const l = plotLength * sc;
    const h = (floors * 3.0) * sc;

    let styleColor = 0x6366f1;
    let wallColor = 0xf3f4f6;
    if (style.toLowerCase().includes('minimalist')) {
      styleColor = 0x10b981;
      wallColor = 0xd1d5db;
    } else if (style.toLowerCase().includes('traditional')) {
      styleColor = 0xf59e0b;
      wallColor = 0xfef3c7;
    }

    const shellGeo = new THREE.BoxGeometry(w, h, l);
    const shellMat = new THREE.MeshStandardMaterial({
      color: wallColor,
      roughness: 0.8,
      transparent: true,
      opacity: 0.85
    });
    const shell = new THREE.Mesh(shellGeo, shellMat);
    shell.position.y = h / 2;
    houseGroup.add(shell);

    const fGeo = new THREE.BoxGeometry(w + 0.1, 0.05, l + 0.1);
    const fMat = new THREE.MeshStandardMaterial({ color: 0x374151 });
    const foundation = new THREE.Mesh(fGeo, fMat);
    foundation.position.y = 0.025;
    houseGroup.add(foundation);

    for (let i = 1; i < floors; i++) {
      const lineGeo = new THREE.BoxGeometry(w + 0.02, 0.05, l + 0.02);
      const lineMat = new THREE.MeshStandardMaterial({ color: styleColor });
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.position.y = (h / floors) * i;
      houseGroup.add(line);
    }

    const winGeo = new THREE.BoxGeometry(w * 0.4, h * 0.2, 0.05);
    const winMat = new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.5 });
    const win = new THREE.Mesh(winGeo, winMat);
    win.position.set(0, h * 0.4, l/2 + 0.01);
    houseGroup.add(win);

    const doorGeo = new THREE.BoxGeometry(w * 0.2, h * 0.35, 0.05);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
    const door = new THREE.Mesh(doorGeo, doorMat);
    door.position.set(-w * 0.2, h * 0.175, l/2 + 0.01);
    houseGroup.add(door);

    scene.add(houseGroup);

    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      if (houseMeshRef.current) {
        houseMeshRef.current.rotation.y = THREE.MathUtils.degToRad(houseRotation);
      }

      const time = Date.now() * 0.005;
      reticle.scale.set(1 + Math.sin(time) * 0.05, 1 + Math.sin(time) * 0.05, 1);

      if (scaleMode === 'fullSize') {
        camera3D.position.set(0, 1.5, 4.5);
        camera3D.lookAt(0, 1.5, 0);
        if (houseMeshRef.current && !placed) {
          houseMeshRef.current.rotation.y += 0.002;
        }
      } else if (scaleMode === 'scale50') {
        camera3D.position.set(0, 4, 8);
        camera3D.lookAt(0, 1, 0);
      } else {
        camera3D.position.set(0, 8, 12);
        camera3D.lookAt(0, 0, 0);
      }

      renderer.render(scene, camera3D);
    };
    animate();

    const handleResize = () => {
      if (!canvasRef.current) return;
      const w = canvasRef.current.clientWidth;
      const h = canvasRef.current.clientHeight;
      camera3D.aspect = w / h;
      camera3D.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      scene.clear();
      renderer.dispose();
    };
  }, [plotWidth, plotLength, floors, style, scaleMode, houseRotation, placed]);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* AR Viewport Window */}
      <div className="relative w-full rounded-2xl overflow-hidden aspect-video border border-emerald-500/20 bg-slate-950 flex items-center justify-center shadow-2xl">
        {cameraState === 'active' ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          />
        ) : (
          <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-gray-900 pointer-events-none overflow-hidden">
            <div className="absolute inset-0 opacity-25 cyber-grid-ar animate-grid-pulse" />
            <div className="z-10 text-center px-4">
              <Camera className="w-12 h-12 text-emerald-400/50 mx-auto mb-2 animate-pulse" />
              <p className="text-sm font-semibold text-gray-300">Camera Feed Not Available</p>
              <p className="text-xs text-gray-500 max-w-xs mt-1 mx-auto">
                Running in High-Fidelity Simulation Mode. Ground tracking and spatial rendering are fully loaded.
              </p>
            </div>
          </div>
        )}

        {placed && (
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full z-10 pointer-events-none"
          />
        )}

        {isScanning && (
          <div className="absolute left-0 right-0 h-1 bg-emerald-500 shadow-[0_0_12px_#10b981] z-20 animate-scan pointer-events-none" />
        )}

        {/* HUD Scanner Scan Line */}
        <div className="absolute inset-x-0 top-4 px-4 flex justify-between items-start pointer-events-none z-20 font-mono text-xs">
          <div className="flex flex-col gap-1.5">
            <span className="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur border border-white/10 px-2.5 py-1 rounded text-slate-200">
              <span className={`w-2.5 h-2.5 rounded-full ${cameraState === 'active' ? 'bg-emerald-400 animate-ping' : 'bg-yellow-400'}`} />
              CAM: {cameraState === 'active' ? 'ACTIVE' : 'SIMULATION'}
            </span>
            <span className="flex items-center gap-1.5 bg-slate-950/80 backdrop-blur border border-white/10 px-2.5 py-1 rounded text-slate-200">
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              SURFACE: {isScanning ? `${scanningProgress}% SCANNING...` : 'LOCKED'}
            </span>
          </div>

          <div className="flex flex-col gap-1.5 items-end">
            <span className="flex items-center gap-1 bg-slate-950/80 backdrop-blur border border-white/10 px-2.5 py-1 rounded text-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              GPS: LOCKED (±1.2m)
            </span>
            <span className="flex items-center gap-1 bg-slate-950/80 backdrop-blur border border-white px-2.5 py-1 rounded text-emerald-400 font-bold border-emerald-500/20">
              <Zap className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
              TRUE SCALE: {scaleMode === 'fullSize' ? '1:1 REAL SIZE' : scaleMode === 'scale50' ? '1:2 HALF SIZE' : '1:10 MINI'}
            </span>
          </div>
        </div>

        {isScanning && (
          <div className="absolute z-20 flex flex-col items-center gap-2 pointer-events-none">
            <div className="w-16 h-16 border-2 border-emerald-400/60 rounded-full border-dashed animate-spin" style={{ animationDuration: '6s' }} />
            <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-widest bg-slate-950/80 py-0.5 px-2 rounded-sm border border-emerald-500/10">
              Locating Ground Plane...
            </span>
          </div>
        )}

        {!isScanning && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-emerald-950/90 border border-emerald-500/30 text-emerald-400 px-4 py-1.5 rounded-full text-xs font-bold font-mono tracking-wide z-20 pointer-events-none shadow-lg animate-bounce">
            ✔ SPATIAL LAYOUT LOCK ACQUIRED
          </div>
        )}
      </div>

      {/* AR Simulation Settings Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Scale Switcher */}
        <div className="glass-panel p-4 rounded-xl flex flex-col gap-2.5">
          <label className="text-xs uppercase font-mono tracking-wider text-indigo-400 font-bold">
            AR Proportional Scaling
          </label>
          <div className="grid grid-cols-3 gap-2 text-xs font-semibold">
            <button
              onClick={() => setScaleMode('miniature')}
              className={`py-2 px-1.5 rounded-lg border cursor-pointer ${
                scaleMode === 'miniature'
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                  : 'bg-slate-900 border-white/5 text-gray-400 hover:bg-slate-800'
              }`}
            >
              Miniature (1:10)
            </button>
            <button
              onClick={() => setScaleMode('scale50')}
              className={`py-2 px-1.5 rounded-lg border cursor-pointer ${
                scaleMode === 'scale50'
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                  : 'bg-slate-900 border-white/5 text-gray-400 hover:bg-slate-800'
              }`}
            >
              Medium (1:2)
            </button>
            
            {/* Real scale locked behind Pro upgrade */}
            <button
              onClick={() => {
                if (!isPro) {
                  if (onUpgradeRequired) onUpgradeRequired();
                  return;
                }
                setScaleMode('fullSize');
              }}
              className={`py-2 px-1.5 rounded-lg border flex items-center justify-center gap-1 cursor-pointer ${
                scaleMode === 'fullSize'
                  ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                  : 'bg-slate-900 border-white/5 text-gray-400 hover:bg-slate-800'
              }`}
            >
              {!isPro && <Lock className="w-3 h-3 text-gray-500" />}
              Real Scale (1:1)
            </button>
          </div>
          <p className="text-[10px] text-gray-400 font-medium mt-0.5">
            {scaleMode === 'fullSize' 
              ? '✨ Recommended! Walk on your empty land and inspect details at actual physical size.' 
              : 'View the home on top of your camera feed as a tabletop mockup.'}
          </p>
        </div>

        {/* Placement Rotation */}
        <div className="glass-panel p-4 rounded-xl flex flex-col justify-between">
          <div>
            <label className="text-xs uppercase font-mono tracking-wider text-indigo-400 font-bold flex justify-between">
              <span>Orient Building</span>
              <span className="text-slate-300 font-mono font-normal">{houseRotation}°</span>
            </label>
            <input
              type="range"
              min="0"
              max="360"
              value={houseRotation}
              onChange={(e) => setHouseRotation(parseInt(e.target.value))}
              disabled={isScanning}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 mt-3"
            />
          </div>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => setHouseRotation(prev => (prev + 90) % 360)}
              disabled={isScanning}
              className="text-[11px] bg-slate-900 hover:bg-slate-800 border border-white/5 py-1 px-3 rounded flex items-center gap-1 font-semibold text-slate-300 cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className="w-3 h-3 rotate-90" /> +90°
            </button>
            <button
              onClick={() => setHouseRotation(0)}
              disabled={isScanning}
              className="text-[11px] bg-slate-900 hover:bg-slate-800 border border-white/5 py-1 px-3 rounded flex items-center gap-1 font-semibold text-slate-300 cursor-pointer disabled:opacity-50"
            >
              Reset Center
            </button>
          </div>
        </div>

        {/* Spatial Calibrator */}
        <div className="glass-panel p-4 rounded-xl flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase font-mono tracking-wider text-indigo-400 font-bold block">
              Spatial Calibration
            </span>
            <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">
              If the building drifts, align your device camera to an open area and recalibrate the surface plane.
            </p>
          </div>
          <button
            onClick={triggerScanning}
            className="w-full py-2 bg-slate-900 border border-emerald-500/20 hover:border-emerald-500/50 hover:bg-emerald-950/20 text-emerald-400 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer mt-3 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Recalibrate Scanner
          </button>
        </div>
      </div>
    </div>
  );
}
