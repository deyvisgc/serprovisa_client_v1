import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ComponentsRoutes } from './component.routing';
import { NgbdpaginationBasicComponent } from './pagination/pagination.component';
import { NgbdAlertBasicComponent } from './alert/alert.component';
import { NgbdDropdownBasicComponent } from './dropdown-collapse/dropdown-collapse.component';
import { NgbdnavBasicComponent } from './nav/nav.component';
import { NgbdButtonsComponent } from './buttons/buttons.component';
import { CardsComponent } from './card/card.component';
import { TableComponent } from "./table/table.component";
import { AdminComponent } from './admin/admin.component';
import { NgSelectModule } from '@ng-select/ng-select';
import { CoreModule } from '../core/core.module';
import { FamilyComponent } from './family/family.component';
import { NgbAlertModule } from '@ng-bootstrap/ng-bootstrap';
import { GrupoComponent } from './grupo/grupo.component';
import { LineaComponent } from './linea/linea.component';
import { NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';
import { NgbCalendar, NgbDatepickerModule, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { JsonPipe } from '@angular/common';
import { ProductoComponent } from './producto/producto.component';
const routes: Routes = [
  {
    path: "admin",
    component: AdminComponent,
  },
  {
    path: "family",
    component: FamilyComponent,
  },
  {
    path: "linea",
    component: LineaComponent,
  },
  {
    path: "grupo",
    component: GrupoComponent,
  },
  {
    path: "asignar-product",
    component: ProductoComponent,
  },
  {
    path: "asignar-product/:id",
    component: ProductoComponent,
  },
];
@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    NgbModule,
    CoreModule,
    NgbAlertModule,
    NgbCollapseModule,
    NgbDatepickerModule, 
    JsonPipe,
    NgbdpaginationBasicComponent,
    NgbdAlertBasicComponent,
    NgbdDropdownBasicComponent,
    NgbdnavBasicComponent,
    NgbdButtonsComponent,
    CardsComponent,
    TableComponent
  ],
  declarations: [AdminComponent, FamilyComponent, LineaComponent, GrupoComponent, ProductoComponent],

})

export class ComponentsModule { }
