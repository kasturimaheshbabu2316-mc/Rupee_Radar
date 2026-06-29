# System Architecture: RupeeRadar

## 1. System Overview

RupeeRadar follows a modern client-server architecture designed for rapid prototyping and efficient processing of financial data. The system is split into a frontend dashboard for user interaction and a backend processing engine that handles data extraction, cleaning, and AI-driven analysis.

## 2. Technology Stack Recommendations

Given the requirement to parse data and leverage AI, a Python-based backend is highly recommended due to its rich ecosystem for data manipulation (Pandas) and AI integration. 

### Frontend (Client-Side)

***Framework:** Next.js (React) or Vite + React
***Styling:** Tailwind CSS (for rapid, responsive UI development)
***Data Visualization:** Recharts or Chart.js (for spending categories, trends, and income vs. expenses)
***Responsibilities:** 
    *Providing a simple UI for users to upload bank statements (CSV/PDF).
    *Displaying the spend summary dashboard.
    *Rendering AI-generated personalized insights.

### Backend (Server-Side & Data Processing)
***Framework:** FastAPI or Flask (Python)
***Data Processing:** Pandas (for tabular data manipulation, cleaning, and aggregation)
***Document Parsing:** `pdfplumber` or `PyPDF2` (if handling PDF statements)
***Responsibilities:**
    *Receiving uploaded files securely.
    *Parsing raw text and tabular data from statements.
    *Orchestrating calls to the AI/LLM layer.
    *Calculating key financial metrics (total spend, top categories).
    *Serving processed data to the frontend via RESTful APIs.

### AI / LLM Layer

***Provider:** Google Gemini API, OpenAI API, or a local open-source LLM (via Ollama)
***Integration:** LangChain (optional, for structured prompt management)
***Responsibilities:**
    ***Categorization:** Taking messy transaction descriptions and mapping them to standardized categories (e.g., Food, Travel, Rent).
    ***Recurring Detection:** Analyzing transaction history to flag subscriptions, EMIs, and recurring bills.
    ***Insight Generation:** Generating human-readable summaries (e.g., "You spent 30% more on Food this month compared to your average.").

### Data Storage (Prototype Phase)
***Database:** SQLite or In-Memory (Pandas DataFrames)
***Responsibilities:** Storing session data temporarily. For a prototype, stateless processing (where the file is processed and results are returned immediately without persistent storage) is often the safest and fastest approach regarding privacy.

## 3. Data Flow & Application Architecture

1.**File Upload:** The user uploads a bank statement (CSV or PDF) through the React frontend.
2.**Data Extraction:** The FastAPI backend receives the file. If CSV, it's loaded into a Pandas DataFrame. If PDF, text/tables are extracted and structured.
3.**Data Cleaning:** The backend normalizes dates, amounts (handling debits vs. credits), and transaction descriptions.
4.**AI Processing Pipeline:**
    **Categorization:* The backend sends batches of transaction descriptions to the LLM to predict the category.
    **Recurring Payments:* The backend (or LLM) groups similar recurring transactions based on frequency and amount.
5.**Metrics Calculation:** Pandas calculates aggregate metrics (Total Income, Total Spend, Savings).
6.**Insight Generation:** The calculated metrics and categorized data are passed to the LLM with a prompt to generate 3-5 personalized financial insights.
7.**Response:** The backend compiles the metrics, categorized transactions, recurring payments, and text insights into a JSON response.
8.**Visualization:** The frontend consumes the JSON and renders the interactive dashboard.

## 4. Privacy & Security Considerations

Since personal finance data is highly sensitive:
***No Permanent Storage:** For the prototype, avoid saving uploaded bank statements to a persistent disk. Process them in memory and discard them after the session.
***PII Masking:** Before sending data to an external LLM API, scrub or mask Personally Identifiable Information (PII) such as full account numbers, names, or addresses if they appear in the statement.
***Local LLM Alternative:** For strict privacy, consider using a local LLM (like Llama 3 via Ollama) so that transaction data never leaves the user's machine.
