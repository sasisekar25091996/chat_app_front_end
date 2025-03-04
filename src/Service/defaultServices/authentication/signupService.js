import axios from "axios";
import { Component } from "react";
import { SIGNUP_URL } from "../constService";

export default class SignupService extends Component{
    url = SIGNUP_URL;
    post(data){
        return axios.post(this.url, data);
    }
}