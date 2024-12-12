import {createRoot} from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {ColorModeProvider} from "src/components/ColorMode.jsx";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {StrictMode} from "react";

createRoot(document.getElementById('root')).render(
	<StrictMode>
		<QueryClientProvider client={new QueryClient()}>
			<ColorModeProvider>
				<App/>
			</ColorModeProvider>
		</QueryClientProvider>
	</StrictMode>,
)
