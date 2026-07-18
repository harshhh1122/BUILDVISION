import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default function AwaitingBlueprint3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 300;

    // 1. Scene setup
    const scene = new THREE.Scene();
    
    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(8, 7, 9);

    // 3. Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // 4. Grid mesh helper
    const grid = new THREE.GridHelper(10, 16, '#71717a', '#27272a');
    grid.position.y = -0.5;
    scene.add(grid);

    // 5. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight1.position.set(5, 10, 5);
    dirLight1.castShadow = true;
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x818cf8, 0.4);
    dirLight2.position.set(-5, 5, -5);
    scene.add(dirLight2);

    // 6. Procedural Mini House Group
    const houseGroup = new THREE.Group();

    // Base slab (dark grey)
    const baseGeo = new THREE.BoxGeometry(2.4, 0.12, 2.4);
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x27272a, roughness: 0.6 });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.y = 0.06;
    houseGroup.add(baseMesh);

    // Main walls (off-white zinc)
    const wallsGeo = new THREE.BoxGeometry(2.0, 1.2, 2.0);
    const wallsMat = new THREE.MeshStandardMaterial({ color: 0xe4e4e7, roughness: 0.85 });
    const wallsMesh = new THREE.Mesh(wallsGeo, wallsMat);
    wallsMesh.position.y = 0.6 + 0.12;
    houseGroup.add(wallsMesh);

    // Pitched Roof (dark grey traditional/minimalist gables)
    const roofGeo = new THREE.ConeGeometry(1.6, 0.8, 4);
    roofGeo.rotateY(Math.PI / 4); // Align square cone
    const roofMat = new THREE.MeshStandardMaterial({ color: 0x3f3f46, roughness: 0.5 });
    const roofMesh = new THREE.Mesh(roofGeo, roofMat);
    roofMesh.position.y = 0.12 + 1.2 + 0.4;
    houseGroup.add(roofMesh);

    // Door (wood brown)
    const doorGeo = new THREE.BoxGeometry(0.4, 0.7, 0.05);
    const doorMat = new THREE.MeshStandardMaterial({ color: 0xa16207, roughness: 0.7 });
    const doorMesh = new THREE.Mesh(doorGeo, doorMat);
    doorMesh.position.set(0, 0.35 + 0.12, 1.0);
    houseGroup.add(doorMesh);

    // Windows (specular blue glass)
    const winGeo = new THREE.BoxGeometry(0.35, 0.35, 0.05);
    const winMat = new THREE.MeshPhysicalMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.6, roughness: 0.1 });
    const winL = new THREE.Mesh(winGeo, winMat);
    winL.position.set(-0.5, 0.7 + 0.12, 1.0);
    const winR = new THREE.Mesh(winGeo, winMat);
    winR.position.set(0.5, 0.7 + 0.12, 1.0);
    houseGroup.add(winL, winR);

    scene.add(houseGroup);

    // 7. Interactive OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false; // keep focus on the layout placeholder
    controls.maxPolarAngle = Math.PI / 2 - 0.1;

    // 8. Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth slow rotation
      houseGroup.rotation.y += 0.006;

      // Gentle floating bobbing effect
      houseGroup.position.y = Math.sin(Date.now() * 0.0018) * 0.18 + 0.2;

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize Handling
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
      scene.clear();
      renderer.dispose();
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col justify-center items-center relative select-none">
      {/* Three.js viewport canvas container */}
      <div ref={mountRef} className="w-full h-[280px] cursor-grab active:cursor-grabbing" />
    </div>
  );
}
