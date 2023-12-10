import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor() { }
  // mensaje de exito
   success (message:string) {
    Swal.fire({
      position: "top-end",
      icon: "success",
      title: message,
      showConfirmButton: false,
      timer: 1500
    });
  }
   warning (message:string) {
    Swal.fire({
      position: "top-end",
      icon: "warning",
      title: message,
      showConfirmButton: false,
      timer: 1500
    });
  }
   info (message:string) {
    Swal.fire({
      position: "top-end",
      icon: "info",
      title: message,
      showConfirmButton: false,
      timer: 1500
    });
  }
   error (message:string) {
    Swal.fire({
      position: "top-end",
      icon: "error",
      title: "Oops...",
      text: message,
      timer: 1500
    });
  }
}
