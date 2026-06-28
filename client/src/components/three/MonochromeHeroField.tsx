import { useEffect, useRef, useState } from "react";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";

export default function MonochromeHeroField() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [isUnavailable, setIsUnavailable] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    let frameId = 0;
    let disposed = false;
    let cleanup = () => {};

    async function startScene() {
      try {
        const container = mountRef.current;
        if (!container) {
          return;
        }
        const viewport: HTMLDivElement = container;
        const [
          { WebGLRenderer },
          { Scene },
          { PerspectiveCamera },
          { BufferGeometry },
          { BufferAttribute },
          { PointsMaterial },
          { Points },
          { IcosahedronGeometry },
          { MeshBasicMaterial },
          { Mesh },
        ] = await Promise.all([
          import("three/src/renderers/WebGLRenderer.js"),
          import("three/src/scenes/Scene.js"),
          import("three/src/cameras/PerspectiveCamera.js"),
          import("three/src/core/BufferGeometry.js"),
          import("three/src/core/BufferAttribute.js"),
          import("three/src/materials/PointsMaterial.js"),
          import("three/src/objects/Points.js"),
          import("three/src/geometries/IcosahedronGeometry.js"),
          import("three/src/materials/MeshBasicMaterial.js"),
          import("three/src/objects/Mesh.js"),
        ]);

        if (disposed || !viewport.isConnected) {
          return;
        }

        const renderer = new WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: "high-performance",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setSize(viewport.clientWidth, viewport.clientHeight);
        viewport.appendChild(renderer.domElement);

        const scene = new Scene();
        const camera = new PerspectiveCamera(
          55,
          viewport.clientWidth / viewport.clientHeight,
          0.1,
          100,
        );
        camera.position.z = 8;

        const geometry = new BufferGeometry();
        const count = 180;
        const positions = new Float32Array(count * 3);

        for (let index = 0; index < count; index += 1) {
          positions[index * 3] = (Math.random() - 0.5) * 12;
          positions[index * 3 + 1] = (Math.random() - 0.5) * 7;
          positions[index * 3 + 2] = (Math.random() - 0.5) * 8;
        }

        geometry.setAttribute("position", new BufferAttribute(positions, 3));

        const material = new PointsMaterial({
          color: 0xffffff,
          size: 0.025,
          transparent: true,
          opacity: 0.65,
        });

        const field = new Points(geometry, material);
        const wire = new Mesh(
          new IcosahedronGeometry(1.4, 1),
          new MeshBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.16,
            wireframe: true,
          }),
        );
        wire.position.set(3.2, -0.4, -1.4);

        scene.add(field, wire);

        function resize() {
          renderer.setSize(viewport.clientWidth, viewport.clientHeight);
          camera.aspect = viewport.clientWidth / viewport.clientHeight;
          camera.updateProjectionMatrix();
        }

        function animate() {
          field.rotation.y += 0.0008;
          field.rotation.x += 0.00035;
          wire.rotation.x += 0.002;
          wire.rotation.y += 0.003;
          renderer.render(scene, camera);
          frameId = window.requestAnimationFrame(animate);
        }

        window.addEventListener("resize", resize);
        animate();

        cleanup = () => {
          window.removeEventListener("resize", resize);
          window.cancelAnimationFrame(frameId);
          geometry.dispose();
          material.dispose();
          wire.geometry.dispose();
          if (Array.isArray(wire.material)) {
            wire.material.forEach((item) => item.dispose());
          } else {
            wire.material.dispose();
          }
          renderer.dispose();
          renderer.domElement.remove();
        };
      } catch {
        setIsUnavailable(true);
      }
    }

    void startScene();

    return () => {
      disposed = true;
      cleanup();
    };
  }, [prefersReducedMotion]);

  if (prefersReducedMotion || isUnavailable) {
    return null;
  }

  return (
    <div
      ref={mountRef}
      className="pointer-events-none absolute inset-0 z-[1] opacity-70 mix-blend-screen"
      aria-hidden="true"
    />
  );
}
