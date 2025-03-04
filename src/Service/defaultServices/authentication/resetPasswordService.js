import { Component } from "react";
import { RESET_PASSWORD_URL } from "../../defaultServices/constService";
import axios from "axios";

export default class ResetPasswordService extends Component {
  url = RESET_PASSWORD_URL;
  post(data, head) {
    return axios.post(this.url, data, head);
  }
}
