import { useGLTF } from '@react-three/drei';
import { useRef } from 'react';
import { Mesh } from 'three';

interface CarModel3DProps {
  modelPath: string;
  onClick?: (event: any) => void;
}

export const CarModel3D: React.FC<CarModel3DProps> = ({ modelPath, onClick }) => {
  const meshRef = useRef<Mesh>(null);
  const { scene } = useGLTF(modelPath);

  return (
    <primitive 
      ref={meshRef}
      object={scene} 
      scale={1.5}
      position={[0, -0.5, 0]}
      onClick={onClick}
    />
  );
};

// Preload the model
useGLTF.preload('/models/car.glb');
