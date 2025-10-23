import { Environment, OrbitControls } from '@react-three/drei';

interface Scene3DProps {
  autoRotate?: boolean;
  enableZoom?: boolean;
}

export const Scene3D: React.FC<Scene3DProps> = ({ 
  autoRotate = false,
  enableZoom = true 
}) => {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.5} />
      <hemisphereLight intensity={0.4} />
      
      {/* Environment for reflections */}
      <Environment preset="city" />
      
      {/* Camera Controls */}
      <OrbitControls 
        autoRotate={autoRotate}
        autoRotateSpeed={2}
        enableZoom={enableZoom}
        enablePan={false}
        minDistance={3}
        maxDistance={10}
      />
    </>
  );
};
