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
import {StationFormComponent} from './components/station-form/station-form.component';
import {ErrorDialogComponent} from './components/error-dialog/error-dialog.component';
import {WarningDialogComponent} from './components/warning-dialog/warning-dialog.component';
import {ConfirmDialogComponent} from './components/confirm-dialog/confirm-dialog.component';
import {MatIconModule} from '@angular/material/icon';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {StationViewerComponent} from './components/station-viewer/station-viewer.component';
import {VisualNovelComponent} from './components/visual-novel/visual-novel.component';
import {MatSelectModule} from '@angular/material/select';
import {NovelFormComponent} from './components/novel-form/novel-form.component';
import {NovelViewerComponent} from './components/novel-viewer/novel-viewer.component';
import {RelationFormComponent} from './components/relation-form/relation-form.component';
import {ItemFormComponent} from './components/item-form/item-form.component';
import {RegionFormComponent} from './components/region-form/region-form.component';

@NgModule({
  declarations: [
    AppComponent,
    NovelFormComponent,
    StationFormComponent,
    ErrorDialogComponent,
    WarningDialogComponent,
    ConfirmDialogComponent,
    StationViewerComponent,
    NovelViewerComponent,
    RelationFormComponent,
    ItemFormComponent,
    RegionFormComponent,
    VisualNovelComponent
  ],
  imports: [
    CommonModule,
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
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
}
