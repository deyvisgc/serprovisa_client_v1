import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { Response } from 'src/app/core/interface/message.response';
import { UserRequest } from 'src/app/core/interface/users.request';
import { UriConstante } from 'src/app/util/UriConstante';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) {
    
  }
  registerAndUpdate(id:number = 0, user: UserRequest): Observable<Response> {
    if (id === 0) {
      return this.http
      .post<any>(UriConstante.ADMIN_RESOURCE, user)
    } else {
      return this.http
      .put<any>(UriConstante.ADMIN_RESOURCE + `/${id}`, user)
    }

    // .pipe(
    //   catchError((err: any) => of(err)),
    // );
  }
  getRol():Observable<any>  {
    return this.http.get(UriConstante.ROLE);
  }
  getAll(limit: number, offset: number, page: number):Observable<any>  {
    const params = new HttpParams()
    .append("limit", limit)
    .append("offset", offset)
    .append("page", page)
    return this.http.get(UriConstante.ADMIN_RESOURCE, {params: params});
  }
  getUsersById(id: number) : Observable<any> {
    return this.http.get<any>(UriConstante.ADMIN_RESOURCE +   `/${id}` )
  }
  delete(id:number) {
    return this.http.delete<any>(UriConstante.ADMIN_RESOURCE +   `/${id}` )
  }
}