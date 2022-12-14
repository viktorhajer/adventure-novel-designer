import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {Scene} from '../../model/scene.model';
import {BookService} from '../../services/book.service';
import {GrammerService} from '../../services/grammer.service';

@Component({
  selector: 'app-questionnaire',
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.scss']
})
export class QuestionnaireComponent {

  scenes: Scene[] = [];

  constructor(private readonly dialogRef: MatDialogRef<QuestionnaireComponent>,
              private readonly bookService: BookService) {
    this.scenes = this.bookService.model.scenes.filter(s => !!s.question);
  }

  getCommand(index: number): string {
    return this.bookService.model.questionnaireCommand
      .replace('[###]', GrammerService.getArticle(index) + index + GrammerService.getAffix(index))
      .replace('(###)', GrammerService.getArticle(index) + index + GrammerService.getAffix2(index))
      .replace('###', GrammerService.getArticle(index) + index);
  }

  cancel() {
    this.dialogRef.close();
  }
}
