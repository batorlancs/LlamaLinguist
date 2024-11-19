// import { Button } from "@/components/ui/button";
// import { useState } from "react";
// import { ModeToggle } from "./components/mode-toggle";
// import { Loader2 } from "lucide-react";
import { Chat } from "./features/Chat";

const App = () => {
	// const [response, setResponse] = useState("");
	// const [isLoading, setIsLoading] = useState(false);

	// const fetchHello = async () => {
	// 	try {
	// 		setIsLoading(true);
	// 		const response = await fetch("http://localhost:8000/generate", {
	// 			method: "GET",
	// 			headers: {
	// 				"Content-Type": "application/json",
	// 				Accept: "application/json",
	// 			},
	// 			credentials: "include",
	// 			mode: "cors",
	// 		});
	// 		const data = await response.json();
	// 		setResponse(`Response: ${data.response}`);
	// 		setIsLoading(false);
	// 	} catch (error) {
	// 		console.error("Error fetching:", error);
	// 		setResponse("Error fetching response");
	// 		setIsLoading(false);
	// 	}
	// };

	return (
		<div className="h-screen max-h-screen w-screenmax-w-screen flex flex-col">
			{/* <ModeToggle /> */}
			<Chat />
		</div>
	);
};

export default App;
