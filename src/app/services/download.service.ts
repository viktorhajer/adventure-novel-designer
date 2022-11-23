import {Injectable} from '@angular/core';
import {Book} from '../model/book.model';
import {Scene} from '../model/scene.model';
import {GrammerService} from './grammer.service';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {

  downloadRawBook(book: Book) {
    this.downloadFile(`book_${book.id}.txt`, JSON.stringify(book));
  }

  downloadGeneratedBook(book: Book, scenes: Scene[]) {
    this.downloadFile(`book_${book.id}.html`, this.getBookContent(book, scenes));
  }

  private getBookContent(book: Book, scenes: Scene[]): string {

    let html = '<head><style>';
    html += this.getCSS();
    html += '</style></head><body>';
    html += `<h1>${book.title}</h1><div class="background-story">${book.backgroundStory}</div>`;
    html += `<div class="chapter_container">`;
    for (const scene of scenes) {
      html += '<div class="chapter">';
      html += `<div class="chapter_index" id="chapter_${scene.index}">${scene.index}.</div>`;
      html += `<div class="chapter_content">${scene.story}</div>`;
      if (book.questionnaire && scene.questionnaire) {
        html += this.getQuestionnaire(book, scenes);
      }
      html += '</div>';
    }
    html += `</div>`;

    if (book.charactersChapter) {
      html += '<h2 class="characters_title">Szereplők</h2>';
      html += `<div class="chapter_container">`;
      for (const character of book.characters) {
        html += `<div class="chapter"><span>${character.name}:</span> ${character.description}</div>`;
      }
      html += `</div>`;
    }

    html += '<script>const els = document.getElementsByClassName(\'anchor\');' +
      'Array.prototype.forEach.call(els, (el) => {const index = el.classList[1];' +
      'if (index) {el.addEventListener(\'click\', () => {' +
      'document.getElementById(\'chapter_\' + index)?.scrollIntoView();});}});</script></body>';
    return html;
  }

  private downloadFile(filename: string, data: string) {
    const blob = new Blob([data], {type: 'text/csv'});
    const element = window.document.createElement('a');
    element.href = window.URL.createObjectURL(blob);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  private getQuestionnaire(book: Book, scenes: Scene[]): string {
    let html = '<div class="questionnaire">';
    scenes.filter(s => !!s.question && !!s.question.length).forEach(scene => {
      html += '<div class="question_container">';
      html += `<div class="question">${scene.question}</div>`;
      html += '<div class="answer"></div>';
      html += `<div class="command">${this.getCommand(book.questionnaireCommand, scene.index)}</div>`;
      html += '</div>';
    });
    return html + '</div>';
  }

  private getCommand(command: string, index: number): string {
    return command
      .replace('[###]', GrammerService.getArticle(index) + index + GrammerService.getAffix(index))
      .replace('(###)', GrammerService.getArticle(index) + index + GrammerService.getAffix2(index))
      .replace('###', GrammerService.getArticle(index) + index);
  }

  private getCSS(): string {
    let html = 'body {display: flex; flex-flow: column; align-items: center; font-family: sans-serif; padding: 20px;}';
    html += 'h1 {font-size: 20pt; margin: 60px 0;}';
    html += '.chapter_container {}';
    html += '.background-story {text-indent: 35px;}';
    html += '.background-story, .chapter {width: calc(45vw - 30px); padding: 15px; font-family: sans-serif; ' +
      'font-size: 12pt; line-height: 20pt; text-align: justify; white-space: pre-wrap; word-wrap: break-word;}';
    html += '.chapter_index {font-weight: bold; font-size: 12pt; text-align: left;} ';
    html += '.chapter_content {}';
    html += '.chapter_content span {cursor: pointer; font-weight: bold;}';
    html += '.chapter span {font-weight: bold;}';
    html += '.characters_title {margin: 80px 0 34px 0;}';
    html += '.questionnaire {margin-top: 25px;}';
    html += '.question_container { margin-bottom: 45px;}';
    html += '.question_container .answer {width: 100%; border-bottom: 2px dotted #787878; margin: 14px 0 8px 0; height: 4px;}';
    html += '.question_container .command {font-style: italic;}';
    return html;
  }
}

