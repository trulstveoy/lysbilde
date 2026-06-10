export type DisplaySettings = {
  mode: "embedded" | "fullscreen";
};

export type AnnotationLayerRef = {
  slideId: string;
  path: string;
};

export type AnnotationColor =
  | "#fff59d"
  | "#d32f2f"
  | "#2e7d32"
  | "#1976d2"
  | "#f57c00";

export type AnnotationBase = {
  id: string;
  x: number;
  y: number;
  color: AnnotationColor;
};

export type StickyNoteAnnotation = AnnotationBase & {
  type: "sticky-note";
  width: number;
  height: number;
  text: string;
};

export type TextBoxAnnotation = AnnotationBase & {
  type: "text-box";
  width: number;
  height: number;
  text: string;
};

export type RectangleAnnotation = AnnotationBase & {
  type: "rectangle";
  width: number;
  height: number;
  fillColor: string;
};

export type ArrowAnnotation = AnnotationBase & {
  type: "arrow";
  endX: number;
  endY: number;
  strokeWidth: number;
};

export type SlideAnnotation =
  | StickyNoteAnnotation
  | TextBoxAnnotation
  | RectangleAnnotation
  | ArrowAnnotation;

export type Slide = {
  id: string;
  title: string;
  filePath: string;
  thumbnailPath?: string | null;
  missing?: boolean;
  annotations: SlideAnnotation[];
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
