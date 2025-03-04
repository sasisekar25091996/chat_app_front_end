import { Layout, message, Modal } from "antd";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { Navigate } from "react-router-dom";
import UserListPage from "./userListPage";
import PersonalChatService from "../Service/customizeServices/UserManagements/personalChatService";
import CurrentUserService from "../Service/customizeServices/UserManagements/currentUserService";
import PersonalChatPage from "./personalChatPage";
import NewGroup from "./newGroup";
import AllUserService from "../Service/customizeServices/UserManagements/allUserService";
import GroupService from "../Service/customizeServices/UserManagements/groupService";
import { convertToISOFormat } from "../Service/defaultServices/formates";

const Homepage = () => {
  const token = Cookies.get("login_token");

  const [state, setState] = useState({
    isGroupModalOpen: false,
    chatPageDetails: null,
    user: null,
    sessionid: null,
    messageList: [],
    userList: [],
    socket: null,
    currentGroupDetails: null,
    alertModelIsOpen: false,
    removedGroupName: null,
    updatedAdminState: null,
  });

  const currentUserService = new CurrentUserService();
  const personalChatService = new PersonalChatService();
  const allUserService = new AllUserService();
  const groupService = new GroupService();

  /** Token Refresh */
  const refreshTokenExpiration = () => {
    if (token) {
      const expirationTime = 10 / (24 * 60);
      Cookies.set("login_token", token, { expires: expirationTime });
    }
  };

  /** Fetch Current User */
  useEffect(() => {
    if (token) {
      currentUserService.getAll().then((res) => {
        setState((prev) => ({ ...prev, user: res.data }));
      });

      window.addEventListener("mousemove", refreshTokenExpiration);
      window.addEventListener("keydown", refreshTokenExpiration);

      return () => {
        window.removeEventListener("mousemove", refreshTokenExpiration);
        window.removeEventListener("keydown", refreshTokenExpiration);
      };
    }
  }, [token]);

  /** Fetch Chat Messages */
  useEffect(() => {
    if (
      token &&
      state.user?.id &&
      state.chatPageDetails?.id &&
      !state.chatPageDetails?.groupId
    ) {
      personalChatService
        .getAll({
          senderid: state.user.id,
          receiverid: state.chatPageDetails.id,
        })
        .then((res) => {
          setState((prev) => ({
            ...prev,
            sessionid: res.data.sessionid,
            messageList: res.data.chatList,
          }));
        })
        .catch(console.error);
    } else if (token && state.user?.id && state.chatPageDetails?.groupId) {
      groupService
        .getGroupChat(state.chatPageDetails.groupId, state.user?.id)
        .then((res) => {
          setState((prev) => ({
            ...prev,
            sessionid: null,
            messageList: res.data,
          }));
        });
    }
  }, [token, state.user, state.chatPageDetails]);

  // Web socket
  useEffect(() => {
    if (token && state.user) {
      let socket;
      let reconnectAttempts = 0;
      const maxAttempts = 5; // Set max retries
      const reconnectDelay = 3000; // 3 seconds

      allUserService.getAll({ id: state.user.id }).then((res) => {
        setState((prev) => ({ ...prev, userList: res.data }));
      });

      const connectWebSocket = () => {
        socket = new WebSocket(
          `ws://localhost:4000/chat?userId=${state.user.id}`
        );

        socket.onopen = () => {
          console.log("WebSocket Connected");
          reconnectAttempts = 0; // Reset attempts on success
        };

        socket.onmessage = (event) => {
          console.log("📩 New message:", JSON.parse(event.data));
          let responseBody = JSON.parse(event.data);
          if (responseBody.chatType === "GROUP") {
            setState((prev) => {
              if (!responseBody.recentMessage) {
                message.info("You are in a new group");
                return {
                  ...prev,
                  userList: [responseBody, ...prev.userList],
                };
              }
              return prev;
            });
          } else if (responseBody.type === "group_chat_message") {
            console.log("responseBody.body", responseBody);
            const groupId = responseBody.body.group.id;
            setState((prev) => {
              let group = prev.userList?.find((e) => e.groupId === groupId);

              if (group) {
                let newList = [...prev.userList];
                let indexNo = newList.indexOf(group);
                newList.splice(indexNo, 1);
                let newMessageList = [...prev.messageList];
                if (
                  prev.chatPageDetails &&
                  group.groupId == prev.chatPageDetails.groupId
                ) {
                  let messageHasToModify = prev.messageList?.find(
                    (e) => e.id == responseBody.body.id
                  );
                  if (messageHasToModify) {
                    newMessageList.splice(
                      newMessageList.indexOf(messageHasToModify),
                      1,
                      {
                        ...responseBody.body,
                        sendTime: convertToISOFormat(
                          responseBody.body.sendTime
                        ),
                        messageStatus: responseBody.body.messageStatus.map(
                          (e) => {
                            return {
                              ...e,
                              readTime: e.readTime
                                ? convertToISOFormat(e.readTime)
                                : null,
                              receivedTime: e.receivedTime
                                ? convertToISOFormat(e.receivedTime)
                                : null,
                            };
                          }
                        ),
                      }
                    );
                  } else {
                    newMessageList.push({
                      ...responseBody.body,
                      sendTime: convertToISOFormat(responseBody.body.sendTime),
                      messageStatus: responseBody.body.messageStatus.map(
                        (e) => {
                          return {
                            ...e,
                            readTime: e.readTime
                              ? convertToISOFormat(e.readTime)
                              : null,
                            receivedTime: e.receivedTime
                              ? convertToISOFormat(e.receivedTime)
                              : e.receivedTime,
                          };
                        }
                      ),
                    });
                  }
                  const loginUserDetailsInStatus =
                    responseBody.body.messageStatus.find(
                      (e) => e.receiver.id == state.user.id
                    );

                  loginUserDetailsInStatus &&
                    socket.send(
                      JSON.stringify({
                        message: responseBody.body.id,
                        receiverid: state.user.id,
                        type: "GROUPMESSAGEUPDATE",
                      })
                    );
                }

                const modiffiedMessage = {
                  ...group,
                  recentGroupMessage: {
                    ...responseBody.body,
                    sendTime: convertToISOFormat(responseBody.body.sendTime),
                  },
                };
                responseBody.body.sender.id == state.user.id &&
                responseBody.subtype == "user_received_status"
                  ? newList.splice(indexNo, 0, modiffiedMessage)
                  : newList.unshift(modiffiedMessage);

                return {
                  ...prev,
                  userList: newList.map((e) => {
                    return responseBody.body.messageStatus.find(
                      (e) => e.receiver.id == state.user.id
                    )
                      ? prev.groupId == groupId
                        ? e
                        : !prev.chatPageDetails
                        ? e.groupId == groupId
                          ? { ...e, count: e.count + 1 }
                          : e
                        : e.groupId == groupId
                        ? { ...e, count: e.count + 1 }
                        : e
                      : e;
                  }),
                  messageList: newMessageList,
                };
              }
              return prev;
            });
          } else if (responseBody.chatType === "YOU_ARE_REMOVED") {
            setState((prev) => ({
              ...prev,
              alertModelIsOpen: true,
              removedGroupName: responseBody.removedGroupName,
            }));
            stateUpdateAfterExitFromGroup(responseBody.group_id);
          } else if (responseBody.chatType === "UPDATED_ADMIN_STATUS") {
            let updatedGroupData = responseBody.group_details;
            setState((prev) => {
              if (
                prev.chatPageDetails && prev.chatPageDetails.groupId != null &&
                prev.chatPageDetails.groupId == updatedGroupData.id
              ) {
                message.info(responseBody.Message);
                return {
                  ...prev,
                  updatedAdminState: updatedGroupData,
                };
              } else {
                return prev;
              }
            });
          } else if (responseBody.chatType === "UPDATED_GROUP_NAME") {
            setState((prev) => {
              if (!prev) return prev; // Prevent edge cases

              let updatedState = { ...prev };
              let hasChanges = false;

              if (
                prev.chatPageDetails &&
                prev.chatPageDetails.groupId != null &&
                prev.chatPageDetails.groupId == responseBody.id
              ) {
                updatedState.chatPageDetails = {
                  ...prev.chatPageDetails,
                  groupName: responseBody.groupName,
                };
                hasChanges = true;
              }

              // Update userList if groupId matches responseBody.id
              if (prev.userList) {
                const updatedUserList = prev.userList.map((group) =>
                  group.groupId == responseBody.id
                    ? { ...group, groupName: responseBody.groupName }
                    : group
                );

                // Only update state if userList has actually changed
                if (updatedUserList !== prev.userList) {
                  updatedState.userList = updatedUserList;
                  hasChanges = true;
                }
              }

              return hasChanges ? updatedState : prev;
            });
          } else {
            let sessionid = responseBody.body.session.id;

            setState((prev) => {
              let messagingPerson = prev.userList?.find(
                (e) => e.sessionid == sessionid
              );

              if (messagingPerson) {
                let newList = [...prev.userList];
                let indexNo = newList.indexOf(messagingPerson);
                newList.splice(indexNo, 1);

                let newMessageList = [...prev.messageList];

                if (
                  prev.chatPageDetails &&
                  sessionid == prev.chatPageDetails.sessionid
                ) {
                  let messageHasToModify = prev.messageList?.find(
                    (e) => e.id == responseBody.body.id
                  );
                  if (messageHasToModify) {
                    newMessageList.splice(
                      newMessageList.indexOf(messageHasToModify),
                      1,
                      {
                        ...responseBody.body,
                        sendTime: convertToISOFormat(
                          responseBody.body.sendTime
                        ),
                        receivedTime: convertToISOFormat(
                          responseBody.body.receivedTime
                        ),
                        readTime: convertToISOFormat(
                          responseBody.body.readTime
                        ),
                      }
                    );
                  } else {
                    newMessageList.push({
                      ...responseBody.body,
                      sendTime: convertToISOFormat(responseBody.body.sendTime),
                      receivedTime: convertToISOFormat(
                        responseBody.body.receivedTime
                      ),
                      readTime: convertToISOFormat(responseBody.body.readTime),
                    });
                  }
                  responseBody.body.status != "READ" &&
                    responseBody.body.sender.id != prev.user.id &&
                    socket.send(
                      JSON.stringify({
                        id: responseBody.body.id,
                        message: responseBody.body.message,
                        receiverid: responseBody.body.receiver.id,
                        senderid: responseBody.body.sender.id,
                        sessionid: responseBody.body.session.id,
                        type: "UPDATE",
                      })
                    );
                }

                const modiffiedMessage = {
                  ...messagingPerson,
                  recentMessage: {
                    ...responseBody.body,
                    sendTime: convertToISOFormat(responseBody.body.sendTime),
                  },
                };
                if (responseBody.body.status === "READ") {
                  newList.splice(indexNo, 0, modiffiedMessage);
                } else {
                  newList.unshift(modiffiedMessage);
                }

                return {
                  ...prev,
                  userList: newList.map((e) => {
                    return responseBody.body.status === "READ"
                      ? e
                      : prev.sessionid == sessionid
                      ? e
                      : !prev.chatPageDetails
                      ? e.sessionid == sessionid
                        ? { ...e, count: e.count + 1 }
                        : e
                      : e.sessionid == sessionid
                      ? { ...e, count: e.count + 1 }
                      : e;
                  }),
                  messageList: newMessageList,
                };
              }
              return prev;
            });
          }
        };

        socket.onerror = (error) => {
          console.error("❌ WebSocket Error:", error);
        };

        socket.onclose = () => {
          // Try to reconnect after a delay, but limit attempts
          if (reconnectAttempts < maxAttempts) {
            reconnectAttempts++;
            console.log(`♻️ Reconnecting attempt ${reconnectAttempts}...`);
            setTimeout(connectWebSocket, reconnectDelay);
          } else {
            console.log("❌ Max reconnection attempts reached.");
          }
        };

        setState((prev) => ({ ...prev, socket }));
      };

      connectWebSocket(); // Initial connection

      return () => {
        socket.close();
      };
    }
  }, [state.user]);

  /** Send Message */
  const sendMessage = (data) => {
    if (state.socket) {
      state.socket.send(JSON.stringify(data));
    } else {
      console.log("❌ No WebSocket connection.");
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const stateUpdateAfterExitFromGroup = (groupid) => {
    setState((prev) => {
      return {
        ...prev,
        chatPageDetails: null,
        groupId: null,
        userList: [...prev.userList].filter((e) => e.groupId != groupid),
      };
    });
  };

  const removalOfDataAfterAdminStatusUpdate = () => {
    setState((prev) => ({
      ...prev,
      updatedAdminState: null,
    }));
  };

  return token ? (
    <Layout style={{ backgroundColor: "white" }}>
      <UserListPage
        currentUser={state.user}
        setChatPageDetails={(chatDetails) => {
          if (chatDetails.chatType === "PRIVATE") {
            setState((prev) => {
              let newUserList = prev.userList.map((user) =>
                user.sessionid === chatDetails.sessionid
                  ? { ...user, count: 0 }
                  : user
              );
              return {
                ...prev,
                userList: newUserList,
                chatPageDetails: chatDetails,
                sessionid: chatDetails.sessionid,
                groupId: null,
              };
            });
          } else {
            setState((prev) => {
              let newUserList = prev.userList.map((user) =>
                user.groupId === chatDetails.groupId
                  ? { ...user, count: 0 }
                  : user
              );
              return {
                ...prev,
                userList: newUserList,
                chatPageDetails: chatDetails,
                sessionid: null,
                groupId: chatDetails.groupId,
              };
            });
          }
        }}
        socket={state.socket}
        userList={state.userList}
        openGroupForm={() =>
          setState((prev) => ({ ...prev, isGroupModalOpen: true }))
        }
      />
      {state.chatPageDetails ? (
        <PersonalChatPage
          stateUpdateAfterExitFromGroup={stateUpdateAfterExitFromGroup}
          sendMessage={sendMessage}
          state={state}
          currentUser={state.user}
          updatedAdminState={state.updatedAdminState}
          removalOfDataAfterAdminStatusUpdate={
            removalOfDataAfterAdminStatusUpdate
          }
        />
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            width: "100%",
            flexDirection: "column",
          }}
        >
          <h1>
            {getGreeting()}, {state.user?.username}...!
          </h1>
          <img
            src={`${process.env.PUBLIC_URL}/welcome.gif`}
            alt="Greeting Animation"
            style={{ width: "400px", height: "auto" }} // Adjust size as needed
          />
        </div>
      )}
      <Modal
        title="New Group"
        open={state.isGroupModalOpen}
        footer={false}
        onCancel={() =>
          setState((prev) => ({ ...prev, isGroupModalOpen: false }))
        }
      >
        <NewGroup
          userList={state.userList}
          currentUser={state.user}
          successState={() =>
            setState((prev) => ({ ...prev, isGroupModalOpen: false }))
          }
        />
      </Modal>
      <Modal
        title="Alert Message"
        open={state.alertModelIsOpen}
        footer={false}
        onCancel={() => {
          setState((prev) => ({
            ...prev,
            alertModelIsOpen: false,
            removedGroupName: null,
          }));
        }}
      >
        You are removed from {<b>{state.removedGroupName}</b>}
      </Modal>
    </Layout>
  ) : (
    <Navigate to="/login" />
  );
};

export default Homepage;
