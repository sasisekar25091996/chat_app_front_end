import { LoadingOutlined } from "@ant-design/icons";
import { Button, Flex, Form, Input, Select, Spin } from "antd";
import { useEffect, useState } from "react";
import GroupService from "../Service/customizeServices/UserManagements/groupService";

const NewGroup = ({
  userList,
  currentUser,
  successState,
  currentGroupDetails,
  groupDetailsFormMode,
  stateUpdateAfterExitFromGroup,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const [form] = Form.useForm();
  const service = new GroupService();
  const onSave = (data) => {
    setIsLoading(true);

    if (currentGroupDetails) {
      service
        .updateItem(currentGroupDetails.id, {
          ...data,
          admins:
            groupDetailsFormMode === "exit"
              ? data.admins
              : [
                  ...(data.admins.filter((item) => users.includes(item)) || []),
                  currentUser.id,
                ],
          users:
            groupDetailsFormMode === "exit"
              ? data.users
              : [...(data.users || []), currentUser.id],
        })
        .then((e) => {
          console.log(e);
          setIsLoading(false);
          successState();
          form.resetFields();
          setUsers([]);

          groupDetailsFormMode === "exit" &&
            stateUpdateAfterExitFromGroup(currentGroupDetails.id);
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      service
        .create({
          ...data,
          admins: [...(data.admins || []), currentUser.id],
          users: [...(data.users || []), currentUser.id],
        })
        .then((e) => {
          console.log(e);
          setIsLoading(false);
          successState();
          form.resetFields();
        })
        .catch((err) => {
          console.log(err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  };

  useEffect(() => {
    if (currentGroupDetails) {
      setUsers(currentGroupDetails.users.map((e) => e.id));
      form.setFieldsValue({
        ...currentGroupDetails,
        users: currentGroupDetails.users
          .map((user) => user.id)
          .filter((userid) => userid != currentUser.id),
        admins: currentGroupDetails.admins
          .map((admin) => admin.id)
          .filter((adminid) => adminid != currentUser.id),
      });
    }
  }, [currentGroupDetails, form]);

  const selectedUsers = (data) => {
    setUsers(data);
  };

  return (
    <Form
      labelCol={{ span: 6 }}
      form={form}
      wrapperCol={{ span: 18 }}
      style={{ maxWidth: 600 }}
      onFinish={onSave}
    >
      <Form.Item
        name="groupname"
        label="Group Name"
        hidden={groupDetailsFormMode === "exit"}
        rules={[
          {
            required: true,
            message: "Please enter the Group name!",
          },
        ]}
      >
        <Input disabled={groupDetailsFormMode === "view"} />
      </Form.Item>

      {currentGroupDetails && (
        <Form.Item
          name="id"
          label="groupid"
          hidden
          rules={[
            {
              required: true,
              message: "Please enter the Group name!",
            },
          ]}
        >
          <Input disabled={groupDetailsFormMode === "view"} />
        </Form.Item>
      )}

      {groupDetailsFormMode === "exit" || (
        <Flex justify="end">
          <small style={{ color: "red" }}>You are the default user</small>
        </Flex>
      )}
      <Form.Item
        name="users"
        label="Users"
        hidden={groupDetailsFormMode === "exit"}
        rules={[
          {
            required: true,
            message: "Please select atleast one User!",
          },
        ]}
      >
        <Select
          mode="multiple"
          style={{
            width: "100%",
          }}
          disabled={groupDetailsFormMode === "view"}
          placeholder="Select users"
          onChange={selectedUsers}
          options={userList
            .filter((e) => e.username != null)
            .map((e) => ({ label: e.username, value: e.id }))}
        />
      </Form.Item>
      {groupDetailsFormMode === "exit" || (
        <Flex justify="end">
          <small style={{ color: "red" }}>You are the default admin</small>
        </Flex>
      )}
      <Form.Item
        name="admins"
        label="Admins"
        hidden={groupDetailsFormMode === "exit"}
        rules={[
          {
            required: true,
            message: "Please select atleast one User!",
          },
        ]}
      >
        <Select
          mode="multiple"
          style={{
            width: "100%",
          }}
          disabled={groupDetailsFormMode === "view"}
          placeholder="Select admins"
          options={userList
            .filter((e) => e.username != null)
            .filter((item) => users.includes(item.id))
            .map((e) => ({ label: e.username, value: e.id }))}
        />
      </Form.Item>
      {groupDetailsFormMode === "exit" && (
        <div>Do you want to exit from this group?</div>
      )}
      {groupDetailsFormMode === "view" || (
        <Flex justify="end">
          {groupDetailsFormMode === "exit" && (
            <Button style={{ marginRight: "1rem" }} onClick={successState}>
              No
            </Button>
          )}
          <Button
            icon={
              isLoading && (
                <Spin indicator={<LoadingOutlined spin />} size="small" />
              )
            }
            disabled={isLoading}
            type="primary"
            htmlType="submit"
          >
            {groupDetailsFormMode === "exit"
              ? "Yes"
              : currentGroupDetails
              ? "Update Group"
              : "Create Group"}
          </Button>
        </Flex>
      )}
    </Form>
  );
};

export default NewGroup;
