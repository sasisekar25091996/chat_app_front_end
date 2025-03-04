import { Badge, Card, Dropdown, Flex, Input, Modal, Tag } from "antd";
import Sider from "antd/es/layout/Sider";
import { useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import CurrentUser from "./currentUser";
import { MoreOutlined } from "@ant-design/icons";
import { UserListTimeFormate } from "../Service/defaultServices/formates";

const GroupListPage = ({
  setChatPageDetails,
  currentUser,
  openGroupForm,
  userList,
  socket,
}) => {
  const [state, setState] = useState({
    isChangePasswordModalOpen: false,
    isProfileModalOpen: false,
    searchName: "",
    hoveredUser: null,
  });

  const userSearch = (e) => {
    setState((prev) => ({ ...prev, searchName: e.target.value }));
  };
  const navigate = useNavigate();
  const items = [
    {
      key: "1",
      label: "Profile",
      onClick: () =>
        setState((prev) => ({ ...prev, isProfileModalOpen: true })),
    },
    {
      key: "2",
      label: "Change Password",
      onClick: () =>
        setState((prev) => ({ ...prev, isChangePasswordModalOpen: true })),
    },
    {
      key: "3",
      label: "New Group",
      onClick: () => openGroupForm(),
    },
    {
      key: "4",
      label: "Logout",
      onClick: () => {
        socket.close();
        Cookies.remove("login_token");
        navigate("/login", { replace: true });
      },
    },
  ];
  return (
    <div
      style={{
        height: "50vh",
      }}
    >
      <Card
        style={{
          backgroundColor: "white",
          position: "sticky",
          width: "100%",
          alignItems: "center",
          borderRadius: "0px",
          height: "65px",
        }}
      >
        <Flex align="center">
          <Input
            placeholder="&#x1F50D; Search"
            style={{ marginRight: "1rem" }}
            onChange={(e) => {
              userSearch(e);
            }}
          />
          <Dropdown menu={{ items }} placement="bottomRight">
            <MoreOutlined style={{ fontSize: "25px" }} />
          </Dropdown>
        </Flex>
      </Card>
      <Sider
        width={"400px"}
        style={{
          backgroundColor: "white",
          overflowY: "auto",
          scrollbarWidth: "thin",
          scrollbarGutter: "stable",
          backgroundColor: "white",
          height: "calc(50vh - 65px)", // Subtract the height of the Card
        }}
      >
        {userList
          ?.filter((e) =>
            e.username.toLowerCase().includes(state.searchName.toLowerCase())
          )
          .map((e) => {
            return (
              <div
                key={e.id}
                style={{
                  borderRadius: "0px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  border: "0px",
                  backgroundColor:
                    state.hoveredUser === e.id ? "#f0f5f5" : "white",
                  padding: "2px 5px 0px",
                  borderBottom: "solid #dee3e0 1px",
                  margin: "0rem 1rem",
                }}
                onClick={() => {
                  setChatPageDetails(e);
                }}
                onMouseEnter={() =>
                  setState((prev) => ({ ...prev, hoveredUser: e.id }))
                }
                onMouseLeave={() =>
                  setState((prev) => ({ ...prev, hoveredUser: null }))
                }
              >
                <Flex
                  align="center"
                  style={{
                    fontSize: "1rem",
                    color: "#919191",
                  }}
                >
                  <img
                    src={`${process.env.PUBLIC_URL}/userprofile.jpg`}
                    alt="Logo"
                    style={{
                      width: "20%",
                      height: "auto",
                      borderRadius: "50%",
                    }}
                  />
                  <Flex justify="space-between" flex={1}>
                    <div>
                      <div style={{ color: "black", fontWeight: 700 }}>
                        {e.username}
                      </div>
                      {e.recentMessage && (
                        <div style={{ paddingTop: "5px", fontSize: "14px" }}>
                          {e.recentMessage.message.length < 20
                            ? e.recentMessage.message
                            : e.recentMessage.message.slice(0, 20) + "..."}
                        </div>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "end",
                      }}
                    >
                      {e.recentMessage?.sendTime && (
                        <div style={{ paddingBottom: "10px" }}>
                          {UserListTimeFormate(e.recentMessage.sendTime)}
                        </div>
                      )}
                      {e.count != 0 && (
                        <Badge color="#909190" count={e.count} />
                      )}
                    </div>
                  </Flex>
                </Flex>
              </div>
            );
          })}
      </Sider>
      <Modal
        title="Profile"
        open={state.isProfileModalOpen}
        footer={false}
        onCancel={() =>
          setState((prev) => ({ ...prev, isProfileModalOpen: false }))
        }
      >
        <CurrentUser currentUser={currentUser?.username} />
      </Modal>
    </div>
  );
};

export default GroupListPage;
