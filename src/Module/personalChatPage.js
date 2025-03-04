import { MoreOutlined, SendOutlined } from "@ant-design/icons";
import {
  Button,
  Card,
  Dropdown,
  Flex,
  Form,
  Input,
  Layout,
  Modal,
  Table,
  Tag,
  Tooltip,
} from "antd";
import { LiaCheckSolid } from "react-icons/lia";
import { RiCheckDoubleFill } from "react-icons/ri";
import TextArea from "antd/es/input/TextArea";
import React, { useEffect, useRef, useState } from "react";
import PersonalChatService from "../Service/customizeServices/UserManagements/personalChatService";
import {
  ChatPageTimeFormat,
  IndianDateTimeFormate,
  UserListTimeFormate,
} from "../Service/defaultServices/formates";
import GroupService from "../Service/customizeServices/UserManagements/groupService";
import NewGroup from "./newGroup";

const { Header, Footer, Content } = Layout;

const PersonalChatPage = ({
  stateUpdateAfterExitFromGroup,
  state,
  sendMessage,
  currentUser,
  updatedAdminState,
  removalOfDataAfterAdminStatusUpdate,
}) => {
  const contentRef = useRef(null);
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editGroupDetails, setEditGroupDetails] = useState(false);
  const [statusData, setStatusData] = useState([]);
  const [statusMessage, setStatusMessage] = useState(null);
  const [currentGroupDetails, setCurrentGroupDetails] = useState(null);
  const [groupDetailsFormMode, setgroupDetailsFormMode] = useState(false);
  const groupService = new GroupService();

  const { chatPageDetails, messageList, user, sessionid, groupId } =
    state || {};

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({
        top: contentRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messageList, user]);

  useEffect(() => {
    if (state) {
      form.setFieldsValue({
        receiverid: chatPageDetails?.id,
        senderid: user?.id,
        sessionid,
        type: "CREATE",
        groupId: groupId,
      });
    }
  }, [state]);

  useEffect(() => {
    if (state.chatPageDetails && state.chatPageDetails.chatType == "GROUP") {
      groupService.getSingleItem(state.chatPageDetails?.groupId).then((e) => {
        setCurrentGroupDetails(e.data);
      });
    } else {
      setCurrentGroupDetails(null);
    }
  }, [chatPageDetails, groupDetailsFormMode]);

  useEffect(() => {
    if (updatedAdminState != null) {
      setCurrentGroupDetails(updatedAdminState);
      removalOfDataAfterAdminStatusUpdate();
    }
  }, [updatedAdminState]);

  const onSentMessage = (data) => {
    sendMessage(data);
    form.resetFields(["message"]);
  };

  const messageStatusIcons = {
    SENT: <LiaCheckSolid style={{ marginLeft: 10, color: "blue" }} />,
    RECEIVED: (time) => (
      <Tooltip
        placement="left"
        title={<div>{`Delivered at ${UserListTimeFormate(time)}`}</div>}
      >
        <RiCheckDoubleFill style={{ marginLeft: 10, color: "blue" }} />
      </Tooltip>
    ),
    READ: (time, receivedTime) => (
      <Tooltip
        placement="left"
        title={
          <>
            <div>{`Received at ${ChatPageTimeFormat(receivedTime)}`}</div>
            <div>{`Read at ${ChatPageTimeFormat(time)}`}</div>
          </>
        }
      >
        <RiCheckDoubleFill style={{ marginLeft: 10, color: "white" }} />
      </Tooltip>
    ),
  };

  const items = [
    {
      key: "1",
      label: "Group Details",
      onClick: () => {
        setEditGroupDetails(true);
        setgroupDetailsFormMode("view");
      },
    },
    ...(currentGroupDetails?.admins.some((e) => e.id == currentUser?.id)
      ? [
          {
            key: "2",
            label: "Edit Group",
            onClick: () => {
              setEditGroupDetails(true);
              setgroupDetailsFormMode("update");
            },
          },
        ]
      : []),
    {
      key: "3",
      label: "Exit",
      onClick: () => {
        setEditGroupDetails(true);
        setgroupDetailsFormMode("exit");
      },
    },
  ];

  const handleCancel = () => {
    setIsModalOpen(false);
    setStatusData([]);
    setStatusMessage(null);
  };

  const handleEditGroupDetailsFormCancel = () => {
    setEditGroupDetails(false);
    setgroupDetailsFormMode(null);
  };

  return (
    <Layout
      style={{
        display: "flex",
        flexDirection: "column",
        position: "relative",
        height: "100vh",
      }}
    >
      <Header
        style={{
          backgroundColor: "white",
          display: "flex",
          alignItems: "center",
        }}
      >
        <img
          src={`${process.env.PUBLIC_URL}/userprofile.jpg`}
          alt="Logo"
          style={{ width: 50, borderRadius: "50%", marginRight: "1rem" }}
        />
        <Flex justify="space-between" flex={1}>
          <div style={{ fontSize: "1rem" }}>
            {chatPageDetails.chatType === "PRIVATE"
              ? chatPageDetails.username
              : chatPageDetails.groupName}
          </div>
          {chatPageDetails.chatType === "GROUP" && (
            <Dropdown menu={{ items }} placement="bottomRight">
              <MoreOutlined style={{ fontSize: "25px" }} />
            </Dropdown>
          )}
        </Flex>
      </Header>

      <Content
        ref={contentRef}
        style={{
          flex: 1,
          overflowY: "scroll",
          alignContent: "end",
          padding: "1rem 1rem 5px",
        }}
      >
        {messageList?.map(
          ({
            id,
            message,
            sender,
            receiver,
            sendTime,
            status,
            receivedTime,
            readTime,
            messageStatus,
          }) => (
            <Flex
              key={id}
              justify={sender.id === user.id ? "flex-end" : "flex-start"}
            >
              <Tag
                style={{
                  marginBottom: "8px",
                  maxWidth: "93%",
                  minWidth: "100px",
                  borderRadius:
                    sender.id === user.id
                      ? "10px 0px 10px 10px"
                      : "0px 10px 10px 10px",
                  backgroundColor: sender.id === user.id ? "#0066ff" : "white",
                  color: sender.id === user.id ? "white" : "black",
                  padding: "6px 10px",
                }}
              >
                <Flex justify="space-between">
                  {groupId && (
                    <div
                      style={{
                        fontWeight: 700,
                        color: sender.id === user.id ? "white" : "blue",
                      }}
                    >
                      {sender.username}
                    </div>
                  )}
                  {sender.id === user.id && groupId && (
                    <Tooltip placement="left" title="Click me">
                      <Button
                        onClick={() => {
                          setIsModalOpen(true);
                          setStatusData(messageStatus);
                          setStatusMessage(message);
                        }}
                        style={{
                          padding: "0px",
                          height: "15px",
                          width: "15px",
                          borderRadius: "50%",
                        }}
                      >
                        !
                      </Button>
                    </Tooltip>
                  )}
                </Flex>
                <p style={{ margin: 0 }}>
                  {message.split("\n").map((line, index) => (
                    <React.Fragment key={index}>
                      {line}
                      <br />
                    </React.Fragment>
                  ))}
                </p>
                <Flex justify="end">
                  <small>{ChatPageTimeFormat(sendTime)}</small>
                  {sender.id === user.id &&
                    !groupId &&
                    (status === "SENT"
                      ? messageStatusIcons.SENT
                      : status === "RECEIVED"
                      ? messageStatusIcons.RECEIVED(receivedTime)
                      : messageStatusIcons.READ(readTime, receivedTime))}
                </Flex>
              </Tag>
            </Flex>
          )
        )}
      </Content>

      {(sessionid || groupId) && (
        <Footer
          style={{
            backgroundColor: "white",
            padding: "15px 10px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Form form={form} style={{ width: "100%" }} onFinish={onSentMessage}>
            <Flex>
              <Flex flex={1}>
                {chatPageDetails.chatType === "GROUP" ? (
                  <Form.Item hidden name="groupId">
                    <Input />
                  </Form.Item>
                ) : (
                  <>
                    <Form.Item hidden name="receiverid">
                      <Input />
                    </Form.Item>
                    <Form.Item hidden name="sessionid">
                      <Input />
                    </Form.Item>
                  </>
                )}

                <Form.Item hidden name="senderid">
                  <Input />
                </Form.Item>
                <Form.Item hidden name="type">
                  <Input />
                </Form.Item>
                <Form.Item
                  style={{
                    width: "100%",
                    paddingRight: "1rem",
                    marginBottom: 0,
                  }}
                  name="message"
                >
                  <TextArea
                    placeholder="Enter"
                    autoSize={{ minRows: 1, maxRows: 5 }}
                  />
                </Form.Item>
              </Flex>
              <Form.Item style={{ marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  shape="circle"
                  icon={<SendOutlined />}
                />
              </Form.Item>
            </Flex>
          </Form>
        </Footer>
      )}
      <Modal
        title="Group Details"
        open={editGroupDetails}
        onCancel={handleEditGroupDetailsFormCancel}
        footer={false}
      >
        <NewGroup
          userList={state.userList}
          currentUser={state.user}
          successState={handleEditGroupDetailsFormCancel}
          currentGroupDetails={currentGroupDetails}
          groupDetailsFormMode={groupDetailsFormMode}
          stateUpdateAfterExitFromGroup={stateUpdateAfterExitFromGroup}
        />
      </Modal>
      <Modal
        title="Message delivery status"
        open={isModalOpen}
        onCancel={handleCancel}
        footer={false}
      >
        {statusMessage && (
          <Tag style={{ backgroundColor: "#0066ff", color: "white" }}>
            {(() => {
              const lines = statusMessage.split("\n");
              return lines[0].length > 20
                ? lines[0].slice(0, 20) + "..."
                : lines.length > 1
                ? lines[0] + "..."
                : lines[0];
            })()}
          </Tag>
        )}

        <br />
        <br />
        <Table
          columns={[
            {
              title: "Group member",
              dataIndex: "receiver",
              key: "receiver",
              render: (receiver) => {
                return receiver?.username;
              },
            },
            {
              title: "Received time",
              dataIndex: "receivedTime",
              key: "receivedTime",
              render: (time) => (time ? ChatPageTimeFormat(time) : "Not yet"),
            },
            {
              title: "Read time",
              dataIndex: "readTime",
              key: "readTime",
              render: (time) => (time ? ChatPageTimeFormat(time) : "Not yet"),
            },
          ]}
          dataSource={statusData}
        />
      </Modal>
    </Layout>
  );
};

export default PersonalChatPage;
