import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import PropTypes from "prop-types";
import {List, ListItem, ListItemText, Paper, Table, TableBody, TableCell, TableContainer, TableRow} from "@mui/material";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import Divider from "@mui/material/Divider";
import SyntaxHighlighter from "react-syntax-highlighter";
import {tomorrow, tomorrowNight} from "react-syntax-highlighter/dist/cjs/styles/hljs";
import {useColorMode} from "src/components/ColorMode.jsx";
import remarkBreaks from "remark-breaks";

export const ChatMarkdown = ({children, ...props}) => {
	if (!children)
		children = "";
	
	const md = children
		.replace(/(```\s*\n)([\s\S]*?)(\n```)/g, "```auto\n$2\n```")
		.replace(/ {2}/g, " \u00A0")
		.replace(/(?<!((?<!\S)([*_-]{3,})(?!\S)))\n{2,}(?!((?<!\S)([*_-]{3,})(?!\S)))/g,
			(match) => "\n\n" + "\u00A0  \n".repeat(match.length - 1));
	
	const [colorMode] = useColorMode();
	
	return (
		<Markdown
			className="my-markdown"
			remarkPlugins={[remarkGfm, remarkBreaks]}
			components={{
				hr: () => <Divider sx={{my: 1}}/>,
				a: ({href, title, children}) => (<Link href={href} title={title}>{children}</Link>),
				
				p: ({children}) => (<Typography component="div">{children}</Typography>),
				del: ({children}) => (<Typography component="div" sx={{textDecoration: "line-through"}}>{children}</Typography>),
				em: ({children}) => (<Typography component="div" sx={{fontStyle: "italic"}}>{children}</Typography>),
				strong: ({children}) => (<Typography component="div" sx={{fontWeight: "bold"}}>{children}</Typography>),
				b: ({children}) => (<Typography component="div" sx={{fontWeight: "bold"}}>{children}</Typography>),
				h1: ({children}) => (<Typography component="div" variant="h1">{children}</Typography>),
				h2: ({children}) => (<Typography component="div" variant="h2">{children}</Typography>),
				h3: ({children}) => (<Typography component="div" variant="h3">{children}</Typography>),
				h4: ({children}) => (<Typography component="div" variant="h4">{children}</Typography>),
				h5: ({children}) => (<Typography component="div" variant="h5">{children}</Typography>),
				h6: ({children}) => (<Typography component="div" variant="h6">{children}</Typography>),
				
				table: ({children}) => (<TableContainer component={Paper} sx={{my: 0.5}}>
					<Table size="small">{children}</Table>
				</TableContainer>),
				tbody: ({children}) => (<TableBody>{children}</TableBody>),
				tr: ({children}) => (<TableRow>{children}</TableRow>),
				td: ({children}) => (<TableCell><Typography component="div">{children}</Typography></TableCell>),
				
				ol: ({children}) => (<List sx={{
					listStyleType: "decimal",
					m: 0,
					p: 0,
					"& .MuiListItem-root": {display: "list-item"},
				}}>{children}</List>),
				ul: ({children}) => (<List sx={{
					listStyleType: "disc",
					m: 0,
					p: 0,
					"& .MuiListItem-root": {display: "list-item"},
				}}>{children}</List>),
				li: ({children}) => (
					<ListItem sx={{m: 0, p: 0}} disableGutters>
						<ListItemText>{children}</ListItemText>
					</ListItem>),
				
				code: ({className, children}) => {
					const match = /language-(\w+)/.exec(className || "");
					
					return match ? (
						<SyntaxHighlighter
							style={colorMode === "light" ? tomorrow : tomorrowNight}
							language={match ? match[1] : undefined}
							PreTag="div"
							className="syntax-highlighter"
						>
							{children.replace(/(?<!\n[\s\u00A0]*)\n(?![\s\u00A0]*\n)/g, "\n\n")}
						</SyntaxHighlighter>
					) : (
						<code style={{
							color: colorMode === "light" ? "black" : "white",
							backgroundColor: colorMode === "light" ? "white" : "rgb(29, 31, 33)",
							borderRadius: 4,
							padding: "1px 4px",
							marginLeft: 2,
							marginRight: 2,
						}}>
							{children}
						</code>
					);
				},
			}}
			{...props}
		>
			{md}
		</Markdown>
	)
}

ChatMarkdown.propTypes = {
	children: PropTypes.string,
}