import React, { useState } from "react";
import { Button, Card, Col, Flex, Form, Input, message, Row, Spin } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { LoadingOutlined } from "@ant-design/icons";
import LoginService from "../Service/defaultServices/authentication/loginService";
import Cookies from "js-cookie";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const service = new LoginService();
  const navigate = useNavigate();
  const onFinish = (value) => {
    setIsLoading(true);
    service
      .post(value)
      .then((e) => {
        const expirationTime = new Date(new Date().getTime() + 10 * 60 * 1000);
        Cookies.set("login_token", e.data.token, {
          expires: expirationTime,
        });
        navigate("/", { replace: true });
      })
      .catch((err) => message.error(err.response.data.error))
      .finally(() => {
        setIsLoading(false);
      });
  };

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
          <h2 style={{ textAlign: "center", marginTop: "0px" }}>Login</h2>
          <Form onFinish={onFinish} autoComplete="off" layout="vertical">
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
              <Input placeholder="Username" />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                {
                  required: true,
                  message: "Please input your password!",
                },
              ]}
            >
              <Input.Password placeholder="Password" />
            </Form.Item>

            <Form.Item label={null}>
              <Button
                style={{ width: "100%" }}
                icon={
                  isLoading && (
                    <Spin indicator={<LoadingOutlined spin />} size="small" />
                  )
                }
                disabled={isLoading}
                type="primary"
                htmlType="submit"
              >
                Login
              </Button>
            </Form.Item>

            <Flex justify="space-between">
              <Link to="/forget-password">Forgot Password?</Link>
              <Link to="/signup">Don't have an Account?</Link>
            </Flex>
          </Form>
        </Card>
      </Col>
    </Row>
  );
};

export default Login;
