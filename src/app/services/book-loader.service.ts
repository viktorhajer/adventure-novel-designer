import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookLoaderService {

  constructor(private http: HttpClient) {
  }

  loadStored(filename: string): Observable<any> {
    return this.http.get(`assets/${filename}.json`);
  }
}
