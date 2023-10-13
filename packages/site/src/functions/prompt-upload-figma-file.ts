import { BuilderContent } from '@builder.io/sdk';

export async function promptUploadFigmaJsonFile(): Promise<BuilderContent> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.style.display = 'none';
    input.type = 'file';
    document.body.appendChild(input);
    input.click();

    // TODO: parse and upload images!
    input.addEventListener('change', async (event) => {
      const file = (event.target as any).files[0];
      if (file) {
        const reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = async (e) => {
          const text = (e.target as any).result;
          try {
            const json = JSON.parse(text);
            resolve(json);
          } catch (err) {
            reject(err);
          }
          input.remove();
        };

        reader.readAsText(file);
      }
    });
  });
}
