import React, { useState } from "react";
import {
  AppstoreOutlined,
  MailOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Menu } from "antd";
import { NavLink } from "react-router-dom";

const ActiveLinkeHighLight = (isActive) => {
  return isActive ? "active-link" : "inactive-link";
};
const items = [
  {
    key: "1",
    label: (
      <NavLink
        to={"/ethereal/profile/settings"}
        className={({ isActive }) => ActiveLinkeHighLight(isActive)}
      >
        Account Setting
      </NavLink>
    ),
    children: [
      {
        key: "12",
        label: "Option 2",
      },
      {
        key: "13",
        label: "Option 3",
      },
      {
        key: "14",
        label: "Option 4",
      },
    ],
  },
  {
    key: "2",
    icon: <AppstoreOutlined />,
    label: "Navigation Two",
    children: [
      {
        key: "21",
        label: "Option 1",
      },
      {
        key: "22",
        label: "Option 2",
      },
      {
        key: "23",
        label: "Submenu",
        children: [
          {
            key: "231",
            label: "Option 1",
          },
          {
            key: "232",
            label: "Option 2",
          },
          {
            key: "233",
            label: "Option 3",
          },
        ],
      },
      {
        key: "24",
        label: "Submenu 2",
        children: [
          {
            key: "241",
            label: "Option 1",
          },
          {
            key: "242",
            label: "Option 2",
          },
          {
            key: "243",
            label: "Option 3",
          },
        ],
      },
    ],
  },
  {
    key: "3",
    icon: <SettingOutlined />,
    label: "Navigation Three",
    children: [
      {
        key: "31",
        label: "Option 1",
      },
      {
        key: "32",
        label: "Option 2",
      },
      {
        key: "33",
        label: "Option 3",
      },
      {
        key: "34",
        label: "Option 4",
      },
    ],
  },
];
const getLevelKeys = (items1) => {
  const key = {};
  const func = (items2, level = 1) => {
    items2.forEach((item) => {
      if (item.key) {
        key[item.key] = level;
      }
      if (item.children) {
        func(item.children, level + 1);
      }
    });
  };
  func(items1);
  return key;
};
const levelKeys = getLevelKeys(items);
const App = () => {
  const [stateOpenKeys, setStateOpenKeys] = useState(["2", "23"]);
  const onOpenChange = (openKeys) => {
    const currentOpenKey = openKeys.find(
      (key) => stateOpenKeys.indexOf(key) === -1
    );
    // open
    if (currentOpenKey !== undefined) {
      const repeatIndex = openKeys
        .filter((key) => key !== currentOpenKey)
        .findIndex((key) => levelKeys[key] === levelKeys[currentOpenKey]);
      setStateOpenKeys(
        openKeys
          // remove repeat key
          .filter((_, index) => index !== repeatIndex)
          // remove current level all child
          .filter((key) => levelKeys[key] <= levelKeys[currentOpenKey])
      );
    } else {
      // close
      setStateOpenKeys(openKeys);
    }
  };
  return (
    <nav id="profile-side-navbar">
      <div className="nav-container">
        <Menu
          mode="inline"
          defaultSelectedKeys={["231"]}
          openKeys={stateOpenKeys}
          onOpenChange={onOpenChange}
          style={{
            width: 300,
          }}
          items={items}
        />
      </div>
    </nav>
  );
};
export default App;
