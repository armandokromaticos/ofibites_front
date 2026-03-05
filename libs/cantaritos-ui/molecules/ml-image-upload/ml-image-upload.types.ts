export interface MlImageUploadProps {
  currentImage?: string;
  onFileSelect: (file: File) => void;
  isUploading?: boolean;
}
