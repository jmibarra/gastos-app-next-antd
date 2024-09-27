import {
    MessageOutlined,
    NotificationOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Avatar, Layout, Typography, Dropdown, Menu } from "antd";
import React from "react";
import { useRouter } from "next/navigation";

const { Header } = Layout;

const CustomHeader = () => {
    const router = useRouter();
    const user = JSON.parse(localStorage.getItem("user"));

    console.log(user);

    const handleLogout = () => {
        localStorage.removeItem("user");
        // Redirige al login después de cerrar sesión
        router.push("/login");
    };

    const menu = (
        <Menu>
            <Menu.Item disabled>{user?.fullName}</Menu.Item>
            <Menu.Divider />
            <Menu.Item key="logout" onClick={handleLogout}>
                Logout
            </Menu.Item>
        </Menu>
    );

    return (
        <Header
            style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                backgroundColor: "#001529",
            }}
        >
            <Typography.Title level={3} style={{ color: "white", margin: 0 }}>
                Expenses APP
            </Typography.Title>
            <div style={{ display: "flex", alignItems: "center" }}>
                <NotificationOutlined
                    style={{ color: "white", marginRight: 20 }}
                />
                <MessageOutlined style={{ color: "white", marginRight: 20 }} />
                <Dropdown overlay={menu} trigger={["click"]}>
                    <Avatar
                        size="large"
                        icon={<UserOutlined />}
                        src={user?.avatar} // Si tienes la URL del avatar en el objeto de usuario
                        style={{
                            backgroundColor: "#f56a00",
                            cursor: "pointer",
                        }}
                    />
                </Dropdown>
            </div>
        </Header>
    );
};

export default CustomHeader;
