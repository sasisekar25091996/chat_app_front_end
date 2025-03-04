import { CURRENT_USER_URL } from "../../defaultServices/constService";
import CrudService from "../../defaultServices/crudService";

export default class CurrentUserService extends CrudService {
    url = CURRENT_USER_URL;
}
