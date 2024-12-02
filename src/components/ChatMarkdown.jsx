import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import PropTypes from "prop-types";
import {List, ListItem, Paper, Table, TableBody, TableCell, TableContainer, TableRow} from "@mui/material";
import Link from "@mui/material/Link";
import Divider from "@mui/material/Divider";
import SyntaxHighlighter from "react-syntax-highlighter";
import {tomorrow, tomorrowNight} from "react-syntax-highlighter/dist/cjs/styles/hljs";
import {useBinaryColorMode} from "src/components/ColorMode.jsx";
import remarkBreaks from "remark-breaks";
import React, {memo, useCallback, useMemo} from "react";
import Typography from "@mui/material/Typography";

export const ChatMarkdown = memo(function ChatMarkdown({useMarkdown, children, keyword, ...props}) {
	if (!children)
		children = "";
	
	const md = children
		.replace(/ {2}/g, " \u00A0")
		.replace(/(?<!((?<!\S)([*_-]{3,})(?!\S)))\n{2,}(?!((?<!\S)([*_-]{3,})(?!\S)))/g,
			(match) => "\n\n" + "\u00A0  \n".repeat(match.length - 1))
		.replace(/(?<!~)~(?!~)([^~]+)~(?!~)/g, '\\~$1\\~');
	
	const [binaryColorMode] = useBinaryColorMode();
	const regex = useMemo(() =>
		new RegExp(`(${keyword?.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, "i"), [keyword]);
	
	const highlightText = useCallback((node) => {
		if (!keyword) {
			return node;
		}
		
		if (typeof node === 'string') {
			return node.split(regex).map((content, index) => {
				if (regex.test(content)) {
					return (
						<Typography key={index} component="span" color="primary" fontSize="inherit" fontWeight="inherit">
							{content}
						</Typography>
					);
				}
				return content;
			});
		} else if (React.isValidElement(node)) {
			return React.cloneElement(node, {
				children: React.Children.map(node.props.children, highlightText),
			});
		} else if (node) {
			return React.Children.map(node, highlightText);
		}
		
		return node;
	}, [keyword]);
	
	return useMarkdown ? (
		<Markdown
			className="my-markdown"
			remarkPlugins={[remarkGfm, remarkBreaks]}
			components={{
				hr: () => <Divider sx={{my: 1}}/>,
				a: ({href, title, children}) => (
					<Link href={href} title={title} onClick={(event) => event.stopPropagation()}>
						{highlightText(children)}
					</Link>
				),
				p: ({children}) => (
					<Typography fontSize="inherit">
						{highlightText(children)}
					</Typography>
				),
				
				h1: ({children}) => (<h1>{highlightText(children)}</h1>),
				h2: ({children}) => (<h2>{highlightText(children)}</h2>),
				h3: ({children}) => (<h3>{highlightText(children)}</h3>),
				h4: ({children}) => (<h4>{highlightText(children)}</h4>),
				h5: ({children}) => (<h5>{highlightText(children)}</h5>),
				h6: ({children}) => (<h6>{highlightText(children)}</h6>),
				
				table: ({children}) => (
					<TableContainer component={Paper} sx={{my: 0.5}}>
						<Table size="small">
							{highlightText(children)}
						</Table>
					</TableContainer>
				),
				tbody: ({children}) => (<TableBody>{highlightText(children)}</TableBody>),
				tr: ({children}) => (<TableRow>{highlightText(children)}</TableRow>),
				td: ({children}) => (<TableCell>{highlightText(children)}</TableCell>),
				
				ol: ({children}) => (
					<List
						sx={{
							listStyleType: "decimal",
							m: 0,
							p: 0,
							"& .MuiListItem-root": {display: "list-item"},
						}}
					>
						{highlightText(children)}
					</List>
				),
				ul: ({children}) => (
					<List sx={{
						listStyleType: "disc",
						m: 0,
						p: 0,
						"& .MuiListItem-root": {display: "list-item"},
					}}>
						{highlightText(children)}
					</List>
				),
				li: ({children}) => (
					<ListItem sx={{m: 0, p: 0}} disableGutters>
						{highlightText(children)}
					</ListItem>
				),
				
				code: ({className, children}) => {
					const match = /language-(\w+)/.exec(className || "");
					return match ? (
						<SyntaxHighlighter
							style={binaryColorMode === "light" ? tomorrow : tomorrowNight}
							language={match ? match[1] : undefined}
							PreTag="div"
							className="syntax-highlighter"
						>
							{children}
						</SyntaxHighlighter>
					) : (
						<code style={{
							color: binaryColorMode === "light" ? "black" : "white",
							backgroundColor: binaryColorMode === "light" ? "white" : "rgb(29, 31, 33)",
							borderRadius: 4,
							padding: "1px 4px",
							marginLeft: 2,
							marginRight: 2,
						}}>
							{highlightText(children)}
						</code>
					);
				},
				
				img: ({src, alt}) => (
					<img src={src} alt={alt} style={{maxWidth: "100%", maxHeight: "100%", objectFit: "contain"}}/>
				),
			}}
			{...props}
		>
			{md}
		</Markdown>
	) : (
		<Typography whiteSpace="pre-wrap" fontSize="inherit">
			{highlightText(children)}
		</Typography>
	);
});

ChatMarkdown.propTypes = {
	useMarkdown: PropTypes.bool,
	children: PropTypes.string,
	keyword: PropTypes.string,
}