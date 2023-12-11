import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ProductoRequest } from 'src/app/core/interface/producto.request';
import { UriConstante } from 'src/app/util/UriConstante';

@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  constructor(private http: HttpClient) {
    
  }
  register(product: ProductoRequest[]): Observable<Response> {
    return this.http
    .post<any>(UriConstante.PRODUCTO_RESORCE, product)
  }
  update(id:number, product: ProductoRequest): Observable<Response> {
    return this.http
    .put<any>(`${UriConstante.PRODUCTO_RESORCE}/${id}` , product)
  }
  getById(id: number) : Observable<any> {
    return this.http.get<any>(UriConstante.PRODUCTO_RESORCE +   `/${id}` )
  }
  delete(id:number) {
    return this.http.delete<any>(UriConstante.PRODUCTO_RESORCE +   `/${id}` )
  }
}
