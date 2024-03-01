// import Swiper core and required modules
/* eslint-disable @typescript-eslint/no-explicit-any */
import { onInit } from '@builder.io/mitosis';
import { register } from 'swiper/element/bundle';

export default function MyBasicWebComponent() {
  onInit(() => {
    register();
  });

  return (
    <swiper-container slides-per-view="3" navigation="true" pagination="true">
      <swiper-slide>Slide 1</swiper-slide>
      <swiper-slide>Slide 2</swiper-slide>
      <swiper-slide>Slide 3</swiper-slide>
    </swiper-container>
  );
}
