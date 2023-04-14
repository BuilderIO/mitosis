export const isFirstLetterLowerCase = (elementName: string) => {
    const firstLetter = elementName[0]

    return firstLetter >= 'a' && firstLetter <= 'z'
}