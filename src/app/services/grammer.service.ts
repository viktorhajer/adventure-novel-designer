import {Injectable} from '@angular/core';

export class GrammerService {

  static getAffix(num: number): string {
    if (num % 10 !== 0 && [1, 2, 4, 5, 7, 9].includes(num % 10)) {
      return '-re';
    } else if (num % 10 !== 0) {
      return '-ra';
    } else if (num % 100 !== 0 && [1, 4, 5, 7, 9].includes(num % 100 / 10)) {
      return '-re';
    } else if (num % 100 !== 0) {
      return '-ra';
    } else {
      return '-ra';
    }
  }

  static getAffix2(num: number): string {
    if (num % 10 !== 0 && [1, 4, 5, 7, 9].includes(num % 10)) {
      return '-hez';
    } else if (num % 10 !== 0 && [2, 5].includes(num % 10)) {
      return '-höz';
    } else if (num % 10 !== 0) {
      return '-hoz';
    } else if (num % 100 !== 0 && [1, 4, 5, 7, 9].includes(num % 100 / 10)) {
      return '-hez';
    } else if (num % 100 !== 0) {
      return '-hoz';
    } else {
      return '-hoz';
    }
  }

  static getArticle(num: number): string {
    const numStr = num + '';
    if (numStr.substr(0, 1) === '5' || (numStr.length === 4 && numStr.substr(0, 1) === '1') || num === 1) {
      return 'az ';
    } else {
      return 'a ';
    }
  }

}
