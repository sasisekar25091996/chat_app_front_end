import { ALL_USERS_URL } from "../../defaultServices/constService";
import CrudService from "../../defaultServices/crudService";

export default class AllUserService extends CrudService {
    url = ALL_USERS_URL;
}
