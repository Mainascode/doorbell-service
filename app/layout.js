import { jsx as _jsx } from "react/jsx-runtime";
import "./globals.css";
import "./auth.css";
export const metadata = {
    title: "NITUME — Doorbell Service",
    description: "Your local runner in Ruaka.",
};
export default function RootLayout({ children }) {
    return (_jsx("html", { lang: "en", children: _jsx("body", { children: children }) }));
}
