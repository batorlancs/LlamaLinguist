import { Button } from "@/components/ui/button";
import { useState } from "react";

const App = () => {
	const [response, setResponse] = useState("");

	const fetchHello = async () => {
		try {
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
			setResponse(data.response);
		} catch (error) {
			console.error("Error fetching:", error);
			setResponse("Error fetching response");
		}
	};

	return (
		<div className="p-2 bg-lime-500 flex flex-col items-center justify-center">
			This is home
			<Button onClick={fetchHello}>Fetch Hello</Button>
			<p>{response}</p>
		</div>
	);
};

export default App;
