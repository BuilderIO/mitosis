export const solidImageComponent = `
function Image(props) {
  const [state, setState] = createState({
    load: !props.lazy
  });

  function updateQueryParam(uri = '', key, value) {
    const re = new RegExp('([?&])' + key + '=.*?(&|$)', 'i');
    const separator = uri.indexOf('?') !== -1 ? '&' : '?';
    if (uri.match(re)) {
      return uri.replace(re, '$1' + key + '=' + encodeURIComponent(value) + '$2');
    }
  
    return uri + separator + key + '=' + encodeURIComponent(value);
  }

  function getSrcSet(url) {
    if (!url) {
      return url;
    }
  
    const sizes = [100, 200, 400, 800, 1200, 1600, 2000];
  
    if (url.match(/builder\\.io/)) {
      let srcUrl = url;
      const widthInSrc = Number(url.split('?width=')[1]);
      if (!isNaN(widthInSrc)) {
        srcUrl = \`\${srcUrl} \${widthInSrc}w\`;
      }
  
      return sizes
        .filter(size => size !== widthInSrc)
        .map(size => \`\${updateQueryParam(url, 'width', size)} \${size}w\`)
        .concat([srcUrl])
        .join(', ');
    }
  
    return url;
  }

  const srcset = props.srcset || getSrcSet(props.image);

  return (
    <>
      <picture ref={ref => {
        const options = { threshold: 0.01 }
        const observer = new IntersectionObserver((entries, observer) => {
          if (!entries[0].isIntersecting || entries[0].intersectionRatio <= options.threshold) {
            return;
          }
          observer.disconnect();
          setState(produce(state => state.load = true))        
        }, options);
        observer.observe(ref)
      }}>
        <source srcSet={srcset && srcset.replace(/\\?/g, '?format=webp&')} type="image/webp" />
        <Show when={state.load}>
          <img 
            sizes={props.size}
            role="presentation"
            srcset={srcset}
            style={\`
              opacity: \${state.load ? 1 : 0};
              transition: opacity 0.2s ease-in-out;
              object-fit: \${props.backgroundSize || 'cover'};
              object-position: \${props.backgroundPosition || 'center'};
              \${props.aspectRatio ? \`
                position: absolute;
                height: 100%;
                width: 100%;
                top: 0;
                left: 0;
              \` : ''}
            \`} 
            class="builder-image"
            src={props.image}
            />
          </Show>

      </picture>
      <Show when={props.aspectRatio}>
        <div class="builder-image-sizer" style={\`
          width: 100%;
          padding-top: \${props.aspectRatio * 100}%;
          pointer-events: none;
          font-size: 0px;
        \`} />
      </Show>
    </>
  );

}
`;
