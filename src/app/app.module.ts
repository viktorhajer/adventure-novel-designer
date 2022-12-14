import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatDialogModule} from '@angular/material/dialog';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {SceneFormComponent} from './components/scene-form/scene-form.component';
import {ConfirmDialogComponent} from './components/confirm-dialog/confirm-dialog.component';
import {MatIconModule} from '@angular/material/icon';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {SceneViewerComponent} from './components/scene-viewer/scene-viewer.component';
import {MatSelectModule} from '@angular/material/select';
import {BookFormComponent} from './components/book-form/book-form.component';
import {BookViewerComponent} from './components/book-viewer/book-viewer.component';
import {QuestionnaireComponent} from './components/questionnaire/questionnaire.component';
import {CharacterViewerComponent} from './components/character-viewer/character-viewer.component';
import {RelationFormComponent} from './components/relation-form/relation-form.component';
import {ItemFormComponent} from './components/item-form/item-form.component';
import {ChapterFormComponent} from './components/chapter-form/chapter-form.component';
import {SimulationComponent} from './components/simulation/simulation.component';
import {NotesFormComponent} from './components/notes-form/notes-form.component';
import {ColorBoxComponent} from './components/color-box/color-box.component';
import {VisualBookComponent} from './components/visual-book/visual-book.component';
import {CharacterFormComponent} from './components/character-form/character-form.component';
import {HttpClientModule} from '@angular/common/http';
import {ReviewFormComponent} from './components/review-form/review-form.component';
import {BookListComponent} from './components/book-list/book-list.component';
import {MatTabsModule} from '@angular/material/tabs';
import {DialogComponent} from './components/dialog/dialog.component';
import {IndexEditorComponent} from './components/index-editor/index-editor.component';
import {VisualBookSimplifiedComponent} from './components/visual-book-simplified/visual-book-simplified.component';

@NgModule({
  declarations: [
    AppComponent,
    BookFormComponent,
    SceneFormComponent,
    DialogComponent,
    ConfirmDialogComponent,
    SceneViewerComponent,
    BookViewerComponent,
    BookListComponent,
    RelationFormComponent,
    ItemFormComponent,
    ChapterFormComponent,
    ColorBoxComponent,
    CharacterFormComponent,
    SimulationComponent,
    NotesFormComponent,
    VisualBookComponent,
    QuestionnaireComponent,
    CharacterViewerComponent,
    ReviewFormComponent,
    VisualBookSimplifiedComponent,
    IndexEditorComponent
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    FormsModule,
    BrowserModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatInputModule,
    MatDialogModule,
    MatIconModule,
    MatSlideToggleModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatTabsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
