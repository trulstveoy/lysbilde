import { forwardRef, type ReactNode } from "react";

type SlideViewportProps = {
  missing?: boolean;
  missingPath?: string;
  overlay?: ReactNode;
  slideTitle: string;
  src: string;
};

const SlideViewport = forwardRef<HTMLDivElement, SlideViewportProps>(
  function SlideViewport(
    { missing = false, missingPath, overlay, slideTitle, src },
    ref,
  ) {
    return (
      <div aria-label="Slide viewport" className="slide-viewport" ref={ref}>
        {missing ? (
          <div className="missing-slide">
            <h2>Slide file missing</h2>
            {missingPath && <p>{missingPath}</p>}
          </div>
        ) : src ? (
          <iframe className="slide-frame" src={src} title={slideTitle} />
        ) : (
          <div className="missing-slide">
            <h2>No slide selected</h2>
          </div>
        )}
        {overlay}
      </div>
    );
  },
);

export default SlideViewport;
