const fs = require('fs');
const path = require('path');

export type TestData = { name: string; file: string };
export type TestDataLoaderOptions = { subdirectories: boolean };

const FILE_REGEXP = /\.raw\.tsx$/gi;

export class TestDataLoader {
  options: TestDataLoaderOptions = {
    subdirectories: false,
  };

  constructor(options: TestDataLoaderOptions) {
    this.options = options;
  }

  load = (dir: string, dataArr: TestData[] = []) => {
    let files = fs.readdirSync(dir);

    dataArr = dataArr || [];

    files.forEach((file: any) => {
      if (
        this.options.subdirectories &&
        fs.statSync(dir + '/' + file).isDirectory()
      ) {
        dataArr = this.load(dir + '/' + file, dataArr);
      } else if (file.match(FILE_REGEXP)) {
        dataArr.push({
          name: file.replace(FILE_REGEXP, ''),
          file: path.join(dir, '/', file),
        });
      }
    });

    return dataArr;
  };
}
