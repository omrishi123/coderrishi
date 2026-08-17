import { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface ThreeBackgroundProps {
  isDarkMode: boolean;
}

export default function ThreeBackground({ isDarkMode }: ThreeBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    
    // Create Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    // Position camera looking down onto the terrain grid
    camera.position.set(0, 5, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Dynamic grid colors
    const primaryColor = isDarkMode ? 0x00e5ff : 0x4f46e5; // Glowing Neon Cyan vs Deep Indigo
    const secondaryColor = isDarkMode ? 0xff00cc : 0xec4899; // Cyberpunk Pink vs Hot Pink

    // 1. Create a 3D Wavy Terrain Mesh Grid (Cyberpunk Synthwave Landscape)
    const gridWidth = 40;
    const gridHeight = 40;
    const segmentsX = 45;
    const segmentsY = 45;

    const geometry = new THREE.PlaneGeometry(gridWidth, gridHeight, segmentsX, segmentsY);
    // Rotate plane so it lies flat on the floor
    geometry.rotateX(-Math.PI / 2);

    // Color vertices to create a beautiful neon purple-cyan-pink color transition across the grid
    const count = geometry.attributes.position.count;
    const colors = new Float32Array(count * 3);
    const colorA = new THREE.Color(primaryColor);
    const colorB = new THREE.Color(secondaryColor);

    for (let i = 0; i < count; i++) {
      // Calculate color blend based on distance from center
      const vx = geometry.attributes.position.getX(i);
      const vz = geometry.attributes.position.getZ(i);
      const dist = Math.sqrt(vx * vx + vz * vz);
      const blend = Math.min(dist / 20, 1);

      const blendedColor = colorA.clone().lerp(colorB, blend);
      colors[i * 3] = blendedColor.r;
      colors[i * 3 + 1] = blendedColor.g;
      colors[i * 3 + 2] = blendedColor.b;
    }

    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Material with glowing wireframe vectors and vertex colors
    const material = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      wireframe: true,
      vertexColors: true,
      transparent: true,
      opacity: isDarkMode ? 0.38 : 0.55,
      blending: THREE.AdditiveBlending
    });

    const terrainMesh = new THREE.Mesh(geometry, material);
    // Position terrain slightly lower in the viewport
    terrainMesh.position.y = -3;
    scene.add(terrainMesh);

    // Save initial vertex heights for sine-wave computations
    const initialPositions = geometry.attributes.position.clone();

    // 2. Neon horizon line grids for depth
    const gridHelper = new THREE.GridHelper(50, 50, primaryColor, secondaryColor);
    gridHelper.position.y = -4.5;
    gridHelper.material.transparent = true;
    gridHelper.material.opacity = isDarkMode ? 0.2 : 0.35;
    scene.add(gridHelper);

    // Interactive mouse coordinates state
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX / window.innerWidth) - 0.5;
      mouseY = (event.clientY / window.innerHeight) - 0.5;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Scroll height mapping
    let currentScroll = 0;
    let targetScroll = 0;
    const handleScroll = () => {
      targetScroll = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight || 1);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Handle viewport resize
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
      }
    });
    resizeObserver.observe(container);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Smooth lag interpolations for cursor and scroll
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;
      currentScroll += (targetScroll - currentScroll) * 0.07;

      // 3. Dynamic Sine-Wave Terrain Heights!
      // Makes the 3D grid undulating and responsive to the cursor coordinates
      const positionsAttr = geometry.attributes.position;
      
      for (let i = 0; i < count; i++) {
        const x = initialPositions.getX(i);
        const z = initialPositions.getZ(i);

        // Sine wave calculations combining grid coordinates, time, and cursor displacement
        const waveX = Math.sin(x * 0.25 + elapsedTime * 1.5) * 0.7;
        const waveZ = Math.cos(z * 0.25 + elapsedTime * 1.5) * 0.7;
        
        // Displacement factor closer to the cursor positions
        const distToCursor = Math.sqrt((x - targetX * 15) ** 2 + (z - targetY * 15) ** 2);
        const cursorHump = Math.max(0, (8 - distToCursor) * 0.22);

        // Update vertex height (Y coordinate)
        positionsAttr.setY(i, waveX + waveZ + cursorHump);
      }

      positionsAttr.needsUpdate = true;

      // Rotate terrain grid slightly with mouse
      terrainMesh.rotation.y = elapsedTime * 0.012 + targetX * 0.3;
      terrainMesh.rotation.z = targetY * 0.15;

      // Camera coordinates dynamically fly forward/upwards along grid based on scroll height
      camera.position.z = 12 - currentScroll * 14;
      camera.position.y = 5 - currentScroll * 5;
      camera.position.x = targetX * 4;

      // Maintain camera focal alignment
      camera.lookAt(new THREE.Vector3(targetX * 0.5, -currentScroll * 4, -currentScroll * 10));

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      resizeObserver.unobserve(container);
      cancelAnimationFrame(animationFrameId);
      container.removeChild(renderer.domElement);
      
      // Dispose buffers
      geometry.dispose();
      material.dispose();
      gridHelper.dispose();
      renderer.dispose();
    };
  }, [isDarkMode]);

  return (
    <div
      ref={containerRef}
      id="three-canvas-container"
      className="fixed inset-0 w-full h-full -z-10 pointer-events-none overflow-hidden"
      style={{
        background: isDarkMode 
          ? 'radial-gradient(circle at 50% 50%, #0d0124 0%, #020005 100%)'
          : 'radial-gradient(circle at 50% 50%, #faf3ff 0%, #e6d3ff 100%)'
      }}
    />
  );
}
