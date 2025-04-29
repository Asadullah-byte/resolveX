import Groq from "groq-sdk";
import dotenv from "dotenv";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const sendToGroq = async (fileContent) => {
  try {
    console.log("Sending extracted errors to Groq API...");
    console.log("Extracted Errors Preview:", fileContent.substring(0, 200));

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `content: You are an AI system that **must** return a valid JSON response.

Your job is to analyze logs and output structured information. Strictly adhere to the **JSON format** provided. **DO NOT** include extra text, Markdown formatting, or explanations.

When classifying the "domain" of each anomaly, use one of the following **predefined domain categories**:

{
  "Application Layer": [
    "Frontend",
    "Backend",
    "Mobile",
    "Microservices",
    "API Gateway / Middleware",
    "Business Logic",
    "Third-Party Integrations"
  ],
  "Data Layer": [
    "Database",
    "ORM / Query Builders",
    "Data Modeling / Schema Design",
    "Data Caching"
  ],
  "Identity & Access": [
    "Authentication",
    "Authorization",
    "Session Management",
    "Identity Providers"
  ],
  "Infrastructure & Networking": [
    "DevOps / Infrastructure",
    "Networking",
    "Load Balancers / Proxies",
    "CDN / Edge Services",
    "Cloud Services"
  ],
  "File & Media Handling": [
    "File System",
    "File Uploads / Downloads",
    "Media Processing"
  ],
  "Messaging & Communication": [
    "Email Services",
    "SMS / Push Notifications",
    "Message Queues / Pub-Sub"
  ],
  "Monitoring & Observability": [
    "Logging",
    "Tracing",
    "Metrics & Alerts"
  ],
  "Security": [
    "Input Validation / Sanitization",
    "Rate Limiting / Throttling",
    "Encryption / Secrets Management",
    "Vulnerability Scanning",
    "Security Breach Detection"
  ],
  "Performance & Optimization": [
    "Caching",
    "Lazy Loading / Optimization",
    "Load Testing / Stress Testing"
  ],
  "Platform-Specific": [
    "OS-Level",
    "Hardware / Embedded",
    "Mobile Platform Issues",
    "Browser-Specific Bugs"
  ],
  "Testing & QA": [
    "Unit Testing",
    "Integration Testing",
    "End-to-End Testing",
    "Test Coverage Tools"
  ]
}


Use your judgment based on the log entry and anomaly to decide which domain applies. If unsure, choose the **closest matching technical category**.

Do **NOT** create new domain names like "Login Screen", "User Profile", "Array Helper", etc.

Example:  
- An error in "LoginScreen.js" should be classified as "Frontend"  
- A "Database connection timeout" belongs to "Database"  
- A "userSession is not defined" issue in useSession.js is "Session Management"

Here's the required response format:

{
  "analysis_summary": {
    "system_type": "Specify the system type (e.g., Web Server, Database, etc.)",
    "total_log_entries": "Total number of log entries analyzed",
    "anomalies_detected": "Total number of anomalies found",
    "error_count": "Total errors detected",
    "warning_count": "Total warnings detected",
    "info_count": "Total informational messages detected"
  },
  "anomalies": [
    {
      "log_entry": "The specific log entry where the anomaly was found",
      "anomaly_type": "Type of anomaly (e.g., Security Breach, Performance Issue)",
      "severity": "Low / Medium / High",
      "domain": "Relevant technical domain from the predefined list",
      "suggested_action": "Recommended fix or investigation step",
      "related_errors": [
        {
          "log_entry": "Related log entry that contributes to the anomaly",
          "domain": "Domain where it occurred",
          "origin_point": "Where in the system this issue originated"
        }
      ]
    }
  ],
  "statistics": {
    "error_rate": "Percentage of errors in the log",
    "warning_rate": "Percentage of warnings in the log",
    "info_rate": "Percentage of informational messages in the log"
  },
  "timestamp": "Current timestamp of analysis"
}`


        },
        {
          role: "user",
          content: `Analyze the following extracted errors and return only the JSON response:

          ${fileContent}`
        }
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0,  //**Set to 0 for strict deterministic output**
      max_completion_tokens: 4096,  //Increased max response size
      top_p: 1,
    });

    let responseText = chatCompletion.choices[0]?.message?.content?.trim() || "No response";

    //More robust Markdown removal
    responseText = responseText.replace(/^```json\s*/i, "").replace(/```$/g, "").trim();

    //Ensure response is valid JSON
    try {
      const jsonResponse = JSON.parse(responseText);
      return jsonResponse;
    } catch (error) {
      console.error("Groq response is not valid JSON:", responseText);
      return { error: "Invalid JSON response from AI", rawResponse: responseText };
    }
  } catch (error) {
    console.error("Groq API error:", error);
    return { error: "Failed to process file", details: error.message };
  }
};
