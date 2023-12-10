import { Component, TemplateRef, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LineaRequest } from 'src/app/core/interface/linea.request';
import { List } from 'src/app/core/interface/list.';
import { NotificationService } from 'src/app/core/service/notification.service';
import Swal from 'sweetalert2';
import { LineaService } from '../service/linea.service';
import { FamilyService } from './../service/family.service';

@Component({
  selector: 'app-linea',
  templateUrl: './linea.component.html',
  styleUrls: ['./linea.component.scss']
})
export class LineaComponent {
  private modalService = inject(NgbModal);
	closeResult = '';
  filterValue = '';
  list: List
  familia: any[] = []
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
  idLinea: number
  constructor(private lineaService: LineaService, private familiaService: FamilyService, private formBuilder: FormBuilder, private totastService: NotificationService) {
  }
  ngOnInit(): void {
    this.getLinea();
    this.getFamilia()
    this.inicializarFormulario();
    this.agregarLinea();
  }
  inicializarFormulario() {
    this.formForm = this.formBuilder.group({
      lineas: this.formBuilder.array([])
    });
    this.formFormUpdate = this.formBuilder.group({
      des_line: ['', Validators.required],
      cod_lin: ['', Validators.required],
      id_familia: [null, Validators.required]
    });
  }
  get lineas() {
    return this.formForm.get('lineas') as FormArray;
  }
  agregarLinea() {
    const nuevaFamilia = this.formBuilder.group({
      des_line: ['', Validators.required],
      cod_lin: ['', Validators.required],
      id_familia: [null, Validators.required]
    });
    this.lineas.push(nuevaFamilia);
  }
  eliminarLinea(index: number) {
    this.lineas.removeAt(index);
  }
  guardar() {
    this.submitted = true;
    if (this.formForm.invalid) {
      return;
    }
    const datosLinea = this.formForm.value.lineas as LineaRequest[];
    this.lineaService.register( datosLinea).subscribe({
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
        this.getLinea()
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
  private getLinea() {
    this.getList(this.limit, this.offset, this.currentPage)
  }
  onPageChange(event: { page: number, limit: number, offset: number }): void {
    this.currentPage = event.page;
    this.getList(event.limit, event.offset, this.currentPage)
  }
  getList(limit: number, offset: number, page: number) {
    this.lineaService.getAll(limit, offset, page).subscribe({
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
  getFamilia() {
    this.familiaService.getAll(10000, 0, 1).subscribe({
      next: (res: any) => {
        this.familia =  res?.registros
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
        title: 'Seguro de Eliminar Esta Linea?',
        text:`¡No podrás revertir esto!?`,
        icon: 'warning',
        confirmButtonText: `Si, Eliminar!`,
        cancelButtonText: 'No, cerrar!',
        showCancelButton: true
      })
      .then(result => {
        if (result.value) {
          Swal.fire({
            text: 'Eliminando Linea...',
            background: "#F3EAEA",
            allowOutsideClick: false,
            allowEscapeKey: false
          })
          Swal.showLoading()
          this.lineaService.delete(users_id).subscribe({
            next: (res: any) => {
              this.totastService.success(res.message)
            },
            error: (err: any) => {
              this.totastService.error(err.error.error)
            },
            complete: () => {
              this.getLinea()
            }
          })
        }
      });
  }
  edit (model:any, id:number) {
    this.lineaService.getById(id).subscribe({
      next: (res: any) => {
          this.formFormUpdate.patchValue(
            {
              des_line: res.des_line,
              cod_lin: res.cod_lin,
              id_familia: res.family_id_fam
            }
          )
          this.idLinea = res.id_line
          this.modalService.open(model, {size: 'lg'})
      }, 
      error: (err: any) => {
        this.totastService.error(err.error.error)
      }
    })
  }
  addCodigo(event: any, index: number) {
    const texto = event.target.value.toUpperCase()
    const frase = texto.split(' ');
    let codigoLinea = "L"
    // Obtén el FormGroup de la familia en el FormArray
    const familiaFormGroup = this.lineas.at(index) as FormGroup;
    if(texto.toLowerCase().indexOf(' ') !== -1) {
      codigoLinea = `${codigoLinea}${frase.map((p: any) => p.charAt(0)).join('')}`
    // Actualiza el valor del control cod_lin
      familiaFormGroup.get('cod_lin')?.setValue(codigoLinea);
    } else {
      codigoLinea = `${codigoLinea}${texto.substring(0,2)}`
      familiaFormGroup.get('cod_lin')?.setValue(codigoLinea);
    }
    familiaFormGroup.get("des_line")?.setValue(texto.toUpperCase())
  }
  get f() { return this.formFormUpdate; }
  update () {
    this.submitted = true;
    if (this.formFormUpdate.invalid) {
      return;
    }
    this.lineaService.update(this.idLinea, this.formFormUpdate.value).subscribe({
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
        this.getLinea()
      }
    })
  }
  addCodigoUpdate(event: any) {
    const texto = event.target.value.toUpperCase()
    const frase = texto.split(' ');
    let codigoLinea = "L"
    if(texto.toLowerCase().indexOf(' ') !== -1) {
      this.formFormUpdate.get('cod_lin')?.setValue(`${codigoLinea}${frase.map((p: any) => p.charAt(0)).join('')}`);
    } else {
      this.formFormUpdate.get('cod_lin')?.setValue(`${codigoLinea}${texto.substring(0,2)}`);
    }
    this.formFormUpdate.get("des_line")?.setValue(texto)
  }
}
