export interface FilePreview {
  id: string;
  file: File;
  previewUrl: string;
  type: 'image' | 'video';
}
