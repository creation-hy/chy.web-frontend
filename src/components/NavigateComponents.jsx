import {memo} from "react";
import {useNavigate} from "react-router";
import PropTypes from "prop-types";
import Link from "@mui/material/Link";
import {ButtonBase} from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";

export const NavigateLink = memo(({href, underline = "hover", color = "inherit", children, ...props}) => {
	const navigate = useNavigate();
	
	return (
		<Link
			href={href}
			onClick={(event) => {
				if (!event.ctrlKey && !event.metaKey && !event.shiftKey) {
					event.preventDefault();
					navigate(href);
				}
			}}
			underline={underline}
			color={color}
			{...props}
		>
			{children}
		</Link>
	);
});

NavigateLink.propTypes = {
	href: PropTypes.string,
	underline: PropTypes.string,
	color: PropTypes.string,
	children: PropTypes.node,
}

export const NavigateButton = memo(({href, children, ...props}) => {
	const navigate = useNavigate();
	
	return (
		<Button
			href={href}
			onClick={(event) => {
				if (!event.ctrlKey && !event.metaKey && !event.shiftKey) {
					event.preventDefault();
					navigate(href);
				}
			}}
			{...props}
		>
			{children}
		</Button>
	);
});

NavigateButton.propTypes = {
	href: PropTypes.string,
	children: PropTypes.node,
}

export const NavigateButtonBase = memo(({href, children, ...props}) => {
	const navigate = useNavigate();
	
	return (
		<ButtonBase
			href={href}
			onClick={(event) => {
				if (!event.ctrlKey && !event.metaKey && !event.shiftKey) {
					event.preventDefault();
					navigate(href);
				}
			}}
			{...props}
		>
			{children}
		</ButtonBase>
	);
})

NavigateButtonBase.propTypes = {
	href: PropTypes.string,
	children: PropTypes.node,
}

export const NavigateIconButton = memo(({href, children, ...props}) => {
	const navigate = useNavigate();
	
	return (
		<IconButton
			href={href}
			onClick={(event) => {
				if (!event.ctrlKey && !event.metaKey && !event.shiftKey) {
					event.preventDefault();
					navigate(href);
				}
			}}
			{...props}
		>
			{children}
		</IconButton>
	);
})

NavigateIconButton.propTypes = {
	href: PropTypes.string,
	children: PropTypes.node,
}