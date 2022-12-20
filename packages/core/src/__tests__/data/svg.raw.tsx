export default function SvgComponent() {
  return (
    <svg viewBox={'0 0 ' + 42 + ' ' + 42} fill="none" role="img" width={42} height={42}>
      <defs>
        <filter id="prefix__filter0_f" filterUnits="userSpaceOnUse">
          <feFlood result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation={7} result="effect1_foregroundBlur" />
        </filter>
      </defs>
    </svg>
  );
}
