import type { Metadata } from "next";
import config from "@payload-config";
import { RootLayout, handleServerFunctions } from "@payloadcms/next/layouts";
import type { ServerFunctionClient } from "payload";
import React from "react";

import { importMap } from "./cms/importMap.js";
import "@payloadcms/next/css";
import "./custom.scss";

type Args = { children: React.ReactNode };

export const metadata: Metadata = {
  title: "Sri Sakthi Vinayagar CMS",
  robots: { index: false, follow: false },
};

const serverFunction: ServerFunctionClient = async function (args) {
  "use server";
  return handleServerFunctions({ ...args, config, importMap });
};

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
);

export default Layout;
