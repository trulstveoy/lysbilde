export type DisplaySettings = {
  mode: "embedded" | "fullscreen";
};

export type AnnotationLayerRef = {
  slideId: string;
  path: string;
};

export type Slide = {
  id: string;
  title: string;
  filePath: string;
  thumbnailPath?: string | null;
  missing?: boolean;
};

export type Project = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  slides: Slide[];
  displaySettings: DisplaySettings;
  annotations: AnnotationLayerRef[];
};

export type ProjectSummary = {
  id: string;
  title: string;
  slideCount: number;
  updatedAt: string;
  thumbnailPath?: string | null;
};
