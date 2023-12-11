import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgbCalendar, NgbDateStruct, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as dayjs from 'dayjs';
import { Filtros, FiltrosProducto } from 'src/app/core/interface/filtros.request';
import { List } from 'src/app/core/interface/list.';
import { LineaService } from '../service/linea.service';
import { FamilyService } from '../service/family.service';
import { NotificationService } from 'src/app/core/service/notification.service';
import { GrupoService } from '../service/grupo.service';
import { ProductoService } from '../service/producto.service';
import { ActivatedRoute } from '@angular/router';
import { AdminService } from '../service/admin.service';

@Component({
  selector: 'app-producto',
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.scss']
})
export class ProductoComponent implements OnInit {
  private modalService = inject(NgbModal);
  today = inject(NgbCalendar).getToday();
	model: NgbDateStruct;


  closeResult = '';
  filterValue = '';
  list: List;
  linea: any[] = [];
  lineaFilters: any[] = [];
  familia: any[] = [];
  grupo: any[] = [];
  responsables: any[] = [];
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
  filtros: FiltrosProducto = {
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
    linea: "",
    grupo: "",
    user: ""
  }
  filtrosGrupo: Filtros = {
    fecha_ini: { year: 0, month: 0, day: 0},
    fecha_fin: { year: 0, month: 0, day: 0},
    famila: "",
    linea: "",
  }
  constructor(
    private lineaService: LineaService,
    private familaService: FamilyService,
    private formBuilder: FormBuilder,
    private totastService: NotificationService,
    private grupoService: GrupoService,
    private productoService: ProductoService,
    private adminService: AdminService,
    private route: ActivatedRoute
  ) {}
  ngOnInit(): void {

    this.route.params.subscribe(params => {
      const id = params['id'] ? +params['id'] : null;
      if (id !== null) {
        this.filtros.grupo = id.toString()
        this.filtros.fecha_ini = { year: 0, month: 0, day: 0}
        this.filtros.fecha_fin = { year: 0, month: 0, day: 0}
      }
      this.getProducto()
      this.getLinea()
      this.getFamilia()
      this.getGrupo()
      this.getResponsable()
    });
  }
  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
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
  onSearchGrupo () {
    if (!this.filtros.grupo) {
      this.totastService.warning("Debe seleccionar un grupo");
      return
    }
    this.getList(this.limit, this.offset, this.currentPage)
  }
  onSearchResponsable () {
    if (!this.filtros.user) {
      this.totastService.warning("Debe seleccionar un responsable");
      return
    }
    this.getList(this.limit, this.offset, this.currentPage)
  }
  clearFilter() {
    this.filtros = {
      famila: "",
      linea: "",
      grupo: "",
      user: "",
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
  private getProducto() {
    this.getList(this.limit, this.offset, this.currentPage);
  }
  getList(limit: number, offset: number, page: number) {
    this.productoService.getAll(limit, offset, page, this.filtros).subscribe({
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
  getLinea() {
    this.lineaService.getAll(10000, 0, 1).subscribe({
      next: (res: any) => {
        this.linea = res?.registros;
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
  getGrupo() {
    this.grupoService.getAll(10000, 0, 1, this.filtrosGrupo).subscribe({
      next: (res: any) => {
        this.grupo = res?.registros;
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }
  getResponsable() {
    this.adminService.getAll(10000, 0, 1).subscribe({
      next: (res: any) => {
        this.responsables = res?.registros.filter( (f: any) => f.ro_name !== "Super Admin");
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }
  edit(model: any, id: number) {}
  eliminar(id: number) {}
  onPageChange(event: { page: number, limit: number, offset: number }): void {
    this.currentPage = event.page;
    this.getList(event.limit, event.offset, this.currentPage)
  }
}
