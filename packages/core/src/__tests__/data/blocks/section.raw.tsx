import '@jsx-lite/core';

export interface SectionProps {
  maxWidth?: number;
  attributes?: any;
  children?: any;
}

export default function SectionComponent({ maxWidth, ...props }: SectionProps) {
  return (
    <section
      {...props.attributes}
      style={
        maxWidth && typeof maxWidth === 'number' ? { maxWidth } : undefined
      }
    >
      {props.children}
    </section>
  );
}
