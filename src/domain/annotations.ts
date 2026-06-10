import type {
  AnnotationColor,
  ArrowAnnotation,
  RectangleAnnotation,
  Slide,
  SlideAnnotation,
  StickyNoteAnnotation,
  TextBoxAnnotation,
} from "./project";

export type AnnotationKind = SlideAnnotation["type"];

export type ViewportSize = {
  width: number;
  height: number;
};

export type PixelBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type RelativeBox = PixelBox;

type CreateAnnotationInput = {
  id: string;
  x: number;
  y: number;
  color: AnnotationColor;
};

function clamp(value: number) {
  return Math.max(0, Math.min(1, value));
}

function round(value: number) {
  return Number(value.toFixed(4));
}

export function normalizeBox(box: PixelBox, viewport: ViewportSize): RelativeBox {
  return {
    x: round(clamp(box.x / viewport.width)),
    y: round(clamp(box.y / viewport.height)),
    width: round(clamp(box.width / viewport.width)),
    height: round(clamp(box.height / viewport.height)),
  };
}

export function denormalizeBox(
  box: RelativeBox,
  viewport: ViewportSize,
): PixelBox {
  return {
    x: Math.round(box.x * viewport.width),
    y: Math.round(box.y * viewport.height),
    width: Math.round(box.width * viewport.width),
    height: Math.round(box.height * viewport.height),
  };
}

export function createAnnotation(
  type: "sticky-note",
  input: CreateAnnotationInput,
): StickyNoteAnnotation;
export function createAnnotation(
  type: "text-box",
  input: CreateAnnotationInput,
): TextBoxAnnotation;
export function createAnnotation(
  type: "rectangle",
  input: CreateAnnotationInput,
): RectangleAnnotation;
export function createAnnotation(
  type: "arrow",
  input: CreateAnnotationInput,
): ArrowAnnotation;
export function createAnnotation(
  type: AnnotationKind,
  input: CreateAnnotationInput,
): SlideAnnotation;
export function createAnnotation(
  type: AnnotationKind,
  input: CreateAnnotationInput,
): SlideAnnotation {
  if (type === "arrow") {
    return {
      id: input.id,
      type,
      x: input.x,
      y: input.y,
      endX: clamp(input.x + 0.18),
      endY: input.y,
      strokeWidth: 4,
      color: input.color,
    };
  }

  if (type === "rectangle") {
    return {
      id: input.id,
      type,
      x: input.x,
      y: input.y,
      width: 0.2,
      height: 0.15,
      fillColor: "transparent",
      color: input.color,
    };
  }

  return {
    id: input.id,
    type,
    x: input.x,
    y: input.y,
    width: 0.2,
    height: 0.15,
    text: type === "sticky-note" ? "New note" : "New text",
    color: input.color,
  };
}

export function updateSlideAnnotation(
  slide: Slide,
  annotation: SlideAnnotation,
): Slide {
  return {
    ...slide,
    annotations: slide.annotations.map((candidate) =>
      candidate.id === annotation.id ? annotation : candidate,
    ),
  };
}

export function deleteSlideAnnotation(slide: Slide, annotationId: string): Slide {
  return {
    ...slide,
    annotations: slide.annotations.filter(
      (annotation) => annotation.id !== annotationId,
    ),
  };
}

export function recolorSlideAnnotation(
  slide: Slide,
  annotationId: string,
  color: AnnotationColor,
): Slide {
  return {
    ...slide,
    annotations: slide.annotations.map((annotation) =>
      annotation.id === annotationId ? { ...annotation, color } : annotation,
    ),
  };
}
