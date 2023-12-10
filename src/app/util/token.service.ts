import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { KeySession } from './key_session.constante';
@Injectable({
  providedIn: 'root'
})
export class TokenService {
  constructor() { }
  
  roles: Array<string> = [];
  saveToken(token: string) {
    sessionStorage.setItem(KeySession.TOKEN, token)
  }
  saveTokenApi(token: string) {
    sessionStorage.setItem(KeySession.TOKEN_API, token)
  }
  
  getToken() {
    return sessionStorage.getItem(KeySession.TOKEN)
  }
  getTokenApi() {
    return sessionStorage.getItem(KeySession.TOKEN_API)
  }
  removeToken() {
    sessionStorage.removeItem(KeySession.TOKEN)
  }
  removeTokenApi() {
    sessionStorage.removeItem(KeySession.TOKEN_API)
  }
  isLoggedInUser(): boolean {
    const authToken = this.getToken()
    return (authToken != null) ? true : false;
  }
  
  decodeToken(): any {
    const token = this.getToken();
    if (token === null || token === '') {
      return { upn: '' };
    }
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('JWT debe tener 3 partes');
    }
    const decoded = this.urlBase64Decode(parts[1]);
    if (!decoded) {
      throw new Error('No se puede decodificar el token');
    }
    return JSON.parse(decoded);
  }
  decodeTokenWhatssap(): any {
    const token = this.getTokenApi();
    if (token === null || token === '') {
      return { upn: '' };
    }
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('JWT debe tener 3 partes');
    }
    const decoded = this.urlBase64Decode(parts[1]);
    if (!decoded) {
      throw new Error('No se puede decodificar el token');
    }
    return JSON.parse(decoded);
  }
  urlBase64Decode(str: string) {
    var output = str.replace(/-/g, '+').replace(/_/g, '/');
    switch (output.length % 4) {
        case 0:
            break;
        case 2:
            output += '==';
            break;
        case 3:
            output += '=';
            break;
        default:
            throw 'Illegal base64url string!';
    }
    return decodeURIComponent(escape(window.atob(output)));
  }
  // getRol (): string[] {
  //   this.roles = [];
  //   if(this.getToken()) {
  //     const res = this.decodeToken()
  //     res.data.rol.forEach((r: any) => {
  //       this.roles.push(r.role_description);
  //     });
  //     return this.roles;
  //   }
  // }
  
}
