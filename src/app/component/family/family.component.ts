import { Component, TemplateRef, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { List } from 'src/app/core/interface/list.';
import { NotificationService } from 'src/app/core/service/notification.service';
import Swal from 'sweetalert2';
import { FamilyService } from '../service/family.service';
import { FamiliaRequest } from 'src/app/core/interface/family.request';
@Component({
  selector: 'app-family',
  templateUrl: './family.component.html',
  styleUrls: ['./family.component.scss']
})
export class FamilyComponent {
  private modalService = inject(NgbModal);
	closeResult = '';
  filterValue = '';
  list: List
  selectedCar: number;
  formForm: FormGroup;
  formFormUpdate: FormGroup;
  submitted = false;
  isLoading = false;
  totalRegistros = 0
  totalRegistroPage = 0
  limit = 7
  offset = 0
  currentPage: number = 1;
  totalPages: number = 1;
  textSearch: string = ''
  errors: any[] = []
  idFamilia: number
  constructor(private familyService: FamilyService, private formBuilder: FormBuilder, private totastService: NotificationService) {

  }
  ngOnInit(): void {
    this.getFamily();
    this.inicializarFormulario();
    this.agregarFamilia();
  }
  inicializarFormulario() {
    this.formForm = this.formBuilder.group({
      familias: this.formBuilder.array([])
    });
    this.formFormUpdate = this.formBuilder.group({
      descripcion_familia: ['', Validators.required],
      codigo_familia: ['', Validators.required]
    });
  }
  get familias() {
    return this.formForm.get('familias') as FormArray;
  }
  agregarFamilia() {
    const nuevaFamilia = this.formBuilder.group({
      descripcion_familia: ['', Validators.required],
      codigo_familia: ['', Validators.required]
    });
    this.familias.push(nuevaFamilia);
  }
  eliminarFamilia(index: number) {
    this.familias.removeAt(index);
  }
  guardar() {
    this.submitted = true;
    if (this.formForm.invalid) {
      return;
    }
    const datosFamilias = this.formForm.value.familias as FamiliaRequest[];
    this.familyService.register( datosFamilias).subscribe({
      next: (res: any) => {
        this.totastService.success(res.message)
        this.formForm.reset()
        this.modalService.dismissAll()
        this.errors = []
      },
      error: (err: any) => {
        if (err.status !== 400) {
          this.totastService.error(err.error.error)
        } else {
          this.errors = err.error.message
        }

      }, 
      complete: () => {
        this.submitted = false;
        this.getFamily()
      }
    })
  }
  open(content: TemplateRef<any>) {
		this.modalService.open(content, { ariaLabelledBy: 'modal-basic-title' , size: 'lg'}).result.then(
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
  private getFamily() {
    this.getList(this.limit, this.offset, this.currentPage)
  }
  onPageChange(event: { page: number, limit: number, offset: number }): void {
    this.currentPage = event.page;
    this.getList(event.limit, event.offset, this.currentPage)
  }
  getList(limit: number, offset: number, page: number) {
    this.familyService.getAll(limit, offset, page).subscribe({
      next: (res: any) => {
        this.list = res
        this.offset = res.offset
        this.totalRegistros = res.totalRegistros
        if (this.offset == 0) {
          this.totalRegistroPage = 7
        } else {
          console.log(this.totalRegistroPage)
          this.totalRegistroPage =  res.offset + this.list?.registros.length 
        }
        this.totalPages =  Math.ceil(this.totalRegistros / limit);
      },
      error: (err: any) => {
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
        title: 'Seguro de Eliminar Esta Familia?',
        text:`¡No podrás revertir esto!?`,
        icon: 'warning',
        confirmButtonText: `Si, Eliminar!`,
        cancelButtonText: 'No, cerrar!',
        showCancelButton: true
      })
      .then(result => {
        if (result.value) {
          Swal.fire({
            text: 'Eliminando familia...',
            background: "#F3EAEA",
            allowOutsideClick: false,
            allowEscapeKey: false
          })
          Swal.showLoading()
          this.familyService.delete(users_id).subscribe({
            next: (res: any) => {
              this.totastService.success(res.message)
            },
            error: (err: any) => {
              this.totastService.error(err.error.error)
            },
            complete: () => {
              this.getFamily()
            }
          })
        }
      });
  }
  edit (model:any, id:number) {
    this.familyService.getById(id).subscribe({
      next: (res: any) => {
          this.formFormUpdate.patchValue(
            {
              descripcion_familia: res.des_fam,
              codigo_familia: res.cod_fam
            }
          )
          this.idFamilia = res.id_fam
          this.modalService.open(model)
      }, 
      error: (err: any) => {
        this.totastService.error(err.error.error)
      }
    })
  }
  addCodigo(event: any, index: number) {
    const texto = event.target.value.toUpperCase()
    const frase = texto.split(' ');
    let codigoFamilia = "F"
    // Obtén el FormGroup de la familia en el FormArray
    const familiaFormGroup = this.familias.at(index) as FormGroup;
    if(texto.toLowerCase().indexOf(' ') !== -1) {
      codigoFamilia = `${codigoFamilia}${frase.map((p: any) => p.charAt(0)).join('')}`
    // Actualiza el valor del control codigo_familia
      familiaFormGroup.get('codigo_familia')?.setValue(codigoFamilia);
    } else {
      codigoFamilia = `${codigoFamilia}${texto.substring(0,2)}`
      familiaFormGroup.get('codigo_familia')?.setValue(codigoFamilia);
    }
    familiaFormGroup.get("descripcion_familia")?.setValue(texto.toUpperCase())
  }
  get f() { return this.formFormUpdate; }
  update () {
    this.submitted = true;
    if (this.formFormUpdate.invalid) {
      return;
    }
    this.familyService.update(this.idFamilia, this.formFormUpdate.value).subscribe({
      next: (res: any) => {
        this.totastService.success(res.message)
        this.formFormUpdate.reset()
        this.modalService.dismissAll()
        this.errors = []
      },
      error: (err: any) => {
        if (err.status !== 400) {
          this.totastService.error(err.error.error)
        } else {
          this.totastService.error(err.error.message)
        }
      }, 
      complete: () => {
        this.submitted = false;
        this.getFamily()
      }
    })
  }
  addCodigoUpdate(event: any) {
    const texto = event.target.value.toUpperCase()
    const frase = texto.split(' ');
    let codigoFamilia = "F"
    if(texto.toLowerCase().indexOf(' ') !== -1) {
      this.formFormUpdate.get('codigo_familia')?.setValue(`${codigoFamilia}${frase.map((p: any) => p.charAt(0)).join('')}`);
    } else {
      this.formFormUpdate.get('codigo_familia')?.setValue(`${codigoFamilia}${texto.substring(0,2)}`);
    }
    this.formFormUpdate.get("descripcion_familia")?.setValue(texto)
  }
}
