
import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap'
import { AdminService } from '../service/admin.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/core/service/notification.service';
import { List } from 'src/app/core/interface/list.';
import Swal from 'sweetalert2';
interface Role {
  id_role: number,
  ro_name: string
}
@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})


export class AdminComponent  implements OnInit {
  private modalService = inject(NgbModal);
	closeResult = '';
  filterValue = '';
  role: Role[];
  list: List
  selectedCar: number;
  signupForm: FormGroup;
  submitted = false;
  error = '';
  successmsg = false;
  isLoading = false;
  totalRegistros = 0
  totalRegistroPage = 0
  limit = 7
  offset = 0
  currentPage: number = 1;
  title:string = "Crear Usuario"
  totalPages: number = 1; // por ejemplo
  textSearch: string = ''
  idUser: number = 0
  constructor(private adminService: AdminService, private formBuilder: FormBuilder, private totastService: NotificationService) {

  }
  ngOnInit(): void {
    this.getAdmin()
    this.getRol()
    this.signupForm = this.formBuilder.group({
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.maxLength(20), Validators.minLength(6)]],
      name: [null, [Validators.required]],
      id_rol: [null, [Validators.required] ]
    });
  }
  open(content: TemplateRef<any>) {
		this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' }).result.then(
			(result) => {
				this.closeResult = `Closed with: ${result}`;
			},
			(reason) => {
				this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
			},
		);
	}
  private getDismissReason(reason: any): string {
		switch (reason) {
			case ModalDismissReasons.ESC:
				return 'by pressing ESC';
			case ModalDismissReasons.BACKDROP_CLICK:
				return 'by clicking on a backdrop';
			default:
				return `with: ${reason}`;
		}
    
	}
  private getRol() {
    this.adminService.getRol().subscribe({
      next: (res) => {
        this.role = res
      },
      error: (err) => {
        console.log(err);
      } 
    })
  }
  private getAdmin() {
    this.getList(this.limit, this.offset, this.currentPage)
  }
  get f() { return this.signupForm; }
  onSubmit() {
    this.submitted = true;
    if (this.idUser) this.signupForm.controls["password"].clearValidators()
    else this.signupForm.controls["password"].addValidators([Validators.required, Validators.maxLength(20), Validators.minLength(6)])
    if (this.signupForm.invalid) {
      return;
    } else {
      this.createAndUpdate(this.idUser)
    }
  }

  onPageChange(event: { page: number, limit: number, offset: number }): void {
    this.currentPage = event.page;
    this.getList(event.limit, event.offset, this.currentPage)
  }
  getList(limit: number, offset: number, page: number) {
    this.adminService.getAll(limit, offset, page).subscribe({
      next: (res) => {
        this.list = res
        this.offset = res.offset
        this.totalRegistros = res.totalRegistros
        if (this.offset == 0) {
          this.totalRegistroPage = 7
        } else {
          this.totalRegistroPage =  res.offset + this.list?.registros.length 
        }
        this.totalPages =  Math.ceil(this.totalRegistros / limit);
      },
      error: (err) => {
        console.log(err);
      } 
    })
  }
  eliminar(users_id: number) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger ms-2'
      },
      buttonsStyling: false
    });
    swalWithBootstrapButtons
      .fire({
        title: 'Seguro de Eliminar Este Usuario?',
        text:`¡No podrás revertir esto!?`,
        icon: 'warning',
        confirmButtonText: `Si, Eliminar!`,
        cancelButtonText: 'No, cerrar!',
        showCancelButton: true
      })
      .then(result => {
        if (result.value) {
          this.adminService.delete(users_id).subscribe({
            next: (res) => {
              this.totastService.success(res.message)
            },
            error: (err) => {
              this.totastService.error(err.error.error)
            },
            complete: () => {
              this.getAdmin()
            }
          })
        }
      });
  }
  edit (model:any, id:number) {
    this.adminService.getUsersById(id).subscribe({
      next: (res) => {
          this.title = 'Actualizar Usuario'
          this.signupForm.patchValue(
            {
              email: res.us_username,
              name: res.us_full_name,
              id_rol: res.role_idrole,
            }
          )
          this.signupForm.controls["password"].clearValidators()
          this.modalService.open(model)
          this.idUser = res.id_user
      }, 
      error: (err) => {
        this.totastService.error(err.error.error)
      }
    })
  }
  createAndUpdate (idUser: number) {
    this.adminService.registerAndUpdate(idUser, this.signupForm.value).subscribe({
      next: (res) => {
        this.totastService.success(res.message)
        this.signupForm.reset()
        this.modalService.dismissAll()
      },
      error: (err) => {
        this.totastService.error(err.error.error)
      }, 
      complete: () => {
        this.submitted = false;
        this.idUser = 0
        this.getAdmin()
      }
    })
  }
}
