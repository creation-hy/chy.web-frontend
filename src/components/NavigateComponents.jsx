import {forwardRef, memo} from "react";
import {useLocation, useNavigate} from "react-router";
import PropTypes from "prop-types";
import Link from "@mui/material/Link";
import {ButtonBase, ListItemButton} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";

export const NavigateLink = memo(forwardRef(({href, underline = "hover", color = "inherit", children, ...props}, ref) => {
	const navigate = useNavigate();
	const location = useLocation();
	
	return (
		<Link
			href={href}
			onClick={(event) => {
				if (!event.ctrlKey && !event.metaKey && !event.shiftKey && event.button === 0) {
					event.preventDefault();
					if (location.pathname !== href) {
						navigate(href);
					}
				}
			}}
			underline={underline}
			color={color}
			ref={ref}
			{...props}
		>
			{children}
		</Link>
	);
}));

NavigateLink.propTypes = {
	href: PropTypes.string,
	underline: PropTypes.string,
	color: PropTypes.string,
	children: PropTypes.node,
}

export const NavigateButton = memo(forwardRef(({href, children, ...props}, ref) => {
	const navigate = useNavigate();
	const location = useLocation();
	
	return (
		<Button
			href={href}
			onClick={(event) => {
				if (!event.ctrlKey && !event.metaKey && !event.shiftKey && event.button === 0) {
					event.preventDefault();
					if (location.pathname !== href) {
						navigate(href);
					}
				}
			}}
			ref={ref}
			{...props}
		>
			{children}
		</Button>
	);
}));

NavigateButton.propTypes = {
	href: PropTypes.string,
	children: PropTypes.node,
}

export const NavigateButtonBase = memo(forwardRef(({href, children, ...props}, ref) => {
	const navigate = useNavigate();
	const location = useLocation();
	
	return (
		<ButtonBase
			href={href}
			onClick={(event) => {
				if (!event.ctrlKey && !event.metaKey && !event.shiftKey && event.button === 0) {
					event.preventDefault();
					if (location.pathname !== href) {
						navigate(href);
					}
				}
			}}
			ref={ref}
			{...props}
		>
			{children}
		</ButtonBase>
	);
}));

NavigateButtonBase.propTypes = {
	href: PropTypes.string,
	children: PropTypes.node,
}

export const NavigateIconButton = memo(forwardRef(({href, children, ...props}, ref) => {
	const navigate = useNavigate();
	const location = useLocation();
	
	return (
		<IconButton
			href={href}
			onClick={(event) => {
				if (!event.ctrlKey && !event.metaKey && !event.shiftKey && event.button === 0) {
					event.preventDefault();
					if (location.pathname !== href) {
						navigate(href);
					}
				}
			}}
			ref={ref}
			{...props}
		>
			{children}
		</IconButton>
	);
}));

NavigateIconButton.propTypes = {
	href: PropTypes.string,
	children: PropTypes.node,
}

export const NavigateListItemButton = memo(forwardRef(({href, children, ...props}, ref) => {
	const navigate = useNavigate();
	const location = useLocation();
	
	return (
		<ListItemButton
			href={href}
			onClick={(event) => {
				if (!event.ctrlKey && !event.metaKey && !event.shiftKey && event.button === 0) {
					event.preventDefault();
					if (location.pathname !== href) {
						navigate(href);
					}
				}
			}}
			ref={ref}
			{...props}
		>
			{children}
		</ListItemButton>
	);
}));

NavigateListItemButton.propTypes = {
	href: PropTypes.string,
	children: PropTypes.node,
}