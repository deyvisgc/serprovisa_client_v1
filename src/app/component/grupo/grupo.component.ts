import { Component, TemplateRef, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalDismissReasons, NgbCalendar, NgbDate, NgbDateStruct, NgbModal, NgbModalConfig, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { List } from 'src/app/core/interface/list.';
import { NotificationService } from 'src/app/core/service/notification.service';
import Swal from 'sweetalert2';
import { GrupoRequest } from 'src/app/core/interface/grupo.request';
import { GrupoService } from '../service/grupo.service';
import { LineaService } from './../service/linea.service';
import { FamilyService } from '../service/family.service';
import  * as dayjs from "dayjs"
import { Filtros } from 'src/app/core/interface/filtros.request';
import { TokenService } from 'src/app/util/token.service';
import { ProductoRequest } from 'src/app/core/interface/producto.request';
import { ProductoService } from '../service/producto.service';
import { Router } from '@angular/router';
dayjs().format()
@Component({
  selector: 'app-grupo',
  templateUrl: './grupo.component.html',
  styleUrls: ['./grupo.component.scss'],
})
export class GrupoComponent {
  private modalService = inject(NgbModal);
  today = inject(NgbCalendar).getToday();
	model: NgbDateStruct;
  closeResult = '';
  filterValue = '';
  list: List;
  linea: any[] = [];
  lineaFilters: any[] = [];
  familia: any[] = [];
  selectedCar: number;
  formForm: FormGroup;
  formFormUpdate: FormGroup;
  formFormProducto: FormGroup;
  submitted = false;
  isLoading = false;
  totalRegistros = 0;
  totalRegistroPage = 0;
  limit = 7;
  offset = 0;
  currentPage: number = 1;
  totalPages: number = 1;
  textSearch: string = '';
  errors: any[] = [];
  idGrupo: number;
  idGrupoProducto: number = 0;
  isCollapsed = true;
  idLinea = 0
  idFamilia = 0
  codigoConjunto: string = ""
  totalProducto: number = 0
  filtros: Filtros = {
    fecha_ini: {
      year: dayjs().subtract(1, 'month').year(),
      month: dayjs().subtract(1, 'month').month() + 1, // Los meses en NgbDateStruct van de 1 a 12
      day: dayjs().date()
    },
    fecha_fin: {
      year: dayjs().year(),
      month: dayjs().month() + 1,
      day: dayjs().date()
    },
    famila: "",
    linea: ""
  }
  
  constructor(
    private lineaService: LineaService,
    private familaService: FamilyService,
    private formBuilder: FormBuilder,
    private totastService: NotificationService,
    private grupoService: GrupoService,
    private tokenService: TokenService,
    private productoService: ProductoService,
    private router: Router,
    config: NgbModalConfig
  ) {
    config.backdrop = 'static';
		config.keyboard = false;
  }
  ngOnInit(): void {
    this.getFamilia();
    this.getGrupo();
    this.getLinea();
    this.inicializarFormulario();
    this.agregarGrupo();
    //this.addProducto();
  }
  inicializarFormulario() {
    this.formForm = this.formBuilder.group({
      grupos: this.formBuilder.array([]),
    });
    this.formFormProducto = this.formBuilder.group({
      productos: this.formBuilder.array([]),
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
  get productos() {
    return this.formFormProducto.get('productos') as FormArray;
  }
  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }
  agregarGrupo() {
    const nuevaFamilia = this.formBuilder.group({
      des_gru: ['', Validators.required],
      cod_gru: ['', Validators.required],
      id_familia: [null, Validators.required],
      id_linea: [null, Validators.required],
      des_fam: [""],
      des_line: [""]
    });
    this.grupos.push(nuevaFamilia);
  }
  addProducto() {
    if (this.productos.length > 9) {
      this.totastService.warning("Solo se permite agregar 10 productos")
      return
    }
    this.totalProducto += 1
    let codProducto = ""
    if(this.totalProducto < 10) {
      codProducto = `00${this.totalProducto}`
    } else if (this.totalProducto < 99 && this.totalProducto > 9) {
      codProducto = `0${this.totalProducto}`
    } else {
      codProducto = `${this.totalProducto}`
    }
    const nuevoProducto = this.formBuilder.group({
      cod_product: [`${this.codigoConjunto}-${codProducto}` , Validators.required],
      name_product: ['', Validators.required],
      des_product: [null, Validators.required],
      id_grupo: [this.idGrupoProducto, Validators.required],
      id_user: [this.tokenService.decodeToken().id, Validators.required],
    });
    this.productos.push(nuevoProducto);
    console.log()
  }
  eliminarGrupo(index: number) {
    this.grupos.removeAt(index);
  }
  eliminarProducto(index: number) {
    this.productos.removeAt(index);
  }
  guardar() {
    this.submitted = true;
    if (this.formForm.invalid) {
      return;
    }
    const datosGrupo = this.formForm.value.grupos as GrupoRequest[];
    this.grupoService.register(datosGrupo).subscribe({
      next: (res: any) => {
        this.totastService.success(res.message);
        this.formForm.reset();
        this.modalService.dismissAll();
        this.errors = [];
      },
      error: (err: any) => {
        if (err.status !== 400) {
          this.totastService.error(err.error.error);
        } else {
          this.errors = err.error.message;
        }
      },
      complete: () => {
        this.submitted = false;
        this.getGrupo();
      },
    });
  }
  open(content: TemplateRef<any>) {
    const opcionesModal: NgbModalOptions = {
      size: 'xl'
    };
    this.modalService.open(content, opcionesModal).result.then(
      (result) => {
        this.closeResult = `Closed with: ${result}`;
      },
      (reason) => {
        this.closeResult = `Dismissed ${this.getDismissReason(reason)}`;
      }
    );
  }
  getDismissReason(reason: any): string {
    switch (reason) {
      case ModalDismissReasons.BACKDROP_CLICK:
        this.productos.clear()
        this.modalService.dismissAll();
        return 'by clicking on a backdrop';
      default:
        return `with: ${reason}`;
    }
  }
  private getGrupo() {
    this.getList(this.limit, this.offset, this.currentPage);
  }
  onPageChange(event: { page: number; limit: number; offset: number }): void {
    this.currentPage = event.page;
    this.getList(event.limit, event.offset, this.currentPage);
  }
  getList(limit: number, offset: number, page: number) {
    this.grupoService.getAll(limit, offset, page, this.filtros).subscribe({
      next: (res: any) => {
        this.list = res;
        this.offset = res.offset;
        this.totalRegistros = res.totalRegistros;
        if (this.offset == 0) {
          this.totalRegistroPage = 7;
        } else {
          console.log(this.totalRegistroPage);
          this.totalRegistroPage = res.offset + this.list?.registros.length;
        }
        this.totalPages = Math.ceil(this.totalRegistros / limit);
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }
  getLineaByIdFamiliaCreate(event: any, index:number) {
    const grupoFormGroup = this.grupos.at(index) as FormGroup;
    grupoFormGroup.get('des_fam')?.setValue(event.des_fam);
    this.getLineByIdFamilia(event.id_fam)
  }
  getLineaByIdFamiliaUpdate (event: any) {
    this.getLineByIdFamilia(event.id_fam)
  }
  getLineByIdFamilia(id: number) {
    this.lineaService.getByIdFamilia(id).subscribe({
      next: (res: any) => {
        this.linea = res;
        this.formFormUpdate.patchValue({id_linea: 0});
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }
  getFamilia() {
    this.familaService.getAll(10000, 0, 1).subscribe({
      next: (res: any) => {
        this.familia = res?.registros;
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }
  getLinea() {
    this.lineaService.getAll(10000, 0, 1).subscribe({
      next: (res: any) => {
        this.lineaFilters = res?.registros;
        this.linea = res?.registros;
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }
  eliminar(users_id: number) {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger ms-2',
      },
      buttonsStyling: false,
    });
    swalWithBootstrapButtons
      .fire({
        title: 'Seguro de Eliminar Este Grupo?',
        text: `¡No podrás revertir esto!?`,
        icon: 'warning',
        confirmButtonText: `Si, Eliminar!`,
        cancelButtonText: 'No, cerrar!',
        showCancelButton: true,
      })
      .then((result) => {
        if (result.value) {
          Swal.fire({
            text: 'Eliminando Grupo...',
            background: '#F3EAEA',
            allowOutsideClick: false,
            allowEscapeKey: false,
          });
          Swal.showLoading();
          this.grupoService.delete(users_id).subscribe({
            next: (res: any) => {
              this.totastService.success(res.message);
            },
            error: (err: any) => {
              this.totastService.error(err.error.error);
            },
            complete: () => {
              this.getGrupo();
            },
          });
        }
      });
  }
  edit(model: any, id: number) {
    this.grupoService.getById(id).subscribe({
      next: (res: any) => {
        this.formFormUpdate.patchValue({
          des_gru: res.des_gru,
          cod_gru: res.cod_gru,
          id_linea: res.linea_id_line,
          id_familia: res.fam_id_familia
        });
        this.idGrupo = id;
        this.modalService.open(model, { size: 'xl' });
      },
      error: (err: any) => {
        this.totastService.error(err.error.error);
      },
    });
  }
  addCodigo(event: any, index: number) {
    const texto = event.target.value.toUpperCase();
    const frase = texto.split(' ');
    let codigoLinea = 'G';
    // Obtén el FormGroup de la familia en el FormArray
    const lineaFormGroup = this.grupos.at(index) as FormGroup;
    if (texto.toLowerCase().indexOf(' ') !== -1) {
      codigoLinea = `${codigoLinea}${frase
        .map((p: any) => p.charAt(0))
        .join('')}`;
      // Actualiza el valor del control cod_gru
      lineaFormGroup.get('cod_gru')?.setValue(codigoLinea);
    } else {
      codigoLinea = `${codigoLinea}${texto.substring(0, 2)}`;
      lineaFormGroup.get('cod_gru')?.setValue(codigoLinea);
    }
    lineaFormGroup.get('des_gru')?.setValue(texto.toUpperCase());
  }
  get f() {
    return this.formFormUpdate;
  }
  update() {
    this.submitted = true;
    if (this.formFormUpdate.invalid) {
      return;
    }
    this.grupoService
      .update(this.idGrupo, this.formFormUpdate.value)
      .subscribe({
        next: (res: any) => {
          this.totastService.success(res.message);
          this.formFormUpdate.reset();
          this.modalService.dismissAll();
          this.errors = [];
        },
        error: (err: any) => {
          if (err.status !== 400) {
            this.totastService.error(err.error.error);
          } else {
            this.totastService.error(err.error.message);
          }
        },
        complete: () => {
          this.submitted = false;
          this.getGrupo();
        },
      });
  }
  addCodigoUpdate(event: any) {
    const texto = event.target.value.toUpperCase();
    const frase = texto.split(' ');
    let codigoLinea = 'G';
    if (texto.toLowerCase().indexOf(' ') !== -1) {
      this.formFormUpdate
        .get('cod_gru')
        ?.setValue(
          `${codigoLinea}${frase.map((p: any) => p.charAt(0)).join('')}`
        );
    } else {
      this.formFormUpdate
        .get('cod_gru')
        ?.setValue(`${codigoLinea}${texto.substring(0, 2)}`);
    }
    this.formFormUpdate.get('des_gru')?.setValue(texto);
  }
	onSearchDate() {
    if (!this.filtros.fecha_ini) {
      this.totastService.warning("La fecha Inicio no debe estar vacio");
      return
    }
    if (!this.filtros.fecha_fin) {
      this.totastService.warning("La fecha Fin no debe estar vacio");
      return
    }
    this.getList(this.limit, this.offset, this.currentPage)
	}
  onSearchFamily () {
    if (!this.filtros.famila) {
      this.totastService.warning("Debe seleccionar una familia a filtrar");
      return
    }
    this.getList(this.limit, this.offset, this.currentPage)
  }
  onSearchLine () {
    if (!this.filtros.linea) {
      this.totastService.warning("Debe seleccionar una linea a filtrar");
      return
    }
    this.getList(this.limit, this.offset, this.currentPage)
  }
  clearFilter() {
    this.filtros = {
      famila: "",
      linea: "",
      fecha_ini: {
        year: dayjs().subtract(1, 'month').year(),
        month: dayjs().subtract(1, 'month').month() + 1, // Los meses en NgbDateStruct van de 1 a 12
        day: dayjs().date()
      },
      fecha_fin: {
        year: dayjs().year(),
        month: dayjs().month() + 1,
        day: dayjs().date()
      },
    }
    this.getList(this.limit, this.offset, this.currentPage)
  }
  getGrupoLinea (event: any, index: number) {
    const lineaFormGroup = this.grupos.at(index) as FormGroup;
    lineaFormGroup.get('des_line')?.setValue(event.des_line);
  }
  guardarProducto () {
    this.submitted = true;
    if (this.productos.length > 0) {
      if (this.formFormProducto.invalid) {
        return;
      }
      const producto = this.formFormProducto.value.productos as ProductoRequest[];
      
      this.productoService.register(producto).subscribe({
        next: (res: any) => {
          this.totastService.success(res.message);
          this.formFormProducto.reset();
          this.modalService.dismissAll();
          this.errors = [];
        },
        error: (err: any) => {
          if (err.status !== 400) {
            this.totastService.error(err.error.error);
          } else {
            this.errors = err.error.message;
          }
        },
        complete: () => {
          this.submitted = false;
          this.getGrupo();
          this.productos.clear()
        },
      });
    } {
      this.totastService.error("Minimo un producto ha registrar")
    }
    
  }
  agregarProducto (model: any, item: any) {
    this.codigoConjunto = item.cod_gru_final
    this.totalProducto = item.total_product
    this.idGrupoProducto = item.id_grou
    this.modalService.open(model, { size: 'xl' });
  }
  verProducto (model: any, id: number) {
    this.router.navigate(['system/component/asignar-product/', id]);
  }
}
