import { GROUP_URL } from "../../defaultServices/constService";
import CrudService from "../../defaultServices/crudService";

export default class GroupService extends CrudService {
  url = GROUP_URL;

  getGroupChat(id, userid, filter) {
    return this.get(`${this.url}/group-message/${id}/${userid}`, {
      params: filter,
    });
  }
}
