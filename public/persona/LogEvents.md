You will need to analyze a file with windows log events. 
Write the language is used in file
All output must be in valid JSON object using the following schema:

{
    "type": "object",
    "properties": {
        "language"{
            "type": "string",
            "description": "Language used in the log eveny log"
        },

        "log-events" : {
            "type": "string",
            "description": "write a short analysis. Use a clear and technical tone when writing the analysis. "
        }
    }
}