export interface SceneProps {
  progress: number;
  active: boolean;
  accent?: string;
  onMorphComplete?: () => void;
}
