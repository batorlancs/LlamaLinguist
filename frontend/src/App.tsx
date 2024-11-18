import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ModeToggle } from "./components/mode-toggle";
import { Loader2 } from "lucide-react";

const App = () => {
	const [response, setResponse] = useState("");
	const [isLoading, setIsLoading] = useState(false);

	const fetchHello = async () => {
		try {
			setIsLoading(true);
			const response = await fetch("http://localhost:8000/generate", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Accept: "application/json",
				},
				credentials: "include",
				mode: "cors",
			});
			const data = await response.json();
			setResponse(`Response: ${data.response}`);
			setIsLoading(false);
		} catch (error) {
			console.error("Error fetching:", error);
			setResponse("Error fetching response");
			setIsLoading(false);
		}
	};

	return (
		<div className="h-screen w-screen p-2 flex flex-col items-center justify-center gap-4">
			<ModeToggle />
			<Button onClick={fetchHello}>
				{isLoading ? (
					<>
						<Loader2 className="animate-spin" />
                        Please wait
					</>
				) : (
					"ollama generate pls"
				)}
			</Button>
			<p>{response}</p>
		</div>
	);
};

export default App;
