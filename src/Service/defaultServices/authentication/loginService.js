import { Component } from "react";
import { LOGIN_URL } from "../../defaultServices/constService";
import axios from "axios";

export default class LoginService extends Component {
  url = LOGIN_URL;
  post(data) {
    return axios.post(this.url, data);
  }
}
