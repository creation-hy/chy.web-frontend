import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import PropTypes from "prop-types";
import remarkBreaks from "remark-breaks";

export const ChatMarkdown = ({children, ...props}) => {
	if (!children)
		children = "";
	
	const md = children.replace(/ {2}/g, " \u00A0")
		.replace(/(?<!((?<!\S)([*_-]{3,})(?!\S)))\n{2,}(?!((?<!\S)([*_-]{3,})(?!\S)))/g,
			(match) => "\n\n" + "\u00A0  \n".repeat(match.length - 1));
	
	return (
		<Markdown className="my-markdown" remarkPlugins={[remarkGfm, remarkBreaks]} {...props}>
			{md}
		</Markdown>
	)
}

ChatMarkdown.propTypes = {
	children: PropTypes.string,
}