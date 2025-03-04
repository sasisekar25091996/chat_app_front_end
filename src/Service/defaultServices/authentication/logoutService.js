import { LOGOUT_URL } from "../../defaultServices/constService";
import CrudService from "../crudService";

export default class LogoutService extends CrudService {
  url = LOGOUT_URL;
}
