import * as React from "react";
import { navigate } from "takeme";

interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  to: string;
  children: React.ReactChild | React.ReactChild[];
  style?: React.CSSProperties;
  className?: string;
}

export const Link: React.SFC<LinkProps> = (props) => <a
  {...props}
  href={props.to}
  onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    /** BEGIN LEGACY SHIMS */
    const { onClick, to } = props;
    navigate(to.startsWith("/app") ? to.replace("/app", "") : to);
    onClick && onClick(e);
  }} />;
