import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of, switchMap, tap } from 'rxjs';
import { UriConstante } from 'src/app/util/UriConstante';
import { TokenService } from 'src/app/util/token.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private htpp: HttpClient, private tokenServ: TokenService) {
  }
  login(email: string, password: string): Observable<any> {
    console.log(email, password)
    return this.htpp.
    post<any>(UriConstante.LOGIN, {email, password})
    .pipe(tap(res => {
      this.tokenServ.saveToken(res.access_token)
    }));
  }
  logout(): void {
    this.tokenServ.removeToken()
    this.tokenServ.removeTokenApi()
  }
}
