import { message } from "antd";
import { Component } from "react";

class UserParentComponent extends Component {
  constructor() {
    super();
    this.state = {
      isLoading: false,
    };
  }

  onFinish = (value) => {
    this.setState({ isLoading: true });
    this.service
      .post(value)
      .then((e) => {
        message.success(e.data.message);
      })
      .catch((err) => message.error(err.response.data.error))
      .finally(() => {
        this.setState({ isLoading: false });
      });
  };
}

export default UserParentComponent;
