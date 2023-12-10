import { environment } from "src/environments/environment"
export class UriConstante {
  public static readonly LOGIN = environment.host + "admin/login"
  public static readonly ROLE = environment.host + "admin/role"
  public static readonly ADMIN_RESOURCE = environment.host + "admin"
  public static readonly FAMILY_RESOURCE = environment.host + "family"
}
