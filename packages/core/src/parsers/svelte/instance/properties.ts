import type {
  ExportNamedDeclaration,
  Identifier,
  SimpleLiteral,
  VariableDeclaration,
} from 'estree';

export function parseProperties(json: SveltosisComponent, node: ExportNamedDeclaration) {
  const declarations = (node.declaration as VariableDeclaration)?.declarations;

  if (declarations?.length) {
    const declaration = declarations[0];
    const property = (declaration.id as Identifier).name;
    const value = (declaration.init as SimpleLiteral)?.value;

    const propertyObject = {
      [property]: {
        default: value,
      },
    };

    json.props = { ...json.props, ...propertyObject };

    json.defaultProps = Object.fromEntries(
      Object.keys(json.props)
        .filter((key) => json.props[key].default)
        .map((key) => [key, json.props[key].default]),
    );
  }
}
