function capitalizeFirstLetterOfEachWord(str: string): string {
    return str.replace(/\b\w/g, (char: string) => char.toUpperCase());
  }
  
export default capitalizeFirstLetterOfEachWord;
