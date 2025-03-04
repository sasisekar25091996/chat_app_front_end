import { Component } from "react";
import { FORGET_PASSWORD_URL } from "../../defaultServices/constService";
import axios from "axios";

export default class ForgetPasswordService extends Component {
  url = FORGET_PASSWORD_URL;
  put(data) {
    return axios.put(this.url, data);
  }
}
