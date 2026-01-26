"use client";

import { useTheme } from "next-themes";
import { Switch } from "./ui/switch";
import { ThemeSwitch } from "./ui/theme-switch-button";

const ThemeToggler = ({visible}: {visible: Boolean}) => {
  return <div>{visible && <ThemeSwitch />}</div>;
};

export default ThemeToggler;
