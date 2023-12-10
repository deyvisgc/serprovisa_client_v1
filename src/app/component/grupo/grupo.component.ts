import { Component, TemplateRef, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { List } from 'src/app/core/interface/list.';
import { NotificationService } from 'src/app/core/service/notification.service';
import Swal from 'sweetalert2';
import { GrupoRequest } from 'src/app/core/interface/grupo.request';
import { GrupoService } from '../service/grupo.service';
import { LineaService } from './../service/linea.service';
import { FamilyService } from '../service/family.service';

@Component({
  selector: 'app-grupo',
  templateUrl: './grupo.component.html',
  styleUrls: ['./grupo.component.scss']
})
export class GrupoComponent {
  private modalService = inject(NgbModal);
	closeResult = '';
  filterValue = '';
  list: List
  linea: any[] = []
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
  idGrupo: number
  constructor(private lineaService: LineaService, private familaService: FamilyService, private formBuilder: FormBuilder, 
    private totastService: NotificationService, private grupoService: GrupoService) {
  }
  ngOnInit(): void {
    this.getFamilia();
    this.getGrupo()
    this.inicializarFormulario();
    this.agregarGrupo();
  }
  inicializarFormulario() {
    this.formForm = this.formBuilder.group({
      grupos: this.formBuilder.array([])
    });
    this.formFormUpdate = this.formBuilder.group({
      des_gru: ['', Validators.required],
      cod_gru: ['', Validators.required],
      id_familia: [null, Validators.required],
      id_linea: [null, Validators.required]
    });
  }
  get grupos() {
    return this.formForm.get('grupos') as FormArray;
  }
  agregarGrupo() {
    const nuevaFamilia = this.formBuilder.group({
      des_gru: ['', Validators.required],
      cod_gru: ['', Validators.required],
      id_linea: [null, Validators.required]
    });
    this.grupos.push(nuevaFamilia);
  }
  eliminarGrupo(index: number) {
    this.grupos.removeAt(index);
  }
  guardar() {
    this.submitted = true;
    if (this.formForm.invalid) {
      return;
    }
    const datosGrupo = this.formForm.value.grupos as GrupoRequest[];
    this.grupoService.register( datosGrupo).subscribe({
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
        this.getGrupo()
      }
    })
  }
  open(content: TemplateRef<any>, ) {
		this.modalService.open(content, { size: "xl"}).result.then(
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
  private getGrupo() {
    this.getList(this.limit, this.offset, this.currentPage)
  }
  onPageChange(event: { page: number, limit: number, offset: number }): void {
    this.currentPage = event.page;
    this.getList(event.limit, event.offset, this.currentPage)
  }
  getList(limit: number, offset: number, page: number) {
    this.grupoService.getAll(limit, offset, page).subscribe({
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
  getLinea() {
    this.lineaService.getAll(10000, 0, 1).subscribe({
      next: (res: any) => {
        this.linea =  res?.registros
      },
      error: (err: any) => {
        console.log(err);
      } 
    })
  }
  getFamilia() {
    this.familaService.getAll(10000, 0, 1).subscribe({
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
        title: 'Seguro de Eliminar Este Grupo?',
        text:`¡No podrás revertir esto!?`,
        icon: 'warning',
        confirmButtonText: `Si, Eliminar!`,
        cancelButtonText: 'No, cerrar!',
        showCancelButton: true
      })
      .then(result => {
        if (result.value) {
          Swal.fire({
            text: 'Eliminando Grupo...',
            background: "#F3EAEA",
            allowOutsideClick: false,
            allowEscapeKey: false
          })
          Swal.showLoading()
          this.grupoService.delete(users_id).subscribe({
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
    this.grupoService.getById(id).subscribe({
      next: (res: any) => {
          this.formFormUpdate.patchValue(
            {
              des_gru: res.des_gru,
              cod_gru: res.cod_gru,
              id_linea: res.linea_id_line
            }
          )
          this.idGrupo= res.linea_id_line
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
    let codigoLinea = "G"
    // Obtén el FormGroup de la familia en el FormArray
    const lineaFormGroup = this.grupos.at(index) as FormGroup;
    if(texto.toLowerCase().indexOf(' ') !== -1) {
      codigoLinea = `${codigoLinea}${frase.map((p: any) => p.charAt(0)).join('')}`
    // Actualiza el valor del control cod_gru
      lineaFormGroup.get('cod_gru')?.setValue(codigoLinea);
    } else {
      codigoLinea = `${codigoLinea}${texto.substring(0,2)}`
      lineaFormGroup.get('cod_gru')?.setValue(codigoLinea);
    }
    lineaFormGroup.get("des_gru")?.setValue(texto.toUpperCase())
  }
  get f() { return this.formFormUpdate; }
  update () {
    this.submitted = true;
    if (this.formFormUpdate.invalid) {
      return;
    }
    this.grupoService.update(this.idGrupo, this.formFormUpdate.value).subscribe({
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
        this.getGrupo()
      }
    })
  }
  addCodigoUpdate(event: any) {
    const texto = event.target.value.toUpperCase()
    const frase = texto.split(' ');
    let codigoLinea = "G"
    if(texto.toLowerCase().indexOf(' ') !== -1) {
      this.formFormUpdate.get('cod_gru')?.setValue(`${codigoLinea}${frase.map((p: any) => p.charAt(0)).join('')}`);
    } else {
      this.formFormUpdate.get('cod_gru')?.setValue(`${codigoLinea}${texto.substring(0,2)}`);
    }
    this.formFormUpdate.get("des_gru")?.setValue(texto)
  }
}
