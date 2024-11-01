import {createRoot} from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import {ColorModeProvider} from "src/components/ColorMode.jsx";
import {ClientUserProvider} from "src/components/ClientUser.jsx";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";

createRoot(document.getElementById('root')).render(
	//<StrictMode>
	<QueryClientProvider client={new QueryClient({
		defaultOptions: {
			queries: {
				staleTime: 60 * 1000,
			},
		},
	})}>
		<ClientUserProvider>
			<ColorModeProvider>
				<App/>
			</ColorModeProvider>
		</ClientUserProvider>
	</QueryClientProvider>
	//</StrictMode>,
)
