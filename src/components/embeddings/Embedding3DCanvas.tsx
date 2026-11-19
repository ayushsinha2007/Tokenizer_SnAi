import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { SentenceItem } from '../../engine/embeddings/types';
import { 
  RotateCcw, ZoomIn, ZoomOut, RotateCw, Play, Pause, 
  Tag, Info, HelpCircle, Layers, CheckCircle2 
} from 'lucide-react';
import { soundFx } from '../../utils/audio';

interface Embedding3DCanvasProps {
  sentences: SentenceItem[];
  selectedSentenceA: SentenceItem | null;
  selectedSentenceB: SentenceItem | null;
  onSelectSentence: (sentence: SentenceItem) => void;
  explainedVariance: [number, number, number];
}

export const Embedding3DCanvas: React.FC<Embedding3DCanvasProps> = ({
  sentences,
  selectedSentenceA,
  selectedSentenceB,
  onSelectSentence,
  explainedVariance,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const pointsGroupRef = useRef<THREE.Group | null>(null);
  const labelsGroupRef = useRef<THREE.Group | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // Interaction State
  const [hoveredPoint, setHoveredPoint] = useState<{
    item: SentenceItem;
    screenX: number;
    screenY: number;
  } | null>(null);
  const [autoRotate, setAutoRotate] = useState(false);
  const [showLabels, setShowLabels] = useState(true);

  // Spherical camera coordinates for smooth orbital rotation
  const cameraAngleRef = useRef({ theta: Math.PI / 4, phi: Math.PI / 6, radius: 24 });
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const targetCameraPosRef = useRef<THREE.Vector3 | null>(null);

  // Update camera position from spherical angles
  const updateCameraPosition = useCallback(() => {
    if (!cameraRef.current) return;
    const { theta, phi, radius } = cameraAngleRef.current;
    const x = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.cos(theta);

    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(0, 0, 0);
  }, []);

  // Initialize Three.js Scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x080F1E);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    cameraRef.current = camera;
    updateCameraPosition();

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = false;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x398BFF, 1.2);
    dirLight1.position.set(15, 20, 15);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x62C9F5, 0.8);
    dirLight2.position.set(-15, -10, -15);
    scene.add(dirLight2);

    // Coordinate Bounding Cage & Subtle Grid
    const boxGeo = new THREE.BoxGeometry(16, 16, 16);
    const boxEdges = new THREE.EdgesGeometry(boxGeo);
    const boxMaterial = new THREE.LineBasicMaterial({ 
      color: 0x398BFF, 
      transparent: true, 
      opacity: 0.12 
    });
    const boxMesh = new THREE.LineSegments(boxEdges, boxMaterial);
    scene.add(boxMesh);

    // Floor Grid
    const floorGrid = new THREE.GridHelper(16, 8, 0x398BFF, 0x1B2B48);
    floorGrid.position.y = -8;
    (floorGrid.material as THREE.Material).transparent = true;
    (floorGrid.material as THREE.Material).opacity = 0.25;
    scene.add(floorGrid);

    // Helper: Build Axes with clean colors
    const buildAxis = (start: THREE.Vector3, end: THREE.Vector3, color: number) => {
      const geo = new THREE.BufferGeometry().setFromPoints([start, end]);
      const mat = new THREE.LineBasicMaterial({ color, linewidth: 2 });
      return new THREE.Line(geo, mat);
    };

    // PC1 Axis (X, Electric Blue)
    scene.add(buildAxis(new THREE.Vector3(-8, -8, -8), new THREE.Vector3(8, -8, -8), 0x398BFF));
    // PC2 Axis (Y, Muted Cyan)
    scene.add(buildAxis(new THREE.Vector3(-8, -8, -8), new THREE.Vector3(-8, 8, -8), 0x62C9F5));
    // PC3 Axis (Z, Purple Accent)
    scene.add(buildAxis(new THREE.Vector3(-8, -8, -8), new THREE.Vector3(-8, -8, 8), 0x818CF8));

    // Groups for Points and Labels
    const pointsGroup = new THREE.Group();
    scene.add(pointsGroup);
    pointsGroupRef.current = pointsGroup;

    const labelsGroup = new THREE.Group();
    scene.add(labelsGroup);
    labelsGroupRef.current = labelsGroup;

    // Resize Handler
    const handleResize = () => {
      if (!container || !cameraRef.current || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      if (autoRotate) {
        cameraAngleRef.current.theta += 0.005;
        updateCameraPosition();
      }

      // Smooth camera reset transition
      if (targetCameraPosRef.current && cameraRef.current) {
        cameraRef.current.position.lerp(targetCameraPosRef.current, 0.08);
        cameraRef.current.lookAt(0, 0, 0);
        if (cameraRef.current.position.distanceTo(targetCameraPosRef.current) < 0.1) {
          targetCameraPosRef.current = null;
        }
      }

      // Subtle pulse on selected points
      if (pointsGroupRef.current) {
        const time = Date.now() * 0.003;
        pointsGroupRef.current.children.forEach(child => {
          const isSelected = child.userData?.isSelected;
          if (isSelected) {
            const scale = 1 + Math.sin(time * 3) * 0.15;
            child.scale.set(scale, scale, scale);
          }
        });
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      renderer.dispose();
      boxGeo.dispose();
      boxEdges.dispose();
      boxMaterial.dispose();
    };
  }, [updateCameraPosition, autoRotate]);

  // Create Billboard Text Sprite for point label
  const createTextSprite = (text: string, color: string) => {
    const canvas = document.createElement('canvas');
    canvas.width = 384;
    canvas.height = 72;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(8, 15, 30, 0.85)';
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(4, 4, 376, 64, 12);
      ctx.fill();
      ctx.stroke();

      ctx.font = 'bold 22px Inter, sans-serif';
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const truncated = text.length > 24 ? text.substring(0, 24) + '…' : text;
      ctx.fillText(truncated, 192, 36);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(3.2, 0.6, 1);
    return sprite;
  };

  // Populate / Update 3D Points when sentences change
  useEffect(() => {
    const pointsGroup = pointsGroupRef.current;
    const labelsGroup = labelsGroupRef.current;
    if (!pointsGroup || !labelsGroup) return;

    // Clear existing
    while (pointsGroup.children.length > 0) {
      const obj = pointsGroup.children[0] as THREE.Mesh;
      pointsGroup.remove(obj);
      if (obj.geometry) obj.geometry.dispose();
      if (obj.material) {
        if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
        else obj.material.dispose();
      }
    }

    while (labelsGroup.children.length > 0) {
      const sprite = labelsGroup.children[0] as THREE.Sprite;
      labelsGroup.remove(sprite);
      if (sprite.material) {
        if (sprite.material.map) sprite.material.map.dispose();
        sprite.material.dispose();
      }
    }

    // Geometries
    // Sample sentences: Sphere (Circle point)
    const sphereGeo = new THREE.SphereGeometry(0.55, 32, 32);
    // User-added sentences: Octahedron (Diamond point)
    const diamondGeo = new THREE.OctahedronGeometry(0.68, 0);

    // Materials
    const sampleMatNormal = new THREE.MeshStandardMaterial({
      color: 0x398BFF,
      emissive: 0x1D4ED8,
      emissiveIntensity: 0.5,
      roughness: 0.2,
      metalness: 0.3,
    });

    const userMatNormal = new THREE.MeshStandardMaterial({
      color: 0xFF7A45,
      emissive: 0xEA580C,
      emissiveIntensity: 0.6,
      roughness: 0.2,
      metalness: 0.3,
    });

    const selectedMat = new THREE.MeshStandardMaterial({
      color: 0x2DD4BF,
      emissive: 0x0D9488,
      emissiveIntensity: 0.8,
      roughness: 0.1,
      metalness: 0.5,
    });

    sentences.forEach((sentence) => {
      const coords = sentence.coords3D || { x: 0, y: 0, z: 0 };
      const isSample = sentence.category === 'sample';
      const isSelected = selectedSentenceA?.id === sentence.id || selectedSentenceB?.id === sentence.id;

      const geometry = isSample ? sphereGeo.clone() : diamondGeo.clone();
      const material = isSelected 
        ? selectedMat.clone() 
        : isSample ? sampleMatNormal.clone() : userMatNormal.clone();

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(coords.x, coords.y, coords.z);
      mesh.userData = { sentence, isSample, isSelected };
      pointsGroup.add(mesh);

      // Add label billboard if enabled
      if (showLabels) {
        const labelColor = isSelected ? '#2DD4BF' : isSample ? '#398BFF' : '#FF7A45';
        const sprite = createTextSprite(sentence.text, labelColor);
        sprite.position.set(coords.x, coords.y + 1.1, coords.z);
        labelsGroup.add(sprite);
      }
    });
  }, [sentences, selectedSentenceA, selectedSentenceB, showLabels]);

  // Raycasting for Mouse Hover & Click
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const container = mountRef.current;
    if (!container || !cameraRef.current || !pointsGroupRef.current) return;

    if (isDraggingRef.current) {
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      cameraAngleRef.current.theta -= deltaX * 0.008;
      cameraAngleRef.current.phi = Math.max(0.1, Math.min(Math.PI - 0.1, cameraAngleRef.current.phi - deltaY * 0.008));
      updateCameraPosition();

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      return;
    }

    // Raycast hover test
    const rect = container.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);
    const intersects = raycaster.intersectObjects(pointsGroupRef.current.children);

    if (intersects.length > 0) {
      const hit = intersects[0].object;
      const item = hit.userData.sentence as SentenceItem;
      setHoveredPoint({
        item,
        screenX: e.clientX - rect.left,
        screenY: e.clientY - rect.top,
      });
      container.style.cursor = 'pointer';
    } else {
      setHoveredPoint(null);
      container.style.cursor = 'grab';
    }
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    if (mountRef.current) mountRef.current.style.cursor = 'grabbing';
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
    if (mountRef.current) mountRef.current.style.cursor = 'grab';
  };

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const container = mountRef.current;
    if (!container || !cameraRef.current || !pointsGroupRef.current) return;

    const rect = container.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const mouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), cameraRef.current);
    const intersects = raycaster.intersectObjects(pointsGroupRef.current.children);

    if (intersects.length > 0) {
      soundFx.playSpinClick();
      const hit = intersects[0].object;
      const item = hit.userData.sentence as SentenceItem;
      onSelectSentence(item);
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    cameraAngleRef.current.radius = Math.max(8, Math.min(60, cameraAngleRef.current.radius + e.deltaY * 0.02));
    updateCameraPosition();
  };

  // Control button actions
  const handleZoom = (delta: number) => {
    soundFx.playSpinClick();
    cameraAngleRef.current.radius = Math.max(8, Math.min(60, cameraAngleRef.current.radius + delta));
    updateCameraPosition();
  };

  const handleRotateStep = (direction: 'left' | 'right') => {
    soundFx.playSpinClick();
    const step = direction === 'left' ? -Math.PI / 12 : Math.PI / 12;
    cameraAngleRef.current.theta += step;
    updateCameraPosition();
  };

  const handleResetView = () => {
    soundFx.playSpinClick();
    cameraAngleRef.current = { theta: Math.PI / 4, phi: Math.PI / 6, radius: 24 };
    updateCameraPosition();
  };

  return (
    <div className="relative w-full h-[520px] lg:h-[600px] rounded-2xl overflow-hidden border border-[#398BFF]/25 bg-[#080F1E] shadow-2xl flex flex-col select-none">
      
      {/* 3D Canvas Mount Point */}
      <div
        ref={mountRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={handleClick}
        onWheel={handleWheel}
        className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
      />

      {/* Top Left: Coordinate Axes Overlay & Variance */}
      <div className="absolute top-4 left-4 pointer-events-none space-y-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#080F1E]/80 backdrop-blur-md border border-white/10 text-xs font-mono">
          <Layers className="w-3.5 h-3.5 text-[#398BFF]" />
          <span className="text-[#F1F5FC] font-semibold">3D PCA Vector Space</span>
        </div>

        <div className="flex flex-wrap gap-2 text-[10px] font-mono">
          <div className="px-2.5 py-1 rounded-lg bg-[#080F1E]/80 backdrop-blur-md border border-[#398BFF]/40 text-[#398BFF]">
            <span className="font-bold">PC1 (X):</span> {explainedVariance[0]}% var
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-[#080F1E]/80 backdrop-blur-md border border-[#62C9F5]/40 text-[#62C9F5]">
            <span className="font-bold">PC2 (Y):</span> {explainedVariance[1]}% var
          </div>
          <div className="px-2.5 py-1 rounded-lg bg-[#080F1E]/80 backdrop-blur-md border border-[#818CF8]/40 text-[#818CF8]">
            <span className="font-bold">PC3 (Z):</span> {explainedVariance[2]}% var
          </div>
        </div>
      </div>

      {/* Top Right: Category Legend */}
      <div className="absolute top-4 right-4 pointer-events-auto flex flex-col gap-1.5 p-3 rounded-xl bg-[#080F1E]/85 backdrop-blur-md border border-white/10 text-xs font-mono shadow-lg">
        <div className="text-[10px] text-[#9AAAC0] uppercase tracking-wider font-semibold border-b border-white/10 pb-1">
          Point Categories
        </div>
        
        <div className="flex items-center gap-2 text-[#398BFF]">
          <div className="w-3 h-3 rounded-full bg-[#398BFF] shadow-[0_0_8px_#398BFF]" />
          <span className="text-[#F1F5FC] text-[11px]">
            Sample Sentences ({sentences.filter(s => s.category === 'sample').length})
          </span>
        </div>

        <div className="flex items-center gap-2 text-[#FF7A45]">
          <div className="w-3 h-3 rotate-45 bg-[#FF7A45] shadow-[0_0_8px_#FF7A45]" />
          <span className="text-[#F1F5FC] text-[11px]">
            User Sentences ({sentences.filter(s => s.category === 'user').length})
          </span>
        </div>

        <div className="flex items-center gap-2 text-[#2DD4BF] pt-0.5 border-t border-white/5">
          <div className="w-3 h-3 rounded-full bg-[#2DD4BF] animate-pulse" />
          <span className="text-[10px] text-[#2DD4BF]">Selected for Cosine Compare</span>
        </div>
      </div>

      {/* Bottom Floating Interactive Graph Controls */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#111C30]/90 backdrop-blur-lg border border-[#398BFF]/30 shadow-2xl z-20">
        
        <button
          onClick={() => handleZoom(-3)}
          className="p-2 rounded-xl text-[#9AAAC0] hover:text-[#F1F5FC] hover:bg-white/10 transition-colors"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleZoom(3)}
          className="p-2 rounded-xl text-[#9AAAC0] hover:text-[#F1F5FC] hover:bg-white/10 transition-colors"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <div className="w-[1px] h-4 bg-white/10 mx-0.5" />

        <button
          onClick={() => handleRotateStep('left')}
          className="p-2 rounded-xl text-[#9AAAC0] hover:text-[#F1F5FC] hover:bg-white/10 transition-colors"
          title="Rotate Left"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={() => handleRotateStep('right')}
          className="p-2 rounded-xl text-[#9AAAC0] hover:text-[#F1F5FC] hover:bg-white/10 transition-colors"
          title="Rotate Right"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            soundFx.playSpinClick();
            setAutoRotate(!autoRotate);
          }}
          className={`p-2 rounded-xl transition-colors ${
            autoRotate 
              ? 'text-[#62C9F5] bg-[#398BFF]/20 border border-[#398BFF]/40' 
              : 'text-[#9AAAC0] hover:text-[#F1F5FC] hover:bg-white/10'
          }`}
          title={autoRotate ? 'Pause Auto-Spin' : 'Auto-Spin Arena'}
        >
          {autoRotate ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
        </button>

        <div className="w-[1px] h-4 bg-white/10 mx-0.5" />

        <button
          onClick={() => {
            soundFx.playSpinClick();
            setShowLabels(!showLabels);
          }}
          className={`p-2 rounded-xl text-xs font-mono transition-colors flex items-center gap-1 ${
            showLabels 
              ? 'text-[#2DD4BF] bg-[#2DD4BF]/15 border border-[#2DD4BF]/30' 
              : 'text-[#9AAAC0] hover:text-[#F1F5FC] hover:bg-white/10'
          }`}
          title="Toggle Floating Labels"
        >
          <Tag className="w-3.5 h-3.5" />
          <span className="text-[11px] hidden sm:inline">Labels</span>
        </button>

        <button
          onClick={handleResetView}
          className="px-3 py-1.5 rounded-xl bg-[#398BFF]/15 hover:bg-[#398BFF]/25 border border-[#398BFF]/40 text-[#62C9F5] text-xs font-mono transition-all flex items-center gap-1"
          title="Reset Camera View"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Hover Tooltip Popup */}
      {hoveredPoint && (
        <div
          className="absolute z-30 pointer-events-none p-3 rounded-xl bg-[#111C30]/95 backdrop-blur-xl border border-[#398BFF]/40 shadow-2xl text-left max-w-xs space-y-1.5 transition-all"
          style={{
            left: Math.min(hoveredPoint.screenX + 14, (mountRef.current?.clientWidth || 400) - 270),
            top: Math.min(hoveredPoint.screenY + 14, (mountRef.current?.clientHeight || 400) - 130),
          }}
        >
          <div className="flex items-center justify-between text-[10px] font-mono border-b border-white/10 pb-1">
            <span className={`font-semibold ${hoveredPoint.item.category === 'sample' ? 'text-[#398BFF]' : 'text-[#FF7A45]'}`}>
              {hoveredPoint.item.category === 'sample' ? '● Sample Sentence' : '◆ User Sentence'}
            </span>
            <span className="text-[#9AAAC0]">Click to Compare</span>
          </div>

          <div className="text-xs font-semibold text-[#F1F5FC] leading-snug">
            &quot;{hoveredPoint.item.text}&quot;
          </div>

          <div className="grid grid-cols-3 gap-1 pt-1 text-[10px] font-mono text-[#9AAAC0] border-t border-white/5">
            <div>PC1: <span className="text-[#398BFF]">{hoveredPoint.item.coords3D?.x}</span></div>
            <div>PC2: <span className="text-[#62C9F5]">{hoveredPoint.item.coords3D?.y}</span></div>
            <div>PC3: <span className="text-[#818CF8]">{hoveredPoint.item.coords3D?.z}</span></div>
          </div>
        </div>
      )}

      {/* Subtle Hint on bottom left */}
      <div className="absolute bottom-4 left-4 hidden md:flex items-center gap-1.5 text-[11px] font-mono text-[#9AAAC0]/60 pointer-events-none">
        <Info className="w-3.5 h-3.5 text-[#398BFF]" />
        <span>Drag to rotate • Scroll to zoom • Click points to compare cosine similarity</span>
      </div>

    </div>
  );
};
