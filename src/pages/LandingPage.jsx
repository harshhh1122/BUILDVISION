import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as THREE from 'three';
import Header from '../components/Header';

export default function LandingPage() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const width = canvasRef.current.clientWidth || 450;
    const height = canvasRef.current.clientHeight || 350;

    const scene = new THREE.Scene();
    scene.background = null;

    // Cinematic perspective camera
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    const cameraPos = new THREE.Vector3(0, 8.0, 0.1);
    camera.position.copy(cameraPos);
    
    const lookAtTarget = new THREE.Vector3(0, -0.2, 0);
    camera.lookAt(lookAtTarget);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
      alpha: true
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Warm & ambient lighting setup for matte zinc palette
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(5, 12, 7);
    scene.add(dirLight);

    // Root Group
    const houseGroup = new THREE.Group();
    scene.add(houseGroup);

    // 1. BASE GROUP (Slab base and 2D blueprints - does not scale on Y)
    const baseGroup = new THREE.Group();
    houseGroup.add(baseGroup);

    // 2. ELEVATION GROUP (Walls, furniture, pillars, roofs - scales vertically in Phase 2)
    const elevationGroup = new THREE.Group();
    houseGroup.add(elevationGroup);

    // -------------------------------------------------------------
    // Define Materials
    // -------------------------------------------------------------
    const solidMatBase = new THREE.MeshStandardMaterial({ 
      color: 0x18181b, roughness: 0.8, metalness: 0.2 
    });
    const solidMatWall = new THREE.MeshStandardMaterial({ 
      color: 0xe4e4e7, roughness: 0.85, transparent: true, opacity: 0 
    });
    const solidMatInnerWall = new THREE.MeshStandardMaterial({ 
      color: 0xa1a1aa, roughness: 0.9, transparent: true, opacity: 0 
    });
    const solidMatRoof = new THREE.MeshStandardMaterial({ 
      color: 0x3f3f46, roughness: 0.6, transparent: true, opacity: 0 
    });
    const solidMatFurniture = new THREE.MeshStandardMaterial({ 
      color: 0x71717a, roughness: 0.7, transparent: true, opacity: 0 
    });
    const solidMatPillar = new THREE.MeshStandardMaterial({ 
      color: 0xd4d4d8, roughness: 0.5, transparent: true, opacity: 0 
    });

    const wireMat = new THREE.MeshBasicMaterial({ 
      color: 0x06b6d4, wireframe: true, transparent: true, opacity: 1.0 
    });

    const solidMats = [solidMatWall, solidMatInnerWall, solidMatRoof, solidMatFurniture, solidMatPillar];

    // Helper: Add solid + wireframe element to the Elevation Group
    const addElevationElement = (geometry, solidMaterial, x, y, z, rotY = 0) => {
      const solidMesh = new THREE.Mesh(geometry, solidMaterial);
      solidMesh.position.set(x, y, z);
      if (rotY) solidMesh.rotation.y = rotY;
      elevationGroup.add(solidMesh);

      const wireMesh = new THREE.Mesh(geometry, wireMat);
      wireMesh.position.set(x, y, z);
      if (rotY) wireMesh.rotation.y = rotY;
      elevationGroup.add(wireMesh);
    };

    // -------------------------------------------------------------
    // Base Slab (Base Group)
    // -------------------------------------------------------------
    const baseSlabGeo = new THREE.BoxGeometry(4.2, 0.08, 3.2);
    const baseSlab = new THREE.Mesh(baseSlabGeo, solidMatBase);
    baseSlab.position.y = -0.46;
    baseGroup.add(baseSlab);

    const baseSlabWire = new THREE.Mesh(baseSlabGeo, wireMat);
    baseSlabWire.position.y = -0.46;
    baseGroup.add(baseSlabWire);

    // -------------------------------------------------------------
    // Elevation Elements (Elevation Group - scales from y = -0.42)
    // -------------------------------------------------------------
    
    // Outer Walls (Height 1.6, Thickness 0.08)
    const wallGeoBack = new THREE.BoxGeometry(3.8, 1.6, 0.08);
    addElevationElement(wallGeoBack, solidMatWall, 0, 0.38, -1.5); // Back Wall

    const wallGeoLeft = new THREE.BoxGeometry(0.08, 1.6, 3.0);
    addElevationElement(wallGeoLeft, solidMatWall, -1.9, 0.38, 0); // Left Wall

    const wallGeoRight = new THREE.BoxGeometry(0.08, 1.6, 1.9);
    addElevationElement(wallGeoRight, solidMatWall, 1.9, 0.38, -0.55); // Right Wall (stops at porch)

    const wallGeoFrontLiving = new THREE.BoxGeometry(2.4, 1.6, 0.08);
    addElevationElement(wallGeoFrontLiving, solidMatWall, -0.7, 0.38, 1.5); // Front Living Wall

    // Inner Partition Walls (2 Rooms, 2 Bathrooms, Porch separator)
    const wallGeoBedSeparator = new THREE.BoxGeometry(0.08, 1.6, 1.1);
    addElevationElement(wallGeoBedSeparator, solidMatInnerWall, 0, 0.38, -0.95); // Bedroom 1 / 2 Separator

    const wallGeoBedFront = new THREE.BoxGeometry(3.8, 1.6, 0.08);
    addElevationElement(wallGeoBedFront, solidMatInnerWall, 0, 0.38, -0.4); // Bedrooms / Living Divider

    const wallGeoBath1Inner = new THREE.BoxGeometry(0.08, 1.6, 0.8);
    addElevationElement(wallGeoBath1Inner, solidMatInnerWall, -1.0, 0.38, 0); // Bath 1 East Partition

    const wallGeoBath1Front = new THREE.BoxGeometry(0.9, 1.6, 0.08);
    addElevationElement(wallGeoBath1Front, solidMatInnerWall, -1.45, 0.38, 0.4); // Bath 1 South Wall

    const wallGeoBath2Inner = new THREE.BoxGeometry(0.08, 1.6, 0.8);
    addElevationElement(wallGeoBath2Inner, solidMatInnerWall, 1.0, 0.38, 0); // Bath 2 West Partition

    const wallGeoBath2Front = new THREE.BoxGeometry(0.9, 1.6, 0.08);
    addElevationElement(wallGeoBath2Front, solidMatInnerWall, 1.45, 0.38, 0.4); // Bath 2 South Wall

    const wallGeoPorchSeparator = new THREE.BoxGeometry(0.08, 1.6, 1.1);
    addElevationElement(wallGeoPorchSeparator, solidMatInnerWall, 0.5, 0.38, 0.95); // Living / Porch Separator

    // Porch Columns (Pillars)
    const pillarGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.6, 8);
    addElevationElement(pillarGeo, solidMatPillar, 0.6, 0.38, 1.4); // Column 1
    addElevationElement(pillarGeo, solidMatPillar, 1.8, 0.38, 1.4); // Column 2

    const railingGeo = new THREE.BoxGeometry(1.2, 0.5, 0.04);
    addElevationElement(railingGeo, solidMatPillar, 1.2, -0.17, 1.45); // Porch Railing

    // Mini Internal Furniture (Shows layout utilization)
    const bedGeo = new THREE.BoxGeometry(0.8, 0.3, 1.1);
    addElevationElement(bedGeo, solidMatFurniture, -1.45, -0.27, -0.95); // Bed 1 (Room 1)
    addElevationElement(bedGeo, solidMatFurniture, 0.55, -0.27, -0.95); // Bed 2 (Room 2)

    const toiletGeo = new THREE.BoxGeometry(0.25, 0.4, 0.3);
    addElevationElement(toiletGeo, solidMatFurniture, -1.5, -0.22, 0.05); // Toilet 1 (Bath 1)
    addElevationElement(toiletGeo, solidMatFurniture, 1.5, -0.22, 0.05); // Toilet 2 (Bath 2)

    // Roof Structures
    // Pitched Roof covering Back Bedrooms
    const pitchedRoofGeo = new THREE.ConeGeometry(2.3, 0.9, 4);
    pitchedRoofGeo.rotateY(Math.PI / 4);
    
    // Solid pitched roof
    const roofSolid = new THREE.Mesh(pitchedRoofGeo, solidMatRoof);
    roofSolid.position.set(0, 1.63, -0.95);
    roofSolid.scale.set(1.7, 1.0, 1.2);
    elevationGroup.add(roofSolid);

    // Wireframe pitched roof
    const roofWire = new THREE.Mesh(pitchedRoofGeo, wireMat);
    roofWire.position.set(0, 1.63, -0.95);
    roofWire.scale.set(1.7, 1.0, 1.2);
    elevationGroup.add(roofWire);

    // Flat roof over Living Room
    const flatRoofGeo = new THREE.BoxGeometry(2.4, 0.06, 1.1);
    addElevationElement(flatRoofGeo, solidMatRoof, -0.7, 1.21, 0.95);

    // Flat canopy roof over Porch
    const porchRoofGeo = new THREE.BoxGeometry(1.4, 0.04, 1.1);
    addElevationElement(porchRoofGeo, solidMatRoof, 1.2, 1.21, 0.95);

    // -------------------------------------------------------------
    // Architectural Blueprint Lines & Grid (Base Group)
    // -------------------------------------------------------------
    const gridHelper = new THREE.GridHelper(6, 12, '#3f3f46', '#18181b');
    gridHelper.position.y = -0.5;
    scene.add(gridHelper);

    const blueprintGroup = new THREE.Group();
    const blueprintLineMat = new THREE.LineBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.7 });

    const addBlueprintLine = (x1, z1, x2, z2) => {
      const points = [new THREE.Vector3(x1, -0.41, z1), new THREE.Vector3(x2, -0.41, z2)];
      const geo = new THREE.BufferGeometry().setFromPoints(points);
      blueprintGroup.add(new THREE.Line(geo, blueprintLineMat));
    };

    // Draw the actual 2 Room, 2 Bath, Porch floor plan walls:
    addBlueprintLine(-1.9, -1.5, 1.9, -1.5); // Back boundary
    addBlueprintLine(-1.9, -1.5, -1.9, 1.5); // Left boundary
    addBlueprintLine(1.9, -1.5, 1.9, 0.4);  // Right boundary (stops at porch)
    addBlueprintLine(-1.9, 1.5, 0.5, 1.5);  // Front boundary (Living)
    addBlueprintLine(0.5, 1.5, 0.5, 0.4);   // Living/Porch boundary
    addBlueprintLine(-1.9, -0.4, 1.9, -0.4); // Bedrooms / Living divider
    addBlueprintLine(0, -1.5, 0, -0.4);     // Bed 1 / Bed 2 divider
    
    addBlueprintLine(-1.0, -0.4, -1.0, 0.4); // Bath 1 inner divider
    addBlueprintLine(-1.9, 0.4, -1.0, 0.4);  // Bath 1 front wall
    
    addBlueprintLine(1.0, -0.4, 1.0, 0.4);  // Bath 2 inner divider
    addBlueprintLine(1.9, 0.4, 1.0, 0.4);   // Bath 2 front wall

    // Column markers (Crosses) on porch blueprint
    addBlueprintLine(0.55, 1.4, 0.65, 1.4);
    addBlueprintLine(0.6, 1.35, 0.6, 1.45);
    addBlueprintLine(1.75, 1.4, 1.85, 1.4);
    addBlueprintLine(1.8, 1.35, 1.8, 1.45);

    baseGroup.add(blueprintGroup);

    // 2D Laser sweep line
    const sweepGeo = new THREE.BoxGeometry(4.0, 0.01, 0.05);
    const sweepMat = new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0 });
    const sweepLaser = new THREE.Mesh(sweepGeo, sweepMat);
    sweepLaser.position.y = -0.40;
    baseGroup.add(sweepLaser);

    // VR Holographic Scan Ring
    const scanRingGeo = new THREE.RingGeometry(2.3, 2.45, 32);
    scanRingGeo.rotateX(-Math.PI / 2);
    const scanRingMat = new THREE.MeshBasicMaterial({ 
      color: 0x06b6d4, side: THREE.DoubleSide, transparent: true, opacity: 0 
    });
    const scanRing = new THREE.Mesh(scanRingGeo, scanRingMat);
    scene.add(scanRing);

    const easeInOutCubic = (x) => {
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    };

    let animationId;
    
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      
      const t = (Date.now() / 1000) % 16;
      
      const targetPos = new THREE.Vector3();
      const targetLook = new THREE.Vector3(0, -0.2, 0);

      if (t >= 0 && t < 4) {
        // --- PHASE 1: 2D BLUEPRINT DRAFT ---
        targetPos.set(0, 8.0, 0.05); // Direct top-down view
        targetLook.set(0, -0.2, 0);
        
        // Walls collapsed inside the floor base
        elevationGroup.scale.y = 0.001;
        elevationGroup.position.y = -0.42;

        solidMats.forEach(m => m.opacity = 0);
        roofSolid.material.opacity = 0;
        wireMat.opacity = 1.0;

        // Blueprint laser sweeps active
        sweepMat.opacity = 0.8;
        sweepLaser.position.z = Math.sin(Date.now() * 0.0035) * 1.3;

        scanRingMat.opacity = 0;
      } 
      else if (t >= 4 && t < 8) {
        // --- PHASE 2: 3D MORPHING EXTRUSION ---
        const progress = (t - 4) / 4;
        const eased = easeInOutCubic(progress);

        // Interpolate camera angle
        targetPos.lerpVectors(
          new THREE.Vector3(0, 8.0, 0.05),
          new THREE.Vector3(4.8, 4.2, 5.8),
          eased
        );
        targetLook.lerpVectors(
          new THREE.Vector3(0, -0.2, 0),
          new THREE.Vector3(0, 0.3, 0),
          eased
        );

        // Extrude elevation group from floor
        elevationGroup.scale.y = 0.001 + eased * 0.999;
        elevationGroup.position.y = -0.42 * (1.0 - eased); // shift to standard height

        // Fade in solids, wires stay slightly highlighted
        solidMats.forEach(m => m.opacity = eased);
        roofSolid.material.opacity = eased;
        wireMat.opacity = 1.0 - eased * 0.4;

        sweepMat.opacity = (1.0 - eased) * 0.8;
        scanRingMat.opacity = 0;
      }
      else if (t >= 8 && t < 12) {
        // --- PHASE 3: VR SCAN ORBIT ---
        const angle = (t - 8) * (Math.PI / 6); // Slow camera pan
        targetPos.set(
          Math.sin(angle + 0.8) * 6.8,
          4.2 + Math.sin(t * 1.5) * 0.3,
          Math.cos(angle + 0.8) * 6.8
        );
        targetLook.set(0, 0.3, 0);

        elevationGroup.scale.y = 1.0;
        elevationGroup.position.y = 0;

        solidMats.forEach(m => m.opacity = 1.0);
        roofSolid.material.opacity = 1.0;
        
        // Wires pulse green/cyan for scans
        wireMat.opacity = 0.5 + Math.sin(Date.now() * 0.012) * 0.3;

        // Active scan ring sweep
        scanRingMat.opacity = 0.8;
        scanRing.position.y = 0.4 + Math.sin((t - 8) * (Math.PI * 0.75)) * 1.5;
        
        sweepMat.opacity = 0;
      }
      else {
        // --- PHASE 4: COLLAPSE RESET ---
        const progress = (t - 12) / 4;
        const eased = easeInOutCubic(progress);

        // Lerp camera back to top-down
        targetPos.lerpVectors(
          new THREE.Vector3(4.8, 4.2, 5.8),
          new THREE.Vector3(0, 8.0, 0.05),
          eased
        );
        targetLook.lerpVectors(
          new THREE.Vector3(0, 0.3, 0),
          new THREE.Vector3(0, -0.2, 0),
          eased
        );

        // Collapse walls
        elevationGroup.scale.y = 1.0 - eased * 0.999;
        elevationGroup.position.y = -0.42 * eased;

        solidMats.forEach(m => m.opacity = 1.0 - eased);
        roofSolid.material.opacity = 1.0 - eased;
        wireMat.opacity = 0.6 + eased * 0.4;

        scanRingMat.opacity = (1.0 - eased) * 0.8;
        sweepMat.opacity = eased * 0.8;
      }

      // Camera transitions
      cameraPos.lerp(targetPos, 0.045);
      camera.position.copy(cameraPos);

      lookAtTarget.lerp(targetLook, 0.045);
      camera.lookAt(lookAtTarget);

      // Rotate root group slowly
      houseGroup.rotation.y = Date.now() * 0.00025;

      renderer.render(scene, camera);
    };
    
    animate();

    const handleResize = () => {
      if (!canvasRef.current) return;
      const w = canvasRef.current.clientWidth;
      const h = canvasRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      scene.clear();
      renderer.dispose();
    };
  }, []);

  const handleLaunchApp = () => {
    navigate('/dashboard');
  };

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 flex flex-col relative overflow-hidden font-sans select-none">
      
      {/* Background neutral grey glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-zinc-800/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-zinc-900/10 rounded-full blur-3xl pointer-events-none" />
      
      <Header active="home" />

      {/* Hero Section */}
      <section className="max-w-7xl w-full mx-auto px-6 py-4 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center relative z-10 flex-grow overflow-hidden h-[calc(100vh-140px)]">
        <div className="flex flex-col gap-5 text-center lg:text-left">
          <h2 className="text-4xl md:text-5xl lg:text-6.5xl font-black leading-[1.1] tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent select-none">
            <span className="block font-black text-white">See</span>
            <span className="block font-black text-zinc-200 mt-1">Your Future House</span>
            <span className="block font-bold text-zinc-400 mt-1">Built Before Laying a Brick.</span>
          </h2>
          <p style={{ fontFamily: "'Barlow Condensed', sans-serif" }} className="text-base md:text-[17px] text-zinc-300 leading-relaxed tracking-wide max-w-lg mx-auto lg:mx-0 font-light">
            BuildVision AI transforms empty land into interactive, life-sized virtual 3D buildings. Scan your plot, generate blueprint designs from voice command drafts, and run material cost estimations instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center lg:justify-start mt-1">
            <button
              onClick={handleLaunchApp}
              className="w-full sm:w-auto lg:ml-5 lg:mt-3 mt-2 scale-[1.05] bg-zinc-100 hover:bg-white text-zinc-950 font-black py-3 px-8 rounded-2xl shadow-2xl shadow-black/40 hover:shadow-black/55 cursor-pointer text-sm transition-all duration-300 ease-out hover:scale-[1.10] active:scale-[1.02]"
            >
              Start Designing Free
            </button>
          </div>
        </div>

        {/* 3D Dynamic Morphing Canvas Container */}
        <div className="flex justify-center items-center relative h-[320px] md:h-[420px] w-full">
          <div className="absolute w-[280px] h-[280px] md:w-[360px] md:h-[360px] bg-zinc-900/10 rounded-full border border-white/5 flex items-center justify-center shadow-[inset_0_1px_15px_rgba(255,255,255,0.02)]" />
          <canvas ref={canvasRef} className="w-full h-full relative z-10 cursor-grab active:cursor-grabbing" />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-zinc-950 py-4 text-center text-[10px] text-zinc-500 font-mono">
        <p>BuildVision AI System • Developed with Three.js & Tailwind CSS v4 • Copyright © 2026</p>
      </footer>
    </div>
  );
}
