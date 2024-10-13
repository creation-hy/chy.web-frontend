import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import PropTypes from "prop-types";

export const ChatMarkdown = ({children, ...props}) => {
	return (
		<Markdown className="my-markdown" remarkPlugins={[remarkGfm, remarkBreaks]} {...props}>
			{children.toString().replace(/ {2}/g, " &nbsp;")
				.replace(/\n{2,}/g, (match) => "\n\n" + "&nbsp;  \n".repeat(match.length - 1))}
		</Markdown>
	)
}

ChatMarkdown.propTypes = {
	children: PropTypes.string,
}