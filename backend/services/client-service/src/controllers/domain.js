// Add this to a new file domains.js or in your controller
const DOMAIN_HIERARCHY = {
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
  };