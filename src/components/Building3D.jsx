import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';
import { Download, Lock } from 'lucide-react';

export default function Building3D({
  plotWidth = 40,
  plotLength = 60,
  floors = 2,
  bedrooms = 3,
  bathrooms = 2,
  style = 'Modern Villa',
  showRoof = true,
  explodedView = false,
  currentFloor = 0,
  layoutOption = 'A',
  isPro = false,
  onUpgradeRequired = null,
  onRoomSelect = null,
  layoutData = null
}) {
  const mountRef = useRef(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const doorMeshes = useRef([]);
  const roomMeshes = useRef([]);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || 500;
    const height = container.clientHeight || 400;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0b0f19');
    sceneRef.current = scene;

    const gridHelper = new THREE.GridHelper(50, 50, '#6366f1', '#1f2937');
    gridHelper.position.y = -0.01;
    scene.add(gridHelper);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(20, 20, 30);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.maxPolarAngle = Math.PI / 2 - 0.05;
    controls.minDistance = 5;
    controls.maxDistance = 100;
    controlsRef.current = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(20, 40, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x818cf8, 0.3);
    fillLight.position.set(-20, 10, -20);
    scene.add(fillLight);

    const sc = 0.25;
    const w = plotWidth * sc;
    const l = plotLength * sc;
    const get3DX = (gx) => -w/2 + gx * sc;
    const get3DZ = (gz) => -l/2 + gz * sc;
    const floorHeight = 3.0;
    const wallThick = 0.15;

    // Plot wire
    const plotGeo = new THREE.BoxGeometry(w, 0.05, l);
    const plotMat = new THREE.MeshBasicMaterial({ color: 0x4b5563, wireframe: true });
    const plotMesh = new THREE.Mesh(plotGeo, plotMat);
    scene.add(plotMesh);

    let themeColor = 0x6366f1;
    let wallColor = 0xf3f4f6;
    let windowColor = 0x38bdf8;
    let roofColor = 0x475569;

    if (style.toLowerCase().includes('minimalist')) {
      themeColor = 0x10b981;
      wallColor = 0xe5e7eb;
      roofColor = 0x1f2937;
    } else if (style.toLowerCase().includes('traditional')) {
      themeColor = 0xf59e0b;
      wallColor = 0xfef3c7;
      roofColor = 0x991b1b;
    } else if (style.toLowerCase().includes('industrial')) {
      themeColor = 0xef4444;
      wallColor = 0x6b7280;
      roofColor = 0x111827;
    }

    const wallMat = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.9 });
    const partitionMat = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.9, transparent: true, opacity: 0.85 });
    const activeFloorMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.7 });
    const inactiveFloorMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.7, transparent: true, opacity: 0.4 });
    const glassMat = new THREE.MeshPhysicalMaterial({ color: windowColor, transparent: true, opacity: 0.4, roughness: 0.1 });
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1f2937 });
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x78350f });
    const roofMat = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.6 });
    const courtGlassMat = new THREE.MeshPhysicalMaterial({ color: 0x34d399, transparent: true, opacity: 0.25, roughness: 0.2 });
    
    // Furniture specific materials
    const bedWoodMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.7 }); // dark wood
    const fabricMat = new THREE.MeshStandardMaterial({ color: 0x52525b, roughness: 0.9 }); // fabric grey
    const cushionMat = new THREE.MeshStandardMaterial({ color: 0xe4e4e7, roughness: 0.9 }); // white fabric

    doorMeshes.current = [];
    roomMeshes.current = [];

    const createBox = (xSize, ySize, zSize, material, posX, posY, posZ) => {
      const geo = new THREE.BoxGeometry(xSize, ySize, zSize);
      const mesh = new THREE.Mesh(geo, material);
      mesh.position.set(posX, posY, posZ);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      return mesh;
    };

    const buildingGroup = new THREE.Group();
    buildingGroup.name = 'building-group';

    // Setbacks
    const setbackSide = Math.max(3, plotWidth * 0.1) * sc;
    const setbackBack = Math.max(4, plotLength * 0.1) * sc;
    const houseWidth = (plotWidth - Math.max(3, plotWidth * 0.1) * 2) * sc;
    const houseLength = (plotLength - Math.max(5, plotLength * 0.12) - Math.max(4, plotLength * 0.1)) * sc;

    const ox = -w/2 + setbackSide + houseWidth/2;
    const oz = -l/2 + setbackBack + houseLength/2;

    // Procedural 3D Furniture builder helper
    const addFurniture3D = (targetGroup, type, px, py, pz, rotation = 0, fW = 1.6, fL = 1.6, fH = 0.5) => {
      // Furniture rendering disabled by user request
      return;
    };

    for (let f = 0; f < floors; f++) {
      const floorGroup = new THREE.Group();
      floorGroup.name = `Floor-${f}`;

      let hOffset = f * floorHeight;
      if (explodedView) {
        hOffset = f * (floorHeight + 4.0);
      }

      const isCurrentFloor = f === currentFloor;
      const fMat = isCurrentFloor ? activeFloorMat : inactiveFloorMat;
      const wMat = isCurrentFloor ? wallMat : new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.9, transparent: true, opacity: 0.2 });

      // Floor Slab
      if (layoutOption === 'C') {
        const cw = houseWidth * 0.22;
        const cl = houseLength * 0.18;
        
        const slabBack = createBox(houseWidth, 0.15, (houseLength - cl)/2, fMat, ox, hOffset, oz - houseLength/2 + (houseLength - cl)/4);
        const slabFront = createBox(houseWidth, 0.15, (houseLength - cl)/2, fMat, ox, hOffset, oz + houseLength/2 - (houseLength - cl)/4);
        const slabLeft = createBox((houseWidth - cw)/2, 0.15, cl, fMat, ox - houseWidth/2 + (houseWidth - cw)/4, hOffset, oz);
        const slabRight = createBox((houseWidth - cw)/2, 0.15, cl, fMat, ox + houseWidth/2 - (houseWidth - cw)/4, hOffset, oz);
        floorGroup.add(slabBack, slabFront, slabLeft, slabRight);

        // Skywell columns
        const col1 = createBox(0.15, floorHeight, 0.15, partitionMat, ox - cw/2, hOffset + floorHeight/2, oz - cl/2);
        const col2 = createBox(0.15, floorHeight, 0.15, partitionMat, ox + cw/2, hOffset + floorHeight/2, oz - cl/2);
        const col3 = createBox(0.15, floorHeight, 0.15, partitionMat, ox - cw/2, hOffset + floorHeight/2, oz + cl/2);
        const col4 = createBox(0.15, floorHeight, 0.15, partitionMat, ox + cw/2, hOffset + floorHeight/2, oz + cl/2);
        floorGroup.add(col1, col2, col3, col4);

        // Courtyard glass barrier
        const barrierH = 0.9;
        const barL = createBox(0.05, barrierH, cl, courtGlassMat, ox - cw/2, hOffset + barrierH/2, oz);
        const barR = createBox(0.05, barrierH, cl, courtGlassMat, ox + cw/2, hOffset + barrierH/2, oz);
        const barB = createBox(cw, barrierH, 0.05, courtGlassMat, ox, hOffset + barrierH/2, oz - cl/2);
        const barF = createBox(cw, barrierH, 0.05, courtGlassMat, ox, hOffset + barrierH/2, oz + cl/2);
        floorGroup.add(barL, barR, barB, barF);

      } else {
        const slab = createBox(houseWidth, 0.15, houseLength, fMat, ox, hOffset, oz);
        floorGroup.add(slab);
      }

      // Exterior walls
      const wallL = createBox(wallThick, floorHeight, houseLength, wMat, ox - houseWidth/2 + wallThick/2, hOffset + floorHeight/2, oz);
      const wallR = createBox(wallThick, floorHeight, houseLength, wMat, ox + houseWidth/2 - wallThick/2, hOffset + floorHeight/2, oz);
      const wallB = createBox(houseWidth, floorHeight, wallThick, wMat, ox, hOffset + floorHeight/2, oz - houseLength/2 + wallThick/2);
      
      const wallF_L = createBox(houseWidth * 0.35, floorHeight, wallThick, wMat, ox - houseWidth * 0.325, hOffset + floorHeight/2, oz + houseLength/2 - wallThick/2);
      const wallF_R = createBox(houseWidth * 0.35, floorHeight, wallThick, wMat, ox + houseWidth * 0.325, hOffset + floorHeight/2, oz + houseLength/2 - wallThick/2);
      const wallF_T = createBox(houseWidth * 0.3, floorHeight * 0.3, wallThick, wMat, ox, hOffset + floorHeight * 0.85, oz + houseLength/2 - wallThick/2);
      
      floorGroup.add(wallL, wallR, wallB, wallF_L, wallF_R, wallF_T);

      // Main door
      if (f === 0 && isCurrentFloor) {
        const doorPivot = new THREE.Group();
        doorPivot.position.set(ox - houseWidth * 0.15, hOffset, oz + houseLength/2 - wallThick);
        const doorPanel = createBox(1.5, floorHeight * 0.7, 0.1, doorMat, 0.75, floorHeight * 0.35, 0);
        doorPanel.userData = { type: 'door', open: false };
        doorPivot.add(doorPanel);
        floorGroup.add(doorPivot);
        doorMeshes.current.push(doorPanel);
      }

      // Partitions & Furniture placement
      if (layoutData) {
        // Dynamic Gemini blueprint layout rendering
        const setbackSideFeet = Math.max(3, plotWidth * 0.1);
        const setbackBackFeet = Math.max(4, plotLength * 0.1);
        
        // Rooms (for clickable HUD overlays)
        layoutData.rooms?.forEach((r) => {
          if (r.floor == f) {
            const rx = get3DX(r.x - setbackSideFeet + r.w / 2);
            const rz = get3DZ(r.y - setbackBackFeet + r.h / 2);
            const rw = r.w * sc;
            const rh = r.h * sc;
            
            const roomFloor = createBox(rw, 0.02, rh, new THREE.MeshBasicMaterial({ visible: false }), rx, hOffset + 0.05, rz);
            roomFloor.userData = { 
              roomName: r.label, 
              area: `${Math.round(r.w * r.h)} sq ft`, 
              cost: `₹${(r.w * r.h * 1500 / 100000).toFixed(1)} Lakhs` 
            };
            floorGroup.add(roomFloor);
            roomMeshes.current.push(roomFloor);
          }
        });

        // Walls
        layoutData.walls?.forEach(w => {
          if (w.floor === undefined || w.floor == f) {
            const x1 = get3DX(w.x1 - setbackSideFeet);
            const z1 = get3DZ(w.y1 - setbackBackFeet);
            const x2 = get3DX(w.x2 - setbackSideFeet);
            const z2 = get3DZ(w.y2 - setbackBackFeet);
            
            const dx = Math.abs(x2 - x1);
            const dz = Math.abs(z2 - z1);
            
            const wWidth = dx === 0 ? wallThick : dx;
            const wLength = dz === 0 ? wallThick : dz;
            const cx = (x1 + x2) / 2;
            const cz = (z1 + z2) / 2;
            
            const wallBox = createBox(wWidth, floorHeight, wLength, partitionMat, cx, hOffset + floorHeight/2, cz);
            floorGroup.add(wallBox);
          }
        });

        // Doors
        layoutData.doors?.forEach(d => {
          if (d.floor === undefined || d.floor == f) {
            const dx = get3DX(d.x - setbackSideFeet);
            const dz = get3DZ(d.y - setbackBackFeet);
            const dSize = (d.size || 3) * sc;
            
            const doorPivot = new THREE.Group();
            doorPivot.position.set(dx, hOffset, dz);
            doorPivot.rotation.y = (d.angle * Math.PI) / 180;
            
            const doorPanel = createBox(dSize, floorHeight * 0.7, 0.08, doorMat, dSize/2, floorHeight * 0.35, 0);
            doorPanel.userData = { type: 'door', open: false };
            doorPivot.add(doorPanel);
            
            floorGroup.add(doorPivot);
            doorMeshes.current.push(doorPanel);
          }
        });

        // Windows
        layoutData.windows?.forEach(win => {
          if (win.floor === undefined || win.floor == f) {
            const wx = get3DX(win.x - setbackSideFeet);
            const wz = get3DZ(win.y - setbackBackFeet);
            const wSize = (win.size || 4) * sc;
            
            const wWidth = win.isVertical ? wallThick * 1.2 : wSize;
            const wLength = win.isVertical ? wSize : wallThick * 1.2;
            
            const winMesh = createBox(wWidth, floorHeight * 0.4, wLength, glassMat, wx, hOffset + floorHeight * 0.5, wz);
            floorGroup.add(winMesh);
          }
        });

        // Furniture
        layoutData.furniture?.forEach(furn => {
          if (furn.floor === undefined || furn.floor == f) {
            const fx = get3DX(furn.x - setbackSideFeet);
            const fz = get3DZ(furn.y - setbackBackFeet);
            addFurniture3D(floorGroup, furn.type, fx, hOffset, fz, (furn.rotation * Math.PI) / 180, furn.w * sc, furn.h * sc);
          }
        });

      } else {
        if (layoutOption === 'A') {
          if (f === 0) {
            const splitY = hOffset + floorHeight/2;
            const splitZ = oz;
            const divH = createBox(houseWidth, floorHeight, wallThick, partitionMat, ox, splitY, splitZ);
            floorGroup.add(divH);

            const masterFloor = createBox(houseWidth*0.65, 0.02, houseLength*0.45, new THREE.MeshBasicMaterial({ visible: false }), ox - houseWidth*0.17, hOffset+0.05, oz - houseLength*0.22);
            masterFloor.userData = { roomName: 'Master Suite', area: `${Math.round(plotWidth*plotLength*0.2)} sq ft`, cost: '₹3.6 Lakhs' };
            floorGroup.add(masterFloor);
            roomMeshes.current.push(masterFloor);

            // Place 3D bed in master suite
            addFurniture3D(floorGroup, 'bed', ox - houseWidth*0.17, hOffset, oz - houseLength*0.28, 0, 1.8, 1.8);

            const openLoungeFloor = createBox(houseWidth, 0.02, houseLength*0.5, new THREE.MeshBasicMaterial({ visible: false }), ox, hOffset+0.05, oz + houseLength*0.25);
            openLoungeFloor.userData = { roomName: 'Open Lounge & Kitchen', area: `${Math.round(plotWidth*plotLength*0.35)} sq ft`, cost: '₹5.5 Lakhs' };
            floorGroup.add(openLoungeFloor);
            roomMeshes.current.push(openLoungeFloor);

            // Place sofa, dining and kitchen in lounge
            addFurniture3D(floorGroup, 'sofa', ox - houseWidth*0.18, hOffset, oz + houseLength*0.22, 0, 2.2, 1.8);
            addFurniture3D(floorGroup, 'dining', ox + houseWidth*0.15, hOffset, oz + houseLength*0.32, 0, 1.4, 2.0);
            addFurniture3D(floorGroup, 'kitchen', ox + houseWidth*0.38, hOffset, oz + houseLength*0.08, Math.PI / 2, 2.2, 0.6);
          }
        } else if (layoutOption === 'B') {
          if (f === 0) {
            const splitX = ox;
            const splitZ = oz;
            const divV = createBox(wallThick, floorHeight, houseLength * 0.5, partitionMat, splitX, hOffset + floorHeight/2, oz - houseLength * 0.25);
            const divH = createBox(houseWidth, floorHeight, wallThick, partitionMat, ox, hOffset + floorHeight/2, splitZ);
            floorGroup.add(divV, divH);

            const bedFloor = createBox(houseWidth*0.5, 0.02, houseLength*0.5, new THREE.MeshBasicMaterial({ visible: false }), ox - houseWidth*0.25, hOffset+0.05, oz - houseLength*0.25);
            bedFloor.userData = { roomName: 'Bedroom 1 (Compact)', area: `${Math.round(plotWidth*plotLength*0.18)} sq ft`, cost: '₹2.1 Lakhs' };
            floorGroup.add(bedFloor);
            roomMeshes.current.push(bedFloor);

            // Bed in bed 1
            addFurniture3D(floorGroup, 'bed', ox - houseWidth*0.25, hOffset, oz - houseLength*0.32, 0, 1.6, 1.6);

            const compactLiving = createBox(houseWidth*0.55, 0.02, houseLength*0.5, new THREE.MeshBasicMaterial({ visible: false }), ox - houseWidth*0.22, hOffset+0.05, oz + houseLength*0.25);
            floorGroup.add(compactLiving);

            // Sofa and Kitchenette in Layout B
            addFurniture3D(floorGroup, 'sofa', ox - houseWidth*0.25, hOffset, oz + houseLength*0.2, 0, 1.8, 1.5);
            addFurniture3D(floorGroup, 'kitchen', ox + houseWidth*0.28, hOffset, oz + houseLength*0.25, Math.PI/2, 2.0, 0.6);
          }
        } else {
          if (f === 0) {
            const courtW = houseWidth * 0.22;
            const courtH = houseLength * 0.18;
            const divNW = createBox(houseWidth * 0.45, floorHeight, wallThick, partitionMat, ox - houseWidth*0.275, hOffset + floorHeight/2, oz - courtH);
            const divSE = createBox(wallThick, floorHeight, houseLength * 0.4, partitionMat, ox + courtW/2, hOffset + floorHeight/2, oz + houseLength * 0.3);
            floorGroup.add(divNW, divSE);

            const courtFloor = createBox(courtW, 0.02, courtH, new THREE.MeshBasicMaterial({ visible: false }), ox, hOffset+0.05, oz);
            courtFloor.userData = { roomName: 'Vastu Air Courtyard 🍃', area: `${Math.round(plotWidth*plotLength*0.05)} sq ft`, cost: '₹0.8 Lakhs' };
            floorGroup.add(courtFloor);
            roomMeshes.current.push(courtFloor);

            // Bed in NW Guest Bed
            addFurniture3D(floorGroup, 'bed', ox - houseWidth*0.25, hOffset, oz - houseLength*0.28, 0, 1.6, 1.6);
            // Living Sofa
            addFurniture3D(floorGroup, 'sofa', ox - houseWidth*0.25, hOffset, oz + houseLength*0.25, 0, 1.6, 1.5);
            // Dining Table
            addFurniture3D(floorGroup, 'dining', ox + houseWidth*0.25, hOffset, oz + houseLength*0.12, 0, 1.2, 1.6);
            // Kitchen Counter
            addFurniture3D(floorGroup, 'kitchen', ox + houseWidth*0.25, hOffset, oz + houseLength*0.35, Math.PI/2, 1.8, 0.6);
          }
        }
      }

      floorGroup.scale.set(1, 1, 1);
      buildingGroup.add(floorGroup);
    }

    // Roof
    if (showRoof) {
      const roofOffset = floors * floorHeight + (explodedView ? (floors - 1) * 4.0 : 0);
      if (style.toLowerCase().includes('traditional') || style.toLowerCase().includes('villa')) {
        const roofGeom = new THREE.ConeGeometry(houseWidth * 0.7, 2, 4);
        roofGeom.rotateY(Math.PI / 4);
        const pitchedRoof = new THREE.Mesh(roofGeom, roofMat);
        pitchedRoof.position.set(ox, roofOffset + 1.0, oz);
        pitchedRoof.scale.set(1, 1, houseLength / (houseWidth * 0.7));
        buildingGroup.add(pitchedRoof);
      } else {
        const roofSlab = createBox(houseWidth, 0.15, houseLength, roofMat, ox, roofOffset, oz);
        buildingGroup.add(roofSlab);
      }
    }

    scene.add(buildingGroup);
    controls.target.set(ox, (floors * floorHeight) / 2, oz);
    controls.update();

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handleCanvasClick = (event) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const doorIntersections = raycaster.intersectObjects(doorMeshes.current);
      if (doorIntersections.length > 0) {
        const clickedDoor = doorIntersections[0].object;
        clickedDoor.userData.open = !clickedDoor.userData.open;
        const pivot = clickedDoor.parent;
        if (pivot) {
          pivot.rotation.y = clickedDoor.userData.open ? -Math.PI / 2 : 0;
        }
        return;
      }

      const roomIntersections = raycaster.intersectObjects(roomMeshes.current);
      if (roomIntersections.length > 0) {
        const room = roomIntersections[0].object;
        setSelectedRoom({
          name: room.userData.roomName,
          area: room.userData.area,
          cost: room.userData.cost
        });
        if (onRoomSelect) onRoomSelect(room.userData.roomName);
      } else {
        setSelectedRoom(null);
      }
    };

    renderer.domElement.addEventListener('pointerdown', handleCanvasClick);

    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current && rendererRef.current.domElement) {
        rendererRef.current.domElement.removeEventListener('pointerdown', handleCanvasClick);
      }
      scene.clear();
      renderer.dispose();
    };
  }, [plotWidth, plotLength, floors, style, showRoof, explodedView, currentFloor, layoutOption]);

  const handleDownloadOBJ = () => {
    if (!isPro) {
      if (onUpgradeRequired) onUpgradeRequired();
      return;
    }

    const exporter = new OBJExporter();
    const building = sceneRef.current.getObjectByName('building-group');
    
    if (!building) return;

    const result = exporter.parse(building);
    const blob = new Blob([result], { type: 'text/plain' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `BuildVision_Layout_${layoutOption}_${plotWidth}x${plotLength}.obj`;
    link.click();
  };

  return (
    <div className="relative w-full h-full min-h-[400px] flex flex-col">
      <div ref={mountRef} className="w-full h-full flex-grow rounded-xl overflow-hidden shadow-inner cursor-grab active:cursor-grabbing border border-white/10" style={{ minHeight: '380px' }} />

      {/* Exporter Button HUD Overlay */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={handleDownloadOBJ}
          className="flex items-center gap-1.5 py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-500/20 cursor-pointer transition border border-indigo-400/40"
        >
          {isPro ? (
            <Download className="w-3.5 h-3.5 text-white" />
          ) : (
            <Lock className="w-3.5 h-3.5 text-indigo-200" />
          )}
          Download 3D CAD (.obj)
        </button>
      </div>

      {selectedRoom && (
        <div className="absolute top-4 left-4 glass-panel border-indigo-500/30 p-3 rounded-lg text-xs flex flex-col gap-1 text-slate-200 shadow-xl pointer-events-auto z-10 animate-fade-in max-w-[200px]">
          <div className="font-bold text-indigo-400 border-b border-white/10 pb-1 mb-1 text-[13px]">{selectedRoom.name}</div>
          <div><span className="text-gray-400">Floorage:</span> {selectedRoom.area}</div>
          <div><span className="text-gray-400">Est. Cost:</span> <span className="text-emerald-400 font-semibold">{selectedRoom.cost}</span></div>
          <button onClick={() => setSelectedRoom(null)} className="mt-2 text-[10px] bg-slate-800 hover:bg-slate-700 text-gray-300 font-semibold py-0.5 px-2 rounded-sm border border-white/5 cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      <div className="absolute bottom-2 left-2 pointer-events-none text-[10px] text-gray-500 font-mono bg-slate-950/70 py-0.5 px-2 rounded border border-white/5">
        🖱️ Orbit: Left-Click + Drag | 🚪 Open Doors: Click them | Active Layout: {layoutOption}
      </div>
    </div>
  );
}
