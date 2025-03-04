import { PERSONAL_CHAT_URL } from "../../defaultServices/constService";
import CrudService from "../../defaultServices/crudService";

export default class PersonalChatService extends CrudService {
    url = PERSONAL_CHAT_URL;
}