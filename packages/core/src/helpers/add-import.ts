import { MitosisComponent, MitosisImport } from '@builder.io/mitosis';

/**
 * Add an import to a component, if it doesn't already exist.
 * Returns modified MitosisComponent, which is NOT a new object
 * @param json The component to add the import to
 * @param theImport The import to add
 */
export function addImportToMitosisComponent(
  json: MitosisComponent,
  theImport: MitosisImport,
): MitosisComponent {
  if (!json.imports) {
    json.imports = [];
  }
  const existingImport = json.imports.find((item) => item.path === theImport.path);
  if (!existingImport) {
    json.imports.push(theImport);
  } else {
    existingImport.imports = {
      ...existingImport.imports,
      ...(theImport.imports || {}),
    };
  }
  return json;
}
