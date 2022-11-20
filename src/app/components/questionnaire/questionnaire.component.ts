import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material/dialog';
import {Station} from '../../model/station.model';
import {BookService} from '../../services/book.service';
import {GrammerService} from '../../services/grammer.service';

@Component({
  selector: 'app-questionnaire',
  templateUrl: './questionnaire.component.html',
  styleUrls: ['./questionnaire.component.scss']
})
export class QuestionnaireComponent {

  stations: Station[] = [];

  constructor(private readonly dialogRef: MatDialogRef<QuestionnaireComponent>,
              private readonly bookService: BookService) {
    this.stations = this.bookService.model.stations.filter(s => !!s.question);
  }
  
  getCommand(index: number): string {
    const command = 'A válaszod ellenőrzéséhez lapozz [###]!';
    return command
      .replace('[###]', GrammerService.getArticle(index) + index + GrammerService.getAffix(index))
      .replace('(###)', GrammerService.getArticle(index) + index + GrammerService.getAffix2(index))
      .replace('###', GrammerService.getArticle(index) + index);
  }

  cancel() {
    this.dialogRef.close();
  }
}
