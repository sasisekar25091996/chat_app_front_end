import React, { useState } from "react";
import {
  Button,
  Card,
  Col,
  Flex,
  Form,
  Input,
  message,
  Row,
  Spin,
} from "antd";
import { Link } from "react-router-dom";
import { LoadingOutlined } from "@ant-design/icons";
import ForgetPasswordService from "../Service/defaultServices/authentication/forgotPasswordService";
import UserParentComponent from "./userParendComponent";

class ForgetPassword extends UserParentComponent {
  service = new ForgetPasswordService();
  onFinish = (value) => {
    this.setState({ isLoading: true });
    this.service
      .put(value)
      .then((e) => {
        message.success(e.data.message);
      })
      .catch((err) => message.error(err.response.data.message))
      .finally(() => {
        this.setState({ isLoading: false });
      });
  };
  render() {
    return (
      <Row
        style={{
          display: "flex",
          height: "100vh",
          flexDirection: "row-reverse",
          alignItems: "center",
          padding: "5rem",
          backgroundImage:
            "url('https://static.vecteezy.com/system/resources/previews/007/724/628/non_2x/blue-chat-bubbles-on-vivid-background-conversation-concept-3d-illustration-vector.jpg')",
        }}
      >
        <Col
          xs={24}
          sm={24}
          md={12}
          lg={8}
          xl={8}
          xxl={8}
          style={{ opacity: "0.9" }}
        >
          <Card>
            <h2 style={{ textAlign: "center", marginTop: "0px" }}>
              Forget Password
            </h2>
            <Form onFinish={this.onFinish} autoComplete="off" layout="vertical">
              <Form.Item
                label="Username"
                name="username"
                rules={[
                  {
                    required: true,
                    message: "Please input your username!",
                  },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label="New Password"
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Please input your password!",
                  },
                ]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item label={null} style={{ width: "100%" }}>
                <Button
                  style={{ width: "100%" }}
                  icon={
                    this.state.isLoading && (
                      <Spin indicator={<LoadingOutlined spin />} size="small" />
                    )
                  }
                  disabled={this.state.isLoading}
                  type="primary"
                  htmlType="submit"
                >
                  Reset Password
                </Button>
              </Form.Item>

              <Flex justify="space-between">
                <Link to="/login">Remember password?</Link>
                <Link to="/signup">Don't have an Account?</Link>
              </Flex>
            </Form>
          </Card>
        </Col>
      </Row>
    );
  }
}

export default ForgetPassword;
