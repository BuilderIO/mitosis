export const isFirstLetterLowerCase = (elementName: string) => {
    const firstLetterCode = elementName[0]

    return firstLetterCode >= 'a' && firstLetterCode <= 'z'
}