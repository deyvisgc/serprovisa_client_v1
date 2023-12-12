import { environment } from "src/environments/environment"
export class UriConstante {
  public static readonly LOGIN = environment.host + "admin/login"
  public static readonly ROLE = environment.host + "admin/role"
  public static readonly ADMIN_RESOURCE = environment.host + "admin"
  public static readonly FAMILY_RESOURCE = environment.host + "family"
  public static readonly LINEA_RESORCE = environment.host + "linea"
  public static readonly LINEA_FAMILIA_RESORCE = environment.host + "linea/linea-familia"
  public static readonly GRUPO_RESORCE = environment.host + "group"
  public static readonly GRUPO_LINEA_RESORCE = environment.host + "group/grupo-linea"
  public static readonly PRODUCTO_RESORCE = environment.host + "products"
  
}
