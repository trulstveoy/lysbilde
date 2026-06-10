function lastIndex(totalSlides: number) {
  return Math.max(0, totalSlides - 1);
}

export function selectSlideIndex(index: number, totalSlides: number) {
  if (totalSlides <= 0) {
    return 0;
  }

  return Math.min(Math.max(index, 0), lastIndex(totalSlides));
}

export function nextSlideIndex(currentIndex: number, totalSlides: number) {
  return selectSlideIndex(currentIndex + 1, totalSlides);
}

export function previousSlideIndex(currentIndex: number, totalSlides: number) {
  return selectSlideIndex(currentIndex - 1, totalSlides);
}
